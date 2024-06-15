import { CombatPTR2e } from "@combat";
import { htmlQuery } from "@utils";

class CombatTrackerPTR2e<TEncounter extends CombatPTR2e | null> extends CombatTracker<TEncounter> {

    override get template() {
        return 'systems/ptr2e/templates/sidebar/combat-tracker.hbs';
    }

    override async getData(options: CombatTrackerOptions): Promise<CombatTrackerData> {
        const data = await super.getData(options) as CombatTrackerData & { [key: string]: any };
        data.turns = data.turns.map((turn) => {
            const combatant = this.viewed?.combatants.get(turn.id);
            if(!combatant) return turn;
            turn.type = combatant?.type;
            return turn;
        })

        const preview = (() => {
            const combat = this.viewed;
            const current = combat?.combatant;
            if (!current) return null;

            return {
                ...(data.turns.find((t: {id: string}) => t.id === current.id) || {}),
                initiative: current.baseAV,
                css: "preview",
                preview: true
            } as CombatTrackerTurn;
        })();
        
        // Add the preview to the turns in the right initiative spot.
        if(preview) {
            data.turns.push(preview);
            data.turns = data.turns.sort((a,b) => {
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

        return data;
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
                    const combatant = this.viewed?.combatants.get(li.data("combatantId"));
                    return combatant?.type !== "round" && this.viewed?.combatant !== combatant;
                }
                options.push(option);
                continue;
            }

            option.condition = li => {
                const combatant = this.viewed?.combatants.get(li.data("combatantId"));
                return this.viewed?.combatant?.id !== combatant?.id;
            }
            options.push(option);
        }
        options.push({
            name: "PTR2E.Combat.ContextMenu.ApplyDelayOrAdvancement.name",
            icon: '<i class="fas fa-bolt"></i>',
            condition: li => {
                const combatant = this.viewed?.combatants.get(li.data("combatantId"));
                return combatant?.type !== "round" && this.viewed?.combatant !== combatant;
            },
            callback: li => {
                const combatant = this.viewed?.combatants.get(li.data("combatantId"));
                if(!combatant) return;

                foundry.applications.api.DialogV2.prompt({
                    window: {
                        title: game.i18n.format("PTR2E.Combat.ContextMenu.ApplyDelayOrAdvancement.title", {name: combatant.name}),
                    },
                    content: game.i18n.format("PTR2E.Combat.ContextMenu.ApplyDelayOrAdvancement.content", { current: combatant.system.avModifiers }),
                    ok: {
                        label: game.i18n.localize("PTR2E.Combat.ContextMenu.ApplyDelayOrAdvancement.ok"),
                        action: 'ok',
                        callback: async (_event, target, element) => {
                            const html = element ?? target;
                            const value = htmlQuery<HTMLInputElement>(html, 'input[name="value"]')?.value;
                            if(!value) return;

                            const newValue = parseInt(value);
                            if(isNaN(newValue)) return;

                            const newModifiers = Math.clamp(combatant.system.avModifiers + newValue, -100, 100);
                            combatant.update({ "system.avModifiers": newModifiers });
                        }
                    }
                })
            }
        })
        return options;
    }
}

export default CombatTrackerPTR2e;