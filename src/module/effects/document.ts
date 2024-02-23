import { ActorPTR2e } from "@actor";
import { ItemPTR2e } from "@item";
import { ActiveEffectSchema } from "types/foundry/common/documents/active-effect.js";
import { BaseActiveEffectSystem } from "./models/base.ts";
import { ChangeModel } from "@module/data/models/change.ts";

class ActiveEffectPTR2e<TParent extends ActorPTR2e | ItemPTR2e | null = ActorPTR2e | ItemPTR2e | null> extends ActiveEffect<TParent> {
    declare system: BaseActiveEffectSystem;
    
    static override defineSchema() {
        const schema = super.defineSchema() as {changes?: object};
        delete schema.changes;
        return schema as ActiveEffectSchema;
    }

    override get changes(){
        return this.system.changes;
    }

    override apply(actor: ActorPTR2e, change: ChangeModel, options?: string[]): unknown {
        return change.apply(actor, options);
        //return this.system.apply(actor, change, options);
    }

    getRollOptions(): string[] {
        return [];
    }

    targetsActor(): this is ActiveEffectPTR2e<ActorPTR2e> {
        return this.modifiesActor;
    }
}

export { ActiveEffectPTR2e }

// @ts-ignore
globalThis.BaseActiveEffectSystem = BaseActiveEffectSystem;