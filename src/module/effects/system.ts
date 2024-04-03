import { HasChanges, HasSlug, HasTraits } from "@module/data/index.ts";
import { ActiveEffectPTR2e } from "@effects";

export default abstract class ActiveEffectSystem extends HasTraits(HasSlug(HasChanges(foundry.abstract.TypeDataModel))) {
    declare parent: ActiveEffectPTR2e;
}