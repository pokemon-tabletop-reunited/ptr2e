import RemoveTraitChangeSystem from "../remove-trait.ts";
import ChangeForm from "./base.ts";

class RemoveTraitForm extends ChangeForm<RemoveTraitChangeSystem> {
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    override get template() {
        return "systems/ptr2e/templates/effects/changes/remove-trait.hbs";
    }
}

export default RemoveTraitForm;