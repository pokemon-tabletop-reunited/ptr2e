import type { ModifierPTR2e } from "@module/effects/modifiers.ts";
import * as R from "remeda";
import type { BaseStatisticData, StatisticData } from "./data.ts"
import { extractModifiers } from "src/util/change-helpers.ts";

/** Basic data forming any PTR statistic */
abstract class BaseStatistic {
    /** The actor to which this statistic belongs */
    actor: Actor.ConfiguredInstance;
    /** A stable but human-readable identifier */
    slug: string;
    /** A display label */
    label: string;
    /** Original construction arguments */
    protected data: StatisticData;
    /** String category identifiers: used to retrieve modifiers and other synthetics as well as create roll options  */
    domains: string[];
    /** Penalties, bonuses, and actual modifiers comprising a total modifier value */
    modifiers: ModifierPTR2e[];

    constructor(actor: Actor.ConfiguredInstance, data: BaseStatisticData) {
        this.actor = actor;
        this.slug = data.slug;
        this.label = game.i18n.localize(data.label).trim();
        this.data = { ...data };
        this.domains = R.unique((data.domains ??= []));
        const modifiers = [
            data.modifiers ?? [],
            extractModifiers(this.actor.synthetics, this.domains, data.defferedValueParams),
        ].flat();
        //TODO: Commented line from PF2e is about removing duplicates and taking the highest value, evaluate necessity
        this.modifiers = modifiers.map(m => m.clone()) //new StatisticModifier("", modifiers).modifiers.map((m) => m.clone());

        if (this.domains.length > 0) {
            // Test the gathered modifiers if there are any domains
            const options = this.createRollOptions();
            for (const modifier of this.modifiers) {
                modifier.test(options);
            }
        }
    }

    createRollOptions(domains = this.domains): Set<string> {
        return new Set(this.actor.getRollOptions(domains));
    }
}

export { BaseStatistic };
