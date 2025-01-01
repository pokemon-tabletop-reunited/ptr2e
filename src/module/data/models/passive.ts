import { ActionPTR2e } from "@data";
import type { ActionSchema } from "./action.ts";

const passiveSchema = {
  hidden: new foundry.data.fields.BooleanField({ required: true, initial: false, label: "PTR2E.FIELDS.hidden.label", hint: "PTR2E.FIELDS.hidden.hint" })
}

export type PassiveSchema = typeof passiveSchema & ActionSchema;

export default class PassivePTR2e extends ActionPTR2e<PassiveSchema> {
  static override TYPE = "passive" as const;

  static override defineSchema(): PassiveSchema {
    return {
      ...super.defineSchema() as ActionSchema,
      ...passiveSchema,
    }
  }
}
