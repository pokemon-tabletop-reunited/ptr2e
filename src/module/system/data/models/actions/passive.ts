import ActionPTR2e from "./action";

const passiveSchema = {
  ...ActionPTR2e.defineSchema(),
  hidden: new foundry.data.fields.BooleanField({
    required: true,
    initial: false,
    label: "PTR2E.FIELDS.hidden.label",
    hint: "PTR2E.FIELDS.hidden.hint",
  }),
};

declare namespace PassivePTR2e {
  type Schema = typeof passiveSchema;
}

export default class PassivePTR2e extends ActionPTR2e<PassivePTR2e.Schema> {
  declare type: "passive";

  static override TYPE = "passive" as const;

  static override defineSchema() {
    return passiveSchema;
  }
}
