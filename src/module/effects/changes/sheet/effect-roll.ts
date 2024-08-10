
import RollEffectChangeSystem from "../roll-note.ts";
import ChangeForm from "./base.ts";

class RollEffectForm extends ChangeForm<RollEffectChangeSystem> {
    override get template() {
        return "/systems/ptr2e/templates/effects/changes/effect-roll.hbs";
    }
}

export default RollEffectForm;