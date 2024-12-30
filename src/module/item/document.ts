import { ActorPTR2e } from "@actor";
import type { ItemSystemPTR, ItemSystemsWithActions } from "@item";
import type { ActionPTR2e, EquipmentData, Trait } from "@data";
import { RollOptionManager } from "@data";
import { ActiveEffectPTR2e, type EffectSourcePTR2e } from "@effects";
import { ActionsCollections } from "@actor/actions.ts";
import { SpeciesSystemModel } from "./data/index.ts";
import { preImportJSON } from "@module/data/doc-helper.ts";
import { MigrationList, MigrationRunner } from "@module/migration/index.ts";
import * as R from "remeda";
import { MigrationRunnerBase } from "@module/migration/runner/base.ts";
import { processGrantDeletions } from "@module/effects/changes/grant-item.ts";
import type { AnyDocument, DropData, FromDropDataOptions } from "node_modules/fvtt-types/src/foundry/client/data/abstract/client-document.d.mts";
import type { InexactPartial } from "fvtt-types/utils";

/**
 * @extends {PTRItemData}
 */
class ItemPTR2e extends Item {
  /** Has this document completed `DataModel` initialization? */
  declare initialized: boolean;

  // declare _sheet: ItemSheetPTR2e<this> | null;

  // override get sheet(): ItemSheetPTR2e<this> {
  //   return super.sheet as ItemSheetPTR2e<this>;
  // }

  /** The recorded schema version of this item, updated after each data migration */
  get schemaVersion(): number | null {
    return Number(this.system._migration?.version) || null;
  }

  get grantedBy(): ItemPTR2e | ActiveEffectPTR2e | null {
    return (this.actor?.items.get(this.flags.ptr2e.grantedBy?.id ?? "") as ItemPTR2e | undefined | null)
      ?? (this.actor?.effects.get(this.flags.ptr2e.grantedBy?.id ?? "") as ActiveEffectPTR2e | undefined | null)
      ?? null;
  }

  // protected override _initializeSource(
  //   data: Record<string, unknown>,
  //   options?: Omit<foundry.abstract.DataModel.DataValidationOptions, "parent">
  // ) {
  //   if (data && '_stats' in data && data._stats && typeof data._stats === 'object' && 'systemId' in data._stats && data._stats.systemId === "ptu") {
  //     data.type = "ptu-item";
  //   }
  //   return super._initializeSource(data, options);
  // }

  get slug() {
    return this.system.slug;
  }

