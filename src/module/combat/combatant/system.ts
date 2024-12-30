import type { DeepPartial } from "fvtt-types/utils";
import type CombatantPTR2e from "./document.ts";

const combatantSystemSchema = {
  activationsHad: new foundry.data.fields.NumberField({
    required: true,
    initial: 0,
    min: 0,
    nullable: false,
  }),
  advanceDelayPercent: new foundry.data.fields.NumberField({
    required: true,
    initial: 0,
    min: -3,
    max: 1,
    nullable: false,
  })
};

export type CombatantSystemSchema = typeof combatantSystemSchema;

export default class CombatantSystemPTR2e<Schema extends CombatantSystemSchema = CombatantSystemSchema> extends foundry.abstract.TypeDataModel<Schema, CombatantPTR2e> {
  get combat() {
    return this.parent.encounter;
  }

  get baseAV(): number {
    throw new Error("CombatantSystemPTR2e#baseAV must be implemented by a subclass");
  }

  get activations() {
    return this.activationsHad;
  }

  static override defineSchema<Schema extends CombatantSystemSchema = CombatantSystemSchema>(): Schema {
    return combatantSystemSchema as Schema;
  }

  async applyAdvancementDelay(advancementDelay: number, dataOnly = false): Promise<Record<string, unknown> | this['parent'] | undefined> {
    if (advancementDelay === 0) return;
    if (advancementDelay > 1 || advancementDelay < -3) {
      throw new Error("Delay or advancement must be normalized between -3 and 1");
    }

    const currentlyApplied = this.advanceDelayPercent;
    const maxDelta = -150 / this.baseAV;
    const newApplied = Math.clamp(currentlyApplied + advancementDelay, maxDelta, 1);
    const delta = ((newApplied < 0 && Math.floor(this.baseAV * newApplied) < -150) ? maxDelta : newApplied) - currentlyApplied;

    const change = delta === 0 ? this.parent.initiative : this.calculateInitiativeChange(this.baseAV, this.baseAV, delta);

    if (dataOnly) {
      return change === this.parent.initiative ? {} : { "system.advanceDelayPercent": newApplied, initiative: change };
    }
    return change === this.parent.initiative ? this.parent : this.parent.update({ "system.advanceDelayPercent": newApplied, initiative: change });
  }

  calculateInitiativeChange(oldBaseAV: number, newBaseAV: number, delayOrAdvancement = 0) {
    const currentInitiative = this.parent.initiative;
    if (currentInitiative === null || currentInitiative === undefined) return 0;

    if (delayOrAdvancement > 1 || delayOrAdvancement < -3) {
      throw new Error("Delay or advancement must be normalized between -3 and 1");
    }

    const delayAdvancementChange = delayOrAdvancement > 0 ? Math.floor(this.baseAV * delayOrAdvancement) : Math.ceil(this.baseAV * delayOrAdvancement);
    const speedChange = newBaseAV > oldBaseAV ? Math.floor(currentInitiative * (newBaseAV / oldBaseAV)) : Math.ceil(currentInitiative * (newBaseAV / oldBaseAV));

    return Math.clamp(
      speedChange - delayAdvancementChange,
      0,
      150
    );
  }

  /**
   * Overridden by subclasses to perform actions when the combatant's turn starts
   */
  async onStartActivation() {
    return;
  }

  override async _preUpdate(
    changed: DeepPartial<foundry.data.fields.SchemaField.AssignmentType<Combatant.Schema>>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.PreUpdateOptions<any>,
    userId: string
  ): Promise<boolean | void> {
    if(!changed) return false;
    
    const result = await super._preUpdate(changed, options, userId);
    if (result === false) return false;

    if (changed.system?.activationsHad !== undefined && Number(changed.system.activationsHad) > 0) {
      changed.system.advanceDelayPercent = 0;
    }

    if (changed.initiative !== undefined && typeof changed.initiative === "number") {
      changed.initiative = Math.round(changed.initiative)
    }
  }

  override _onUpdate(
    changed: DeepPartial<foundry.data.fields.SchemaField.AssignmentType<Combatant.Schema>>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.OnUpdateOptions<any>,
    userId: string
  ): void {
    if(!changed) return;
    super._onUpdate(changed, options, userId);
    if (
      "system" in changed &&
      changed.system &&
      typeof changed.system === "object" &&
      "activationsHad" in changed.system &&
      typeof changed.system.activationsHad === "number"
    ) {
      this.parent.actor?.onEndActivation();
    }
  }
}