import AttackPTR2e from "./attack";

const summonAttackSchema = {
  ...AttackPTR2e.defineSchema(),
};

declare namespace SummonAttackPTR2e {
  type Schema = typeof summonAttackSchema;
}

export default class SummonAttackPTR2e extends AttackPTR2e<SummonAttackPTR2e.Schema> {
  declare type: "summon";

  static override TYPE = "summon" as const;

  static override defineSchema() {
    return summonAttackSchema;
  }
}
