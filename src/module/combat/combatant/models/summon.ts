import type { CombatantPTR2e } from "@combat";
import { CombatantSystemPTR2e } from "@combat";
import type { CombatantSystemSchema } from "../system.ts";
import type { SummonPTR2e } from "@item";
import { ItemPTR2e } from "@item";
import type { SummonAttackPTR2e } from "@data";
import type { ActorPTR2e } from "@actor";
import type { ActiveEffectPTR2e } from "@effects";
import type { DeepPartial } from "fvtt-types/utils";

const summonCombatantSchema = {
  owner: new foundry.data.fields.DocumentUUIDField({ required: true, nullable: true }),
  item: new foundry.data.fields.JSONField({ required: true, nullable: false }),
  delay: new foundry.data.fields.NumberField({ required: true, initial: null, min: -2, max: 3 })
}

export type SummonCombatantSchema = typeof summonCombatantSchema & CombatantSystemSchema;

export default class SummonCombatantSystem extends CombatantSystemPTR2e<SummonCombatantSchema> {

  //@ts-expect-error - Override base property.
  item: ItemPTR2e | null;

  override get baseAV(): number {
    return this.delay !== null ? 999 : this.item?.system.baseAV ?? 999;
  }

  get duration() {
    return this.delay !== null ? 1 : this.item?.system.duration ?? 1;
  }

  get expired() {
    return this.activationsHad >= this.duration
  }

  get name() {
    return `${this.parent.name} (${this.duration - this.activationsHad})`;
  }

  static override defineSchema(): SummonCombatantSchema {
    return {
      ...super.defineSchema() as CombatantSystemSchema,
      ...summonCombatantSchema
    }
  }

  override prepareBaseData(): void {
    super.prepareBaseData();

    this.item = (() => {
      if (!this._source.item) return null;
      try {
        const jsonData = JSON.parse(this._source.item);
        if (jsonData.uuid) {
          const item = fromUuidSync(jsonData.uuid);
          if (item && item instanceof ItemPTR2e) return item.clone(jsonData.system.owner ? { "system.owner": jsonData.system.owner } : {}, { keepId: true });
        }

        return ItemPTR2e.fromJSON(this._source.item) as SummonPTR2e;
      }
      catch (error: unknown) {
        Hooks.onError("SummonCombatantSystem#prepareBaseData", error as Error, {
          log: "error",
        });
      }
      return null;
    })();
  }

  override async onStartActivation() {
    const messages = [];
    if (this.delay !== null) {
      const action = this.item?.system.actions?.contents?.[0];
      if (action) {
        messages.push(game.i18n.format("PTR2E.Combat.Summon.Messages.Delay", { name: action.actor?.link ?? "", action: action.link }));
      }
    }
    else if (this.item?.system.actions?.size) {
      messages.push(game.i18n.localize("PTR2E.Combat.Summon.Messages.HasActions"));
      messages.push("<ul>")
      for (const action of this.item.system.actions) {
        messages.push(game.i18n.format("PTR2E.Combat.Summon.Messages.Action", { name: action.link }));
      }
      messages.push("</ul>")
    }
    else {
      messages.push(game.i18n.localize("PTR2E.Combat.Summon.Messages.NoActions"));
    }

    if (this.duration - this.activationsHad === 1) {
      messages.push(game.i18n.localize("PTR2E.Combat.Summon.Messages.LastActivation"));
    }

    await ChatMessage.create({
      speaker: {
        alias: this.name,
      },
      content: messages.join(""),
    })

    for (const action of this.item?.system.actions ?? []) {
      if (action.type !== "summon") continue;

      const result = await (action as SummonAttackPTR2e).execute(this, this.combat.combatants.contents);
      // Result is only 'False' if no owner was found and thus the attack couldn't be resolved
      if (result === false) {
        console.warn(`Summon ${this.name} failed to execute action ${action.name} because no owner was found.`);
      }
    }

    return;
  }

  onEndActivation() {
    return;
  }

