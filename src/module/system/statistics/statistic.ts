import { BaseStatistic } from "./base.ts";
import type { StatisticCheckData, StatisticData, StatisticDifficultyClassData } from "./data.ts";
import { CheckModifier, ModifierPTR2e, StatisticModifier } from "@module/effects/modifiers.ts";
import type { AttackRollCallback, CheckRoll, CheckRollCallback, CheckType, PokeballRollCallback } from "@system/rolls/check-roll.ts";
import * as R from "remeda";
import {
  extractModifierAdjustments,
  extractModifiers,
  extractNotes,
} from "src/util/change-helpers.ts";
import type { CheckDC } from "@system/rolls/degree-of-success.ts";
import type { RollNote, RollNoteSource } from "@system/notes.ts";
import type { CheckContext, RollTarget } from "../data.ts";
import type { CheckRollContext } from "@system/rolls/data.ts";
import { CheckPTR2e } from "../check.ts";
import type { AttackModifierPopup } from "@module/apps/modifier-popup/attack-modifier-popup.ts";
import type { DeepPartial } from "fvtt-types/utils";

class Statistic extends BaseStatistic {
  /** The `Statistic` from which this one was derived (set by `Statistic#extend`), or otherwise `null`. */
  base: Statistic | null = null;

  config: RollOptionConfig;

  #check?: BaseStatisticCheck<unknown, unknown, this>;

  constructor(actor: Actor.ConfiguredInstance, data: StatisticData, config: RollOptionConfig = {}) {
    data.modifiers ??= [];
    data.domains ??= [];

    const skillModifier =
      data.check?.type === "skill-check" && actor.system.skills.has(data.slug)
        ? new ModifierPTR2e({
          slug: data.slug,
          label: data.label,
          modifier: actor.system.skills.get(data.slug)!.total,
          method: "flat",
        })
        : null;

    if(skillModifier && actor.system.modifiers.skills !== 1 && actor.system.skills.has(data.slug)) {
      const value = Number(actor.system.modifiers.skills);
      if(!isNaN(value) && value !== 1) {
        skillModifier.adjustments.push({
          slug: "skill-multiplier",
          test: () => true,
          getNewValue: (current) => value > 1 ? Math.ceil(current * value) : Math.floor(current * value),
        })
      }
    }

    if (skillModifier) {
      data.modifiers.filter((m) => skillModifier.slug !== m.slug);
      data.modifiers.unshift(skillModifier);
    }

    super(actor, data);

    this.config = config;

    // Run the modifiers filter function if one is supplied
    if (data.filter) {
      this.modifiers = this.modifiers.filter(data.filter);
    }

    // Add DC data with an additional domain if not already set
    this.data.dc ??= { domains: [`${this.slug}-dc`] };
  }

  get check(): BaseStatisticCheck<unknown, unknown, this> {
    return (this.#check ??= new StatisticCheck(this, this.data, this.config));
  }

  /** Convenience getter to the statistic's total modifier */
  get mod(): number {
    return this.check.mod;
  }

  override createRollOptions(domains = this.domains, args: RollOptionConfig = {}): Set<string> {
    const { item, extraRollOptions, origin } = args;

    const rollOptions: string[] = [];
    if (domains.length > 0) {
      rollOptions.push(...super.createRollOptions(domains));
    }

    if (this.data.rollOptions) {
      rollOptions.push(...this.data.rollOptions);
    }

    if (item) {
      rollOptions.push(...item.getRollOptions("item"));
      if (item.actor && item.actor.uuid !== this.actor.uuid) {
        rollOptions.push(...item.actor.getSelfRollOptions("origin"));
      }

      // Special cases, traits that modify the action itself universally
      // This might change once we've better decided how derivative traits will work
      const traits: string[] =
        ("traits" in item.system ? item.system.traits!.map((s: {slug: string}) => s.slug) : []) ?? [];
      if (traits.includes("attack")) {
        rollOptions.push("trait:attack");
      }
    }

    if (origin) {
      rollOptions.push(...origin.getSelfRollOptions("origin"));
    }

    if (extraRollOptions) {
      rollOptions.push(...extraRollOptions);
    }

    return new Set(rollOptions);
  }

  withRollOptions(options?: RollOptionConfig): Statistic {
    const newOptions = foundry.utils.mergeObject<object, object, {inplace: false}>(this.config ?? {}, options ?? {}, { inplace: false }) as RollOptionConfig;
    return new Statistic(this.actor, foundry.utils.deepClone(this.data), newOptions);
  }

  /**
   * Extend this statistic into a new cloned statistic with additional data.
   * Combines all domains and modifier lists.
   */
  extend(
    data: Omit<DeepPartial<StatisticData>, "check" | "dc" | "modifiers"> & {
      dc?: Partial<StatisticDifficultyClassData>;
      check?: Partial<StatisticCheckData>;
      modifiers?: ModifierPTR2e[];
    }
  ): Statistic {
    function maybeMergeArrays<T>(arr1: Maybe<T[]>, arr2: Maybe<T[]>) {
      if (!arr1 && !arr2) return undefined;
      return [...new Set([arr1 ?? [], arr2 ?? []].flat())];
    }

    const result = foundry.utils.mergeObject(foundry.utils.deepClone(this.data), data) as StatisticData;
    result.domains = maybeMergeArrays(this.domains, data.domains);
    result.modifiers = maybeMergeArrays(this.data.modifiers, data.modifiers);
    result.rollOptions = maybeMergeArrays(this.data.rollOptions, data.rollOptions);
    if (result.check && this.data.check) {
      result.check.domains = maybeMergeArrays(this.data.check.domains, data.check?.domains);
      result.check.modifiers = maybeMergeArrays(
        this.data.check.modifiers,
        data.check?.modifiers
      );
    }
    if (result.dc && this.data.dc) {
      result.dc.domains = maybeMergeArrays(this.data.dc.domains, data.dc?.domains);
      result.dc.modifiers = maybeMergeArrays(this.data.dc.modifiers, data.dc?.modifiers);
    }

    const extended = new Statistic(this.actor, result, this.config);
    extended.base = this;
    return extended;
  }

  /** Shortcut to `this#check#roll` */
  roll(args: StatisticRollParameters = {}): Promise<Roll.Evaluated<CheckRoll> | null> {
    return this.check.roll(args) as Promise<Roll.Evaluated<CheckRoll> | null>;
  }
}

class StatisticCheck<TParent extends Statistic = Statistic> implements BaseStatisticCheck<StatisticRollParameters, Roll.Evaluated<CheckRoll>, TParent> {
  parent: TParent;
  type: CheckType;
  label: string;
  domains: string[];
  mod: number;
  modifiers: ModifierPTR2e[];

