import { ActorPTR2e } from "@actor";
import { ChangeModel, ChangeSchema } from "@data";
import { UserVisibility } from "@scripts/ui/user-visibility.ts";
import { RollNote } from "@system/notes.ts";

export default class RollNoteChangeSystem extends ChangeModel {
  static override TYPE = "roll-note";

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      visibility: new fields.StringField({
        required: true,
        nullable: true,
        choices: ["gm", "owner"],
        initial: null,
      }),
    }
  }

  get selector() {
    return this.key;
  }

  get text() {
    return this.value;
  }

  override apply(actor: ActorPTR2e): void {
    if(this.ignored) return;
    if(!this.actor) return;

    const selector = this.resolveInjectedProperties(this.selector);
    if(!selector || selector === "null") return;

    const text = this.resolveInjectedProperties(String(this.resolveValue(this.text, "", {evaluate: false}))).trim();
    if(!text) return this.failValidation("text field resolved empty");

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

export default interface RollNoteChangeSystem extends ChangeModel, ModelPropsFromSchema<RollNoteSchema> {
  _source: SourceFromSchema<RollNoteSchema>;
  value: string;
}

interface RollNoteSchema extends ChangeSchema {
  /** An optional limitation of the notes visibility to GMs */
  visibility: foundry.data.fields.StringField<UserVisibility, UserVisibility, true, true, true>;
  /** Applicable degree-of-success outcomes for the note */
  // outcome: foundry.data.fields.ArrayField<foundry.data.fields.StringField<DegreeOfSuccessString, DegreeOfSuccessString, true, false, false>>;
};