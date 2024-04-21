import FlatModifierChangeSystem from "../flat-modifier.ts";
import ChangeForm from "./base.ts";

class FlatModifierForm extends ChangeForm<FlatModifierChangeSystem> {
    override get template() {
        return "/systems/ptr2e/templates/effects/changes/flat-modifier.hbs";
    }
}

export default FlatModifierForm;