  constructor(parent: TParent, data: StatisticData, config: RollOptionConfig = {}) {
    this.parent = parent;
    this.type = data.check?.type ?? "check";
    data.check = foundry.utils.mergeObject(data.check ?? {}, { type: this.type });

    const checkDomains = new Set(R.filter(["check", data.check.domains].flat(), R.isTruthy));
    if (this.type === "attack-roll") {
      checkDomains.add("attack");
      checkDomains.add(`${this.parent.slug}-attack`);
    } else {
      checkDomains.add(`${this.parent.slug}-check`);
    }

    data.check.domains = Array.from(checkDomains);
    this.domains = R.unique(R.filter([data.domains, data.check.domains].flat(), R.isTruthy));

    this.label = data.check?.label
      ? game.i18n.localize(data.check.label) || this.parent.label
      : this.parent.label;

    const parentModifiers = parent.modifiers.map((modifier) => modifier.clone());
    const checkOnlyModifiers = [
      data.check?.modifiers ?? [],
      extractModifiers(parent.actor.synthetics, data.check?.domains ?? []),
    ]
      .flat()
      .map((modifier) => {
        modifier.adjustments.push(
          ...extractModifierAdjustments(
            parent.actor.synthetics.modifierAdjustments,
            parent.domains,
            this.parent.slug
          )
        );
        return modifier;
      });

    const rollOptions = parent.createRollOptions(this.domains, config);
    this.modifiers = [
      ...parentModifiers,
      ...checkOnlyModifiers.map((modifier) => modifier.clone({ test: rollOptions })),
    ];
    this.mod = new StatisticModifier(this.label, this.modifiers, rollOptions).totalModifier;
  }

  get actor() {
    return this.parent.actor;
  }

  createRollOptions(args: RollOptionConfig = {}): Set<string> {
    return this.parent.createRollOptions(this.domains, args);
  }

  async roll(args: StatisticRollParameters = {}): Promise<Roll.Evaluated<CheckRoll> | null> {
    // Use a CheckDC Object
    args.dc =
      typeof args.dc === "number" ? { value: Math.trunc(args.dc) || 0 } : args.dc ?? null;

    const { rollMode, skipDialog } = args;
    const domains = this.domains;
    // The origin's token
    const token =
      args.token ??
      (this.actor.getActiveTokens(false, true).shift() as TokenDocument.ConfiguredInstance | null);
    const item = args.item ?? null;
    const origin = args.origin;

    const targetTokens = origin
      ? null
      : ((args.targets?.flatMap((target) => target?.getActiveTokens() ?? []) ??
        Array.from(game.user.targets)) as Token.ConfiguredInstance[]) ?? null;

    //TODO: Implement roll context for attacks
    const rollContext: CheckContext<this["actor"]> | null = null as CheckContext<
      this["actor"]
    > | null;

    const selfActor = rollContext?.self.actor ?? this.actor;
    const dc = typeof args.dc?.value === "number" ? args.dc : rollContext?.dc ?? null;
    const targets: RollTarget[] | null =
      targetTokens?.map((token) => {
        return {
          actor: token.actor!,
          token: token.document,
          distance: 0,
          rangeIncrement: null,
        };
      }) ?? null;

    const extraModifiers = R.filter([args.modifiers, rollContext?.self.modifiers].flat(), R.isTruthy);

    const extraRollOptions = R.filter([
      ...(args.extraRollOptions ?? []),
      ...(rollContext?.options ?? []),
      `check:statistic:${this.parent.slug}`,
      `check:type:${this.type.replace(/-check$/, "")}`,
      args.slug ? `check:slug:${args.slug}` : null,
      this.parent.base ? `check:statistic:base:${this.parent.base.slug}` : null,
    ], R.isTruthy);

    const options = this.createRollOptions({ ...args, origin, extraRollOptions });
    const notes = [
      ...extractNotes(selfActor.synthetics.rollNotes, domains).filter(n => n.predicate.test(options)),
      ...(args.extraRollNotes ?? []),
    ];

    //TODO: Apply just-in-time roll options from changes

    const context: CheckRollContext = {
      actor: selfActor,
      token,
      item,
      type: args.type || this.type,
      identifier: args.identifier,
      domains,
      targets,
      dc,
      notes,
      options,
      action: args.action,
      damaging: args.damaging,
      rollMode,
      skipDialog,
      title: args.title?.trim() || args.label?.trim() || this.label,
      createMessage: args.createMessage ?? true,
    };
    const check = new CheckModifier(
      this.parent.slug,
      { modifiers: this.modifiers },
      extraModifiers
    );
    const roll = await CheckPTR2e.roll(check, context, args.callback);

    return roll;
  }

