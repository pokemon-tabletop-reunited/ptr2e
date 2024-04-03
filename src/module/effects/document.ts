import { ActorPTR2e } from "@actor";
import { ItemPTR2e, ItemSourcePTR2e } from "@item";
import { ActiveEffectSystem, EffectSourcePTR2e } from "@effects";
import { ChangeModel, Trait } from "@data";
import { ActiveEffectSchema } from "types/foundry/common/documents/active-effect.js";
class ActiveEffectPTR2e<
    TParent extends ActorPTR2e | ItemPTR2e | null = ActorPTR2e | ItemPTR2e | null,
    TSystem extends ActiveEffectSystem = ActiveEffectSystem,
> extends ActiveEffect<TParent, TSystem> {
    declare grantedBy: ItemPTR2e | null;

    get slug() {
        return this.system.slug;
    }

    static override defineSchema() {
        const schema = super.defineSchema() as { changes?: object; subtype?: object };
        delete schema.changes;
        return schema as ActiveEffectSchema;
    }

    override get changes() {
        return this.system.changes ?? [];
    }

    get traits(): Map<string, Trait> {
        return this.system.traits;
    }

    override prepareDerivedData(): void {
        super.prepareDerivedData();

        if (this.parent?.rollOptions) {
            this.parent.rollOptions.addOption("effect", `${this.type}:${this.slug}`);
        }
    }

    override apply(actor: ActorPTR2e, change: ChangeModel, options?: string[]): unknown {
        const result = change.apply(actor, options);
        if (result === false) return result;

        return result;
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
            ...(this.parent?.getRollOptions() ?? []).map((o) => `${prefix}:${o}`),
            ...traitOptions.map((o) => `${prefix}:${o}`),
        ];

        return options;
    }

    targetsActor(): this is ActiveEffectPTR2e<ActorPTR2e> {
        return this.modifiesActor;
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

        return super._preCreate(data, options, user);
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

        let expanded = fu.expandObject(changed);
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
            const effects = sources.map((source) => {
                if (!(context.keepId || context.keepEmbeddedIds)) {
                    source._id = fu.randomID();
                }
                return new this(source, { parent });
            });
            return effects;
            // TODO: Possibly implement simple grants for Effects
        })();

        const tempItems: ItemPTR2e[] = [];
        const outputItemSources: ItemSourcePTR2e[] = [];
        const outputEffectSources = effects.map(e => e._source as EffectSourcePTR2e);

        // Process effect preCreate changes for all effects that are going to be added
        // This may add additional effects or items (such as via GrantItem)
        for(const effect of effects) {
            const effectSource = effect._source as EffectSourcePTR2e;
            const changes = effect.system.changes;

            for(const change of changes) {
                const changeSource = change._source;
                await change.preCreate?.({
                    effectSource,
                    changeSource,
                    pendingEffects: outputEffectSources,
                    pendingItems: outputItemSources,
                    tempItems,
                    context
                })
            }
        }

        await ItemPTR2e.createDocuments(outputItemSources, context as DocumentModificationContext<ActorPTR2e | null>);
        // Create the effects
        return super.createDocuments(outputEffectSources, context) as Promise<ActiveEffectPTR2e[]>;
    }
}

interface ActiveEffectPTR2e<
    TParent extends ActorPTR2e | ItemPTR2e | null = ActorPTR2e | ItemPTR2e | null,
    TSystem extends ActiveEffectSystem = ActiveEffectSystem,
> {
    readonly _source: foundry.documents.ActiveEffectSource<string, TSystem>;
}

export default ActiveEffectPTR2e;
