import { ChangeModel, HasChanges, HasSlug, HasTraits } from "@module/data/index.ts";
import { ActiveEffectPTR2e } from "@effects";
import { ActorPTR2e } from "@actor";

export default abstract class ActiveEffectSystem extends HasTraits(
    HasSlug(HasChanges(foundry.abstract.TypeDataModel))
) {
    declare parent: ActiveEffectPTR2e;

    /**
     * Allow child classes to define overrides for the roll options available to this effect.
     * By default don't change anything.
     */
    getRollOptions(options: string[]): string[] {
        return options;
    }

    apply(actor: ActorPTR2e, change: ChangeModel, options?: string[]): unknown {
        const result = change.apply(actor, options);
        if (result === false) return result;

        return result;
    }
}
