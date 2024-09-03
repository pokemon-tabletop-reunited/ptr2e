import { ActorPTR2e } from "@actor";
import { ChatMessagePTR2e } from "@chat";
import { SlugField } from "@module/data/fields/slug-field.ts";

abstract class DamageAppliedMessageSystem extends foundry.abstract.TypeDataModel {
  declare parent: ChatMessagePTR2e<DamageAppliedMessageSystem>;

  /**
   * Define the schema for the DamageAppliedMessageSystem data model
   */
  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      target: new fields.DocumentUUIDField({ required: true, type: 'Actor' }),
      damageApplied: new fields.NumberField({ required: true }),
      shieldApplied: new fields.BooleanField({ required: true, initial: false }),
      undone: new fields.BooleanField({ required: true, initial: false }),
      notes: new fields.ArrayField(new fields.ArrayField(new fields.HTMLField({ blank: false, nullable: false })), { required: true, initial: [] }),
      rollNotes: new fields.ArrayField(new fields.StringField({ blank: false, nullable: false }), { required: true, initial: [] }),
      result: new fields.SchemaField({
        domains: new fields.ArrayField(new SlugField(), { required: true, initial: [] }),
        type: new fields.StringField({ required: true, blank: true, initial: "" }),
        options: new fields.ArrayField(new fields.StringField(), { required: true, initial: [] }),
      }, {nullable: true, initial: null})
    }
  }

  override prepareBaseData(): void {

    this.target = (() => {
      const actor = fromUuidSync<ActorPTR2e>(this._source.target!);
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

interface DamageAppliedMessageSystem extends ModelPropsFromSchema<DamageAppliedMessageSchema> {
  _source: SourceFromSchema<DamageAppliedMessageSchema>;

  _notesHTML: string | undefined;
}

interface DamageAppliedMessageSchema extends foundry.data.fields.DataSchema {
  target: foundry.data.fields.DocumentUUIDField<ActorPTR2e, true, true, false>;
  damageApplied: foundry.data.fields.NumberField<number, number, true, false, false>;
  shieldApplied: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
  undone: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
  notes: foundry.data.fields.ArrayField<foundry.data.fields.ArrayField<foundry.data.fields.HTMLField>>;
  result: foundry.data.fields.SchemaField<
    DamageAppliedResultSchema,
    foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<DamageAppliedResultSchema>>,
    foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<DamageAppliedResultSchema>>,
    true,
    true,
    true
  >
}

interface DamageAppliedResultSchema extends foundry.data.fields.DataSchema {
  domains: foundry.data.fields.ArrayField<SlugField, string[], string[], true, false, true>;
  options: foundry.data.fields.ArrayField<foundry.data.fields.StringField, string[], string[], true, false, true>;
  type: foundry.data.fields.StringField<string, string, true, false, true>;
}

export default DamageAppliedMessageSystem