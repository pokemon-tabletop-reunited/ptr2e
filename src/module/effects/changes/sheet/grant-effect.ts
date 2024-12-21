import GrantItemForm from "./grant-item.ts";

class GrantEffectForm extends GrantItemForm {
  override get template() {
    return "systems/ptr2e/templates/effects/changes/grant-effect.hbs";
  }
}

export default GrantEffectForm;