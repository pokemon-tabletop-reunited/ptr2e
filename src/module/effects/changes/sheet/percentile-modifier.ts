import StageChangeSystem from "../stage-modifier.ts";
import ChangeForm from "./base.ts";

class PercentileModifierForm extends ChangeForm<StageChangeSystem> {
    override get template() {
        return "/systems/ptr2e/templates/effects/changes/percentile-modifier.hbs";
    }
}

export default PercentileModifierForm;