import { CombatantPTR2e } from "@combat";
import CombatantSystemPTR2e from "../system.ts";

class CharacterCombatantSystem extends CombatantSystemPTR2e {
    declare parent: CombatantPTR2e;

    get actor() {
        //if (!this.parent.actor) throw new Error("A Combatant must have an associated Actor to use this method.")
        return this.parent.actor;
    }

    get combat() {
        return this.parent.encounter;
    }

    get baseAV() {
        if (!this.actor) return Infinity;
        return Math.clamp(
            Math.floor((500 * (1 + ((this.combat.averageLevel-1) * 21) / 90)) / this.actor.speed),
            33,
            100
        );
    }

    override _preDelete(
        _options: DocumentModificationContext<this["parent"]["parent"]>,
        _user: User
    ): Promise<boolean | void> {
        if (this.combat.combatant?.id === this.parent.id) return Promise.resolve(false);
        return super._preDelete(_options, _user);
    }
}

export default CharacterCombatantSystem;
