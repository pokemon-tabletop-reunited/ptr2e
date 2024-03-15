import { ItemPTR2e } from "@item";
import { SpeciesSystemModel } from "@item/data/index.ts";

class SpeciesDropSheet extends FormApplication {
    declare object: (value: unknown) => unknown;
    species: ItemPTR2e<SpeciesSystemModel> | null;

    constructor(promise: (value: unknown) => unknown, options?: ApplicationOptions) {
        super(promise, options);

        this.species = null;
    }

    static override get defaultOptions() {
        return fu.mergeObject(super.defaultOptions, {
            classes: ["pokemon", "sheet", "actor"],
            template: "/systems/ptr2e/templates/actor/species-drop.hbs",
            width: 250,
            height: 125,
            closeOnSubmit: true,
            submitOnChange: true,
            submitOnClose: true,
            resizable: false,
            title: "Creating a Pokemon...",
            dragDrop: [{ dragSelector: ".species-link", dropSelector: "form" }]
        });
    }

    override getData(options?: Partial<FormApplicationOptions> | undefined) {
        return {
            ...(super.getData(options) as FormApplicationData<object>),
            species: this.species
        };
    }

    override activateListeners(html: JQuery<HTMLElement>): void {
        html.find('.species-link').on('click', () => this.species?.sheet?.render(true));
    }

    protected override _onDragStart(event: DragEvent): void {
        if (!this.species) return;
        event.dataTransfer?.setData(
            "text/plain",
            JSON.stringify({
                type: "Item",
                data: {
                    name: this.species.name,
                    type: "species",
                    img: this.species.img,
                    system: this.species.system
                }
            })
        );
    }

    protected override async _onDrop(event: DragEvent) {
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

            this.submit();
        }
    }

    protected override async _updateObject(_event: Event, _formData: Record<string, unknown>): Promise<void> {
        await this.object(this.species);
    }
}

export { SpeciesDropSheet };