import { ActorPTR2e } from "@actor";
import { ItemSourcePTR2e, ItemSystemPTR, ItemSystemsWithActions } from "@item";
import { ActionPTR2e, EquipmentData, RollOptionManager, Trait } from "@data";
import { ActiveEffectPTR2e, EffectSourcePTR2e } from "@effects";
import { ItemFlagsPTR2e } from "./data/system.ts";
import { ActionsCollections } from "@actor/actions.ts";
import { SpeciesSystemModel } from "./data/index.ts";
import { preImportJSON } from "@module/data/doc-helper.ts";
import { MigrationList, MigrationRunner } from "@module/migration/index.ts";
import * as R from "remeda";
import { MigrationRunnerBase } from "@module/migration/runner/base.ts";
import { processGrantDeletions } from "@module/effects/changes/grant-item.ts";
import BlueprintSystem from "./data/blueprint.ts";
import ItemSheetPTR2e from "./sheets/base.ts";

/**
 * @extends {PTRItemData}
 */
class ItemPTR2e<
  TSystem extends ItemSystemPTR = ItemSystemPTR,
  TParent extends ActorPTR2e | null = ActorPTR2e | null,
> extends Item<TParent, TSystem> {
  /** Has this document completed `DataModel` initialization? */
  declare initialized: boolean;

  declare _sheet: ItemSheetPTR2e<TSystem> | null;

  override get sheet(): ItemSheetPTR2e<TSystem> {
    return super.sheet as ItemSheetPTR2e<TSystem>;
  }

  /** The recorded schema version of this item, updated after each data migration */
  get schemaVersion(): number | null {
    return Number(this.system._migration?.version) || null;
  }

  get grantedBy(): ItemPTR2e | ActiveEffectPTR2e | null {
    return (this.actor?.items.get(this.flags.ptr2e?.grantedBy?.id ?? "") as Maybe<ItemPTR2e>)
      ?? (this.actor?.effects.get(this.flags.ptr2e?.grantedBy?.id ?? "") as Maybe<ActiveEffectPTR2e>)
      ?? null;
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

  getRollOptions(prefix = this.type, { includeGranter = true, includeActor = true } = {}): string[] {
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

    const gearOptions = 'equipped' in this.system
      ? [
        `${this.slug}:${(this.system.equipped as EquipmentData).carryType}`,
        ...(["held", "worn"].includes((this.system.equipped as EquipmentData).carryType) ? `${this.slug}:equipped` : [])
      ]
      : [] as string[];

    const actorOptions = includeActor && this.parent
      ? this.parent.getRollOptions().map((o) => `actor:${o}`)
      : [];

    const options = [
      `${prefix}:id:${this.id}`,
      `${prefix}:${this.slug}`,
      `${prefix}:slug:${this.slug}`,
      ...granterOptions,
      ...actorOptions,
      ...traitOptions.map((o) => `${prefix}:${o}`),
      ...gearOptions.map((o) => `${prefix}:${o}`),
    ];

    return options;
  }

  override getRollData(): Record<string, unknown> {
    const rollData: Record<string, unknown> = { item: this };
    if (this.parent instanceof ActorPTR2e) rollData.actor = this.parent;
    return rollData;
  }

  get actions() {
    return this._actions;
  }

  protected override _initialize(options?: Record<string, unknown>): void {
    this.initialized = false;
    super._initialize(options);
  }

  /**
   * Never prepare data except as part of `DataModel` initialization. If embedded, don't prepare data if the parent is
   * not yet initialized. See https://github.com/foundryvtt/foundryvtt/issues/7987
   */
  override prepareData(): void {
    if (this.initialized) return;
    if (!this.parent || this.parent.initialized) {
      this.initialized = true;
      super.prepareData();
    }
  }

  override prepareBaseData() {
    if (this.type === "ptu-item") return super.prepareBaseData();
    this._actions = new ActionsCollections(this);

    this.rollOptions = new RollOptionManager(this);

    this.rollOptions.addOption("item", `type:${this.type}`, { addToParent: false });
    this.flags.ptr2e.itemGrants ??= {};

    super.prepareBaseData();
  }

  override prepareDerivedData(): void {
    super.prepareDerivedData();
    if (this.type === "ptu-item") return;

    if (this.hasActions()) this._actions.addActionsFromItem(this);
    if (!this.parent) return;
    if (this.hasActions()) this.parent._actions.addActionsFromItem(this);

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
      img: document.img,
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
            const speciesItem = actor.items.get("actorspeciesitem") as ItemPTR2e<ItemSystemPTR, ActorPTR2e>;
            if (speciesItem) {
              await speciesItem.update({ "system": source.system });
              return [];
            }
          }
        }
        return [];
      }
    }

    if (!(context.keepId || context.keepEmbeddedIds)) {
      for (const source of sources) {
        source._id = fu.randomID();
      }
      context.keepEmbeddedIds = true;
      context.keepId = true;
    }

    async function processSources(sources: ItemSourcePTR2e[]) {
      const outputItemSources: ItemSourcePTR2e[] = sources;

      for (const source of sources) {
        if (!source.effects?.length) continue;
        const item = new CONFIG.Item.documentClass(source as ItemPTR2e["_source"], { parent: actor }) as ItemPTR2e;
        const effects = source.effects.map((e: unknown) => new CONFIG.ActiveEffect.documentClass(e as ActiveEffectPTR2e["_source"], { parent: item }) as ActiveEffectPTR2e);

        // Process effect preCreate changes for all effects that are going to be added
        // This may add additional effects or items (such as via GrantItem)

        const outputEffectSources: EffectSourcePTR2e[] = effects.map((e) => e._source as EffectSourcePTR2e);

        for (const effect of effects) {
          const effectSource = effect._source as EffectSourcePTR2e;
          const changes = effect.system.changes ?? [];

          for (const change of changes) {
            const changeSource = change._source;
            await change.preCreate?.({
              effectSource,
              changeSource,
              pendingEffects: outputEffectSources,
              pendingItems: outputItemSources,
              itemSource: source,
              tempItems: [],
              context: {}
            })
          }
        }

        source.effects = outputEffectSources;
      }

      return outputItemSources;
    }

    const outputItemSources = await processSources(sources as ItemSourcePTR2e[]);

    return super.createDocuments<TDocument>(sources.concat(outputItemSources) as PreCreate<TDocument["_source"]>[], context);
  }

  static override async createDialog<TDocument extends foundry.abstract.Document>(this: ConstructorOf<TDocument>, data?: Record<string, unknown>, context?: { parent?: TDocument["parent"]; pack?: Collection<TDocument> | null; types?: string[] } & Partial<FormApplicationOptions>): Promise<TDocument | null>;
  static override async createDialog(
    data: Record<string, unknown> = {},
    createOptions: Record<string, unknown> = {},
    {
      folders,
      types,
      template,
      context,
      ...dialogOptions
    }: {
      folders?: { id: string, name: string }[];
      types?: string[];
      template?: string;
    } & {
      context?: { parent?: Actor; pack?: Collection<ItemPTR2e> | null; types?: string[] } & Partial<FormApplicationOptions>;
    } = {}
  ) {
    if (types?.length) types = types.filter(t => t !== "ptu-item");
    else types = this.TYPES.filter(t => t !== "ptu-item");

    return super.createDialog(data, createOptions, {
      folders, types, template, context, ...dialogOptions
    });
  }

  override async update(data: Record<string, unknown>, context?: DocumentModificationContext<TParent> | undefined): Promise<this | undefined> {
    if (!(this.system instanceof SpeciesSystemModel && this.system.virtual) && !this.flags.ptr2e.virtual) return super.update(data, context);

    await this.actor?.updateEmbeddedDocuments("Item", [{ _id: "actorspeciesitem", "system.species": fu.expandObject(data).system }]);
    this.updateSource(data);
    foundry.applications.instances.get(`SpeciesSheet-${this.uuid}`)?.render({});
    return undefined;
  }

  /** Assess and pre-process this JSON data, ensuring it's importable and fully migrated */
  override async importFromJSON(json: string): Promise<this> {
    const parsed = JSON.parse(json);
    if (parsed.type !== "PackagedBlueprint") {
      const processed = await preImportJSON(this, json);
      return processed ? super.importFromJSON(processed) : this;
    }
    else {
      const blueprint = await BlueprintSystem.importFromJSON(this, parsed);
      return blueprint as this ?? this;
    }
  }

  static override async deleteDocuments<TDocument extends foundry.abstract.Document>(this: ConstructorOf<TDocument>, ids?: string[], context?: DocumentModificationContext<TDocument["parent"]> & { pendingEffects?: ActiveEffectPTR2e<ActorPTR2e | ItemPTR2e<ItemSystemPTR, ActorPTR2e>>[] }): Promise<TDocument[]>;
  static override async deleteDocuments(ids: string[] = [], context: DocumentModificationContext<ActorPTR2e | null> & { pendingEffects?: ActiveEffectPTR2e<ActorPTR2e | ItemPTR2e<ItemSystemPTR, ActorPTR2e>>[] } = {}): Promise<foundry.abstract.Document[]> {
    ids = Array.from(new Set(ids)).filter(id => id !== "actorspeciesitem");
    const actor = context.parent;
    if (actor) {
      const items = ids.flatMap(id => actor.items.get(id) ?? []) as ItemPTR2e<ItemSystemPTR, ActorPTR2e>[];
      const effects = context.pendingEffects ? [...context.pendingEffects] : [] as ActiveEffectPTR2e<ActorPTR2e | ItemPTR2e<ItemSystemPTR, ActorPTR2e>>[];

      // TODO: Logic for container deletion

      // Run Change Model pre-delete callbacks
      for (const item of [...items]) {
        if (item.effects.size) {
          for (const effect of item.effects) {
            for (const change of (effect as ActiveEffectPTR2e).changes) {
              await change.preDelete?.({ pendingItems: items, context });
            }

            await processGrantDeletions(effect as ActiveEffectPTR2e<ActorPTR2e | ItemPTR2e<ItemSystemPTR, ActorPTR2e>>, item, items, effects, !!context.ignoreRestricted)
          }
        }
        else {
          if (item.grantedBy && item.grantedBy instanceof ActiveEffectPTR2e) {
            await processGrantDeletions(item.grantedBy as ActiveEffectPTR2e<ActorPTR2e | ItemPTR2e<ItemSystemPTR, ActorPTR2e>>, item, items, effects, !!context.ignoreRestricted);
          }
        }
      }
      if (effects.length) {
        const effectIds = Array.from(new Set(effects.map(e => e.id))).filter(id => actor.effects.has(id) && !context.pendingEffects?.find(e => e.id === id));
        if (effectIds.length) {
          await ActiveEffectPTR2e.deleteDocuments(effectIds, { pendingItems: items, parent: actor });
        }
      }
      ids = Array.from(new Set(items.map(i => i.id))).filter(id => actor.items.has(id));
    }
    return super.deleteDocuments(ids, context);
  }

  protected override _onDelete(options: DocumentModificationContext<TParent>, userId: string): void {
    super._onDelete(options, userId);
    if (!(this.actor && game.user.id === userId)) return;

    const actorUpdates: Record<string, unknown> = {};
    for (const effect of this.effects) {
      for (const change of (effect as unknown as ActiveEffectPTR2e).changes) {
        change.onDelete?.(actorUpdates);
      }
    }

    const updateKeys = Object.keys(actorUpdates);
    if (updateKeys.length > 0 && !updateKeys.every((k) => k === "_id")) {
      this.actor.update(actorUpdates);
    }
  }

  override getEmbeddedCollection(embeddedName: string) {
    if (embeddedName === "Actions" && this.hasActions()) return this.actions as unknown as ReturnType<Item["getEmbeddedCollection"]>;
    return super.getEmbeddedCollection(embeddedName);
  }

  // static override updateDocuments<TDocument extends foundry.abstract.Document>(
  //   this: ConstructorOf<TDocument>,
  //   updates?: Record<string, unknown>[],
  //   operation?: Partial<DocumentModificationContext<TDocument["parent"]>>,
  // ): Promise<TDocument[]>;
  // static override async updateDocuments(
  //   updates: Record<string, unknown>[] = [],
  //   operation: Partial<DocumentModificationContext<ActorPTR2e | null>> = {},
  // ): Promise<Item<Actor | null>[]> {
  //   const isFullReplace = !((operation?.diff ?? true) && (operation?.recursive ?? true));
  //   if (isFullReplace) return super.updateDocuments(updates, operation);

  //   // Process rule element hooks for each actor update
  //   for (const changed of updates) {
  //     await processPreUpdateActorHooks(changed, { pack: operation.pack ?? null, type: 'item' });
  //   }

  //   return super.updateDocuments(updates, operation);
  // }

  override exportToJSON(options?: Record<string, unknown>): void {
    if (this.type !== "blueprint") return super.exportToJSON(options);
    return void (this.system as BlueprintSystem).exportToJSON();
  }

  async syncData(): Promise<void> {
    const sourceId = this.flags.core?.sourceId || this._stats?.compendiumSource;
    if (!sourceId) {
      return void ui.notifications.error("Unable to detect source for this item, unable to sync.");
    }

    const source = await fu.fromUuid(sourceId) as this;
    if (!source) {
      return void ui.notifications.error("The source this item references no longer exists.");
    }

    const sourceData = R.pick(source.toObject(), ["name", "type", "img", "system", "effects"]);
    const thisData = R.pick(this.toObject(), ["name", "type", "img", "system", "effects"]);

    const diff = fu.diffObject(thisData, sourceData);
    if (fu.isEmpty(diff)) {
      return void ui.notifications.warn("No changes detected.");
    }

    // Preserve action slot
    if ((thisData.system?.actions as ActionPTR2e[])?.length && diff.system && typeof diff.system == "object" && 'actions' in diff.system && diff.system.actions && Array.isArray(diff.system.actions) && diff.system.actions.length) {
      const actionSlots = (thisData.system.actions as ActionPTR2e[])?.flatMap(a => typeof a.slot == 'number' ? { slug: a.slug, slot: a.slot } : []) ?? [];
      for (const entry of actionSlots) {
        const action = diff.system.actions.find((a: ActionPTR2e) => a.slug === entry.slug);
        if (action && !isNaN(entry.slot)) {
          action.slot = entry.slot;
        }
      }
    }

    // Preserve ability slots
    if (thisData.system.slot && !isNaN(thisData.system.slot as number) && diff.system && typeof diff.system == "object" && 'slot' in diff.system && diff.system.slot) {
      diff.system.slot = thisData.system.slot;
    }

    const changes = fu.flattenObject(diff);
    await this.update(changes);
    ui.notifications.info("Changes synced.");
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
