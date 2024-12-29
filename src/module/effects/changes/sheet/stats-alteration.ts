import type StatsAlterationChangeSystem from "../stats-alteration.ts";
import ChangeForm from "./base.ts";

class StatsAlterationModifierForm extends ChangeForm<StatsAlterationChangeSystem> {
    override get template() {
        return "systems/ptr2e/templates/effects/changes/stats-alteration.hbs";
    }
}

export default StatsAlterationModifierForm;