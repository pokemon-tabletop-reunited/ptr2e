import {ClockPTR2e} from "./clock.ts";

const clockDbSchema = {
  clocks: new foundry.data.fields.ArrayField(new foundry.data.fields.EmbeddedDataField(ClockPTR2e), {
    required: true,
    label: "PTR2E.FIELDS.clocks.label",
    hint: "PTR2E.FIELDS.clocks.hint",
  }),
};

declare namespace ClockDatabase {
  type Schema = typeof clockDbSchema;
}

class ClockDatabase extends foundry.abstract.DataModel<ClockDatabase.Schema> {
  static override defineSchema(): ClockDatabase.Schema {
    return clockDbSchema;
  }

  static get instance(): ClockDatabase {
    return game.settings.get("ptr2e", "clocks")
  }

  static get clocks() {
    return this.instance.clocks.sort((a, b) => a.sort === b.sort ? a.label.localeCompare(b.label) : a.sort - b.sort);
  }

  static refresh() {
    if (canvas?.ready) game.ptr.clocks.panel.refresh({} as boolean);
  }

  static async update(data: ClockDatabase['_source'], refresh = true): Promise<ClockDatabase> {
    //@ts-expect-error - Valid operation, learn how to type this properly.
    await game.settings.set("ptr2e", "clocks", data);

    if (refresh) this.refresh();

    return this.instance;
  }

  static async createClock(data: foundry.data.fields.SchemaField.PersistedData<ClockPTR2e.Schema>) {
    const instance = this.instance.toObject();
    instance.clocks.push(data);
    return this.update(instance);
  }

  async createClock(data: foundry.data.fields.SchemaField.PersistedData<ClockPTR2e.Schema>) {
    return ClockDatabase.createClock(data);
  }

  static async updateClocks(data: ({ _id: ClockPTR2e['id'] } & Partial<Omit<foundry.data.fields.SchemaField.PersistedData<ClockPTR2e.Schema>, 'id'>>)[]) {
    const instance = this.instance.toObject();

    for (const update of data) {
      const clockIndex = instance.clocks.findIndex((c) => c.id === update._id);
      if (clockIndex === -1) continue;

      instance.clocks[clockIndex] = foundry.utils.mergeObject(instance.clocks[clockIndex]!, update) as unknown as foundry.data.fields.SchemaField.PersistedData<ClockPTR2e.Schema>
    }

    return this.update(instance);
  }

  async updateClocks(data: ({ _id: ClockPTR2e['id'] } & Partial<Omit<foundry.data.fields.SchemaField.PersistedData<ClockPTR2e.Schema>, 'id'>>)[]) {
    return ClockDatabase.updateClocks(data);
  }

  static async updateClock(id: string, data: Partial<foundry.data.fields.SchemaField.PersistedData<ClockPTR2e.Schema>>) {
    const instance = this.instance.toObject();
    const index = instance.clocks.findIndex((clock) => clock.id === id);
    if (index === -1) return undefined;
    instance.clocks[index] = foundry.utils.mergeObject(instance.clocks[index]!, data) as unknown as foundry.data.fields.SchemaField.PersistedData<ClockPTR2e.Schema>;
    return this.update(instance);
  }

  async updateClock(id: string, data: Partial<foundry.data.fields.SchemaField.PersistedData<ClockPTR2e.Schema>>) {
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
      if (ids.has(clock.id)) throw new Error("Clock IDs must be unique");
      ids.add(clock.id);
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
