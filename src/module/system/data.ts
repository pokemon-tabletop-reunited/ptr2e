import type { ActorPTR2e, EffectRoll } from "@actor";
import type { BaseStatisticCheck, StatisticCheck } from "./statistics/statistic.ts";
import type { ItemPTR2e } from "@item";
import type { CheckDC } from "@system/rolls/degree-of-success.ts";
import type { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import type { ModifierPTR2e } from "@module/effects/modifiers.ts";
import type { ActionPTR2e, AttackPTR2e, Trait } from "@data";
import type { RollNote } from "./notes.ts";
import type { AttackCheck } from "./statistics/attack.ts";

interface CheckContextParams<
  TStatistic extends BaseStatisticCheck<unknown, unknown> = StatisticCheck,
  TItem extends ItemPTR2e | null = ItemPTR2e | null,
> extends RollContextParams<TStatistic, TItem> {

}

interface RollContextParams<
  TStatistic extends BaseStatisticCheck<unknown, unknown> | null = StatisticCheck | null,
  TItem extends ItemPTR2e | null = ItemPTR2e | null,
> {
  /** The statistic used for the roll */
  statistic: TStatistic;
  /** A targeted token: may not be applicable if the action isn't targeted */
  target?: { actor?: ActorPTR2e | null; token?: Token.ConfiguredInstance | null } | null;
  /** The item being used in the attack or damage roll */
  item?: TItem;
  /** The action being used for this check */
  action?: ActionPTR2e;
  /** The attack being used in the attack or damage roll */
  attack?: AttackPTR2e;
  /** Domains from which to draw roll options */
  domains: string[];
  /** Initial roll options for the strike */
  options: Set<string>;
  /** Whether the request is for display in a sheet view. If so, targets are not considered */
  viewOnly?: boolean;
  /** A direct way of informing a roll is part of a melee action: it is otherwise inferred from the attack item */
  melee?: boolean;
  /** Action traits associated with the roll */
  traits?: string[] | Collection<Trait> | null;
}

interface CheckContext<
  TActor extends ActorPTR2e = ActorPTR2e,
  TStatistic extends BaseStatisticCheck<unknown, unknown> = StatisticCheck,
  TItem extends ItemPTR2e | null = ItemPTR2e | null,
> extends RollContext<TActor, TStatistic, TItem> {
  dc?: CheckDC | null;
  outOfRange?: boolean;
  notes?: RollNote[];
  /** Omitted Subrolls */
  omittedSubrolls?: Set<'accuracy' | 'crit' | 'damage'>;
}

/** Context for the attack or damage roll of a strike */
interface RollContext<
  TActor extends ActorPTR2e,
  TStatistic extends BaseStatisticCheck<unknown, unknown> | null = StatisticCheck | null,
  TItem extends ItemPTR2e | null = ItemPTR2e | null,
> {
  /** Roll options */
  options: Set<string>;
  self: AttackSelf<TActor, TStatistic, TItem>;
  target: RollTarget | null;
  traits: string[];
  effectRolls: { target: EffectRoll[], origin: EffectRoll[] };
  flatDamage?: number;
}

interface AttackSelf<
  TActor extends ActorPTR2e,
  TStatistic extends BaseStatisticCheck<unknown, unknown> | null = AttackCheck | null,
  TItem extends ItemPTR2e | null = ItemPTR2e | null,
> {
  actor: TActor;
  token: TokenDocumentPTR2e | null;
  statistic: TStatistic,
  item: TItem,
  attack: AttackPTR2e,
  modifiers: ModifierPTR2e[]
}

interface RollTarget {
  actor: ActorPTR2e;
  token: TokenDocumentPTR2e;
  distance: number;
  rangeIncrement: number | null;
}

export type { CheckContext, RollContext, AttackSelf, RollTarget, CheckContextParams, RollContextParams };