import type CombatPTR2e from "./document.ts";

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

export default class CombatSystem extends foundry.abstract.TypeDataModel<CombatSystemSchema, CombatPTR2e> {
  get maxTurns() {
    return Math.min(this.parent.roundIndex + 1, this.parent.turns.length);
  }

  static override defineSchema(): CombatSystemSchema {
    return combatSystemSchema;
  }
}