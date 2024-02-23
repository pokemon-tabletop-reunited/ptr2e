import { ActorPTR2e } from "@actor";
import { ItemPTR2e } from "@item";
import { ActiveEffectSchema } from "types/foundry/common/documents/active-effect.js";
import { BaseChange } from "./changes/base.ts";
import { Change } from "./changes/document.ts";
import { BaseChangeSystem } from "./changes/models/base.ts";

class ActiveEffectPTR2e<TParent extends ActorPTR2e | ItemPTR2e | null = ActorPTR2e | ItemPTR2e | null> extends ActiveEffect<TParent> {
    declare system: BaseChangeSystem<this>;
    declare changes: Change<this>[];
    
    static override defineSchema() {
        const fields = foundry.data.fields;
        const schema = super.defineSchema() as {changes?: object};
        schema.changes = new fields.EmbeddedCollectionField(BaseChange)
        return schema as ActiveEffectSchema;
    }

    override apply(actor: ActorPTR2e, change: Change<this>, options?: string[]): unknown {
        return change.apply(actor, options);
    }

    getRollOptions(): string[] {
        return [];
    }

    targetsActor(): this is ActiveEffectPTR2e<ActorPTR2e> {
        return this.modifiesActor;
    }

    
}

export { ActiveEffectPTR2e }