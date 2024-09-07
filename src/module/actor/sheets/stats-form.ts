import { StatsChart } from "./stats-chart.ts";
import { Attributes, ActorPTR2e } from "@actor";
import { SpeciesSystemModel } from "@item/data/index.ts";
import { DocumentSheetConfiguration } from "@item/sheets/document.ts";

export default class StatsForm extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.DocumentSheetV2<ActorPTR2e, foundry.applications.api.HandlebarsDocumentSheetConfiguration>) {

    _statsChart: StatsChart;
    
    constructor(options: Partial<foundry.applications.api.DocumentSheetConfiguration>) {
        super(options);
        this._statsChart = new StatsChart(this, {});
    }

    static override DEFAULT_OPTIONS = fu.mergeObject(super.DEFAULT_OPTIONS, {
        classes: ["stats-form"],
        position: {
            height: 500,
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
                "#base-stats-form": {handler: StatsForm.#onSubmitBaseStatsForm }
            }
        },
        evStats: {
            id: "evStats",
            template: "systems/ptr2e/templates/actor/stats-form-parts/ev-stats-form.hbs",
            forms: {
                "#ev-stats-form": {handler: StatsForm.#onSubmitEvStatsForm }
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
        const evMaximums = this._calcEVMaximums(this.document.system.attributes);
        return {
            ...(await super._prepareContext()),
            stats: this.document.system.attributes,
            fields: (this.document.system.schema.fields.attributes as foundry.data.fields.SchemaField<foundry.data.fields.DataSchema>).fields,
            evMaximums: evMaximums,
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
                for (const range of form.querySelectorAll("input[type=range]")) {
                    range.addEventListener("input", this._onChangeRange.bind(this));
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

    static async #onSubmitBaseStatsForm(this: StatsForm, event: SubmitEvent | Event, form: HTMLFormElement, formData: FormDataExtended) {
        event.preventDefault();
        await this.#updateDocument(event as SubmitEvent, form, formData);
        this.render({parts: ["statsChart"]});
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