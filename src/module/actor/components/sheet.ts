import ActorPTR2e from "../base.ts";
import { ActorComponent } from "./base.ts";
import { EffectComponent } from "./effect-component.ts";

const ActorComponents = {
    "effects": EffectComponent
}
type ActorComponentKey = keyof typeof ActorComponents;

type ComponentApplicationConfiguration = Required<{
    actor: ActorPTR2e;
    component: ActorComponentKey | ActorComponent;
}>

class ComponentPopout extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2
) {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["ptr2e", "sheet", "actor", "popout"],
            position: {
                width: 'auto',
                height: 'auto',
            },
            window: {
                resizable: false,
            },
            tag: 'aside',
            actions: {
                "open-actor": function(this: ComponentPopout) {
                    this.actor.sheet.render(true);
                }
            }
        },
        { inplace: false }
    );

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        content: {
            id: "content",
            template: "systems/ptr2e/templates/actor/actor-component.hbs",
        }
    };

    override get title() {
        return game.i18n.format(`PTR2E.ActorSheet.Components.${this.component.constructor.name}.title`, {actor: this.actor.name});
    }

    override _initializeApplicationOptions(options: Partial<foundry.applications.api.ApplicationConfiguration> & ComponentApplicationConfiguration): foundry.applications.api.ApplicationConfiguration & ComponentApplicationConfiguration {
        return {
            ...super._initializeApplicationOptions(options),
            uniqueId: `actor-${options.actor!.uuid}-${options.component!.constructor.name}`,
            actor: options.actor,
            component: options.component,
        }
    }
    actor: ActorPTR2e;
    component: ActorComponent;

    constructor(options: Partial<foundry.applications.api.ApplicationConfiguration> & ComponentApplicationConfiguration) {
        options.component = (typeof options.component === "string") ? new ActorComponents[options.component](options.actor) : options.component;
        super(options);
        
        this.actor = options.actor;
        this.component = options.component as ActorComponent;
    }

    override async _prepareContext() {
        const context: Record<string, unknown> = {
            actor: this.actor,
        }
        context.component = await this.component.renderComponent(context);
        return context;
    }

    override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: foundry.applications.api.HandlebarsRenderOptions): void {
        super._attachPartListeners(partId, htmlElement, options);

        if(partId === "content") {
            this.component.attachListeners(htmlElement);
        }
    }

    override async _renderFrame(options: foundry.applications.api.HandlebarsRenderOptions): Promise<HTMLElement> {
        const frame = await super._renderFrame(options);

        // Add Actor button to the header
        const actorLabel = game.i18n.localize("PTR2E.ActorSheet.Components.actor");
        const actorButton = `<button type="button" class="header-control fa-solid fa-user" data-action="open-actor"
                                    data-tooltip="${actorLabel}" aria-label="${actorLabel}"></button>`;
        this.window.close.insertAdjacentHTML("beforebegin", actorButton);

        return frame;
    }

    /** @override */
    override _onFirstRender() {
        //@ts-expect-error
        this.actor.apps[this.id] = this;
    }

    /* -------------------------------------------- */

    /** @override */
    override _onClose() {
        //@ts-expect-error
        delete this.actor.apps[this.id];
    }
}

export { ComponentPopout, ActorComponents, type ActorComponentKey }