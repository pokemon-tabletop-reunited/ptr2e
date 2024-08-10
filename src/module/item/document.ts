import { ActorPTR2e } from "@actor";
import { ItemSheetPTR2e, ItemSystemPTR, ItemSystemsWithActions } from "@item";
import { ActionPTR2e, RollOptionManager, Trait } from "@data";
import { ActiveEffectPTR2e } from "@effects";
import { ItemFlagsPTR2e } from "./data/system.ts";
import { ActionsCollections } from "@actor/actions.ts";
import { SpeciesSystemModel } from "./data/index.ts";
import ConsumableSystem from "./data/consumable.ts";
import PokeballActionPTR2e from "@module/data/models/pokeball-action.ts";
import { preImportJSON } from "@module/data/doc-helper.ts";
import { MigrationList, MigrationRunner } from "@module/migration/index.ts";
import * as R from "remeda";
import { MigrationRunnerBase } from "@module/migration/runner/base.ts";

/**
 * @extends {PTRItemData}
 */
class ItemPTR2e<
  TSystem extends ItemSystemPTR = ItemSystemPTR,
  TParent extends ActorPTR2e | null = ActorPTR2e | null,
> extends Item<TParent, TSystem> {
  declare grantedBy: ItemPTR2e | ActiveEffectPTR2e | null;

  declare sourceId: string;

  declare _sheet: ItemSheetPTR2e<this> | null;

  override get sheet(): ItemSheetPTR2e<this> {
    return super.sheet as ItemSheetPTR2e<this>;
  }

  /** The recorded schema version of this item, updated after each data migration */
  get schemaVersion(): number | null {
    return Number(this.system._migration?.version) || null;
  }

  protected override _initializeSource(
    data: object & { _stats: { systemId: string }; type: string },
    options?: DataModelConstructionOptions<TParent> | undefined
  ): this["_source"] {
    if (data?._stats?.systemId === "ptu") {
      data.type = "ptu-item";
    }
    return super._initializeSource(data, options);
  }

  get slug() {
    return this.system.slug;
  }

  get traits(): Collection<Trait> | null {
    return "traits" in this.system ? this.system.traits : null;
  }

  getRollOptions(prefix = this.type, { includeGranter = true } = {}): string[] {
    const traitOptions = ((): string[] => {
      if (!this.traits) return [];
      const options = [];
      for (const trait of this.traits) {
        options.push(`trait:${trait.slug}`);
      }
      return options;
    })();

    const granterOptions = includeGranter
      ? this.grantedBy
        ?.getRollOptions("granter", { includeGranter: false })
        .map((o) => `${prefix}:${o}`) ?? []
      : [];

    const options = [
      `${prefix}:id:${this.id}`,
      `${prefix}:${this.slug}`,
      `${prefix}:slug:${this.slug}`,
      ...granterOptions,
      ...(this.parent?.getRollOptions() ?? []).map((o) => `${prefix}:${o}`),
      ...traitOptions.map((o) => `${prefix}:${o}`),
    ];

    return options;
  }

  override getRollData(): Record<string, unknown> {
    const rollData: Record<string, unknown> = { item: this };
    if(this.parent instanceof ActorPTR2e) rollData.actor = this.parent;
    return rollData;
  }

  get actions() {
    return this._actions;
  }

  override prepareBaseData() {
    if (this.type === "ptu-item") return super.prepareBaseData();
    this._actions = new ActionsCollections(this);

    this.rollOptions = new RollOptionManager(this);

    this.rollOptions.addOption("item", `type:${this.type}`, { addToParent: false });

    super.prepareBaseData();
  }

  override prepareDerivedData(): void {
    super.prepareDerivedData();
    if (this.type === "ptu-item") return;

    if (this.hasActions()) this._actions.addActionsFromItem(this);
    if (!this.parent) return;
    if (this.hasActions()) this.parent._actions.addActionsFromItem(this);
    if (this.type === "consumable" && (this.system as ConsumableSystem).consumableType === "pokeball") {
      const action = PokeballActionPTR2e.fromConsumable(this as ItemPTR2e<ConsumableSystem, ActorPTR2e>);
      this.parent._actions.set(action.slug, action);
    }

    this.rollOptions.addOption("item", `${this.type}:${this.slug}`);
  }

  hasActions(): this is ItemPTR2e<ItemSystemsWithActions> {
    return 'actions' in this.system && (this.system.actions as Collection<ActionPTR2e>).size > 0;
  }

  async toChat() {
    return ChatMessage.create({
      content: `<span>@Embed[${this.uuid} caption=false classes=no-tooltip]</span>`,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    });
  }

  static override async fromDropData<TDocument extends foundry.abstract.Document>(
    this: ConstructorOf<TDocument>,
    data: DropCanvasData,
    options?: Record<string, unknown> | undefined
  ): Promise<TDocument | undefined> {
    if (data?.type !== "ActiveEffect")
      return super.fromDropData(data, options) as Promise<TDocument | undefined>;

    let document: ActiveEffectPTR2e | null = null;

    // Case 1 - Data explicitly provided
    if (data.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      document = new CONFIG.ActiveEffect.documentClass(data.data as any) as ActiveEffectPTR2e;
    }
    // Case 2 - UUID provided
    else if (data.uuid) document = await fromUuid(data.uuid);

    // Ensure that we have an ActiveEffect document
    if (!document)
      throw new Error(
        "Failed to resolve Document from provided DragData. Either data or a UUID must be provided."
      );
    if (document.documentName !== "ActiveEffect")
      throw new Error("Invalid drop data provided for ActiveEffect Item creation");

    // Create item document with the ActiveEffect data
    return new this({
      name: document.name,
      type: "effect",
      effects: [document.toObject()],
      _id: document._id,
    });
  }

  static override async createDocuments<TDocument extends foundry.abstract.Document>(
    this: ConstructorOf<TDocument>,
    data?: (TDocument | PreCreate<TDocument["_source"]>)[],
    context?: DocumentModificationContext<TDocument["parent"]>
  ): Promise<TDocument[]>;
  static override async createDocuments<TDocument extends foundry.abstract.Document>(
    data: (TDocument | PreCreate<TDocument["_source"]>)[] = [],
    context: DocumentModificationContext<TDocument["parent"]> = {},
  ): Promise<foundry.abstract.Document[]> {
    const sources = data?.map((d) => (d instanceof ItemPTR2e ? d.toObject() : d as PreCreate<ItemPTR2e["_source"]>)) ?? [];

    // Migrate source in case of importing from an old compendium
    for (const source of [...sources] as PreCreate<ItemPTR2e["_source"]>[]) {
      if (R.isEmpty(R.pick(source, ["flags", "system"]))) {
        // The item has no migratable data: set schema version and skip
        const migrationSource = { _migration: { version: MigrationRunnerBase.LATEST_SCHEMA_VERSION } };
        source.system = fu.mergeObject(source.system ?? {}, migrationSource);
        continue;
      }

      const item = new CONFIG.Item.documentClass(source);
      await MigrationRunner.ensureSchemaVersion(item, MigrationList.constructFromVersion(item.schemaVersion));
      data.splice(data.indexOf(source as PreCreate<TDocument["_source"]>), 1, item.toObject() as unknown as PreCreate<TDocument["_source"]>);
    }

    const actor = context?.parent as ActorPTR2e | null;
    if (!actor) return super.createDocuments<TDocument>(data, context);

    const specialTypes = ["species"];

    for (const source of sources) {
      if (specialTypes.includes(source.type as string)) {
        switch (source.type) {
          case "species": {
            return [];
          }
        }
        return [];
      }
    }

    return super.createDocuments<TDocument>(data, context);
  }

  /**
   * Exact copy of the original createDialog method except:
   * Removed 'ptu-item' from appearing in the list.
   */
  static override async createDialog<TDocument extends foundry.abstract.Document>(
    this: ConstructorOf<TDocument>,
    data: Record<string, unknown> = {},
    context: {
      parent?: TDocument["parent"];
      pack?: Collection<TDocument> | null;
      perksOnly?: boolean;
      types?: string[];
    } & Partial<FormApplicationOptions>,
  ): Promise<TDocument | null> {
    const { parent, pack, ...options } = context;

    // Collect data
    //@ts-expect-error - This is a valid string property
    const documentName = this.metadata.name;
    const types = context.perksOnly ? ["perk"] : game.documentTypes[documentName].filter(t => t !== CONST.BASE_DOCUMENT_TYPE && t !== "ptu-item");
    let collection: Items<ItemPTR2e<ItemSystemPTR, null>> | undefined;
    if (!parent) {
      if (pack) collection = game.packs.get(pack as unknown as string) as unknown as Items<ItemPTR2e<ItemSystemPTR, null>>;
      else collection = game.collections.get(documentName);
    }
    const folders = collection?._formatFolderSelectOptions() ?? [];
    //@ts-expect-error - This is a valid string property
    const label = context.perksOnly ? game.i18n.localize("TYPES.Item.perk") : game.i18n.localize(this.metadata.label);
    const title = game.i18n.format("DOCUMENT.Create", { type: label });
    // Render the document creation form
    const html = await renderTemplate("templates/sidebar/document-create.html", {
      folders,
      name: data.name || game.i18n.format("DOCUMENT.New", { type: label }),
      folder: data.folder,
      hasFolders: folders.length >= 1,
      type: data.type || (CONFIG[documentName as keyof typeof CONFIG] as { defaultType?: string })?.defaultType || types[0],
      types: types.reduce((obj, t) => {
        const label = (CONFIG[documentName as keyof typeof CONFIG] as { typeLabels?: Record<string, string> })?.typeLabels?.[t] ?? t;
        obj[t as keyof typeof obj] = game.i18n.has(label) ? game.i18n.localize(label) : t;
        return obj;
      }, {} as Record<string, unknown>),
      hasTypes: types.length > 1
    });

    // Render the confirmation dialog window
    return Dialog.prompt({
      title: title,
      content: html,
      label: title,
      callback: html => {
        const form = html[0].querySelector("form");
        const fd = new FormDataExtended(form!);
        foundry.utils.mergeObject(data, fd.object, { inplace: true });
        if (!data.folder) delete data.folder;
        if (types.length === 1) data.type = types[0];
        //@ts-expect-error - This is a valid string property
        if (!data.name?.trim()) data.name = this.defaultName();
        //@ts-expect-error - This is a valid string property
        return this.implementation.create(data, { parent, pack, renderSheet: true });
      },
      rejectClose: false,
      options
    }) as unknown as TDocument | null;
  }

  override async update(data: Record<string, unknown>, context?: DocumentModificationContext<TParent> | undefined): Promise<this | undefined> {
    if (!(this.system instanceof SpeciesSystemModel && this.system.virtual) && !this.flags.ptr2e.virtual) return super.update(data, context);

    await this.actor?.update({ "system.species": data.system });
    this.updateSource(data);
    foundry.applications.instances.get(`SpeciesSheet-${this.uuid}`)?.render({});
    return undefined;
  }

  /** Assess and pre-process this JSON data, ensuring it's importable and fully migrated */
  override async importFromJSON(json: string): Promise<this> {
    const processed = await preImportJSON(this, json);
    return processed ? super.importFromJSON(processed) : this;
  }
}

interface ItemPTR2e<
  TSystem extends ItemSystemPTR = ItemSystemPTR,
  TParent extends ActorPTR2e | null = ActorPTR2e | null,
> extends Item<TParent, TSystem> {
  constructor: typeof ItemPTR2e;
  flags: ItemFlagsPTR2e;
  readonly _source: foundry.documents.ItemSource<string, TSystem>;

  _actions: ActionsCollections;

  rollOptions: RollOptionManager<this>;
}

export { ItemPTR2e };
