import { ItemPTR2e } from "@item";
import { SpeciesSystemModel } from "@item/data/index.ts";
import {
    ApplicationConfigurationExpanded,
    ApplicationV2Expanded,
} from "@module/apps/appv2-expanded.ts";
import { htmlQueryAll } from "@utils";

class SpeciesDropSheetV2 extends foundry.applications.api.HandlebarsApplicationMixin(
    ApplicationV2Expanded
) {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["pokemon", "sheet", "actor"],
            position: {
                width: 250,
                height: 141,
            },
            window: {
                resizable: false,
            },
            form: {
                submitOnChange: true,
                closeOnSubmit: true,
                handler: this.#onSubmit,
            },
            tag: "form",
            dragDrop: [{ dragSelector: ".species-link", dropSelector: "form" }],
        },
        { inplace: false }
    );

    static override PARTS : Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        main: {
            id: "main",
            template: "systems/ptr2e/templates/actor/species-drop.hbs",
        },
    }

    static async #onSubmit(
        this: SpeciesDropSheetV2
    ) {
        this.promise(this.species);
    }

    promise: (value: ItemPTR2e<SpeciesSystemModel> | null) => void;
    species: ItemPTR2e<SpeciesSystemModel> | null;

    constructor(
        promise: (value: ItemPTR2e<SpeciesSystemModel> | null) => void,
        options?: ApplicationConfigurationExpanded & { species: ItemPTR2e<SpeciesSystemModel> }
    ) {
        super(options);

        this.promise = promise;
        this.species = options?.species ?? null;
    }

    override get title() {
        return this.species?.flags?.ptr2e?.virtual
            ? `Update ${this.species.actor!.name}'s Species`
            : "Creating a Pokemon...";
    }

    override async _prepareContext(): Promise<object> {
        return {
            ...(await super._prepareContext()),
            species: this.species,
        };
    }

    override _attachPartListeners(
        _partId: string,
        htmlElement: HTMLElement
    ): void {
        htmlQueryAll(htmlElement, ".species-link").forEach((element) => {
            element.addEventListener("click", () => this.species?.sheet?.render(true));
        });
    }

    override _onDragStart(event: DragEvent): void {
        if (!this.species) return;
        event.dataTransfer?.setData(
            "text/plain",
            JSON.stringify({
                type: "Item",
                data: {
                    name: this.species.name,
                    type: "species",
                    img: this.species.img,
                    system: this.species.system,
                },
            })
        );
    }

    override async _onDrop(event: DragEvent) {
        const data = TextEditor.getDragEventData(event) as Record<string, string>;
        if (data.type === "Item") {
            const item = await fromUuid(data.uuid);
            if (!item) {
                ui.notifications.error("The dropped item could not be found");
                return;
            }

            if (!(item instanceof ItemPTR2e && item.system instanceof SpeciesSystemModel)) {
                ui.notifications.error("The dropped item is not a species");
                return;
            }

            this.species = item;

            this.element.dispatchEvent(new Event("submit", {cancelable: true}));
        }
    }
}

export { SpeciesDropSheetV2 as SpeciesDropSheet };
