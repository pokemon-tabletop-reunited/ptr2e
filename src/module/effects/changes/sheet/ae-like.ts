import BasicChangeSystem from "../basic.ts";
import ChangeForm from "./base.ts";

class AELikeModifierForm extends ChangeForm<BasicChangeSystem> {
    override get template() {
        return "/systems/ptr2e/templates/effects/changes/ae-like.hbs";
    }
}

export default AELikeModifierForm;