
import { htmlQueryAll } from "@utils";
import EphemeralEffectChangeSystem from "../ephemeral-effect.ts";
import ChangeForm, { ChangeFormContext } from "./base.ts";
import { ItemAlteration } from "@module/effects/alterations/item.ts";

class EphemeralEffectForm extends ChangeForm<EphemeralEffectChangeSystem> {
  override get template() {
    return "systems/ptr2e/templates/effects/changes/ephemeral-effect.hbs";
  }

  override async _prepareContext() {
    const context: ChangeFormContext<EphemeralEffectChangeSystem> & {
      granted?: ClientDocument | null;
    } = await super._prepareContext();
    const item = await this.change.getItem();
    context.granted = item ?? null;
    return context;
  }

  override activateListeners(html: HTMLElement): void {
    super.activateListeners(html);

    for (const button of htmlQueryAll(html, "button[data-action=add-alteration]")) {
      button.addEventListener("click", async (event) => {
        event.preventDefault();

        const alterations = this.change.toObject().alterations as ItemAlteration['_source'][] ?? [];
        alterations.push({});

        this.updateItem({ "alterations": alterations });
      });
    }

    for (const button of htmlQueryAll(html, "button[data-action=delete-alteration]")) {
      button.addEventListener("click", async (event) => {
        event.preventDefault();

        const alterations = this.change.toObject().alterations as ItemAlteration['_source'][];
        const index = parseInt(button.dataset.index!);
        if (isNaN(index) || index < 0 || index >= alterations.length) return;

        alterations.splice(index, 1);

        this.updateItem({ "alterations": alterations });
      });
    }
  }
}

export default EphemeralEffectForm;