  get breakdown(): string {
    return this.modifiers
      .filter((m) => !m.ignored)
      .map((m) => `${m.label}: ${m.signedValue}`)
      .join(", ");
  }
}

interface BaseStatisticCheck<TRollParam, TRollResult, TParent extends Statistic = Statistic> {
  parent: TParent;
  type: CheckType;
  label: string;
  domains: string[];
  mod: number;
  modifiers: ModifierPTR2e[];

  get actor(): Actor.ConfiguredInstance;
  createRollOptions(args: RollOptionConfig): Set<string>;
  roll(args: TRollParam): Promise<TRollResult | null>;
  get breakdown(): string;
}

interface StatisticRollParameters<TCallback extends CheckRollCallback | AttackRollCallback | PokeballRollCallback = CheckRollCallback> {
  /** A string of some kind to identify the roll: will be included in `CheckRoll#options` */
  identifier?: string;
  /** The slug of an action of which this check is a constituent roll */
  action?: string;
  /** What token to use for the roll itself. Defaults to the actor's token */
  token?: Maybe<TokenDocument.ConfiguredInstance>;
  /** Which attack this is (for the purposes of multiple attack penalty) */
  attackNumber?: number;
  /** Optional targets for the roll */
  targets?: Maybe<Actor.ConfiguredInstance[]>;
  /** Optional origin for the roll: only one of target and origin may be provided */
  origin?: Maybe<Actor.ConfiguredInstance>;
  /** Optional DC data for the roll */
  dc?: CheckDC | CheckDCReference | number | null;
  /** Optional override for the check modifier label */
  label?: string;
  /** An optional identifying slug to give a specific check: propagated to roll options */
  slug?: Maybe<string>;
  /** Optional override for the dialog's title: defaults to label */
  title?: string;
  /** Any additional roll notes that should be used in the roll. */
  extraRollNotes?: (RollNote | RollNoteSource)[];
  /** Any additional options that should be used in the roll. */
  extraRollOptions?: string[];
  /** Additional modifiers */
  modifiers?: ModifierPTR2e[];
  /** The originating item of this attack, if any */
  item?: Item.ConfiguredInstance | null;
  /** The roll mode (i.e., 'roll', 'blindroll', etc) to use when rendering this roll. */
  rollMode?: CONFIG.Dice.RollModes | "roll";
  /** Should the dialog be skipped */
  skipDialog?: boolean;
  // /** Should this roll be rolled twice? If so, should it keep highest or lowest? */
  // rollTwice?: RollTwiceOption;
  /** Any traits for the check */
  traits?: string[];
  /** Whether the check is part of a damaging action */
  damaging?: boolean;
  /** Indication that the check is associated with a melee action */
  melee?: boolean;
  /** Whether to create a chat message using the roll (defaults true) */
  createMessage?: boolean;
  /** Type override for things like luck-checks */
  type?: CheckType;
  /** Event that caused this roll to occur */
  event?: Event;
  /** Callback called when the roll occurs. */
  callback?: TCallback;
}

interface CaptureStatisticRollParameters extends StatisticRollParameters<PokeballRollCallback> {
  accuracyRoll: Roll.Evaluated<CheckRoll>;
  critRoll: Roll.Evaluated<CheckRoll>;
}

interface AttackStatisticRollParameters extends StatisticRollParameters<AttackRollCallback> {
  consumeAmmo?: boolean
  variants?: string[]
  modifierDialog?: AttackModifierPopup
}

interface CheckDCReference {
  slug: string;
  value?: never;
}

interface RollOptionConfig {
  extraRollOptions?: string[];
  item?: Item.ConfiguredInstance | null;
  origin?: Actor.ConfiguredInstance | null;
  target?: Actor.ConfiguredInstance | null;
}

export { Statistic, StatisticCheck };
export type { StatisticRollParameters, CaptureStatisticRollParameters, RollOptionConfig, AttackStatisticRollParameters, BaseStatisticCheck }