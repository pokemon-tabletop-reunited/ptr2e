import { CombatantSystemPTR2e } from "../system.ts";

class RoundCombatantSystem extends foundry.abstract.TypeDataModel implements CombatantSystemPTR2e {
    
    /**
     * The Round always has a base AV of 100
     */
    get baseAV() {
        return 100;
    }
}

export { RoundCombatantSystem }