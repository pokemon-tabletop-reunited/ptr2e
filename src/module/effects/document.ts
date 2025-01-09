import { sluggify } from "@utils";

class ActiveEffectPTR2e extends ActiveEffect {
  /** Has this document completed `DataModel` initialization? */
  declare initialized: boolean;
  declare static TYPES: string[];

  static override LOCALIZATION_PREFIXES = ["PTR2E.Effect"];

  declare grantedBy: Item.ConfiguredInstance | null;

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
    const schema = super.defineSchema();
    delete schema.changes;
    return schema as ActiveEffect.Schema;
  }

  // override get changes() {
  //   return this.system.changes ?? [];
  // }

  get traits(): Collection<PTR.Models.Trait.Instance> {
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

      for (const change of this.system.changes) {
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


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override apply(actor: Actor.ConfiguredInstance, _change: any, options?: string[]): unknown {
    const change = _change as PTR.ActiveEffect.Changes.Instance;
    if (this.parent instanceof CONFIG.Item.documentClass && this.parent && this.parent.system instanceof CONFIG.PTR.Item.dataModels.ability) {
      if (this.parent.system.suppress) return;
    }
    return (this.system as PTR.ActiveEffect.SystemInstance).apply(actor, change, options);
  }

  getRollOptions(prefix = this.type, { includeGranter = true } = {}): string[] {
    const traitOptions = ((): string[] => {
      const options: string[] = [];
      for (const trait of this.traits.values()) {
        options.push(`trait:${trait.slug}`);
      }
      return options;
    })();

    const granterOptions = includeGranter
      ? this.grantedBy
        ?.getRollOptions("granter", { includeGranter: false })
        .map((o: string) => `${prefix}:${o}`) ?? []
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

  targetsActor(): this is ActiveEffectPTR2e & { target: Actor.ConfiguredInstance } {
    return this.modifiesActor;
  }

  /**
   * Override the implementation of ActiveEffect#_requiresDurationUpdate to support activation-based initiative.
   * Duration is purely handled in terms of combat turns elapsed.
   */
  override _requiresDurationUpdate(): boolean {
    const { _combatTime, type } = this.duration;
    if (type === "turns" && game.combat) {
      const ct = (this.parent?.combatant?.system as PTR.Combatant.SystemInstance).activations; //(game.combat as Combat.ConfiguredInstance).system.turn;
      return ct !== _combatTime && !!(this.target as Actor.ConfiguredInstance)?.inCombat;
    }
    return false;
  }

  /**
   * Override the implementation of ActiveEffect#_prepareDuration to support activation-based initiative.
   * Duration is purely handled in terms of combat turns elapsed.
   */
  override _prepareDuration(): Omit<ActiveEffectDuration, "startTime" | "seconds" | "combat" | "rounds" | "turns" | "startRound" | "startTurn"> {
    const d = this.duration;

    // Turn-based duration
    if (this.parent && (d.rounds || d.turns)) {
      const cbt = game.combat as Combat.ConfiguredInstance | undefined;
      if (!cbt || !this.targetsActor())
        return {
          type: "turns",
          //@ts-expect-error - FIXME: Check if this is a fvtt-types issue or if I'm hacking Foundry, I don't remember.
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
          //@ts-expect-error - FIXME: Check if this is a fvtt-types issue or if I'm hacking Foundry, I don't remember.
          _combatTime: undefined,
        };

      // If the effect has not started yet display the full duration
      if (currentTurn <= startTurn) {
        //@ts-expect-error - FIXME: Check if this is a fvtt-types issue or if I'm hacking Foundry, I don't remember.
        return {
          type: "turns",
          duration: durationTurn,
          remaining: durationTurn,
          label: this._getDurationLabel(0, d.turns!),
          _combatTime: currentTurn,
        };
      }

      // Some number of remaining turns (possibly zero)
      const remainingTurns = Math.max(startTurn + durationTurn - currentTurn, 0);
      //@ts-expect-error - FIXME: Check if this is a fvtt-types issue or if I'm hacking Foundry, I don't remember.
      return {
        type: "turns",
        duration: durationTurn,
        remaining: remainingTurns,
        label: this._getDurationLabel(0, remainingTurns),
        _combatTime: currentTurn,
      };
    }

    // No duration
    //@ts-expect-error - FIXME: Check if this is a fvtt-types issue or if I'm hacking Foundry, I don't remember.
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
          : this.parent instanceof CONFIG.Item.documentClass
            ? this.parent.actor
            : game.user.character ?? null,
      }),
    });
  }

  // override toObject(source: true): this["_source"];
  // override toObject(source?: boolean): PTR.ActiveEffect.Source;
  // override toObject(source?: boolean): this["_source"] | PTR.ActiveEffect.Source {
  //   const data = super.toObject(source)
  //   //@ts-expect-error - Figure out the proper type here later
  //   data.changes = this.changes.map((c) => c.toObject())
  //   return data;
  // }

  // // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // override async _preCreate(data: PTR.ActiveEffect.SourceWithSystem, options: foundry.abstract.Document.PreCreateOptions<any>, user: User): Promise<boolean | void> {
  //   if (!options.keepId && data._id) {
  //     const statusEffect = CONFIG.statusEffects.find((effect) => effect._id === data._id);
  //     if (statusEffect) options.keepId = true;
  //   }

  //   const result = await super._preCreate(data, options, user);
  //   if (result === false) return false;

  //   if (this.targetsActor()) {
  //     if (data.duration && data.system.stacks && data.system.stacks > 1) {
  //       data.duration.turns = data.system.stacks;
  //       this.updateSource({
  //         duration: {
  //           turns: data.system.stacks,
  //         },
  //       });
  //     }
  //     if (data.duration?.turns && !data.duration.startTurn) {
  //       this.updateSource({
  //         duration: {
  //           startTurn: this.parent.combatant?.system.activations ?? 0,
  //         },
  //       });
  //     }

  //     if (this.target.isImmuneToEffect(this)) {
  //       ui.notifications.warn(game.i18n.format("PTR2E.Effect.Immune", { effect: this.name, target: this.target.name }));
  //       return false;
  //     }
  //   }

  //   if (data.description.startsWith("PTR2E.Effect.")) {
  //     this.updateSource({
  //       description: game.i18n.localize(data.description),
  //     });
  //   }

  //   if (!data.img) this.updateSource({ img: "systems/ptr2e/img/icons/effect_icon.webp" });

  //   return result;
  // }

  // // TODO: Clean this up cause god it's a mess.
  // protected override async _preUpdate(
  //   changed: PTR.ActiveEffect.SourceWithSystem,
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   options: foundry.abstract.Document.PreUpdateOptions<any>,
  //   user: User
  // ): Promise<boolean | void> {
  //   if (!changed?.changes && !changed?.system?.changes) return super._preUpdate(changed, options, user);

  //   const parseChangePath = (expanded: { changes: unknown[]; system?: unknown }) => {
  //     expanded.system = foundry.utils.mergeObject(expanded.system ?? {}, {
  //       changes: expanded.changes,
  //     });
  //   };

  //   const parseIndexPaths = (data: { system: { changes: object } }): void => {
  //     const current = this.system.changes.map((c) => c.toObject());
  //     for (const [key, value] of Object.entries(data.system.changes)) {
  //       const index = parseInt(key);
  //       if (!current[index]) continue;

  //       current[index] = foundry.utils.mergeObject(current[index], value);
  //     }
  //     data.system.changes = current;
  //   };

  //   const isValidChargesArray = (data: Record<string, unknown>) => {
  //     return "changes" in data && Array.isArray(data.changes) && data.changes.length > 0;
  //   };

  //   const isValidSystemPathObject = (data: Record<string, unknown>) => {
  //     return "system" in data && data.system && typeof data.system === "object";
  //   };

  //   const isValidIndexPathObject = (system: Record<string, unknown>) => {
  //     return (
  //       "changes" in system &&
  //       system.changes &&
  //       typeof system.changes === "object" &&
  //       !Array.isArray(system.changes) &&
  //       Object.keys(system.changes).length > 0 &&
  //       Object.keys(system.changes).every((k) => !isNaN(parseInt(k)))
  //     );
  //   };

  //   const expanded = foundry.utils.expandObject(changed) as PTR.ActiveEffect.SourceWithSystem
  //   if (isValidChargesArray(expanded)) {
  //     parseChangePath(expanded as { changes: unknown[]; system?: unknown });
  //   } else if (isValidIndexPathObject(expanded)) {
  //     parseChangePath(expanded as { changes: unknown[]; system?: unknown });

  //     if (
  //       isValidSystemPathObject(expanded) &&
  //       isValidIndexPathObject(expanded.system as Record<string, unknown>)
  //     ) {
  //       parseIndexPaths(expanded as { system: { changes: Record<number, unknown> } });
  //     }
  //   } else if (
  //     isValidSystemPathObject(expanded) &&
  //     isValidIndexPathObject(expanded.system as Record<string, unknown>)
  //   ) {
  //     parseIndexPaths(expanded as { system: { changes: Record<number, unknown> } });
  //   }
  //   foundry.utils.setProperty(changed, "system.changes", (expanded.system as Record<string, unknown>).changes);
  //   //@ts-expect-error - Should be optional
  //   delete changed.changes;

  //   return super._preUpdate(changed, options, user);
  // }

  // static override async createDocuments(
  //   data: ActiveEffect.ConstructorData[],
  //   context: Record<string, unknown> & {
  //     temporary?: boolean;
  //     parent?: Actor.ConfiguredInstance | Item.ConfiguredInstance | null;
  //   } = {}
  // ): Promise<ActiveEffect.ConfiguredInstance[] | undefined> {
  //   const sources = data.map((d) =>
  //     d instanceof ActiveEffectPTR2e ? (d.toObject()) : d
  //   ) as PTR.ActiveEffect.SourceWithSystem[];

  //   const parent = context.parent;
  //   if (!parent) return super.createDocuments(sources, context)

  //   const effects = await (async (): Promise<ActiveEffectPTR2e[]> => {
  //     const effects = sources.flatMap((source) => {
  //       if (!(context.keepId || context.keepEmbeddedIds)) {
  //         source._id = foundry.utils.randomID();
  //       }

  //       if (source.flags?.ptr2e?.stacks !== false) {
  //         const existing = (parent.effects.contents as ActiveEffectPTR2e[]).find(
  //           (e) => e.slug === sluggify(source.name)
  //         );
  //         if (existing?.system.stacks) {
  //           existing.update({ "system": { "stacks": existing.system.stacks + (source.system?.stacks || 1) } });
  //           return [];
  //         }
  //         if ((
  //           (source.system?.traits as string[])?.includes("major-affliction")
  //           || (source.system?.traits as string[])?.includes("minor-affliction")
  //         ) && existing?.duration.turns) {
  //           existing.update({ "duration": { "turns": existing.duration.turns + (source.duration?.turns || 1) } });
  //           return [];
  //         }
  //       }

  //       return new this(source, { parent });
  //     });
  //     return effects;
  //     // TODO: Possibly implement simple grants for Effects
  //   })();

  //   const tempItems: Item.ConfiguredInstance[] = [];
  //   const outputItemSources: foundry.data.fields.SchemaField.PersistedType<Item.Schema>[] = [];
  //   const outputEffectSources = effects.map((e) => e._source);

  //   // Process effect preCreate changes for all effects that are going to be added
  //   // This may add additional effects or items (such as via GrantItem)
  //   for (const effect of effects) {
  //     const effectSource: foundry.data.fields.SchemaField.PersistedType<ActiveEffect.Schema> = effect._source;
  //     const changes = effect.system.changes ?? [];

  //     for (const change of changes) {
  //       const changeSource = change._source;
  //       await change.preCreate?.({
  //         effectSource,
  //         changeSource,
  //         pendingEffects: outputEffectSources,
  //         pendingItems: outputItemSources,
  //         tempItems,
  //         context,
  //       });
  //     }
  //   }

  //   if (outputItemSources.length) {
  //     await CONFIG.Item.documentClass.createDocuments(
  //       outputItemSources,
  //       context
  //     );
  //   }
  //   // Create the effects
  //   return super.createDocuments(outputEffectSources, context);
  // }

  // static override async deleteDocuments(
  //   ids: string[],
  //   context: Record<string, unknown> & {
  //     pendingItems?: Item.ConfiguredInstance[];
  //   } = {}
  // ): Promise<ActiveEffect.ConfiguredInstance[]> {
  //   ids = Array.from(new Set(ids));
  //   const actor = context.parent instanceof CONFIG.Actor.documentClass ? context.parent : null;
  //   if (actor) {
  //     const effects = ids.flatMap(id => actor.effects.get(id) ?? []) as ActiveEffectPTR2e[];
  //     const items = context.pendingItems ? [...context.pendingItems] : [] as Item.ConfiguredInstance[];

  //     // Run Change Model pre-delete callbacks
  //     for (const effect of effects) {
  //       for (const change of effect.system.changes) {
  //         await change.preDelete?.({ pendingItems: items, context });
  //       }

  //       // const { processGrantDeletions } = await import("./changes/grant-item.ts");
  //       // await processGrantDeletions(effect, null, items, effects, !!context.ignoreRestricted);
  //     }

  //     if (items.length) {
  //       const itemIds = Array.from(new Set(items.map(i => i.id!))).filter(id => actor.items.has(id) && !context.pendingItems?.find(i => i.id === id));
  //       if (itemIds.length) {
  //         await CONFIG.Item.documentClass.deleteDocuments(itemIds, { pendingEffects: effects, parent: actor });
  //       }
  //     }
  //     ids = Array.from(new Set(effects.map(i => i.id))).filter(id => actor.effects.has(id));
  //   }
  //   return super.deleteDocuments(ids, context);
  // }
}

interface ActiveEffectPTR2e {
  system: PTR.ActiveEffect.SystemInstance;

  _name: string;
}

export default ActiveEffectPTR2e;
export { type ActiveEffectPTR2e };