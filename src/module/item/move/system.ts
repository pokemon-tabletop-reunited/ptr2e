import { ItemSystemPTR2e, MovePTR2e } from "@item";
import { AttackPTR2e } from "@module/action.ts";

class MoveSystemPTR2e extends ItemSystemPTR2e {
}

interface MoveSystemPTR2e extends ItemSystemPTR2e {
    type: "move";

    actions: Record<string, AttackPTR2e>;

    parent: MovePTR2e;
}

export { MoveSystemPTR2e };