import Clock, { ClockSchema } from "@module/data/models/clock.ts";
import { HandlebarsRenderOptions } from "types/foundry/common/applications/handlebars-application.ts";

const CLOCK_MAX_SIZE = 16;
const CLOCK_SIZES = [2, 3, 4, 5, 6, 8, 10, 12, 16];

export default class ClockEditor extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2
) {
    private clock?: Clock;
    constructor(
        options: Partial<foundry.applications.api.HandlebarsDocumentSheetConfiguration>,
        clock?: Clock
    ) {
        super(options);
        this.clock = clock;
    }

    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            id: "clock-editor-{id}",
            classes: ["clock-editor"],
            tag: "form",
            window: {
                frame: true,
                positioned: true,
                minimizable: false,
            },
            form: {
                handler: ClockEditor.#submit,
                closeOnSubmit: true,
                submitOnChange: false,
            },
        },
        { inplace: false }
    );

    static override PARTS = {
        clocks: {
            id: "clocks",
            template: "/systems/ptr2e/templates/apps/clocks/clock-editor.hbs",
        },
    };

    override async _renderFrame(options: HandlebarsRenderOptions) {
        options.window!.title = this.clock
            ? game.i18n.format("PTR2E.Clocks.Global.Editor.TitleEdit", { label: this.clock.label })
            : game.i18n.localize("PTR2E.Clocks.Global.Editor.TitleAdd");
        return super._renderFrame(options);
    }

    override async _prepareContext() {
        const context = (await super._prepareContext()) ?? {};
        const fields = (
            game.ptr.clocks.db.schema.fields.clocks as foundry.data.fields.ArrayField<
                foundry.data.fields.EmbeddedDataField<Clock>
            >
        ).element.fields;
        const clock = this.clock ?? new Clock();

        return {
            ...context,
            clock,
            maxSize: CLOCK_MAX_SIZE,
            presetSizes: CLOCK_SIZES,
            fields,
        };
    }

    override _attachPartListeners(
        partId: string,
        htmlElement: HTMLElement,
        _options: HandlebarsRenderOptions
    ): void {
        if (partId === "clocks") {
            const inputElement =
                htmlElement.querySelector<HTMLInputElement>(".dropdown-wrapper input")!;
            htmlElement.querySelector(".dropdown li")?.addEventListener("mousedown", (event) => {
                inputElement.value = (event.target as HTMLElement).getAttribute("data-value") ?? "";
            });

            const colorElement =
                htmlElement.querySelector<HTMLInputElement>("input[type='color']")!;
            const edits = colorElement.dataset.edit;
            if (edits) {
                colorElement.addEventListener("input", () => {
                    const sibling = colorElement.previousElementSibling as
                        | HTMLInputElement
                        | undefined;
                    if (sibling?.getAttribute("name") !== edits) return;

                    sibling.value = colorElement.value;
                    colorElement.style.setProperty("--color-input-border-color", colorElement.value);
                });
            }
        }
    }

    static #submit(
        this: ClockEditor,
        event: Event,
        _form: HTMLFormElement,
        formData: FormDataExtended
    ) {
        event.preventDefault();
        if (this.clock) {
            return game.ptr.clocks.db.updateClock(
                this.clock.id,
                formData.object as Partial<SourceFromSchema<ClockSchema>>
            );
        }
        return game.ptr.clocks.db.createClock(formData.object as SourceFromSchema<ClockSchema>);
    }
}
