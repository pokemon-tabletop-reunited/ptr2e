import type { ActorPTR2e } from "@actor";
import { ChangeModel } from "@data";
import { RollNote } from "@system/notes.ts";
import type { ChangeModelSchema } from "./change.ts";

const rollNoteChangeSchema = {
  visibility: new foundry.data.fields.StringField({
    required: true,
    nullable: true,
    choices: ["gm", "owner"],
    initial: null,
  }),
}

export type RollNoteChangeSchema = typeof rollNoteChangeSchema & ChangeModelSchema;

class RollNoteChangeSystem extends ChangeModel<RollNoteChangeSchema> {
  static override TYPE = "roll-note";

  static override defineSchema(): RollNoteChangeSchema {
    return {
      ...super.defineSchema() as ChangeModelSchema,
      ...rollNoteChangeSchema
    }
  }

  get selector() {
    return this.key;
  }

  get text() {
    return this.value;
  }

  override apply(actor: ActorPTR2e): void {
    if (this.ignored) return;
    if (!this.actor) return;

    const selector = this.resolveInjectedProperties(this.selector);
    if (!selector || selector === "null") return;

    const text = this.resolveInjectedProperties(String(this.resolveValue(this.text, "", { evaluate: false }))).trim();
    if (!text) return this.failValidation("text field resolved empty");

    const note = new RollNote({
      selector,
      text,
      predicate: this.resolveInjectedProperties(this.predicate),
      change: this
    })
    const notes = (actor.synthetics.rollNotes[selector] ??= []);
    notes.push(note);
  }
}

interface RollNoteChangeSystem {
  value: string;
}

export default RollNoteChangeSystem;
export type { RollNoteChangeSystem };