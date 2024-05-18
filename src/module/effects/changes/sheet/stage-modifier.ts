import StageModifierSystem from "../stage-modifier.ts";
import ChangeForm from "./base.ts";

class StageModifierForm extends ChangeForm<StageModifierSystem> {
    override get template() {
        return "/systems/ptr2e/templates/effects/changes/stage-modifier.hbs";
    }
}

export default StageModifierForm;