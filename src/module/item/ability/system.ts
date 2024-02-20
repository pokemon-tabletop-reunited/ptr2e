import { AbilityPTR2e } from "@item";
import { HasBase } from "@module/data/index.ts";

abstract class AbilitySystem extends HasBase(foundry.abstract.TypeDataModel) {
    declare parent: AbilityPTR2e;
}

export { AbilitySystem }