  get traits(): Collection<Trait> | null {
    return "traits" in this.system ? this.system.traits as Collection<Trait> : null;
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

    const gearOptions = 'equipped' in this.system
      ? [
        `${this.slug}:${(this.system.equipped as EquipmentData).carryType}`,
        ...(["held", "worn"].includes((this.system.equipped as EquipmentData).carryType) ? `${this.slug}:equipped` : [])
      ]
      : [] as string[];

    const options = [
      `${prefix}:id:${this.id}`,
      `${prefix}:${this.slug}`,
      `${prefix}:slug:${this.slug}`,
      ...granterOptions,
      ...(this.parent?.getRollOptions() ?? []).map((o) => `actor:${o}`),
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

  static override async fromDropData<T extends foundry.abstract.Document.AnyConstructor>(
    this: T,
    data: DropData<InstanceType<NoInfer<T>>>,
    options?: FromDropDataOptions
  ) {
    if (data?.type !== "ActiveEffect")
      return super.fromDropData(data, options) as Promise<T | undefined>;

    let document: AnyDocument | ActiveEffectPTR2e | null = null;

    // Case 1 - Data explicitly provided
    if (data.data) {
      document = new CONFIG.ActiveEffect.documentClass(data.data) as ActiveEffectPTR2e;
    }
    // Case 2 - UUID provided
    else if ('uuid' in data && data.uuid) document = await fromUuid(data.uuid);

    // Ensure that we have an ActiveEffect document
    if (!document)
      throw new Error(
        "Failed to resolve Document from provided DragData. Either data or a UUID must be provided."
      );
    if (document.documentName !== "ActiveEffect")
      throw new Error("Invalid drop data provided for ActiveEffect Item creation");

    // Create item document with the ActiveEffect data
    return new CONFIG.Item.documentClass({
      name: document.name,
      type: "effect",
      effects: [document.toObject()],
      _id: document._id,
    });
  }

  static override async createDocuments<T extends foundry.abstract.Document.AnyConstructor, Temporary extends boolean | undefined>(
    this: T,
    data: Item.ConstructorData[],
    operation?: Record<string, unknown> & {
      temporary?: Temporary;
    }
  ): Promise<foundry.abstract.Document.ToStoredIf<T, Temporary>[] | undefined> {
    const sources = data?.map((d) => (d instanceof Item ? d.toObject() : d)) ?? [];

    // Migrate source in case of importing from an old compendium
    for (const source of [...sources]) {
      if (R.isEmpty(R.pick(source, ["flags", "system"]))) {
        // The item has no migratable data: set schema version and skip
        const migrationSource = { _migration: { version: MigrationRunnerBase.LATEST_SCHEMA_VERSION } };
        source.system = foundry.utils.mergeObject(source.system ?? {}, migrationSource);
        continue;
      }

      const item = new CONFIG.Item.documentClass(source);
      await MigrationRunner.ensureSchemaVersion(item, MigrationList.constructFromVersion(item.schemaVersion));
      data.splice(data.indexOf(source), 1, item.toObject());
    }

    const actor = operation?.parent as ActorPTR2e | null;
    //@ts-expect-error - Operation cannot be typed correctly until https://github.com/League-of-Foundry-Developers/foundry-vtt-types/issues/2998 is resolved
    if (!actor) return super.createDocuments<T, Temporary>(data, operation);

    const specialTypes = ["species"];

    for (const source of sources) {
      if (specialTypes.includes(source.type as string)) {
        switch (source.type) {
          case "species": {
            const speciesItem = actor.items.get("actorspeciesitem")
            if (speciesItem) {
              await speciesItem.update({ "system": source.system });
              return [];
            }
          }
        }
        return [];
      }
    }

    async function processSources(sources: ItemPTR2e['_source'][]) {
      const outputItemSources: ItemPTR2e['_source'][] = [];

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
              tempItems: [],
              context: {}
            })
          }
        }

