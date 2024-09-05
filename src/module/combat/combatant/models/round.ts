import { CombatantPTR2e, CombatantSystemPTR2e, CombatPTR2e } from "@combat";

class RoundCombatantSystem extends CombatantSystemPTR2e {
    declare parent: CombatantPTR2e

    static readonly id = "roundsinitiative" as const;
    static get instance(): CombatantPTR2e<CombatPTR2e, null, RoundCombatantSystem> | null {
        return game.combat?.combatants.get(this.id) as CombatantPTR2e<CombatPTR2e, null, RoundCombatantSystem> ?? null;
    }

    override get activations() {
        return this.parent.parent!.round;
    }

    /**
     * The Round always has a base AV of 150
     */
    readonly baseAV = 150;

    override _preUpdate(changed: DeepPartial<this["parent"]["_source"]>, options: DocumentUpdateContext<this["parent"]["parent"]>, user: User): Promise<boolean | void> {
        if (changed.defeated) {
            changed.defeated = false;
        }
        return super._preUpdate(changed, options, user);
    }

    override _preDelete(): Promise<boolean | void> {
        return Promise.resolve(false);
    }
}

export default RoundCombatantSystem;