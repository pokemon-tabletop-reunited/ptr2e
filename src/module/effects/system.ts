import { ChangeModel, HasChanges, HasEmbed, HasSlug, HasTraits } from "@module/data/index.ts";
import { ActiveEffectPTR2e } from "@effects";
import { ActorPTR2e } from "@actor";

export default abstract class ActiveEffectSystem extends HasEmbed(
    HasTraits(HasSlug(HasChanges(foundry.abstract.TypeDataModel))),
    "effect"
) {
    static LOCALIZATION_PREFIXES = ["PTR2E.Effect"];

    declare parent: ActiveEffectPTR2e;

    static override defineSchema(): ActiveEffectSystemSchema {
        const fields = foundry.data.fields;
        return {
            ...super.defineSchema(),
            removeAfterCombat: new fields.BooleanField({
                required: true,
                initial: true,
                nullable: false,
            }),
            removeOnRecall: new fields.BooleanField({
                required: true,
                initial: false,
                nullable: false,
            }),
        };
    }

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

export default interface ActiveEffectSystem
    extends ModelPropsFromSchema<ActiveEffectSystemSchema> {}

export type ActiveEffectSystemSchema = {
    removeAfterCombat: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
    removeOnRecall: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
};
