
import CreateClockChangeSystem from "../create-clock.ts";
import ChangeForm from "./base.ts";

class CreateClockForm extends ChangeForm<CreateClockChangeSystem> {
  override get template() {
    return "systems/ptr2e/templates/effects/changes/create-clock.hbs";
  }

  override activateListeners(html: HTMLElement): void {
    super.activateListeners(html);

    for(const button of html.querySelectorAll("a[data-action=randomId]")) {
      button.addEventListener("click", async (event) => {
        event.preventDefault();
        this.updateItem({ "key": foundry.utils.randomID(16) });
      });
    }
  }
}

export default CreateClockForm;