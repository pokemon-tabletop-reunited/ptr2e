
import { htmlQueryAll } from "@utils";



export class TargetSelectorPopup extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2
) {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["sheet target-selector-popup"],
            position: {
                height: "auto",
                width: 400,
            },
            form: {
                closeOnSubmit: false,
                submitOnChange: false,
            },
            tag: "form",
        },
        { inplace: false }
    );

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        modifiers: {
            id: "modifiers",
            template: "systems/ptr2e/templates/apps/target-selector-popup.hbs",
        },
    };

    targets: { uuid: string; name: string; img: string; description?: string }[];
    #title: string;
    #hint: string;
    

    constructor(
        targets: { uuid: string; name: string; img: string; description?: string }[],
        { title = "", hint = "" } : { title?: string; hint?: string; },
        options: Partial<foundry.applications.api.ApplicationConfiguration> = {}
    ) {
        super(options);
        this.targets = targets;
        this.#title = title;
        this.#hint = hint;
    }

    override get title() {
        return this.#title == "" ? "Choose Target" : game.i18n.localize(this.#title);
    }

    override async _prepareContext(): Promise<Record<string, unknown>> {
        return {
            targets: this.targets,
            hint: this.#hint,
        };
    }

    override _attachPartListeners(
        partId: string,
        htmlElement: HTMLElement,
        options: foundry.applications.api.HandlebarsRenderOptions
    ): void {
        super._attachPartListeners(partId, htmlElement, options);

        for (const element of htmlQueryAll(htmlElement, ".target[data-uuid]")) {
            const uuid = element.dataset.uuid;
            if (!uuid) continue;

            element?.addEventListener("click", () => {
                this.resolve?.(uuid);
                this.close();
            })
        }
    }

    promise: Promise<Maybe<string>> | null = null;
    resolve?: (value: Maybe<string>) => void;

    async wait() {
        return (this.promise ??= new Promise((resolve) => {
            this.resolve = resolve;

            this.addEventListener(
                "close",
                () => {
                    resolve(null);
                    this.promise = null;
                    this.resolve = undefined;
                },
                { once: true }
            );
            this.render(true);
        }));
    }
}
