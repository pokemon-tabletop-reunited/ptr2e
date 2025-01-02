import type { DeepPartial } from "fvtt-types/utils";

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

export default class CombatantSystemPTR2e<Schema extends CombatantSystemSchema = CombatantSystemSchema> extends foundry.abstract.TypeDataModel<Schema, Combatant.ConfiguredInstance> {
  get combat(): Combat.ConfiguredInstance {
    return this.parent.encounter;
  }

  get baseAV(): number {
    throw new Error("CombatantSystemPTR2e#baseAV must be implemented by a subclass");
  }

  get activations(): number {
    const self = this as CombatantSystemPTR2e;
    return self.activationsHad;
  }

  static override defineSchema(): CombatantSystemSchema {
    return combatantSystemSchema;
  }

  async applyAdvancementDelay(this: CombatantSystemPTR2e, advancementDelay: number, dataOnly = false): Promise<Record<string, unknown> | this['parent'] | undefined> {
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
    changes: DeepPartial<foundry.abstract.TypeDataModel.ParentAssignmentType<Schema, Combatant.ConfiguredInstance>>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.PreUpdateOptions<any>,
    userId: string
  ): Promise<boolean | void> {
    if (!changes) return false;

    const result = await super._preUpdate(changes, options, userId);
    if (result === false) return false;

    if (changes.system?.activationsHad !== undefined && Number(changes.system.activationsHad) > 0) {
      //@ts-expect-error - FIXME: Typing is failing - This should work.
      changes.system.advanceDelayPercent = 0;
    }

    if (changes.initiative !== undefined && typeof changes.initiative === "number") {
      changes.initiative = Math.round(changes.initiative)
    }
  }

  override _onUpdate(
    changed: DeepPartial<foundry.abstract.TypeDataModel.ParentAssignmentType<Schema, Combatant.ConfiguredInstance>>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.OnUpdateOptions<any>,
    userId: string
  ): void {
    if (!changed) return;
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