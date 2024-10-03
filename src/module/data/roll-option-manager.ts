import { ActorPTR2e } from "@actor";
import { ItemPTR2e } from "@item";
import Trait from "./models/trait.ts";
import { ActiveEffectPTR2e } from "@effects";

export default class RollOptionManager<TParent extends ActorPTR2e | ItemPTR2e | ActiveEffectPTR2e> {
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
        if (!["all", "change-selections"].includes(domain)) {
            this.options.all[`${domain}:${option}`] = value;
        }
        if (addToParent && this.document instanceof ItemPTR2e && this.document.actor) {
            this.document.actor.rollOptions.addOption(domain, option, {
                value: value,
                addToParent: false,
            });
        }
    }

    public addTrait(trait: Maybe<Trait>) {
        if (!trait) return;
        this.addOption("trait", trait.slug);
    }

    initialize() {
        if (this.#initialized) return this.options;

        if (!this.document.flags.ptr2e)
            this.document.flags.ptr2e = {
                rollOptions: { all: {}, item: {}, effect: {}, self: {}, trait: {}, clocks: {}, "change-selections": {} },
            };
        else this.document.flags.ptr2e.rollOptions = { all: {}, item: {}, effect: {}, self: {}, trait: {}, clocks: {}, "change-selections": {} };

        this.#initialized = true;

        return this.options;
    }
}
export const RollOptionDomains = {
    all: "all",
    item: "item",
    effect: "effect",
    self: "self",
    trait: "trait",
    clocks: "clocks",
    "change-selections": "change-selections",
};
export type RollOptions = {
    [domain in keyof typeof RollOptionDomains]: Record<string, boolean>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default interface RollOptionManager<TParent extends ActorPTR2e | ItemPTR2e | ActiveEffectPTR2e> {}
