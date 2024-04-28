import { SpeciesPTR2e } from "@item";
import ActorPTR2e from "./base.ts";
import { SpeciesDropSheet } from "./sheets/species-drop-sheet.ts";
import { SpeciesSystemModel } from "@item/data/index.ts";
import { sluggify } from "@utils";

class ActorSheetPTRV2 extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ActorSheetV2<
        ActorPTR2e,
        foundry.applications.api.HandlebarsDocumentSheetConfiguration<ActorPTR2e>
    >
) {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["ptr2e", "sheet", "actor"],
            position: {
                width: 900,
                height: 660,
            },
            form: {
                submitOnChange: true,
            },
            actions: {
                "species-header": async function(this: ActorSheetPTRV2, event: Event) {
                    event.preventDefault();
                    const species = this.actor.system.species!;
                    const sheet = new SpeciesDropSheet((item) => {
                        if (!item) return;
                        if (
                            !(
                                item instanceof CONFIG.Item.documentClass &&
                                item.system instanceof SpeciesSystemModel
                            )
                        )
                            return;
                        if (item.slug !== species.slug) {
                            const species = item.toObject().system;
                            species.slug ||= sluggify(item.name);
                            this.actor.update({ "system.species": species });
                        }
                    });
                    sheet.species = new CONFIG.Item.documentClass({
                        name: this.document.hasEmbeddedSpecies() ? Handlebars.helpers.formatSlug(species.slug) : this.actor.name,
                        type: "species",
                        img: this.actor.img,
                        flags: { ptr2e: { disabled: !this.actor.system._source.species } },
                        system: species.toObject(),
                    }) as SpeciesPTR2e;
                    sheet.render(true);
                }
            }
        },
        { inplace: false }
    );

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        header: {
            id: "header",
            template: "systems/ptr2e/templates/actor/actor-header.hbs",
        },
        nav: {
            id: "nav",
            template: "systems/ptr2e/templates/actor/actor-nav.hbs",
        },
    };

    override async _prepareContext(options?: foundry.applications.api.HandlebarsDocumentSheetConfiguration<ActorPTR2e>){
        const context = await super._prepareContext(options);

        return context;
    }

    override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: foundry.applications.api.HandlebarsRenderOptions): void {
        super._attachPartListeners(partId, htmlElement, options);

        
    }

    override async close(options: Partial<foundry.applications.api.ApplicationClosingOptions> = {}): Promise<this> {
        if(game.ptr.web.actor === this.actor) {
            this.minimize();
            return this;
        }
        return super.close(options) as Promise<this>;
    }

    override async _preClose(options: foundry.applications.api.HandlebarsDocumentSheetConfiguration<ActorPTR2e>): Promise<void> {
        await super._preClose(options);
        
        // Submit the form if it's open
        this.element.dispatchEvent(new SubmitEvent("submit", {cancelable: true}));
    }

    override async _renderFrame(options: foundry.applications.api.HandlebarsDocumentSheetConfiguration<ActorPTR2e>): Promise<HTMLElement> {
        const frame = await super._renderFrame(options);

        // Add Species button to the header
        const speciesLabel = game.i18n.localize("PTR2E.ActorSheet.Species");
        const speciesButton = `<button type="button" class="header-control fa-solid fa-paw" data-action="species-header"
                                    data-tooltip="${speciesLabel}" aria-label="${speciesLabel}"></button>`;
        this.window.close.insertAdjacentHTML("beforebegin", speciesButton);

        return frame;
    }
}

export default ActorSheetPTRV2;