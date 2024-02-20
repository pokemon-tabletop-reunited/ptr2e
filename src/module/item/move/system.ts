import { MovePTR2e } from "@item";
import { HasBase } from "@module/data/index.ts";

abstract class MoveSystem extends HasBase(foundry.abstract.TypeDataModel) {
    declare parent: MovePTR2e;
}

export { MoveSystem }