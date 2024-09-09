import GrantItemChangeSystem from "../grant-item.ts";
import ChangeForm from "./base.ts";

class GrantItemForm extends ChangeForm<GrantItemChangeSystem> {
    override get template() {
        return "systems/ptr2e/templates/effects/changes/grant-effect.hbs";
    }
}

export default GrantItemForm;