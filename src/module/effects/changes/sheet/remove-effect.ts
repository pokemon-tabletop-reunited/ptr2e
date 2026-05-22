
import RemoveEffectChangeSystem from "../remove-effect.ts";
import ChangeForm from "./base.ts";


class RemoveEffectForm extends ChangeForm<RemoveEffectChangeSystem> {
  override get template() {
    return "systems/ptr2e/templates/effects/changes/remove-effect.hbs";
  }
}

export default RemoveEffectForm;