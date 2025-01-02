import type { ClockSchema } from "./clock.ts";
import Clock from "./clock.ts";

const clockDatabaseSchema = {
  clocks: new foundry.data.fields.ArrayField(new foundry.data.fields.EmbeddedDataField(Clock), {
    required: true,
    label: "PTR2E.FIELDS.clocks.label",
    hint: "PTR2E.FIELDS.clocks.hint",
  })
}

export type ClockDatabaseSchema = typeof clockDatabaseSchema;

class ClockDatabase extends foundry.abstract.DataModel<ClockDatabaseSchema> {
  static override defineSchema(): ClockDatabaseSchema {
    return clockDatabaseSchema;
  }

  static get instance(): ClockDatabase {
    return game.settings.get("ptr2e", "clocks") as ClockDatabase;
  }

  static get clocks() {
    return this.instance.clocks.sort((a, b) => a.sort === b.sort ? a.label.localeCompare(b.label) : a.sort - b.sort);
  }

  static refresh() {
    if (canvas?.ready) game.ptr.clocks.panel.refresh(true);
  }

  static async update(data: foundry.data.fields.SchemaField.PersistedType<ClockDatabaseSchema>, refresh = true): Promise<ClockDatabase> {
    await game.settings.set("ptr2e", "clocks", data!) 

    if (refresh) this.refresh();

    return this.instance;
  }

  static async createClock(data: foundry.data.fields.SchemaField.PersistedType<ClockSchema>) {
    const instance = this.instance.toObject()
    instance.clocks.push(data!);
    return this.update(instance);
  }

  async createClock(data: foundry.data.fields.SchemaField.PersistedType<ClockSchema>) {
    return ClockDatabase.createClock(data);
  }

  static async updateClocks(data: ({ _id: Clock['id'] } & Partial<Omit<foundry.data.fields.SchemaField.AssignmentType<ClockSchema>, 'id'>>)[]) {
    const instance = this.instance.toObject();

    for (const update of data) {
      const clockIndex = instance.clocks.findIndex((c) => c.id === update._id);
      if (clockIndex === -1) continue;

      instance.clocks[clockIndex] = foundry.utils.mergeObject(instance.clocks[clockIndex], update);
    }

    return this.update(instance);
  }

  async updateClocks(data: ({ _id: Clock['id'] } & Partial<Omit<foundry.data.fields.SchemaField.AssignmentType<ClockSchema>, 'id'>>)[]) {
    return ClockDatabase.updateClocks(data);
  }

  static async updateClock(id: string, data: Partial<foundry.data.fields.SchemaField.AssignmentType<ClockSchema>>) {
    const instance = this.instance.toObject();
    const index = instance.clocks.findIndex((clock) => clock.id === id);
    if (index === -1) return undefined;
    instance.clocks[index] = foundry.utils.mergeObject(instance.clocks[index], data!);
    return this.update(instance);
  }

  async updateClock(id: string, data: Partial<foundry.data.fields.SchemaField.AssignmentType<ClockSchema>>) {
    return ClockDatabase.updateClock(id, data);
  }

  static async deleteClock(id: string) {
    const instance = this.instance.toObject();
    const index = instance.clocks.findIndex((clock) => clock.id === id);
    if (index === -1) return undefined;
    instance.clocks.splice(index, 1);
    return this.update(instance);
  }

  async deleteClock(id: string) {
    return ClockDatabase.deleteClock(id);
  }

  static override validateJoint(data: ClockDatabase['_source']) {
    const ids = new Set<string>();
    for (const clock of data.clocks) {
      if (ids.has(clock.id as string)) throw new Error("Clock IDs must be unique");
      ids.add(clock.id as string);
    }
  }

  static get(id: string) {
    return this.clocks.find((clock) => clock.id === id);
  }

  get(id: string) {
    return ClockDatabase.get(id);
  }
}

export default ClockDatabase;
