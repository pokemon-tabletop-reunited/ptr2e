import AddTraitChangeSystem from "../add-trait.ts";
import ChangeForm from "./base.ts";

class AddTraitForm extends ChangeForm<AddTraitChangeSystem> {
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    override get template() {
        return "systems/ptr2e/templates/effects/changes/add-trait.hbs";
    }
}

export default AddTraitForm;