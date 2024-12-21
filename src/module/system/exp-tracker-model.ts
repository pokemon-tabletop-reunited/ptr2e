import { CollectionField } from "@module/data/fields/collection-field.ts";

export const TutorListVersion = 1 as const;

export class ExpTrackerSettings extends foundry.abstract.DataModel {
  static override defineSchema(): ExpTrackerSettingsSchema {
    return {
      data: new CollectionField(new foundry.data.fields.SchemaField({
        id: new foundry.data.fields.StringField({ required: true, nullable: false }),
        checked: new foundry.data.fields.BooleanField({ required: true, nullable: false, initial: false }),
      }), "id"),
      custom: new CollectionField(new foundry.data.fields.SchemaField({
        id: new foundry.data.fields.StringField({ required: true, nullable: false }),
        checked: new foundry.data.fields.BooleanField({ required: true, nullable: false, initial: false }),
        label: new foundry.data.fields.StringField({ required: true, nullable: false }),
        value: new foundry.data.fields.NumberField({ required: true, nullable: false }),
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
    data.custom.push({ id, value: value/100, label, checked: false });

    return game.settings.set("ptr2e", "expTrackerData", data);
  }

  async update(id: string, checked: boolean) {
    if(id.startsWith("custom.")) {
      const data = this.toObject();
      const custom = data.custom.find(d => d.id == id);
      if(!custom) return;

      custom.checked = checked;
      return game.settings.set("ptr2e", "expTrackerData", data);
    }
    else {
      const data = this.toObject();
      const entry = data.data.find(d => d.id == id);
      if(entry) entry.checked = checked;
      else data.data.push({ id, checked });

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
    Collection<{ id: string, checked: boolean }>,
    true,
    false,
    true
  >;
  custom: CollectionField<
    foundry.data.fields.SchemaField<ExpTrackerCustomDataSchema>,
    SourceFromSchema<ExpTrackerCustomDataSchema>[],
    Collection<{ id: string, checked: boolean, label: string, value: number }>,
    true,
    false,
    true
  >;
}

interface ExpTrackerDataSchema extends foundry.data.fields.DataSchema {
  id: foundry.data.fields.StringField<string, string, true, false, false>,
  checked: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>,
}

interface ExpTrackerCustomDataSchema extends ExpTrackerDataSchema {
  label: foundry.data.fields.StringField<string, string, true, false, false>,
  value: foundry.data.fields.NumberField<number, number, true, false, false>,
}