import { ActorPTR2e } from "@actor";
import { ItemPTR2e } from "@item";
import { BaseActiveEffectSystem } from "./models/base.ts";
import { ChangeModel } from "@module/data/models/change.ts";
import { ActiveEffectSchema } from "types/foundry/common/documents/active-effect.js";
import BaseActor from "types/foundry/common/documents/actor.js";
import BaseUser from "types/foundry/common/documents/user.js";

class ActiveEffectPTR2e<TParent extends ActorPTR2e | ItemPTR2e | null = ActorPTR2e | ItemPTR2e | null> extends ActiveEffect<TParent> {
    declare system: BaseActiveEffectSystem;

    static override defineSchema() {
        const schema = super.defineSchema() as { changes?: object, subtype?: object };
        delete schema.changes;
        return schema as ActiveEffectSchema;
    }

    override get changes() {
        return this.system.changes;
    }

    override apply(actor: ActorPTR2e, change: ChangeModel, options?: string[]): unknown {
        return change.apply(actor, options);
    }

    getRollOptions(): string[] {
        return [];
    }

    targetsActor(): this is ActiveEffectPTR2e<ActorPTR2e> {
        return this.modifiesActor;
    }

    // TODO: Clean this up cause god it's a mess.
    protected override _preUpdate(changed: DeepPartial<this["_source"]>, options: DocumentUpdateContext<TParent>, user: BaseUser<BaseActor<null>>): Promise<boolean | void> {
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

export { ActiveEffectPTR2e }

// @ts-ignore
globalThis.BaseActiveEffectSystem = BaseActiveEffectSystem;