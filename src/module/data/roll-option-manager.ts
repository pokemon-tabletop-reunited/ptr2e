import { ActorPTR2e } from "@actor";
import { ItemPTR2e } from "@item";

export default class RollOptionManager<TParent extends ActorPTR2e | ItemPTR2e> {
    #initialized = false;

    private get options(): RollOptions {
        if(this.document.flags?.ptr2e?.rollOptions) return this.document.flags.ptr2e.rollOptions;
        this.#initialized = false;
        return this.initialize();
    }

    public get all(): Record<string, boolean> {
        return this.options.all;
    }

    public getFromDomain(domain: keyof RollOptions): Record<string, boolean> {
        return this.options[domain];
    }

    private document: TParent;

    constructor(document: TParent) {
        this.document = document;
    }

    public addOption(
        domain: keyof RollOptions,
        option: string,
        { value = true, addToParent = true } = {}
    ) {
        this.initialize();
        this.options[domain][option] = value;
        if (domain !== "all") {
            this.options.all[`${domain}:${option}`] = value;
        }
        if (addToParent && this.document instanceof ItemPTR2e && this.document.actor) {
            this.document.actor.rollOptions.addOption(domain, option, {
                value: value,
                addToParent: false,
            });
        }
    }

    initialize() {
        if (this.#initialized) return this.options;

        if (!this.document.flags.ptr2e)
            this.document.flags.ptr2e = {
                rollOptions: { all: {}, item: {}, effect: {}, self: {} },
            };
        else this.document.flags.ptr2e.rollOptions = { all: {}, item: {}, effect: {}, self: {} };

        this.#initialized = true;

        return this.options;
    }
}
export const RollOptionDomains = {
    all: "all",
    item: "item",
    effect: "effect",
    self: "self",
};
export type RollOptions = {
    [domain in keyof typeof RollOptionDomains]: Record<string, boolean>;
};

export default interface RollOptionManager<TParent extends ActorPTR2e | ItemPTR2e> {}
