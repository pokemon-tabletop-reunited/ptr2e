import { CombatantPTR2e, CombatPTR2e, SummonCombatantSystem } from "@combat";
import { htmlQuery } from "@utils";

class CombatTrackerPTR2e<TEncounter extends CombatPTR2e | null> extends foundry.applications.sidebar.tabs.CombatTracker<TEncounter> {

  static DEFAULT_OPTIONS = {
    actions: {}
  }

  static PARTS = {
    header: {
      template: "systems/ptr2e/templates/sidebar/combat-tracker/header.hbs"
    },
    tracker: {
      template: "systems/ptr2e/templates/sidebar/combat-tracker/tracker.hbs",
    },
    footer: {
      template: "systems/ptr2e/templates/sidebar/combat-tracker/footer.hbs",
    },
  }

  async _prepareTrackerContext(context: foundry.applications.api.ApplicationRenderContext) {
    const combat = this.viewed;
    if (!combat) return;
    let turns: Awaited<ReturnType<typeof this._prepareTurnContext>>[] = [];
    for (const [i, combatant] of combat.turns.entries()) {
      if (!combatant.visible) continue;
      const turn = await this._prepareTurnContext(combat, combatant, i);
      turns.push(turn);
    }

    const preview = (() => {
      const combat = this.viewed;
      const current = combat?.combatant;
      if (!current || (current.hidden && !game.user.isGM)) return null;

      return {
        ...(turns.find((t) => t.id === current.id) || {}),
        initiative: current.baseAV,
        css: "preview",
        preview: true,
        delay: undefined
      } as Awaited<ReturnType<typeof this._prepareTurnContext>>;
    })();

    if (preview) {
      turns.push(preview);

      turns = turns.sort((a, b) => {
        const aCombatant = a === preview ? {
          initiative: preview.initiative,
          id: preview.id,
          actor: this.viewed!.combatants.get(preview.id)!.actor,
          preview: true
        } : this.viewed!.combatants.get(a.id)!;
        const bCombatant = b === preview ? {
          initiative: preview.initiative,
          id: preview.id,
          actor: this.viewed!.combatants.get(preview.id)!.actor,
          preview: true
        } : this.viewed!.combatants.get(b.id)!;
        return this.viewed!._sortCombatants(aCombatant, bCombatant);
      })
    }

    const delaySummons = turns.filter(c => c.delay !== undefined);
    for (const summon of delaySummons) {
      // Delayed summons go after X amount of other activations, instead of being based on AV.
      // Thus, insert the summon at the correct position in the turn order.
      const delay = summon.delay!;
      turns.splice(turns.indexOf(summon), 1);

      if (delay === -1) {
        turns.unshift(summon);
        continue;
      }

      let i = 0;
      let validTurns = 0;
      while (validTurns < delay) {
        i++;
        if (i >= turns.length) {
          break;
        }
        const nextTurn = turns[i];
        // Make sure to exclude other rounds & summons from the delay count
        if (nextTurn.type === "round" || nextTurn.type === "summon" || nextTurn.defeated) {
          continue;
        }
        validTurns++;
      }
      turns.splice(i + 1, 0, summon);
    }

    context.turns = turns;
  }

  async _prepareTurnContext(combat: CombatPTR2e, combatant: CombatantPTR2e, index: number) {
    // @ts-expect-error - Missing types for this function
    const turn = await super._prepareTurnContext(combat, combatant, index) as {
      hasDecimals: boolean;
      hidden: boolean;
      id: string;
      isDefeated: boolean;
      initiative: number;
      isOwner: boolean;
      name: string;
      resource: CombatantPTR2e["resource"];
      active: boolean;
      canPing: boolean;
      img: string;
      css: string;
      effects: {
        icons: { img: string; name: string; }[];
        tooltip: string;
      }
    } & {
      type: string;
      defeated: boolean;
      delay?: number | null;
      preview?: boolean;
    }

    turn.type = combatant.type;
    if (combatant.type === "summon" && combatant.system.delay !== null && (combatant.system as SummonCombatantSystem).delay! >= -1) {
      turn.delay = (combatant.system as SummonCombatantSystem).delay!;
    }
    turn.css = turn.css ? turn.css + ` ${combatant.type}` : combatant.type;
    return turn;
  }

  _getCombatContextOptions() {
    // @ts-expect-error - Missing types for this function
    const options = super._getCombatContextOptions() as EntryContextOption[];
    return [
      {
        name: "COMBAT.ResetEncounter",
        icon: '<i class="fa-solid fa-undo"></i>',
        condition: () => game.user.isGM && (this.viewed?.turns.length ?? 0) > 0,
        callback: () => this.viewed?.resetEncounter()
      },
      ...options.filter(o => o.name !== "COMBAT.InitiativeReset"),
    ]
  }

  protected override _getEntryContextOptions(): EntryContextOption[] {
    const base = super._getEntryContextOptions();
    const options: EntryContextOption[] = [];
    for (const option of base) {
      if (option.name === "COMBAT.CombatantClear") continue;
      if (option.name === "COMBAT.CombatantReroll") {
        option.name = "PTR2E.Combat.ContextMenu.ResetAV";
        option.icon = '<i class="fas fa-undo"></i>'
      }
      if (option.name === "COMBAT.CombatantRemove") {
        option.condition = li => {
          const combatant = this.viewed?.combatants.get(li.dataset.combatantId!);
          return combatant?.type !== "round" && this.viewed?.combatant !== combatant;
        }
        options.push(option);
        continue;
      }
      if (option.name === "COMBAT.CombatantClearMovementHistory") {
        options.push(option);
        continue;
      }

      option.condition = li => {
        const combatant = this.viewed?.combatants.get(li.dataset.combatantId!);
        return this.viewed?.combatant?.id !== combatant?.id;
      }
      options.push(option);
    }
    options.push({
      name: "PTR2E.Combat.ContextMenu.ApplyDelayOrAdvancement.name",
      icon: '<i class="fas fa-bolt"></i>',
      condition: li => {
        const combatant = this.viewed?.combatants.get(li.dataset.combatantId!);
        return combatant?.type !== "round" && this.viewed?.combatant !== combatant;
      },
      callback: li => {
        const combatant = this.viewed?.combatants.get(li.dataset.combatantId!);
        if (!combatant) return;

        const hasBossDelayImmunity = !!combatant.actor?.rollOptions?.all?.["special:boss-delay"];
        const maxDelta = Math.clamp(-150 / combatant.baseAV, hasBossDelayImmunity ? -0.3 : -99, 1);

        foundry.applications.api.DialogV2.prompt({
          window: {
            title: game.i18n.format("PTR2E.Combat.ContextMenu.ApplyDelayOrAdvancement.title", { name: combatant.name }),
          },
          content: game.i18n.format("PTR2E.Combat.ContextMenu.ApplyDelayOrAdvancement.content", { current: +(combatant.system.advanceDelayPercent * 100).toFixed(2), max: +(maxDelta * 100).toFixed(2) }),
          ok: {
            label: game.i18n.localize("PTR2E.Combat.ContextMenu.ApplyDelayOrAdvancement.ok"),
            action: 'ok',
            callback: async (_event, target, element) => {
              const html = (element?.element) ?? target;
              const value = htmlQuery<HTMLInputElement>(html, 'input[name="value"]')?.value;
              if (!value) return;

              const newValue = parseInt(value);
              if (isNaN(newValue)) return;

              await combatant.system.applyAdvancementDelay(Math.clamp(newValue / 100, -3, 1));
            }
          }
        })
      }
    })
    return options;
  }
}

export default CombatTrackerPTR2e;