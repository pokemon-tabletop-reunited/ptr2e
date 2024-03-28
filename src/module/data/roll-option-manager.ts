import { ActorPTR2e } from "@actor";
import { ItemPTR2e } from "@item";

export default class RollOptionManager<TParent extends ActorPTR2e | ItemPTR2e> {
    private get options(): RollOptions {
        return this.document.flags.ptr2e!.rollOptions;
    }

    public get all(): Record<string, boolean> {
        return this.options.all;
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
}
export const RollOptionDomains = {
    all: "all",
    item: "item",
    effect: "effect"
};
export type RollOptions = {
    [domain in keyof typeof RollOptionDomains]: Record<string, boolean>;
};

export default interface RollOptionManager<TParent extends ActorPTR2e | ItemPTR2e> {}
