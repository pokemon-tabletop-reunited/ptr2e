import { ActionPTR2e } from "@data";
import {  StatisticRollParameters } from "@system/statistics/statistic.ts";
import { ConsumablePTR2e } from "@item";
import { PokeballStatistic } from "@system/statistics/pokeball.ts";
import { PokeballRollCallback } from "@system/rolls/check-roll.ts";

export default class PokeballActionPTR2e extends ActionPTR2e {
    declare type: "pokeball";

    static override TYPE = "pokeball" as const;

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    get rollable(): boolean {
        return true;
    }

    async roll(args?: StatisticRollParameters<PokeballRollCallback>) {
        if (!this.rollable) return false;

        return this.statistic!.check.roll(args);
    }

    override prepareDerivedData(): void {
        super.prepareDerivedData();

        this.statistic = this.prepareStatistic();
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    get isMelee(): boolean {
        return false; // TODO: Implement
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    get isRanged(): boolean {
        return true; // TODO: Implement
    }

    public prepareStatistic({ force }: { force?: boolean } = {}): PokeballStatistic | null {
        if (!force && this.statistic) return this.statistic;
        if (!this.actor) return null;
        return new PokeballStatistic(this);
    }

    public getRangeIncrement(distance: number | null): number | null {
        if(distance === null || !this.range || !["ally", "enemy", "creature", "object"].includes(this.range.target)) return null;

        // TODO: Implement Reach
        if(this.range.distance <= 1) return distance >= 2 ? Infinity : 0;
        const increment = this.range.distance;
        return Math.max(Math.ceil(distance / increment), 1) - 1;
    }

    static fromConsumable(consumable: ConsumablePTR2e): PokeballActionPTR2e {
        const action = new this({
            name: `Throw ${consumable.name}`,
            slug: `${consumable.slug}-use`,
            type: "pokeball",
            description: `Temporary 'Throw Pokeball' Action for ${consumable.name} consumable`,
            img: consumable.img,
            traits: consumable.system._source.traits,
            range: {
                target: "creature",
                distance: 10
            },
            cost: {
                activation: "complex",
                powerPoints: 0
            }
        }, {
            parent: consumable
        })
        action.prepareDerivedData();
        return action;
    }
}
export default interface PokeballActionPTR2e extends ActionPTR2e {
    statistic: Maybe<PokeballStatistic>;
}