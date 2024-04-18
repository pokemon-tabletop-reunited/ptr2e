import RollOptionChangeSystem from "../roll-option.ts";
import ChangeForm from "./base.ts";

class RollOptionForm extends ChangeForm<RollOptionChangeSystem> {
    override get template() {
        return "/systems/ptr2e/templates/effects/changes/roll-option.hbs";
    }
}

export default RollOptionForm;