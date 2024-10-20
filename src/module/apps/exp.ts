import { ActorPTR2e } from "@actor";
import { ApplicationV2Expanded } from "./appv2-expanded.ts";
import { htmlQueryAll } from "@utils";
import { HandlebarsRenderOptions } from "types/foundry/common/applications/api.js";
import { EvolutionData } from "@item/data/species.ts";

function toCM(number: number) {
    if (number >= 0) return `+${number}%`;
    return `${number}%`;
}

export class ExpApp extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
    static override DEFAULT_OPTIONS = foundry.utils.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            tag: "form",
            classes: ["ptr2e", "sheet", "xp-sheet"],
            position: {
                height: 'auto',
                width: 425,
            },
            window: {
                minimizable: true,
                resizable: false,
            },
            form: {
                submitOnChange: false,
                closeOnSubmit: true,
                handler: ExpApp.#onSubmit,
            },
        },
        { inplace: false }
    );

    static override PARTS = {
        actions: {
            id: "actions",
            template: "systems/ptr2e/templates/apps/xp-award.hbs",
            scrollable: [".scroll"],
        },
    };

    static F_BAND = 2.5;
    static NON_PARTY_MODIFIER = 1 / 4;
    static UNEVOLVED_BONUS = 1.2;

    name;
    documents;
    circumstances;

    constructor(name: string, documents: ActorPTR2e[], options: Partial<foundry.applications.api.ApplicationConfiguration> = {}) {
        options.id = `exp-${documents.length ? documents[0].id || fu.randomID() : fu.randomID()}`;
        super(options);
        this.name = name;
        this.documents = documents;
        this.circumstances = [];

        if (this.level < 10) {
            this.circumstances.push({
                label: "Baby's First Steps",
                bonus: 100,
            })
        }
    }

    override async _prepareContext() {
        const party = this.documents.map(a => ({
            img: a.img,
            name: a.name,
            uuid: a.uuid,
        }));

        const cm = this.circumstances.sort((a, b) => b.bonus - a.bonus).map(c => ({
            label: c.label,
            bonus: toCM(c.bonus),
        }));

        type CmInTemplate = { key: string; label: string; hint?: string; bonus: string; sort: number };

        const exampleCircumstanceModifiers = {} as Record<string, CmInTemplate[]>;
        for (const [key, val] of Object.entries(CONFIG.PTR.data.circumstanceModifiers as Record<string, CircumstanceModifier>)) {
            const cmVal = {
                key,
                label: val.label,
                hint: val.hint,
                bonus: toCM(val.bonus),
                sort: val.bonus,
            }
            for (const category of val.groups) {
                exampleCircumstanceModifiers[category] ??= [] as CmInTemplate[];
                exampleCircumstanceModifiers[category].push(cmVal);
            }
        }
        for (const contents of Object.values(exampleCircumstanceModifiers)) {
            contents.sort((a, b) => b.sort - a.sort);
        }

        const ber = this.ber;
        const modifier = this.modifier;
        const modifierLabel = toCM(modifier);

        const noteAppliesTo = (() => {
            const applyMode = game.settings.get("ptr2e", "expMode");
            return game.i18n.localize(`PTR2E.XP.ApplyMode.${applyMode}.hint`);
        })();

        return {
            id: this.options.id,
            party,
            noteAppliesTo,
            modifier,
            modifierLabel,
            cm,
            ber,
            exampleCircumstanceModifiers,
        };
    }

    override _attachPartListeners(
        partId: string,
        htmlElement: HTMLElement,
        options: foundry.applications.api.HandlebarsRenderOptions
    ) {
        super._attachPartListeners(partId, htmlElement, options);

        htmlElement.querySelector(".prospective-circumstance-modifiers .addCustomCircumstance")
            ?.addEventListener("click", ExpApp.#addCustomCM.bind(this));

        for (const input of htmlQueryAll(htmlElement, ".prospective-circumstance-modifiers .cm button.add[data-modifier-key]")) {
            input.addEventListener("click", ExpApp.#addCM.bind(this));
        }

        for (const input of htmlQueryAll(htmlElement, ".applied-circumstance-modifiers .cm button.remove")) {
            input.addEventListener("click", ExpApp.#removeCM.bind(this));
        }
    }

    override get title() {
        return `${this.name} - ${game.i18n.localize("PTR2E.XP.title")}`;
    }

    get level() {
        return (Math.ceil(this.documents.reduce((l, d) => l + d.system.advancement.level, 0)) ?? 1) / this.documents.length;
    }

    get ber() {
        const apl = this.level;
        return Math.floor(0.25 * (5 / 4) * (Math.pow(apl + 1, 3) - Math.pow(apl, 3)));
    }

    get modifier() {
        return this.circumstances.reduce((m, c) => m + (c.bonus ?? 0), 0);
    }

    override async render(options: boolean | HandlebarsRenderOptions, _options?: HandlebarsRenderOptions) {
        if (!this.element) return super.render(options, _options);

        // @ts-expect-error
        const groupsOpen = htmlQueryAll(this.element, "details[data-group]").reduce((m, d) => ({ ...m, [d.dataset.group]: d.open }), {});
        const prospectiveScrollTop = this.element?.querySelector(".prospective-circumstance-modifiers")?.scrollTop;
        const appliedScrollTop = this.element?.querySelector(".applied-circumstance-modifiers")?.scrollTop;

        // render the new page
        const renderResult = await super.render(options, _options);

        // set the open groups and scroll location
        for (const group of htmlQueryAll(this.element, "details[data-group]")) {
            // @ts-expect-error
            group.open = groupsOpen[group.dataset.group] ?? false;
        }

        const prospective = this.element.querySelector(".prospective-circumstance-modifiers");
        if (prospective !== null && prospectiveScrollTop !== undefined) prospective.scrollTop = prospectiveScrollTop;

        const applied = this.element.querySelector(".applied-circumstance-modifiers");
        if (applied !== null && appliedScrollTop !== undefined) applied.scrollTop = appliedScrollTop;

        return renderResult;
    }

    static getNestedFolderContents(folder: Folder) {
        let contents = new Set(folder.contents);
        for (const subfolder of folder.children) {
            contents = contents.union(ExpApp.getNestedFolderContents(subfolder.folder! as Folder));
        }
        return contents;
    }

    static calculateExpAward(actor: ActorPTR2e, ber: number, cr: number, apl: number) {
        let calculatedExp = ber;
        // apply CR
        calculatedExp *= (1 + (cr / 100));
        // apply F_band
        calculatedExp *= Math.pow((2 * apl + 10) / (apl + actor.system.advancement.level + 10), ExpApp.F_BAND);
        // apply party modifier
        if (!actor.party) {
            calculatedExp *= ExpApp.NON_PARTY_MODIFIER;
        }
        // apply bonus_ue
        if (ExpApp.shouldGetUnevolvedBonus(actor)) {
            calculatedExp *= ExpApp.UNEVOLVED_BONUS;
        }
        return Math.floor(calculatedExp);
    }

    static shouldGetUnevolvedBonus(actor: ActorPTR2e): boolean {
        if (!actor?.system?.species) return false;

        const current = (() => {
            const currentEvolution = (evos: EvolutionData[]): EvolutionData | null => {
                for (const evo of evos) {
                    if (evo.name === actor.system.species!.slug) {
                        return evo;
                    }
                    const subEvo = currentEvolution(evo.evolutions || []);
                    if (subEvo) return subEvo;
                }
                return null;
            }
            if (actor.system.species!.evolutions) return currentEvolution([actor.system.species!.evolutions]);
            return null;
        })();
        if (!current) return false; // no evolutions
        // check all the possible evolutions from here to see if we can evolve
        for (const evo of (current.evolutions || [])) {
            if (!evo.methods) return true; // no prerequisites to evolve!
            if (evo.methods.length !== 1) continue; // we only care about level-only prerequisites right now
            // TODO: implement more complex evolution prerequisite checking, and use it here.
            if (evo.methods[0].type === "level" && evo.methods[0].level <= actor.system.advancement.level) return true;
        }
        return false;
    }

    static #addCustomCM(this: ExpApp) {
        const cmLabel = (this.element.querySelector(".prospective-circumstance-modifiers .customCircumstanceLabel") as HTMLInputElement)?.value || "Custom Circumstance";
        const cmBonus = parseInt((this.element.querySelector(".prospective-circumstance-modifiers .customCircumstanceBonus") as HTMLInputElement)?.value);
        if (isNaN(cmBonus)) return;

        this.circumstances.push({
            label: cmLabel,
            bonus: cmBonus,
        });
        this.render(false);
    }

    static #addCM(this: ExpApp, event: Event) {
        const button = event.currentTarget;
        // @ts-expect-error
        const cmKey = button.dataset.modifierKey;
        this.circumstances.push(CONFIG.PTR.data.circumstanceModifiers[cmKey]);
        this.render(false);
    }

    static #removeCM(this: ExpApp, event: Event) {
        const button = event.currentTarget;
        // @ts-expect-error
        const cmIdx = button.dataset.modifierIdx;
        this.circumstances.splice(cmIdx, 1);
        this.render(false);
    }

    static async #onSubmit(this: ExpApp) {
        const ber = this.ber;
        const cm = this.modifier;
        const apl = this.level;

        const toApply = (() => {
            const applyMode = game.settings.get("ptr2e", "expMode");
            let docs = new Set(this.documents) as Set<ActorPTR2e>;

            // only give exp to the individuals indicated in the dialog
            if (applyMode === "individual") return docs;

            // give exp to the individuals in the dialog and their party members
            if (applyMode === "party") {
                for (const owner of this.documents) {
                    const party = owner.party;
                    if (!party) continue;
                    for (const partyMember of party.party) {
                        docs.add(partyMember);
                    }
                }
                return docs;
            }

            // give exp to the individuals in the dialog and all their owned pokemon
            for (const owner of this.documents) {
                if (owner?.folder?.owner == "") continue;
                docs = docs.union(ExpApp.getNestedFolderContents(owner.folder as Folder)) as Set<ActorPTR2e>;
            }
            return docs;
        })();

        const notification = ui.notifications.info(game.i18n.localize("PTR2E.XP.Notifications.Info"));

        await Promise.all(toApply.map((d) => {
            const existingXp = d.system.advancement.experience.current;
            const expAward = ExpApp.calculateExpAward(d, ber, cm, apl);
            return d.update({
                "system.advancement.experience.current": existingXp + expAward,
            });
        }))

        ui.notifications.remove(notification);
        ui.notifications.info(game.i18n.localize("PTR2E.XP.Notifications.Success"));
    }
};


export type CircumstanceModifier = { bonus: number; label: string; groups: string[], hint?: string };