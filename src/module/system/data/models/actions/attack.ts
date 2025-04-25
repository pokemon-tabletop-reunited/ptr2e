import ActionPTR2e from "./action";

const attackSchema = {
  ...ActionPTR2e.defineSchema(),
};

declare namespace AttackPTR2e {
  type Schema = typeof attackSchema;
}

export default class AttackPTR2e<TSchema extends AttackPTR2e.Schema = AttackPTR2e.Schema> extends ActionPTR2e<TSchema> {
  declare type: "attack" | "summon";

  static override TYPE: "attack" | "summon" = "attack" as const;

  static override defineSchema() {
    return attackSchema;
  }
}
