import PokeballActionPTR2e from "@module/data/models/pokeball-action.ts";
import { BaseStatisticCheck, CaptureStatisticRollParameters, RollOptionConfig, Statistic, StatisticRollParameters } from "./statistic.ts";
import { ConsumablePTR2e } from "@item";
import { ActorPTR2e } from "@actor";
import { StatisticData } from "./data.ts";
import { PokeballRollCallback, PokeballRollResults } from "@system/rolls/check-roll.ts";
import { AttackCheckModifier, ModifierPTR2e, StatisticModifier } from "@module/effects/modifiers.ts";
import * as R from "remeda";
import { extractModifierAdjustments, extractModifiers, extractNotes } from "src/util/change-helpers.ts";
import { CheckPTR2e } from "@system/check.ts";
import { CaptureCheckRollContext } from "@system/rolls/data.ts";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import { ActionUUID } from "src/util/uuid.ts";

type PokeballStatisticData = StatisticData &
  Required<Pick<StatisticData, "defferedValueParams" | "modifiers" | "domains" | "rollOptions">>;

class PokeballStatistic extends Statistic {
  declare data: PokeballStatisticData;

  item: ConsumablePTR2e<ActorPTR2e>;
  action: PokeballActionPTR2e;

  #check: PokeballCheck<this> | null = null;

  constructor(action: PokeballActionPTR2e) {
    const { actor, item } = action;
    if (!actor) throw new Error("Cannot create a PokeballStatistic without an Actor");

    const data: PokeballStatisticData = {
      slug: action.slug,
      label: action.name,
      check: {
        type: "pokeball-check",
      },
      defferedValueParams: {
        resolvables: {
          action,
          actor,
          item
        },
        injectables: {
          action,
          actor,
          item
        }
      },
      modifiers: [],
      domains: [],
      rollOptions: []
    };

    const itemRollOptions = item.getRollOptions("item");
    const itemTraits = item.traits!;
    const meleeOrRanged = action.isMelee ? "melee" : "ranged";

    data.domains = data.check!.domains = R.unique(
      [
        `all`,
        `check`,
        `pokeball`,
        `${meleeOrRanged}-pokeball`,
        action.traits.map((t) => `${t.slug}-trait-pokeball`),
        `${action.slug}-pokeball`,
        `${item.id}-pokeball`,
      ].flat()
    );

    data.rollOptions = [
      ...actor.getRollOptions(data.domains),
      ...itemRollOptions,
      itemTraits.map((t) => t.slug),
      meleeOrRanged,
    ].flat()

    super(actor, data);

    this.item = item as unknown as ConsumablePTR2e<ActorPTR2e>;
    this.action = action;
  }

  override get check(): PokeballCheck<this> {
    return this.#check ??= new PokeballCheck(this, this.data, this.config);
  }
}

class PokeballCheck<TParent extends PokeballStatistic = PokeballStatistic> implements BaseStatisticCheck<StatisticRollParameters<PokeballRollCallback>, PokeballRollResults, TParent> {
  parent: TParent;
  type: "pokeball-check";
  label: string;
  domains: string[];
  mod: number;
  modifiers: ModifierPTR2e[];

  constructor(parent: TParent, data: PokeballStatisticData, config: RollOptionConfig = {}) {
    this.parent = parent;

    data.check = fu.mergeObject(data.check ?? {}, { type: this.type });
    data.check.domains = Array.from(new Set(data.check.domains ?? []));
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

  get item() {
    return this.parent.item;
  }

  createRollOptions(args: RollOptionConfig = {}): Set<string> {
    return this.parent.createRollOptions(this.domains, args);
  }

  async roll(args: CaptureStatisticRollParameters): Promise<PokeballRollResults | null> {
    const options = new Set<string>(args.extraRollOptions ?? []);

    const target: { actor: ActorPTR2e, token?: TokenPTR2e } = (() => {
      if (args.targets) return args.targets.map(t => ({ actor: t, token: t.token?.object as TokenPTR2e }));
      return [...game.user.targets ?? []].map(t => ({ actor: t.actor as ActorPTR2e, token: t as TokenPTR2e }));
    })()[0];

    const context = await this.actor.getCheckContext({
      action: this.parent.action,
      domains: this.domains,
      statistic: this,
      options,
      traits: args.traits ?? this.parent.item.traits,
      target
    })

    if (context.self.actor.flags.ptr2e.disableActionOptions?.disabled.includes(this.parent.action.uuid as ActionUUID)) {
      ui.notifications.warn(game.i18n.format("PTR2E.AttackWarning.AfflictionDisabled", { name: this.parent.action.name }));
      return null;
    }

    const notes = extractNotes(context.self.actor.synthetics.rollNotes, this.domains).filter(n => n.predicate.test(options));

    const checkContext: CaptureCheckRollContext = {
      type: "pokeball-check",
      identifier: args.identifier ?? `pokeball-check-${this.parent.slug}`,
      action: args.action || this.parent.action.slug,
      title: args.title || this.label || this.parent.action.name,
      actor: context.self.actor,
      token: context.self.token,
      item: context.self.item ?? this.item,
      target: context.target,
      options: context.options,
      notes,
      domains: this.domains,
      damaging: args.damaging ?? false,
      createMessage: args.createMessage ?? true,
      skipDialog: args.skipDialog ?? !context.target?.actor,
      accuracyRoll: args.accuracyRoll,
    }
    const check = new AttackCheckModifier(
      this.parent.slug,
      { modifiers: this.modifiers },
      args.modifiers ?? []
    )

    const rolls = await CheckPTR2e.rollPokeball(check, checkContext, args.callback);
    return rolls;
  }

  get breakdown(): string {
    return this.modifiers
      .filter((m) => !m.ignored)
      .map((m) => `${m.label}: ${m.signedValue}`)
      .join(", ");
  }
}

export { PokeballStatistic, PokeballCheck };
