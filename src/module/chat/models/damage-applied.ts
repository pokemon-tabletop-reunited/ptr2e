import { SlugField } from "@module/data/fields/slug-field.ts";
import type { AnyObject } from "fvtt-types/utils";

const damageAppliedSchema = {
  target: new foundry.data.fields.DocumentUUIDField<{required: true, type: 'Actor'}, AnyObject, Actor.ConfiguredInstance | null>({ required: true, type: 'Actor' }),
  damageApplied: new foundry.data.fields.NumberField({ required: true, nullable: false }),
  shieldApplied: new foundry.data.fields.BooleanField({ required: true, initial: false }),
  undone: new foundry.data.fields.BooleanField({ required: true, initial: false }),
  notes: new foundry.data.fields.ArrayField(new foundry.data.fields.ArrayField(new foundry.data.fields.HTMLField({ blank: false, nullable: false })), { required: true, initial: [] }),
  rollNotes: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField({ blank: false, nullable: false }), { required: true, initial: [] }),
  result: new foundry.data.fields.SchemaField({
    domains: new foundry.data.fields.ArrayField(new SlugField(), { required: true, initial: [] }),
    type: new foundry.data.fields.StringField({ required: true, blank: true, initial: "" }),
    options: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField(), { required: true, initial: [] }),
  }, { nullable: true, initial: null })
}

export type DamageAppliedSchema = typeof damageAppliedSchema;

abstract class DamageAppliedMessageSystem extends foundry.abstract.TypeDataModel<DamageAppliedSchema, ChatMessage.ConfiguredInstance> {
  /**
   * Define the schema for the DamageAppliedMessageSystem data model
   */
  static override defineSchema(): DamageAppliedSchema {
    return damageAppliedSchema;
  }

  override prepareBaseData(): void {

    this.target = (() => {
      const actor = fromUuidSync(this._source.target!) as Actor.ConfiguredInstance | null;
      return actor;
    })();

    const notesElement = document.createElement('div');
    for (let i = 0; i < this.notes.length; i++) {
      const element = document.createElement('article');
      element.classList.add('note', `note-${i}`);
      for (let j = 0; j < this.notes[i].length; j++) {
        const note = document.createElement('figure');
        note.innerHTML = this.notes[i][j];
        // The last figure will contain the damage applied note
        // This figure should get the class 'damage'
        if (j === this.notes[i].length - 1) note.classList.add('damage');
        element.appendChild(note);
      }
      notesElement.appendChild(element);
    }
    this._notesHTML = notesElement.innerHTML;
  }

  async getHTMLContent() {
    return renderTemplate('systems/ptr2e/templates/chat/damage-applied.hbs', this);
  }

  async undoDamage() {
    if (this.undone) return;
    if (!this.target) return;

    await this.parent.update({ "system.undone": true });
    await this.target.applyDamage(-this.damageApplied, { silent: true, healShield: this.shieldApplied });
  }

  activateListeners(html: JQuery<HTMLElement>) {
    html.find(".revert-damage").on('click', this.undoDamage.bind(this));
  }
}

interface DamageAppliedMessageSystem {
  _notesHTML: string | undefined;
}

export default DamageAppliedMessageSystem