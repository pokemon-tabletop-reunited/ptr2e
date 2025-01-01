import { CollectionField } from "@module/data/fields/collection-field.ts";

const expTrackerSettingsSchema = {
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

export type ExpTrackerSettingsSchema = typeof expTrackerSettingsSchema;

export class ExpTrackerSettings extends foundry.abstract.DataModel<ExpTrackerSettingsSchema> {
  static override defineSchema(): ExpTrackerSettingsSchema {
    return expTrackerSettingsSchema
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