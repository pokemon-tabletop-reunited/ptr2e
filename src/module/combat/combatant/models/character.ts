import BaseActor from "types/foundry/common/documents/actor.js";
import BaseUser from "types/foundry/common/documents/user.js";
import { CombatantPTR2e, CombatantSystemPTR2e } from "@combat";

class CharacterCombatantSystem extends foundry.abstract.TypeDataModel implements CombatantSystemPTR2e {
    declare parent: CombatantPTR2e

    get actor() {
        //if (!this.parent.actor) throw new Error("A Combatant must have an associated Actor to use this method.")
        return this.parent.actor
    }

    get combat() {
        return this.parent.encounter; 
    }

    get baseAV() {
        if (!this.actor) return Infinity;
        return Math.clamp(
            Math.floor((
                500 * (
                    1 + (
                        ((this.combat.averageLevel - 5) * 21)
                        / 95
                    )
                )
            ) / this.actor.speed), 33, 100);
    }

    override _preDelete(_options: DocumentModificationContext<this["parent"]["parent"]>, _user: BaseUser<BaseActor<null>>): Promise<boolean | void> {
        if (this.combat.combatant?.id === this.parent.id) return Promise.resolve(false);
        return super._preDelete(_options, _user);
    }
}

export default CharacterCombatantSystem;