import { MovePTR2e } from "@item";
import { HasBase } from "@module/data/index.ts";

/**
 * @category Item Data Models
 */
export default abstract class MoveSystem extends HasBase(foundry.abstract.TypeDataModel) {
    /**
     * @internal
     */
    declare parent: MovePTR2e;
}