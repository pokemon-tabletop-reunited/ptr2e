import { ActorPTR2e } from "@actor";
import { ModifierPTR2e } from "@module/effects/modifiers.ts";
import * as R from "remeda";
import { BaseStatisticData, StatisticData } from "./data.ts"
import { extractModifiers } from "src/util/rule-helpers.ts";

/** Basic data forming any PTR statistic */
abstract class BaseStatistic {
    /** The actor to which this statistic belongs */
    actor: ActorPTR2e;
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

    constructor(actor: ActorPTR2e, data: BaseStatisticData) {
        this.actor = actor;
        this.slug = data.slug;
        this.label = game.i18n.localize(data.label).trim();
        this.data = { ...data };
        this.domains = R.uniq((data.domains ??= []));
        const modifiers = [
            data.modifiers ?? [],
            extractModifiers(this.actor.synthetics, this.domains),
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
