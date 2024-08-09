import { ActorPTR2e } from "@actor";
import { ItemPTR2e, ItemSourcePTR2e } from "@item";
import { ActiveEffectSystem, EffectSourcePTR2e } from "@effects";
import { ChangeModel, Trait } from "@data";
import { ActiveEffectSchema } from "types/foundry/common/documents/active-effect.js";
import { CombatPTR2e } from "@combat";
import { sluggify } from "@utils";
class ActiveEffectPTR2e<
  TParent extends ActorPTR2e | ItemPTR2e | null = ActorPTR2e | ItemPTR2e | null,
  TSystem extends ActiveEffectSystem = ActiveEffectSystem,
> extends ActiveEffect<TParent, TSystem> {
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

  override prepareBaseData(): void {
    super.prepareBaseData();

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
  override _requiresDurationUpdate() {
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
    }

    if (data.description.startsWith("PTR2E.Effect.")) {
      this.updateSource({
        description: game.i18n.localize(data.description),
      });
    }

    if (!data.img) this.updateSource({ img: "/systems/ptr2e/img/icons/effect_icon.webp" });

    return result;
  }

  // TODO: Clean this up cause god it's a mess.
  protected override _preUpdate(
    changed: DeepPartial<this["_source"]>,
    options: DocumentUpdateContext<TParent>,
    user: User
  ): Promise<boolean | void> {
    const parseChangePath = (expanded: { changes: unknown[]; system?: unknown }) => {
      expanded.system = fu.mergeObject(expanded.system ?? {}, {
        changes: expanded.changes,
      });
    };

    const parseIndexPaths = (data: { system: { changes: object } }): void => {
      const current = this.changes.map((c) => c.toObject());
      for (const [key, value] of Object.entries(data.system.changes)) {
        const index = parseInt(key);
        if (!current[index]) continue;

        current[index] = fu.mergeObject(current[index], value);
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

    const expanded = fu.expandObject(changed);
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

    fu.setProperty(changed, "system", expanded.system);
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
          source._id = fu.randomID();
        }

        const existing = (parent.effects.contents as ActiveEffectPTR2e[]).find(
          (e) => e.slug === sluggify(source.name)
        );
        if (existing?.system.stacks) {
          existing.update({ "system.stacks": existing.system.stacks + 1 });
          return [];
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

    await ItemPTR2e.createDocuments( //@ts-expect-error - this should not error
      outputItemSources,
      context as DocumentModificationContext<ActorPTR2e | null>
    );
    // Create the effects
    return super.createDocuments(outputEffectSources, context) as Promise<ActiveEffectPTR2e[]>;
  }
}

interface ActiveEffectPTR2e<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TParent extends ActorPTR2e | ItemPTR2e | null = ActorPTR2e | ItemPTR2e | null,
  TSystem extends ActiveEffectSystem = ActiveEffectSystem,
> {
  constructor: typeof ActiveEffectPTR2e;
  readonly _source: foundry.documents.ActiveEffectSource<string, TSystem>;

  _name: string;
}

export default ActiveEffectPTR2e;
