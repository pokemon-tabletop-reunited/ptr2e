import { AbilityPTR2e } from "@item";
import { HasBase } from "@module/data/index.ts";

/**
 * @category Item Data Models
 * @extends {HasBase}
 * @extends {foundry.abstract.TypeDataModel}
 */
export default abstract class AbilitySystem extends HasBase(foundry.abstract.TypeDataModel) {
    /**
     * @internal
     */
    declare parent: AbilityPTR2e;
}
