import { StatsChart } from "./stats-chart.ts";
import { Attributes, ActorPTR2e } from "@actor";
import { SpeciesSystemModel } from "@item/data/index.ts";
import { DocumentSheetConfiguration } from "@item/sheets/document.ts";
import { debounceAsync } from "@utils";

export default class StatsForm extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.DocumentSheetV2<ActorPTR2e, foundry.applications.api.HandlebarsDocumentSheetConfiguration>) {

    _statsChart: StatsChart;
    
    constructor(options: Partial<foundry.applications.api.DocumentSheetConfiguration>) {
        super(options);
        this._statsChart = new StatsChart(this, {});
    }

    static override DEFAULT_OPTIONS = fu.mergeObject(super.DEFAULT_OPTIONS, {
        classes: ["stats-form"],
        position: {
            height: 620,
            width: 700,
        },
        form: {
            handler: null
        }   
    }, { inplace: false });

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        baseStats: {
            id: "baseStats",
            template: "systems/ptr2e/templates/actor/stats-form-parts/base-stats-form.hbs",
            forms: {
                // @ts-expect-error - This is valid
                "#base-stats-form": {handler: debounceAsync(StatsForm.#onSubmitBaseStatsForm, 200) }
            }
        },
        evStats: {
            id: "evStats",
            template: "systems/ptr2e/templates/actor/stats-form-parts/ev-stats-form.hbs",
            forms: {
                // @ts-expect-error - This is valid
                "#ev-stats-form": {handler: debounceAsync(StatsForm.#onSubmitEvStatsForm, 200) }
            }
        },
        statsChart: {
            id: "statsChart",
            template: "systems/ptr2e/templates/actor/stats-form-parts/stats-chart.hbs",
        }
    }

    override get title() {
        return game.i18n.localize("PTR2E.ActorSheet.StatsFormTitle");
    }

    override _configureRenderOptions(options: DocumentSheetConfiguration<ActorPTR2e>): void {
        super._configureRenderOptions(options);
        if ((this.document.system._source.species as Maybe<SpeciesSystemModel['_source']>)?.traits?.includes("pokemon")) {
            options.parts = options.parts?.filter(part => part !== "baseStats");
        }
    }

    override async _prepareContext() {
        const baseMaximums = this._calcBaseMaximums(this.document.system.attributes);
        const evMaximums = this._calcEVMaximums(this.document.system.attributes);
        return {
            ...(await super._prepareContext()),
            stats: this.document.system.attributes,
            fields: (this.document.system.schema.fields.attributes as foundry.data.fields.SchemaField<foundry.data.fields.DataSchema>).fields,
            baseMaximums,
            evMaximums,
        }
    }

    override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: DocumentSheetConfiguration<ActorPTR2e>): void {
        super._attachPartListeners(partId, htmlElement, options);
        const part = (this.constructor as typeof StatsForm).PARTS[partId];

        if (part.forms) {
            for (const [selector] of Object.entries(part.forms)) {
                const form = htmlElement.matches(selector) ? htmlElement : htmlElement.querySelector(selector);
                if (!form) continue;
                for (const element of form.querySelectorAll("input,select,textarea")) {
                    element.addEventListener("change", () => form.dispatchEvent(new SubmitEvent("submit", {cancelable: true})));
                }
                for (const range of form.querySelectorAll("#base-stats-form input[type=range]")) {
                    range.addEventListener("input", this.onChangeBaseRange);
                }
                for (const range of form.querySelectorAll("#ev-stats-form input[type=range]")) {
                    range.addEventListener("input", this.onChangeEVRange);
                }
            }
        }
    }

    override _onRender(context: foundry.applications.api.ApplicationRenderContext, options: DocumentSheetConfiguration<ActorPTR2e>): void {
        super._onRender(context, options);
        if (options.parts?.includes("statsChart")) {
            this._statsChart.render();
        }
    }

    _calcBaseMaximums(stats: Attributes) {
        const BASE_MIN = 40;
        const result = {
            total: 0
        } as Record<keyof Attributes, number> & { total: number };
        for (const k in stats) {
            const key = k as keyof Attributes;
            result[key] = this.#calcBaseMaximum(key, stats);
            result.total += Math.max(stats[key].base - BASE_MIN, 0);
        }

        return result;
    }

    #calcBaseMaximum(stat: keyof Attributes, stats: Attributes) {
        const BASE_MIN = 40;
        const BASE_MAX = 90;
        const BASE_POINTS = 110;
        let total = 0;
        for (const k in stats) {
            const otherKey = k as keyof Attributes;
            if (otherKey !== stat) total += Math.max(stats[otherKey].base - BASE_MIN, 0);
        }
        return Math.min(BASE_MAX, BASE_POINTS + BASE_MIN - total);
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

    _onChangeBaseRange(event: Event) {
        const field = (event.currentTarget as HTMLInputElement).parentElement?.querySelector(".range-value");
        if (field) {
            if (field.tagName === "INPUT") (field as HTMLInputElement).value = (event.target as HTMLInputElement).value;
            else (field as HTMLElement).innerHTML = (event.target as HTMLInputElement).value;
        }

        const rangeInput = event.target as HTMLInputElement;
        const key = rangeInput.name.replaceAll("system.", "").replaceAll("attributes.", "").replaceAll(".base", "") as keyof Attributes;
        const attributes = fu.duplicate(this.document.system.attributes);
        attributes[key].base = parseInt(rangeInput.value);
        const max = this.#calcBaseMaximum(key, attributes);
        rangeInput.max = max.toString();
    }

    //@ts-expect-error - This is valid
    private onChangeBaseRange = debounceAsync(this._onChangeBaseRange.bind(this), 200);

    _onChangeEVRange(event: Event) {
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

    //@ts-expect-error - This is valid
    private onChangeEVRange = debounceAsync(this._onChangeEVRange.bind(this), 200);

    static async #onSubmitBaseStatsForm(this: StatsForm, event: SubmitEvent | Event, form: HTMLFormElement, formData: FormDataExtended) {
        event.preventDefault();
        await this.#updateDocument(event as SubmitEvent, form, formData);
        this.render({parts: ["statsChart", "baseStats"]});
    }

    /**
     * @this {StatsForm} 
     */
    static async #onSubmitEvStatsForm(this: StatsForm, event: SubmitEvent | Event, form: HTMLFormElement, formData: FormDataExtended) {
        event.preventDefault();
        await this.#updateDocument(event as SubmitEvent, form, formData);
        this.render({parts: ["statsChart", "evStats"]});
    }

    async #updateDocument(event: SubmitEvent, form: HTMLFormElement, formData: FormDataExtended) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const submitData = this._prepareSubmitData(event, form, formData) as any;

        if(submitData.system?.attributes && this.document.isHumanoid()) {
            submitData.system!.species ??= {};
            submitData.system.species.stats = Object.entries(submitData.system.attributes).reduce((acc, [key, value]) => {
                acc[key] = (value as {base: number}).base;
                return acc;
            }, {} as Record<string, number>)
            if(submitData.system.attributes.spe.base && submitData.system.attributes.spe.base !== (this.document.system._source as unknown as {attributes: Attributes}).attributes.spe.base) {
                submitData.system.species.movement = this.document.system.movement.contents;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const overland = submitData.system.species.movement.find((m: any) => m.method === "overland")!

                overland.value = Math.max(3, Math.floor(submitData.system.attributes.spe.base / 10));
                if(overland.type !== "primary") overland.type = "primary";

                submitData.system.species.movement = (submitData.system.species.movement as {type: string, method: string, value: number}[]).reduce((acc, m) => {
                    acc[m.type] ??= [];
                    acc[m.type].push({type: m.method, value: m.value});
                    return acc;
                }, {primary: [], secondary: []} as Record<string, {type: string, value: number}[]>);
            }
        }

        await this.document.update(submitData);
    }
}