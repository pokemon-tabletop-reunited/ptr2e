import { ChangeSchema } from "../data.ts";
import GrantItemChangeSystem from "../grant-item.ts";
import ChangeForm, { ChangeFormContext } from "./base.ts";
import { htmlQueryAll } from "@utils";
import { ItemAlteration } from "@module/effects/alterations/item.ts";

class GrantItemForm extends ChangeForm<GrantItemChangeSystem> {
    override get template() {
        return "systems/ptr2e/templates/effects/changes/grant-item.hbs";
    }

    override async _prepareContext() {
        const context: ChangeFormContext<GrantItemChangeSystem> & {
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

    override updateObject(source: SourceFromSchema<ChangeSchema>): void {
        super.updateObject(source);
        if('value' in source && typeof source.value === "string") source.value = source.value.trim();
    }
}

export default GrantItemForm;