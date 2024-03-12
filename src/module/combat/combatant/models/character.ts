import { CombatantPTR2e } from "../combatant.ts"
import { CombatantSystemPTR2e } from "../system.ts";

class CharacterCombatantSystem extends foundry.abstract.TypeDataModel implements CombatantSystemPTR2e {
    declare parent: CombatantPTR2e

    get actor() {
        if (!this.parent.actor) throw new Error("A Combatant must have an associated Actor to use this method.")
        return this.parent.actor
    }

    get combat() {
        return this.parent.encounter;
    }

    get baseAV() {
        return (
            500 * (
                1 + (
                    ((this.combat.averageLevel - 5) * 21)
                    / 95
                )
            )
        ) / this.actor.speed;
    }
}

export { CharacterCombatantSystem }