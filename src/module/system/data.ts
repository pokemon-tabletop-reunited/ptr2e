import { ActorPTR2e } from "@actor";
import { StatisticCheck } from "./statistics/statistic.ts";
import { ItemPTR2e, ItemSystemPTR } from "@item";
import { CheckDC } from "@system/rolls/degree-of-success.ts";
import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { ModifierPTR2e } from "@module/effects/modifiers.ts";

interface CheckContext<
    TActor extends ActorPTR2e,
    TStatistic extends StatisticCheck = StatisticCheck,
    TItem extends ItemPTR2e<ItemSystemPTR, ActorPTR2e> | null = ItemPTR2e<
        ItemSystemPTR,
        ActorPTR2e
    > | null,
> extends RollContext<TActor, TStatistic, TItem> {
    dc: CheckDC | null;
}

/** Context for the attack or damage roll of a strike */
interface RollContext<
    TActor extends ActorPTR2e,
    TStatistic extends StatisticCheck | null = StatisticCheck | null,
    TItem extends ItemPTR2e<ItemSystemPTR, ActorPTR2e> | null = ItemPTR2e<
        ItemSystemPTR,
        ActorPTR2e
    > | null,
> {
    /** Roll options */
    options: Set<string>;
    self: AttackSelf<TActor, TStatistic, TItem>;
    target: RollTarget | null;
    traits: string[];
}

interface AttackSelf<
    TActor extends ActorPTR2e,
    TStatistic extends StatisticCheck | null = StatisticCheck | null,
    TItem extends ItemPTR2e<ItemSystemPTR, ActorPTR2e> | null = ItemPTR2e<
        ItemSystemPTR,
        ActorPTR2e
    > | null,
> {
    actor: TActor;
    token: TokenDocumentPTR2e | null;
    statistic: TStatistic,
    item: TItem,
    modifiers: ModifierPTR2e[]
}

interface RollTarget {
    actor: ActorPTR2e;
    token: TokenDocumentPTR2e;
    distance: number;
    rangeIncrement: number | null;
}

export type { CheckContext, RollContext, AttackSelf, RollTarget };