import { CollectionField } from "@module/data/fields/collection-field.ts";

export const TutorListVersion = 2 as const;

export class ExpTrackerSettings extends foundry.abstract.DataModel {
  static override defineSchema(): ExpTrackerSettingsSchema {
    return {
      data: new CollectionField(new foundry.data.fields.SchemaField({
        id: new foundry.data.fields.StringField({ required: true, nullable: false }),
        /**
         * @obsolete - Do not use, will be removed in a future patch.
         */
        checked: new foundry.data.fields.BooleanField({ required: true, nullable: false, initial: false }),
        amount: new foundry.data.fields.NumberField({ required: true, nullable: false, initial: 0, min: 0, max: 20, step: 1}),
      }), "id"),
      custom: new CollectionField(new foundry.data.fields.SchemaField({
        id: new foundry.data.fields.StringField({ required: true, nullable: false }),
        /**
         * @obsolete - Do not use, will be removed in a future patch.
         */
        checked: new foundry.data.fields.BooleanField({ required: true, nullable: false, initial: false }),
        label: new foundry.data.fields.StringField({ required: true, nullable: false }),
        value: new foundry.data.fields.NumberField({ required: true, nullable: false }),
        amount: new foundry.data.fields.NumberField({ required: true, nullable: false, initial: 0, min: 0, max: 20, step: 1}),
      }), "id"),
    }
  }

  get(id: string) {
    return this.data.get(id) ?? this.custom.get(id);
  }

  async remove(id: string) {
    if(!id.startsWith("custom.")) id = `custom.${id}`;
    if(!this.custom.has(id)) return;

    const data = this.toObject();
    data.custom = data.custom.filter(d => d.id !== id);
    return game.settings.set("ptr2e", "expTrackerData", data);
  }

  async add(id: string, label: string, value: number) {
    if(!id.startsWith("custom.")) id = `custom.${id}`;
    if(this.custom.has(id)) return;

    const data = this.toObject();
    data.custom.push({ id, value: value/100, label, amount: 0});

    return game.settings.set("ptr2e", "expTrackerData", data);
  }

  async update(id: string, amount: number) {
    if(id.startsWith("custom.")) {
      const data = this.toObject();
      const custom = data.custom.find(d => d.id == id);
      if(!custom) return;

      custom.amount = amount;
      return game.settings.set("ptr2e", "expTrackerData", data);
    }
    else {
      const data = this.toObject();
      const entry = data.data.find(d => d.id == id);
      if(entry) entry.amount = amount;
      else data.data.push({ id, amount });

      return game.settings.set("ptr2e", "expTrackerData", data);
    }
  }
}

export interface ExpTrackerSettings extends foundry.abstract.DataModel, ModelPropsFromSchema<ExpTrackerSettingsSchema> {
  _source: SourceFromSchema<ExpTrackerSettingsSchema>;
}

interface ExpTrackerSettingsSchema extends foundry.data.fields.DataSchema {
  data: CollectionField<
    foundry.data.fields.SchemaField<ExpTrackerDataSchema>,
    SourceFromSchema<ExpTrackerDataSchema>[],
    Collection<{ id: string, amount: number }>,
    true,
    false,
    true
  >;
  custom: CollectionField<
    foundry.data.fields.SchemaField<ExpTrackerCustomDataSchema>,
    SourceFromSchema<ExpTrackerCustomDataSchema>[],
    Collection<{ id: string, amount: number, label: string, value: number }>,
    true,
    false,
    true
  >;
}

interface ExpTrackerDataSchema extends foundry.data.fields.DataSchema {
  id: foundry.data.fields.StringField<string, string, true, false, false>,
}

interface ExpTrackerCustomDataSchema extends ExpTrackerDataSchema {
  label: foundry.data.fields.StringField<string, string, true, false, false>,
  value: foundry.data.fields.NumberField<number, number, true, false, false>,
  amount: foundry.data.fields.NumberField<number, number, true, false, true>,
}