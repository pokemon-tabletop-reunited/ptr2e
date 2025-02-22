import { ActorComponent } from "./base.ts";

class MovementComponent extends ActorComponent {
    static override TEMPLATE = "systems/ptr2e/templates/actor/components/actor-movement-component.hbs";
    static override TOOLTIP = "PTR2E.ActorSheet.Components.Movement.tooltip";

    override renderComponent(data: Record<string, unknown>): Promise<string> {
        data.movement = Object.values(this.actor.system.movement);
        return renderTemplate(this.template, data);
    }
}

export { MovementComponent }