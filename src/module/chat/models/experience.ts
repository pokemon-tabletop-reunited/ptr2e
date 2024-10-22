import { ActorPTR2e } from "@actor";

function toCM(number: number) {
    if (number >= 0) return `+${number}%`;
    return `${number}%`;
}

class ExperienceMessageSystem extends foundry.abstract.TypeDataModel {

    /**
     * Define the schema for the ExperienceMessageSystem data model
     */
    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            expBase: new fields.NumberField({ required: true, nullable: false }),
            expApplied: new fields.ArrayField(new fields.SchemaField({
                uuid: new fields.DocumentUUIDField({ required: true, type: 'Actor' }),
                old: new fields.SchemaField({
                    experience: new fields.NumberField({ required: true, nullable: false }),
                    level: new fields.NumberField({ required: true, nullable: false }),
                }, { required: true }),
                new: new fields.SchemaField({
                    experience: new fields.NumberField({ required: true, nullable: false }),
                    level: new fields.NumberField({ required: true, nullable: false }),
                }, { required: true }),
            }), { required: true, initial: [] }),
            modifiers: new fields.ArrayField(new fields.SchemaField({
                label: new fields.StringField({ required: true, nullable: false }),
                bonus: new fields.NumberField({ required: true, nullable: false })
            }), { required: true, initial: [] }),
            notes: new fields.ArrayField(new fields.ArrayField(new fields.HTMLField({ blank: false, nullable: false })), { required: true, initial: [] }),
            rollNotes: new fields.ArrayField(new fields.StringField({ blank: false, nullable: false }), { required: true, initial: [] }),
        }
    }



    async getHTMLContent() {
        const data: Record<string, any> = {
            ...this.toObject(),
        };
        console.log("expApplied", this.expApplied);
        const expAppliedActors = await Promise.all(this.expApplied.map(async (ea)=>{
            return {
                // @ts-expect-error
                ...ea,
                // @ts-expect-error
                actor: await fromUuid(ea.uuid as unknown as string),
                // @ts-expect-error
                levelGain: ea.new.level - ea.old.level,
            }
        }));
        console.log("expAppliedActors", expAppliedActors);
        data.expAppliedActors = expAppliedActors;
        // @ts-expect-error
        data.modifiers = data.modifiers.map(m=>({
            label: m.label,
            bonus: toCM(m.bonus),
        }));
        return renderTemplate('systems/ptr2e/templates/chat/experience.hbs', data);
    }
}

interface ExperienceMessageSystem extends ModelPropsFromSchema<ExperienceMessageSchema> {
  _source: SourceFromSchema<ExperienceMessageSchema>;

  _notesHTML: string | undefined;
}

interface AdvancementField extends foundry.data.fields.DataField {
    experience: foundry.data.fields.NumberField<number, number, true, false, false>,
    level: foundry.data.fields.NumberField<number, number, true, false, false>,
}

interface ExpAppliedField extends foundry.data.fields.DataField {
    uuid: foundry.data.fields.DocumentUUIDField<ActorPTR2e, true, true, false>,
    old: AdvancementField,
    new: AdvancementField,
}

interface CircumstanceField extends foundry.data.fields.DataField {
    label: foundry.data.fields.StringField;
    bonus: foundry.data.fields.NumberField;
}

interface ExperienceMessageSchema extends foundry.data.fields.DataSchema {
  expBase: foundry.data.fields.NumberField<number, number, true, false, false>;
  expApplied: foundry.data.fields.ArrayField<ExpAppliedField>;
  modifiers: foundry.data.fields.ArrayField<CircumstanceField>;
}

export default ExperienceMessageSystem;