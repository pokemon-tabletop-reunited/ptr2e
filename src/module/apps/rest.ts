import { ActorPTR2e } from "@actor";
import { ApplicationV2Expanded } from "./appv2-expanded.ts";
import { htmlQueryAll } from "@utils";

export class RestApp extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            tag: "form",
            classes: ["ptr2e", "sheet", "rest-sheet"],
            position: {
                height: 'auto',
                width: 330,
            },
            window: {
                minimizable: true,
                resizable: true,
            },
            // dragDrop: [
            //     {
            //         dragSelector: ".action",
            //         dropSelector: ".window-content",
            //     }
            // ],
            form: {
                submitOnChange: false,
                closeOnSubmit: true,
                handler: RestApp.#onSubmit,
            },
            actions: {
                // "action-edit": KnownActionsApp._onEditAction,
                // "action-delete": KnownActionsApp._onDeleteAction,
            }
        },
        { inplace: false }
    );

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        actions: {
            id: "actions",
            template: "systems/ptr2e/templates/apps/rest-popup.hbs",
            scrollable: [".scroll"],
        },
    };

    name: string;
    documents: ActorPTR2e[];
    restType: string;
    fractionToHeal: number;

    constructor(name: string, documents: ActorPTR2e[], options: Partial<foundry.applications.api.ApplicationConfiguration> = {}) {
        options.id = `rest-${documents[0].id}`; // TODO better than this
        super(options);
        this.name = name;
        this.documents = documents;
    }

    override get title() {
        return `${this.name} - ${game.i18n.localize("PTR2E.ActorSheet.Rest")}`;
      }

    override async _prepareContext() {
        const party = this.documents.map(a=>({
            img: a.img,
            name: a.name,
            uuid: a.uuid,
        }));

        return {
            id: this.options.id,
            party,
            restType: this.restType ?? "camp",
            fractionToHeal: Math.clamp(Math.round((this.fractionToHeal ?? 0) * 100), 0, 100),
        };
    }

    override _attachPartListeners(
        partId: string,
        htmlElement: HTMLElement,
        options: foundry.applications.api.HandlebarsRenderOptions
    ): void {
        super._attachPartListeners(partId, htmlElement, options);

        for (const input of htmlQueryAll(htmlElement, "[name='restType']")) {
            input.addEventListener("change", this.#onRestTypeChange.bind(this));
        }

        for (const input of htmlQueryAll(htmlElement, "[name='fractionToHeal']")) {
            input.addEventListener("change", this.#onFractionToHealChange.bind(this));
        }
    }

    #onRestTypeChange(event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        const restType = input.value;
        this.restType = restType;
        this.render(false);
    }

    #onFractionToHealChange(event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        const fth = parseInt(input.value);
        if (isNaN(fth)) return;
        this.fractionToHeal = fth / 100;
        this.render(false);
    }

    static async #onSubmit(
        this: RestApp,
        _event: SubmitEvent | Event,
        _form: HTMLFormElement,
        formData: FormDataExtended
    ) {
        const data = fu.expandObject(formData.object);
        const healOptions = {
            fractionToHeal: 1.0,
            removeWeary: true,
            removeExposed: false,
            removeAllStacks: false,
        };

        switch (data.restType) {
            case "camp":
                healOptions.fractionToHeal = (data.fractionToHeal as unknown as number) / 100;
                break;
            case "center":
                healOptions.removeExposed = true;
                healOptions.removeAllStacks = true;
                break;
        }

        await Promise.all(this.documents.map(d=>d.heal(healOptions)));
    }

}