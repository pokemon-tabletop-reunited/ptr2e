import { ActorPTR2e } from "@actor";
import type { ItemSourcePTR2e, ItemSystemPTR } from "@item";
import { ItemPTR2e } from "@item";
import type { ActiveEffectSystem, EffectSourcePTR2e } from "@effects";
import type { ChangeModel, Trait } from "@data";
import type { ActiveEffectSchema } from "types/foundry/common/documents/active-effect.js";
import type { CombatPTR2e } from "@combat";
import { sluggify } from "@utils";
import type { RollOptionDomains } from "@module/data/roll-option-manager.ts";
import type { ItemGrantData } from "@item/data/data.ts";
import { processGrantDeletions } from "./changes/grant-item.ts";
import { AbilitySystemModel } from "@item/data/index.ts";
class ActiveEffectPTR2e<
  TParent extends ActorPTR2e | ItemPTR2e | null = ActorPTR2e | ItemPTR2e | null,
  TSystem extends ActiveEffectSystem = ActiveEffectSystem,
> extends ActiveEffect<TParent, TSystem> {
  /** Has this document completed `DataModel` initialization? */
  declare initialized: boolean;
  declare static TYPES: string[];

  static LOCALIZATION_PREFIXES = ["PTR2E.Effect"];

  declare grantedBy: ItemPTR2e | null;

  get slug() {
    return this.system._source.slug ?? sluggify(this._name);
  }

  static override get schema() {
    if (this.hasOwnProperty("_schema")) return this._schema!;
    const schema = new foundry.data.fields.SchemaField(Object.freeze(this.defineSchema()));
    Object.defineProperty(this, "_schema", { value: schema, writable: false });
    return schema;
  }

  static override defineSchema() {
    const schema = super.defineSchema() as { changes?: ActiveEffectSchema["changes"] } & Omit<
      ActiveEffectSchema,
      "changes"
    >;
    delete schema.changes;
    return schema as ActiveEffectSchema;
  }

  override get changes() {
    return this.system.changes ?? [];
  }

  get traits(): Collection<Trait> {
    return this.system.traits;
  }

  get expired(): boolean {
    if (this.duration.type !== "turns") return false;
    return this.duration.remaining === 0;
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

      for (const change of this.changes) {
        change.prepareData?.();
      }
    }
  }

  override prepareBaseData(): void {
    super.prepareBaseData();

    this.flags.ptr2e = foundry.utils.mergeObject(this.flags.ptr2e ?? {}, { choiceSelections: {} })

    this._name = this._source.name;
    Object.defineProperty(this, "name", {
      get: () =>
        this.system.stacks > 1
          ? `${this._name} ${this.system.stacks}`
          : this.duration.remaining !== null && this.duration.remaining !== undefined
            ? `${this._name} ${this.duration.remaining}`
            : this._name,
      set: (value: string) => {
        this._name = value;
      },
    });
  }

  override prepareDerivedData(): void {
    super.prepareDerivedData();

    if (this.parent?.rollOptions) {
      this.parent.rollOptions.addOption("effect", `${this.type}:${this.slug}`);
    }
  }

  override apply(actor: ActorPTR2e, change: ChangeModel, options?: string[]): unknown {
    if (this.parent instanceof ItemPTR2e && this.parent && this.parent.system instanceof AbilitySystemModel) {
      if (this.parent.system.suppress) return;
    }
    return this.system.apply(actor, change, options);
  }

  getRollOptions(prefix = this.type, { includeGranter = true } = {}): string[] {
    const traitOptions = ((): string[] => {
      const options = [];
      for (const trait of this.traits.values()) {
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
      ...(this.parent?.getRollOptions() ?? []).map((o) => `${prefix}:parent:${o}`),
      ...traitOptions.map((o) => `${prefix}:${o}`),
    ];

    return this.system.getRollOptions(options);
  }

  targetsActor(): this is ActiveEffectPTR2e<ActorPTR2e> {
    return this.modifiesActor;
  }

  /**
   * Override the implementation of ActiveEffect#_requiresDurationUpdate to support activation-based initiative.
   * Duration is purely handled in terms of combat turns elapsed.
   */
  override _requiresDurationUpdate(): boolean {
    const { _combatTime, type } = this.duration;
    if (type === "turns" && game.combat) {
      //@ts-expect-error - This is a private property
      const ct = this.parent?.combatant?.system.activations; //(game.combat as CombatPTR2e).system.turn;
      return ct !== _combatTime && !!(this.target as ActorPTR2e)?.inCombat;
    }
    return false;
  }

  /**
   * Override the implementation of ActiveEffect#_prepareDuration to support activation-based initiative.
   * Duration is purely handled in terms of combat turns elapsed.
   */
  override _prepareDuration(): Partial<ActiveEffectPTR2e["duration"]> {
    const d = this.duration;

    // Turn-based duration
    if (this.parent && (d.rounds || d.turns)) {
      const cbt = game.combat as CombatPTR2e | undefined;
      if (!cbt || !this.targetsActor())
        return {
          type: "turns",
          _combatTime: undefined,
        };

      // Determine the current combat duration
      const durationTurn = d.turns ?? 0;
      const startTurn = d.startTurn ?? 0;

      // Determine parent combatant's activation amount
      const currentTurn = this.parent.combatant?.system.activations;
      if (currentTurn === undefined)
        return {
          type: "turns",
          _combatTime: undefined,
        };

      // If the effect has not started yet display the full duration
      if (currentTurn <= startTurn) {
        return {
          type: "turns",
          duration: durationTurn,
          remaining: durationTurn,
          label: this._getDurationLabel(0, d.turns),
          _combatTime: currentTurn,
        };
      }

      // Some number of remaining turns (possibly zero)
      const remainingTurns = Math.max(startTurn + durationTurn - currentTurn, 0);
      return {
        type: "turns",
        duration: durationTurn,
        remaining: remainingTurns,
        label: this._getDurationLabel(0, remainingTurns),
        _combatTime: currentTurn,
      };
    }

    // No duration
    return {
      type: "none",
      duration: null,
      remaining: null,
      label: game.i18n.localize("None"),
    };
  }

  toChat(): Promise<unknown> {
    return ChatMessage.create({
      content: `<span>@Embed[${this.uuid} caption=false classes=no-tooltip]</span>`,
      speaker: ChatMessage.getSpeaker({
        actor: this.targetsActor()
          ? this.target
          : this.parent instanceof ItemPTR2e
            ? this.parent.actor
            : game.user.character ?? null,
      }),
    });
  }

  override toObject(source?: true | undefined): this["_source"];
  override toObject(source: false): RawObject<this>;
  override toObject(source?: boolean | undefined): this["_source"] | RawObject<this> {
    const data = super.toObject(source) as this["_source"];
    data.changes = this.changes.map((c) => c.toObject()) as this["_source"]["changes"];
    return data;
  }

  protected override async _preCreate(
    data: this["_source"],
    options: DocumentModificationContext<TParent>,
    user: User
  ): Promise<boolean | void> {
    if (!options.keepId && data._id) {
      const statusEffect = CONFIG.statusEffects.find((effect) => effect._id === data._id);
      if (statusEffect) options.keepId = true;
    }

    const result = await super._preCreate(data, options, user);
    if (result === false) return false;

    if (this.targetsActor()) {
      if (data.duration && data.system.stacks && data.system.stacks > 1) {
        data.duration.turns = data.system.stacks;
        this.updateSource({
          duration: {
            turns: data.system.stacks,
          },
        });
      }
      if (data.duration?.turns && !data.duration.startTurn) {
        this.updateSource({
          duration: {
            startTurn: this.parent.combatant?.system.activations ?? 0,
          },
        });
      }

      if (this.target.isImmuneToEffect(this)) {
        ui.notifications.warn(game.i18n.format("PTR2E.Effect.Immune", { effect: this.name, target: this.target.name }));
        return false;
      }
    }

    if (data.description.startsWith("PTR2E.Effect.")) {
      this.updateSource({
        description: game.i18n.localize(data.description),
      });
    }

    if (!data.img) this.updateSource({ img: "systems/ptr2e/img/icons/effect_icon.webp" });

    return result;
  }

  // TODO: Clean this up cause god it's a mess.
  protected override async _preUpdate(
    changed: DeepPartial<this["_source"]>,
    options: DocumentUpdateContext<TParent>,
    user: User
  ): Promise<boolean | void> {
    if (!changed?.changes && !changed?.system?.changes) return super._preUpdate(changed, options, user);

    const parseChangePath = (expanded: { changes: unknown[]; system?: unknown }) => {
      expanded.system = foundry.utils.mergeObject(expanded.system ?? {}, {
        changes: expanded.changes,
      });
    };

    const parseIndexPaths = (data: { system: { changes: object } }): void => {
      const current = this.changes.map((c) => c.toObject());
      for (const [key, value] of Object.entries(data.system.changes)) {
        const index = parseInt(key);
        if (!current[index]) continue;

        current[index] = foundry.utils.mergeObject(current[index], value);
      }
      data.system.changes = current;
    };

    const isValidChargesArray = (data: Record<string, unknown>) => {
      return "changes" in data && Array.isArray(data.changes) && data.changes.length > 0;
    };

    const isValidSystemPathObject = (data: Record<string, unknown>) => {
      return "system" in data && data.system && typeof data.system === "object";
    };

    const isValidIndexPathObject = (system: Record<string, unknown>) => {
      return (
        "changes" in system &&
        system.changes &&
        typeof system.changes === "object" &&
        !Array.isArray(system.changes) &&
        Object.keys(system.changes).length > 0 &&
        Object.keys(system.changes).every((k) => !isNaN(parseInt(k)))
      );
    };

    const expanded = foundry.utils.expandObject(changed);
    if (isValidChargesArray(expanded)) {
      parseChangePath(expanded as { changes: unknown[]; system?: unknown });
    } else if (isValidIndexPathObject(expanded)) {
      parseChangePath(expanded as { changes: unknown[]; system?: unknown });

      if (
        isValidSystemPathObject(expanded) &&
        isValidIndexPathObject(expanded.system as Record<string, unknown>)
      ) {
        parseIndexPaths(expanded as { system: { changes: Record<number, unknown> } });
      }
    } else if (
      isValidSystemPathObject(expanded) &&
      isValidIndexPathObject(expanded.system as Record<string, unknown>)
    ) {
      parseIndexPaths(expanded as { system: { changes: Record<number, unknown> } });
    }
    foundry.utils.setProperty(changed, "system.changes", (expanded.system as Record<string, unknown>).changes);
    delete changed.changes;

    return super._preUpdate(changed, options, user);
  }

  static override async createDocuments<TDocument extends foundry.abstract.Document>(
    this: ConstructorOf<TDocument>,
    data?: (TDocument | PreCreate<TDocument["_source"]>)[],
    context?: DocumentModificationContext<TDocument["parent"]>
  ): Promise<TDocument[]>;
  static override async createDocuments(
    data: (ActiveEffectPTR2e | PreCreate<EffectSourcePTR2e>)[] = [],
    context: DocumentModificationContext<ActorPTR2e | ItemPTR2e | null> = {}
  ): Promise<ActiveEffectPTR2e[]> {
    const sources: PreCreate<EffectSourcePTR2e>[] = data.map((d) =>
      d instanceof ActiveEffectPTR2e ? (d.toObject() as EffectSourcePTR2e) : d
    );

    const parent = context.parent;
    if (!parent) return super.createDocuments(sources, context) as Promise<ActiveEffectPTR2e[]>;

    const effects = await (async (): Promise<ActiveEffectPTR2e[]> => {
      const effects = sources.flatMap((source) => {
        if (!(context.keepId || context.keepEmbeddedIds)) {
          source._id = foundry.utils.randomID();
        }

        if (source.flags?.ptr2e?.stacks !== false) {
          const existing = (parent.effects.contents as ActiveEffectPTR2e[]).find(
            (e) => e.slug === sluggify(source.name)
          );
          if (existing?.system.stacks) {
            existing.update({ "system.stacks": existing.system.stacks + (source.system?.stacks || 1) });
            return [];
          }
          if ((
            (source.system?.traits as string[])?.includes("major-affliction")
            || (source.system?.traits as string[])?.includes("minor-affliction")
          ) && existing?.duration.turns) {
            existing.update({ "duration.turns": existing.duration.turns + (source.duration?.turns || 1) });
            return [];
          }
        }

        return new this(source, { parent });
      });
      return effects;
      // TODO: Possibly implement simple grants for Effects
    })();

    const tempItems: ItemPTR2e[] = [];
    const outputItemSources: ItemSourcePTR2e[] = [];
    const outputEffectSources = effects.map((e) => e._source as EffectSourcePTR2e);

    // Process effect preCreate changes for all effects that are going to be added
    // This may add additional effects or items (such as via GrantItem)
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
          tempItems,
          context,
        });
      }
    }

    if (outputItemSources.length) {
      await ItemPTR2e.createDocuments( //@ts-expect-error - this should not error
        outputItemSources,
        context as DocumentModificationContext<ActorPTR2e | null>
      );
    }
    // Create the effects
    return super.createDocuments(outputEffectSources, context) as Promise<ActiveEffectPTR2e[]>;
  }

  static override async deleteDocuments<TDocument extends foundry.abstract.Document>(this: ConstructorOf<TDocument>, ids?: string[], context?: DocumentModificationContext<TDocument["parent"]> & { pendingItems?: ItemPTR2e<ItemSystemPTR, ActorPTR2e>[] }): Promise<TDocument[]>;
  static override async deleteDocuments(ids: string[] = [], context: DocumentModificationContext<ActorPTR2e | ItemPTR2e | null> & { pendingItems?: ItemPTR2e<ItemSystemPTR, ActorPTR2e>[] } = {}): Promise<foundry.abstract.Document[]> {
    ids = Array.from(new Set(ids));
    const actor = context.parent instanceof ActorPTR2e ? context.parent : null;
    if (actor) {
      const effects = ids.flatMap(id => actor.effects.get(id) ?? []) as ActiveEffectPTR2e<ActorPTR2e | ItemPTR2e<ItemSystemPTR, ActorPTR2e>>[];
      const items = context.pendingItems ? [...context.pendingItems] : [] as ItemPTR2e<ItemSystemPTR, ActorPTR2e>[];

      // Run Change Model pre-delete callbacks
      for (const effect of effects) {
        for (const change of effect.changes) {
          await change.preDelete?.({ pendingItems: items, context });
        }

        await processGrantDeletions(effect, null, items, effects, !!context.ignoreRestricted);
      }

      if (items.length) {
        const itemIds = Array.from(new Set(items.map(i => i.id))).filter(id => actor.items.has(id) && !context.pendingItems?.find(i => i.id === id));
        if (itemIds.length) {
          await ItemPTR2e.deleteDocuments(itemIds, { pendingEffects: effects, parent: actor });
        }
      }
      ids = Array.from(new Set(effects.map(i => i.id))).filter(id => actor.effects.has(id));
    }
    return super.deleteDocuments(ids, context);
  }
}

interface ActiveEffectPTR2e<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TParent extends ActorPTR2e | ItemPTR2e | null = ActorPTR2e | ItemPTR2e | null,
  TSystem extends ActiveEffectSystem = ActiveEffectSystem,
> {
  constructor: typeof ActiveEffectPTR2e;
  readonly _source: foundry.documents.ActiveEffectSource<string, TSystem>;

  flags: DocumentFlags & {
    ptr2e: {
      itemGrants: Record<string, ItemGrantData>;
      grantedBy: ItemGrantData | null;
      choiceSelections: Record<string, string | number | object | null>;
      rollOptions: {
        [domain in keyof typeof RollOptionDomains]: Record<string, boolean>;
      }
      aura?: {
        slug: string;
        origin: ActorUUID;
        removeOnExit: boolean;
        amount?: number;
      };
    };
  }

  _name: string;
}

export default ActiveEffectPTR2e;
