import type SuppresAbilityChangeSystem from "../suppress-ability.ts";
import ChangeForm from "./base.ts";

class SuppresAbilityForm extends ChangeForm<SuppresAbilityChangeSystem> {
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    override get template() {
        return "systems/ptr2e/templates/effects/changes/suppress-ability.hbs";
    }
}

export default SuppresAbilityForm;