        source.effects = outputEffectSources;
      }

      return outputItemSources;
    }

    const outputItemSources = await processSources(sources as ItemPTR2e['_source'][]);

    if(!operation) operation = {};

    if (!(operation.keepId || operation.keepEmbeddedIds)) {
      for (const source of sources) {
        source._id = foundry.utils.randomID();
      }
      operation.keepEmbeddedIds = true;
      operation.keepId = true;
    }

    //@ts-expect-error - Operation cannot be typed correctly until https://github.com/League-of-Foundry-Developers/foundry-vtt-types/issues/2998 is resolved
    return super.createDocuments<T, Temporary>(sources.concat(outputItemSources), operation);
  }

  /**
   * Exact copy of the original createDialog method except:
   * Removed 'ptu-item' from appearing in the list.
   */
  static override async createDialog(
    data: Record<string, unknown> = {},
    context?: Record<string, unknown> & {
      parent?: AnyDocument;
      pack?: string | null;
    } & 
      InexactPartial<
        DialogOptions & {
          perksOnly?: boolean;
          types?: string[];
        }
      >
  ) {
    if(!context) context = {};
    const { parent, pack, ...options } = context;

    // Collect data
    const documentName = this.metadata.name;
    const types = context.perksOnly ? ["perk"] : game.documentTypes[documentName as keyof typeof game["documentTypes"]].filter(t => t !== CONST.BASE_DOCUMENT_TYPE && t !== "ptu-item");
    let collection: CompendiumCollection<CompendiumCollection.Metadata> | WorldCollection<typeof AnyDocument, string> | undefined;
    if (!parent) {
      if (pack) collection = game.packs.get(pack);
      else collection = game.collections.get(documentName);
    }
    //@ts-expect-error - Accessing a protected property
    const folders = collection?._formatFolderSelectOptions() ?? [];
    
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
        const form = $(html)[0].querySelector("form");
        const fd = new FormDataExtended(form!);
        foundry.utils.mergeObject(data, fd.object, { inplace: true });
        if (!data.folder) delete data.folder;
        if (types.length === 1) data.type = types[0];
        if (!(data.name as string)?.trim()) data.name = this.defaultName();
        return this.implementation.create(data, { parent, pack, renderSheet: true });
      },
      rejectClose: false,
      options
    })
  }

  override async update(data: Record<string, unknown>, context?: InexactPartial<Omit<foundry.abstract.Document.DatabaseOperationsFor<"Item", "update">, "updates">>): Promise<this | undefined> {
    if (!(this.system instanceof SpeciesSystemModel && this.system.virtual) && !this.flags.ptr2e.virtual) return super.update(data, context);

    await this.actor?.updateEmbeddedDocuments("Item", [{ _id: "actorspeciesitem", "system.species": foundry.utils.expandObject(data).system }]);
    this.updateSource(data);
    foundry.applications.instances.get(`SpeciesSheet-${this.uuid}`)?.render({});
    return undefined;
  }

  /** Assess and pre-process this JSON data, ensuring it's importable and fully migrated */
  override async importFromJSON(json: string): Promise<this> {
    const processed = await preImportJSON(this, json);
    return processed ? super.importFromJSON(processed) : this;
  }

  static override async deleteDocuments(ids: string[] = [], context: InexactPartial<Omit<foundry.abstract.Document.DatabaseOperationsFor<"Item", "delete">, "ids">> & { pendingEffects?: ActiveEffectPTR2e<ActorPTR2e | ItemPTR2e>[], ignoreRestricted?: boolean } = {}): Promise<foundry.abstract.Document.ToConfiguredInstance<typeof Item>[]> {
    ids = Array.from(new Set(ids)).filter(id => id !== "actorspeciesitem");
    const actor = context.parent as Actor | undefined
    if (actor) {
      const items = ids.flatMap(id => actor.items.get(id) ?? []) as ItemPTR2e[];
      const effects = context.pendingEffects ? [...context.pendingEffects] : [] as ActiveEffectPTR2e<ActorPTR2e | ItemPTR2e>[];

      // TODO: Logic for container deletion

      // Run Change Model pre-delete callbacks
      for (const item of [...items]) {
        if (item.effects.size) {
          for (const effect of item.effects) {
            for (const change of (effect as ActiveEffectPTR2e).changes) {
              await change.preDelete?.({ pendingItems: items, context });
            }

            await processGrantDeletions(effect as ActiveEffectPTR2e<ActorPTR2e | ItemPTR2e>, item, items, effects, !!context.ignoreRestricted)
          }
        }
        else {
          if (item.grantedBy && item.grantedBy instanceof ActiveEffectPTR2e) {
            await processGrantDeletions(item.grantedBy as ActiveEffectPTR2e<ActorPTR2e | ItemPTR2e>, item, items, effects, !!context.ignoreRestricted);
          }
        }
      }
      if (effects.length) {
        const effectIds = Array.from(new Set(effects.map(e => e.id))).filter(id => actor.effects.has(id) && !context.pendingEffects?.find(e => e.id === id));
        if (effectIds.length) {
          await ActiveEffectPTR2e.deleteDocuments(effectIds, { pendingItems: items, parent: actor });
        }
      }
      ids = Array.from(new Set(items.map(i => i.id))).filter(id => id && actor.items.has(id));
    }
    return super.deleteDocuments(ids, context);
  }

  override getEmbeddedCollection<EmbeddedName extends Exclude<foundry.CONST.EMBEDDED_DOCUMENT_TYPES, "Region" | "RegionBehavior"> | "Actions">(embeddedName: EmbeddedName): Collection<foundry.abstract.Document.ConfiguredInstanceForName<EmbeddedName extends foundry.abstract.Document.Type ? EmbeddedName : never>> {
    if (embeddedName === "Actions" && this.hasActions()) return this.actions as unknown as ReturnType<Item["getEmbeddedCollection"]>;
    return super.getEmbeddedCollection(embeddedName as Exclude<foundry.CONST.EMBEDDED_DOCUMENT_TYPES, "Region" | "RegionBehavior">);
  }

}

interface ItemPTR2e extends Item {
  constructor: typeof ItemPTR2e;
  // readonly _source: foundry.documents.ItemSource<string, TSystem>;

  _actions: ActionsCollections;

  system: ItemSystemPTR;

  rollOptions: RollOptionManager<this>;
}

export { ItemPTR2e };
