import { htmlClosest, htmlQuery, htmlQueryAll } from "@utils";
import { ActorComponent } from "./base.ts";
import ActorPTR2e from "@actor/base.ts";

class ToggleComponent extends ActorComponent {
    static override TEMPLATE = "systems/ptr2e/templates/actor/components/actor-toggle-component.hbs";
    static override TOOLTIP = "PTR2E.ActorSheet.Components.Toggles.tooltip";

    override renderComponent(data: Record<string, unknown>): Promise<string> {
        data.toggles = this.actor.synthetics.toggles;
        return renderTemplate(this.template, data);
    }

    override attachListeners(htmlElement: HTMLElement) {
        return ToggleComponent.attachListeners(htmlElement, this.actor);
    }

    static attachListeners(htmlElement: HTMLElement, actor: ActorPTR2e) {
        for (const togglesSection of htmlQueryAll(htmlElement, "ul.toggles-list")) {
          togglesSection.addEventListener("change", (event) => {
              const toggleRow = htmlClosest(event.target, "[data-effect-uuid][data-domain][data-option]");
              const checkbox = htmlQuery<HTMLInputElement>(toggleRow, "input[data-action=toggle-roll-option]");
              const suboptionsSelect = htmlQuery<HTMLSelectElement>(toggleRow, "select[data-action=set-suboption");
              const { domain, option, effectUuid } = toggleRow?.dataset ?? {};
              const suboption = suboptionsSelect?.value ?? null;
              if (checkbox && domain && option) {
                  actor.toggleRollOption(domain, option, effectUuid ?? null, checkbox.checked, suboption);
              }
          });
      }
    }
}

export { ToggleComponent }