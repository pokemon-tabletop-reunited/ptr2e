const combatSystemSchema = {
  turn: new foundry.data.fields.NumberField({
    required: true,
    initial: 0,
    min: 0,
    nullable: false,
  }),
  participants: new foundry.data.fields.SetField(new foundry.data.fields.DocumentUUIDField(), {
    required: true,
    initial: [],
  }),
}

export type CombatSystemSchema = typeof combatSystemSchema;

class CombatSystem extends foundry.abstract.TypeDataModel<CombatSystemSchema, Combat.ConfiguredInstance> {
  get maxTurns() {
    return Math.min(this.parent.roundIndex + 1, this.parent.turns.length);
  }

  static override defineSchema(): CombatSystemSchema {
    return combatSystemSchema;
  }
}

export default CombatSystem;
export type { CombatSystem };