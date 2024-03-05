import { GearPTR2e } from "@item";
import { HasBase, HasGearData, HasIdentification} from "@module/data/index.ts";

/**
 * @category Item Data Models
 */
export default abstract class GearSystem extends HasIdentification(HasGearData(HasBase(foundry.abstract.TypeDataModel))) {
    /**
     * @internal
     */
    declare parent: GearPTR2e;
}