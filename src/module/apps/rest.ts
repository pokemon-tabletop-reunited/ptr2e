import { ActorPTR2e } from "@actor";
import { ApplicationV2Expanded } from "./appv2-expanded.ts";

export class RestApp extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            tag: "form",
            classes: ["sheet", "rest-sheet"],
            position: {
                height: 'auto',
                width: 230,
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

    documents: ActorPTR2e[];
    restType: string;
    fractionToHeal: number;

    constructor(documents: ActorPTR2e[], options: Partial<foundry.applications.api.ApplicationConfiguration> = {}) {
        options.id = `rest-${documents[0].id}`; // TODO better than this
        super(options);
        this.documents = documents;
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
            fractionToHeal: this.fractionToHeal ?? 0.0,
        };
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
            removeExposure: false,
            removeAllStacks: false,
        };

        switch (data.restType) {
            case "camp":
                healOptions.fractionToHeal = data.fractionToHeal as unknown as number;
                break;
            case "center":
                healOptions.removeExposure = true;
                healOptions.removeAllStacks = true;
                break;
        }

        await Promise.all(this.documents.map(d=>d.heal(healOptions)));
    }

}