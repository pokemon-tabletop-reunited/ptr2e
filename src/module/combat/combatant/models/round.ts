import BaseActor from "types/foundry/common/documents/actor.js";
import BaseUser from "types/foundry/common/documents/user.js";
import { CombatantSystemPTR2e } from "../system.ts";
import { CombatantPTR2e } from "../combatant.ts";

class RoundCombatantSystem extends foundry.abstract.TypeDataModel implements CombatantSystemPTR2e {
    declare parent: CombatantPTR2e

    /**
     * The Round always has a base AV of 100
     */
    get baseAV() {
        return 100;
    }

    override _preUpdate(changed: DeepPartial<this["parent"]["_source"]>, options: DocumentUpdateContext<this["parent"]["parent"]>, user: BaseUser<BaseActor<null>>): Promise<boolean | void> {
        if (changed.defeated) {
            changed.defeated = false;
        }
        return super._preUpdate(changed, options, user);
    }

    override _preDelete(_options: DocumentModificationContext<this["parent"]["parent"]>, _user: BaseUser<BaseActor<null>>): Promise<boolean | void> {
        return Promise.resolve(false);
    }
}

export { RoundCombatantSystem }