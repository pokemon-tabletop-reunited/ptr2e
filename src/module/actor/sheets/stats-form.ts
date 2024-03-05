import { ActorPTR2e } from "@actor/base.ts";
import { DocumentSheetV2 } from "@item/sheets/document.ts";
import { ApplicationRenderContext, ApplicationRenderOptions, HandlebarsTemplatePart } from "types/foundry/common/applications/api.js";
import { StatsChart } from "./stats-chart.ts";

//@ts-ignore
export default class StatsForm extends foundry.applications.api.HandlebarsApplicationMixin(DocumentSheetV2<ActorPTR2e>) {

    _statsChart: StatsChart;
    constructor(actor: ActorPTR2e, options: Partial<foundry.applications.api.ApplicationConfiguration>) {
        super(actor, options);
        this._statsChart = new StatsChart(this);
    }

    static override DEFAULT_OPTIONS = fu.mergeObject(super.DEFAULT_OPTIONS, {
        classes: ["stats-form"],
        position: {
            height: 480,
            width: 700,
        }
    }, { inplace: false });

    static override PARTS: Record<string, HandlebarsTemplatePart<typeof StatsForm>> = {
        baseStats: {
            id: "baseStats",
            template: "/systems/ptr2e/templates/actor/stats-form-parts/base-stats-form.hbs",
            forms: {
                "#base-stats-form": StatsForm.#onSubmitBaseStatsForm
            }
        },
        evStats: {
            id: "evStats",
            template: "/systems/ptr2e/templates/actor/stats-form-parts/ev-stats-form.hbs",
            forms: {
                "#ev-stats-form": StatsForm.#onSubmitEvStatsForm
            }
        },
        statsChart: {
            id: "statsChart",
            template: "/systems/ptr2e/templates/actor/stats-form-parts/stats-chart.hbs",
        }
    }

    // @ts-ignore
    override get title() {
        return game.i18n.localize("PTR2E.ActorSheet.StatsFormTitle");
    }

    override _configureRenderOptions(options: ApplicationRenderOptions): void {
        super._configureRenderOptions(options);
        if (this.document.type !== "character") {
            options.parts = options.parts?.filter(part => part !== "baseStats");
        }
    }

    override async _prepareContext() {
        const evMaximums = this._calcEVMaximums(this.document.system.attributes);
        return {
            ...(await super._prepareContext()),
            stats: this.document.system.attributes,
            fields: (this.document.system.schema.fields.attributes as any).fields,
            evMaximums: evMaximums,
        }
    }

    override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: ApplicationRenderOptions): void {
        super._attachPartListeners(partId, htmlElement, options);
        const part = (this.constructor as typeof StatsForm).PARTS[partId];

        if (part.forms) {
            for (const [selector, _handler] of Object.entries(part.forms)) {
                const form = htmlElement.matches(selector) ? htmlElement : htmlElement.querySelector(selector);
                if (!form) continue;
                for (const element of form.querySelectorAll("input,select,textarea")) {
                    element.addEventListener("change", (_event: Event) => form.dispatchEvent(new SubmitEvent("submit")));
                }
                for (const range of form.querySelectorAll("input[type=range]")) {
                    range.addEventListener("input", this._onChangeRange.bind(this));
                }
            }
        }
    }

    override _onRender(context: ApplicationRenderContext, options: ApplicationRenderOptions): void {
        super._onRender(context, options);
        if (context.parts?.includes("statsChart")) {
            this._statsChart.render();
        }
    }

    _calcEVMaximums(stats: Attributes) {
        const result = {
            total: 0
        } as Record<keyof Attributes, number> & { total: number };
        for (const k in stats) {
            const key = k as keyof Attributes;
            result[key] = this.#calcEvMaximum(key, stats);
            result.total += stats[key].evs;
        }

        return result;
    }

    #calcEvMaximum(stat: keyof Attributes, stats: Attributes) {
        let total = 0;
        for (const k in stats) {
            const otherKey = k as keyof Attributes;
            if (otherKey !== stat) total += stats[otherKey].evs;
        }
        return Math.min(200, 508 - total);
    }

    _onChangeRange(event: Event) {
        const field = (event.currentTarget as HTMLInputElement).parentElement?.querySelector(".range-value");
        if (field) {
            if (field.tagName === "INPUT") (field as HTMLInputElement).value = (event.target as HTMLInputElement).value;
            else (field as HTMLElement).innerHTML = (event.target as HTMLInputElement).value;
        }

        const rangeInput = event.target as HTMLInputElement;
        const key = rangeInput.name.replaceAll("system.", "").replaceAll("attributes.", "").replaceAll(".evs", "") as keyof Attributes;
        const attributes = fu.duplicate(this.document.system.attributes);
        attributes[key].evs = parseInt(rangeInput.value);
        const max = this.#calcEvMaximum(key, attributes);
        rangeInput.max = max.toString();
    }

    static async #onSubmitBaseStatsForm(this: StatsForm, event: SubmitEvent, _form: HTMLFormElement, formData: FormDataExtended) {
        event.preventDefault();
        const result = await this._updateDocument(formData);
        console.debug(result, this.document.system.attributes);
        this.render({parts: ["statsChart"]});
    }

    /**
     * @this {StatsForm} 
     */
    static async #onSubmitEvStatsForm(this: StatsForm, event: SubmitEvent, _form: HTMLFormElement, formData: FormDataExtended) {
        event.preventDefault();
        const result = await this._updateDocument(formData);
        console.debug(result, this.document.system.attributes);
        this.render({parts: ["statsChart", "evStats"]});
    }
}