import { ActorPTR2e } from "@actor";
import { ItemPTR2e } from "@item";
import { ActiveEffectSystem } from "@effects";
import { ChangeModel } from "@data";
import { ActiveEffectSchema } from "types/foundry/common/documents/active-effect.js";
class ActiveEffectPTR2e<TParent extends ActorPTR2e | ItemPTR2e | null = ActorPTR2e | ItemPTR2e | null> extends ActiveEffect<TParent> {
    declare system: ActiveEffectSystem;

    get slug() {
        return this.system.slug;
    }

    static override defineSchema() {
        const schema = super.defineSchema() as { changes?: object, subtype?: object };
        delete schema.changes;
        return schema as ActiveEffectSchema;
    }

    override get changes() {
        return this.system.changes;
    }

    override apply(actor: ActorPTR2e, change: ChangeModel, options?: string[]): unknown {
        const result = change.apply(actor, options);
        if(result === false) return result;
        
        actor.rollOptions.addOption("effect", `${this.type}:${this.slug}`);
        return result;
    }

    getRollOptions(): string[] {
        return [];
    }

    targetsActor(): this is ActiveEffectPTR2e<ActorPTR2e> {
        return this.modifiesActor;
    }

    override toObject(source?: true | undefined): this["_source"];
    override toObject(source: false): RawObject<this>;
    override toObject(source?: boolean | undefined): this["_source"] | RawObject<this> {
        const data = super.toObject(source) as this["_source"];
        data.changes = this.changes.map(c => c.toObject()) as this["_source"]["changes"];
        return data;
    }

    // TODO: Clean this up cause god it's a mess.
    protected override _preUpdate(changed: DeepPartial<this["_source"]>, options: DocumentUpdateContext<TParent>, user: User): Promise<boolean | void> {
        const parseChangePath = (expanded: { changes: unknown[], system?: unknown }) => {
            expanded.system = fu.mergeObject(expanded.system ?? {}, {
                changes: expanded.changes
            });
        }

        const parseIndexPaths = (data: { system: { changes: object } }): void => {
            const current = this.changes.map(c => c.toObject());
            for (const [key, value] of Object.entries(data.system.changes)) {
                const index = parseInt(key);
                if (!current[index]) continue;

                current[index] = fu.mergeObject(current[index], value);
            }
            data.system.changes = current;
        };

        const isValidChargesArray = (data: Record<string, unknown>) => {
            return (
                'changes' in data && Array.isArray(data.changes) && data.changes.length > 0
            )
        }

        const isValidSystemPathObject = (data: Record<string, unknown>) => {
            return (
                'system' in data
                && data.system
                && typeof data.system === 'object'
            )
        }

        const isValidIndexPathObject = (system: Record<string, unknown>) => {
            return (
                'changes' in system
                && system.changes
                && typeof system.changes === 'object'
                && !Array.isArray(system.changes)
                && Object.keys(system.changes).length > 0
                && Object.keys(system.changes).every(k => !isNaN(parseInt(k)))
            )
        }

        let expanded = fu.expandObject(changed);
        if (isValidChargesArray(expanded)) {
            parseChangePath(expanded as { changes: unknown[], system?: unknown });
        } else if (isValidIndexPathObject(expanded)) {
            parseChangePath(expanded as { changes: unknown[], system?: unknown });

            if (isValidSystemPathObject(expanded) && isValidIndexPathObject(expanded.system as Record<string, unknown>)) {
                parseIndexPaths(expanded as { system: { changes: Record<number, unknown> } });
            }
        } else if (isValidSystemPathObject(expanded) && isValidIndexPathObject(expanded.system as Record<string, unknown>)) {
            parseIndexPaths(expanded as { system: { changes: Record<number, unknown> } });
        }

        fu.setProperty(changed, 'system', expanded.system);
        delete changed.changes;

        return super._preUpdate(changed, options, user);
    }

    protected override _onUpdate(data: DeepPartial<this["_source"]>, options: DocumentModificationContext<TParent>, userId: string): void {
        super._onUpdate(data, options, userId);
    }
}

export default ActiveEffectPTR2e;