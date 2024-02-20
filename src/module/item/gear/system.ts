import { GearPTR2e } from "@item";
import { HasBase, HasGearData, HasIdentification} from "@module/data/index.ts";

abstract class GearSystem extends HasIdentification(HasGearData(HasBase(foundry.abstract.TypeDataModel))) {
    declare parent: GearPTR2e;
}

export { GearSystem }