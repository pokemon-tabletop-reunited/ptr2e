

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

// @ts-expect-error - Ignore the change in typing
class HabitatRollTable extends RollTable {
  private static cache: PartialRecord<keyof typeof CONFIG.PTR.data.habitats, HabitatRollTable> = {};

  constructor(data: Record<string, unknown>, context: foundry.abstract.DataModel.DataValidationOptions<HabitatRollTable> = {}) {
    const habitatSlug = data.habitat as keyof typeof CONFIG.PTR.data.habitats;
    const habitat = CONFIG.PTR.data.habitats[habitatSlug];
    if (habitat === undefined) throw new Error(`Invalid habitat "${habitatSlug}"`);
    if(HabitatRollTable.cache[habitatSlug]) return HabitatRollTable.cache[habitatSlug]!;

    data.name = habitat.name;
    data.description = habitat.description;
    data.replacement = true;
    super(data, context);
    this.isInitialized = false;
    this.habitat = habitatSlug;
    HabitatRollTable.cache[habitatSlug] = this;
  }

  static override defineSchema(): RollTable.Schema {
    const schema = super.defineSchema() as RollTable.Schema;
    //@ts-expect-error - Ignore that this property isn't optional
    delete schema.results;
    return schema;
  }

  habitat: keyof typeof CONFIG.PTR.data.habitats;

  override async draw(options: RollTable.DrawOptions) {
    await this.init();
    // options = options ?? {};
    // options.displayChat = false;
    return super.draw(options);
  }

  override async drawMany(number: number, options: RollTable.DrawOptions) {
    await this.init();
    // options = options ?? {};
    // options.displayChat = false;
    return super.drawMany(number, options);
  }

  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;
    if (!this.habitat) return;

    const notification = ui.notifications.info(`Initializing Dynamic Table: ${this.name}...`, { permanent: true });

    //@ts-expect-error - fvtt-types is unfinished, fix when compendium index data is added.
    const data = await game.packs.get("ptr2e.core-species")!.getIndex({ fields: ["system.habitats", "system.slug", "system.number", "system.form"] }) as {
      _id: string,
      name: string,
      img: string,
      system: {
        habitats: Maybe<keyof typeof CONFIG.PTR.data.habitats>[],
        slug: string,
        number: number,
        form: string
      }
    }[]
    const species = data.filter(d => d.system.habitats?.includes(this.habitat));
    this.updateSource({
      results: (species.map( (s, i) => {
        return {
          type: CONST.TABLE_RESULT_TYPES.COMPENDIUM,
          documentCollection: "ptr2e.core-species",
          documentId: s._id,
          range: [i + 1, i + 1],
          text: s.name,
          img: s.img
        }
      })),
      formula: `1d${species.length}`
    });
    this.isInitialized = true;

    ui.notifications.remove(notification);
    ui.notifications.info(`Dynamic Table: ${this.name} Initialized!`);
  }

  override reset() {
    this.isInitialized = false;
    this.updateSource({ results: [], formula: "" });
    return super.reset();
  }

  static canRefresh(habitat: Maybe<keyof typeof CONFIG.PTR.data.habitats>) {
    return habitat ? !!HabitatRollTable.cache[habitat] : false;
  }

  static refresh(habitat: keyof typeof CONFIG.PTR.data.habitats) {
    const table = HabitatRollTable.cache[habitat];
    if (table) {
      ui.notifications.info("Resetting Dynamic Table Cache...");
      table.reset();
    }
  }
}

// @ts-expect-error - Ignore the change in typing
interface HabitatRollTable {
  results: TableResult[];
}

export { HabitatRollTable };