  /**
   * Returns summon effects that should be applied to the actor, based on the conditions of the summon.
   */
  getApplicableEffects(actor: ActorPTR2e) {
    const item = this.item;
    if (!item) return [];
    const effects = item.effects;
    if (!effects?.size) return [];

    const owner = fromUuidSync(this.owner ?? "") as ActorPTR2e | null;

    const applicableEffects: ActiveEffectPTR2e[] = [];
    for (const effect of effects.contents as unknown as ActiveEffectPTR2e[]) {
      switch (effect.system.targetType) {
        case "ally": {
          if (!owner) {
            applicableEffects.push(effect);
            break
          }
          if (actor.uuid === this.owner || actor.isAllyOf(owner)) {
            applicableEffects.push(effect);
          }
          break;
        }
        case "enemy": {
          if (!owner) {
            applicableEffects.push(effect);
            break
          }
          if (actor.isEnemyOf(owner)) {
            applicableEffects.push(effect);
          }
          break;
        }
        case "target": {
          if (!effect.system.targetUuid) {
            applicableEffects.push(effect);
            break;
          }
          if (effect.system.targetUuid === actor.uuid) {
            applicableEffects.push(effect);
          }
          break;
        }
        case "owner": {
          if (this.owner === actor.uuid) {
            applicableEffects.push(effect);
          }
          break;
        }
        case "all":
        default: {
          applicableEffects.push(effect);
          break;
        }
      }
    }
    return applicableEffects;
  }

  notifyActorsOfEffectsIfApplicable(combatants: CombatantPTR2e[] = this.combat.combatants.contents) {
    const item = this.item;
    if (!item) return;
    const effects = item.effects;
    if (!effects?.size) return;

    for (const combatant of combatants) {
      if (combatant.actor) combatant.actor.reset();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async _preCreate(data: foundry.abstract.TypeDataModel.ParentAssignmentType<SummonCombatantSchema, CombatantPTR2e>, options: foundry.abstract.Document.PreCreateOptions<any>, user: User): Promise<boolean | void> {
    const result = await super._preCreate(data, options, user);
    if (result === false) return false;

    if (this.item?.name) {
      this.parent.updateSource({ name: this.item.name });
    }
    if (this.item?.img) {
      this.parent.updateSource({ img: this.item.img });
    }

    return result;
  }

  override async _preUpdate(
    changed: foundry.abstract.TypeDataModel.ParentAssignmentType<SummonCombatantSchema, CombatantPTR2e>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.PreUpdateOptions<any>,
    userId: string
  ): Promise<boolean | void> {
    if (changed.defeated) {
      changed.defeated = false;
    }

    if (changed?.system?.item) {
      const item = typeof changed?.system?.item === "string" ? JSON.parse(changed.system.item) : changed.system.item;
      if (item?.name) {
        changed.name = item.name;
      }
      if (item?.img) {
        changed.img = item.img;
      }
    }

    return super._preUpdate(changed, options, userId);
  }

  override _preDelete(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.PreDeleteOptions<any>,
    user: User
  ): Promise<boolean | void> {
    if (this.combat.combatant?.id === this.parent.id) return Promise.resolve(false);
    return super._preDelete(options, user);
  }

  override _onCreate(
    data: foundry.abstract.TypeDataModel.ParentAssignmentType<SummonCombatantSchema, CombatantPTR2e>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.OnCreateOptions<any>,
    userId: string
  ): void {
    super._onCreate(data, options, userId);
    this.notifyActorsOfEffectsIfApplicable()
  }

  override _onUpdate(
    changed: foundry.abstract.TypeDataModel.ParentAssignmentType<SummonCombatantSchema, CombatantPTR2e>, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.OnUpdateOptions<any>, 
    userId: string
  ): void {
    super._onUpdate(changed, options, userId);
    if (
      "system" in changed &&
      changed.system &&
      typeof changed.system === "object" &&
      "activationsHad" in changed.system &&
      typeof changed.system.activationsHad === "number"
    ) {
      this.onEndActivation();
    }
  }

  override _onDelete(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.OnDeleteOptions<any>,
    userId: string
  ): void {
    super._onDelete(options, userId);
    this.notifyActorsOfEffectsIfApplicable()
  }
}