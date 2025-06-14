
import IncrementClockChangeSystem from "../increment-clock.ts";
import ChangeForm from "./base.ts";

class IncrementClockForm extends ChangeForm<IncrementClockChangeSystem> {
  override get template() {
    return "systems/ptr2e/templates/effects/changes/increment-clock.hbs";
  }
}

export default IncrementClockForm;