import { AttackPTR2e, SummonAttackPTR2e } from "@data";
import { AttackStatisticRollParameters, BaseStatisticCheck, RollOptionConfig, Statistic } from "./statistic.ts";
import { StatisticData } from "./data.ts";
import * as R from "remeda";
import { CheckModifier, ModifierPTR2e, StatisticModifier } from "@module/effects/modifiers.ts";
import { AttackRollResult } from "@system/rolls/check-roll.ts";
import { ItemPTR2e, ItemSystemsWithActions } from "@item";
import { ActorPTR2e } from "@actor";
import { CheckContext } from "@system/data.ts";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import { extractEffectRolls, extractModifierAdjustments, extractModifiers, extractNotes } from "src/util/rule-helpers.ts";
import { CheckRollContext } from "@system/rolls/data.ts";
import { CheckPTR2e } from "@system/check.ts";
import { AttackModifierPopup } from "@module/apps/modifier-popup/attack-modifier-popup.ts";

type AttackStatisticData = StatisticData & Required<Pick<StatisticData, "defferedValueParams" | 'modifiers' | 'domains' | 'rollOptions'>>;
type AttackRollParameters = AttackStatisticRollParameters

class AttackStatistic extends Statistic {
  declare data: AttackStatisticData;

  item: ItemPTR2e<ItemSystemsWithActions, ActorPTR2e>;
  attack: AttackPTR2e;

  #check: AttackCheck<this> | null = null;

  constructor(attack: AttackPTR2e, data: AttackStatisticData = {
    slug: attack.slug,
    label: attack.name,
    check: {
      type: "attack-roll"
    },
    defferedValueParams: {
      resolvables: {
        attack
      },
      injectables: {
        attack
      }
    },
    modifiers: [],
    domains: [],
    rollOptions: []
  }) {
    const { actor, item } = attack;
    if (!actor) throw Error("Attack must have an actor for Statistic to be created.");

    if(!data.defferedValueParams) data.defferedValueParams = { resolvables: {}, injectables: {} };
    if(!data.defferedValueParams.resolvables) data.defferedValueParams.resolvables = {};
    if(!data.defferedValueParams.injectables) data.defferedValueParams.injectables = {};
    data.defferedValueParams.resolvables.actor ??= actor;
    data.defferedValueParams.injectables.actor ??= actor;
    data.defferedValueParams.resolvables.item ??= item;
    data.defferedValueParams.injectables.item ??= item;

    const itemRollOptions = item.getRollOptions("item");
    const itemTraits = item.traits!;
    const meleeOrRanged = attack.isMelee ? "melee" : "ranged";

    data.domains = data.check!.domains = R.unique(
      [
        `all`,
        `check`,
        `${attack.type}`,
        `${meleeOrRanged}-${attack.type}`,
        `${attack.category}-${attack.type}`,
        attack.traits.map((t) => `${t.slug}-trait-${attack.type}`),
        ...attack.types.map((t) => `${t}-${attack.type}`),
        `${attack.slug}-${attack.type}`,
        `${item.id}-${attack.type}`,
        ...(attack?.power ? [`damaging-${attack.type}`] : []),
        ...(data.domains ?? [])
      ].flat()
    );

    // Power and category based Modifiers
    if (attack.category !== "status" && !data.modifiers.length) {
      if (typeof attack.power === "number") {
        data.modifiers.push(
          new ModifierPTR2e({
            slug: `power`,
            label: game.i18n.localize("PTR2E.Modifiers.power"),
            modifier: attack.power!,
            method: "base",
            type: "power",
            hidden: true
          })
        );
      } else {
        //TODO: Implement alt. move formulas, such as flat damage or weight based.
      }
    }

    data.rollOptions = [
      ...actor.getRollOptions(data.domains),
      ...itemRollOptions,
      itemTraits.map((t) => t.slug),
      meleeOrRanged,
    ].flat()

    super(actor, data);

    this.item = item as ItemPTR2e<ItemSystemsWithActions, ActorPTR2e>;
    this.attack = attack;
  }

  override get check(): AttackCheck<this> {
    return this.#check ??= new AttackCheck(this, this.data, this.config);
  }
}

class AttackCheck<TParent extends AttackStatistic = AttackStatistic> implements BaseStatisticCheck<AttackRollParameters, AttackRollResult['rolls'][], TParent> {
  parent: TParent;
  type: "attack-roll";
  label: string;
  domains: string[];
  mod: number;
  modifiers: ModifierPTR2e[];

  constructor(parent: TParent, data: StatisticData, config: RollOptionConfig = {}) {
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

  createRollOptions(args: RollOptionConfig = {}): Set<string> {
    return this.parent.createRollOptions(this.domains, args);
  }

  get item(): ItemPTR2e<ItemSystemsWithActions, ActorPTR2e> {
    return this.parent.item;
  }
  get attack() {
    return this.parent.attack;
  }
  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  get itemConsumesAmmo() {
    return false;
  }

  async roll(args: AttackRollParameters = {}): Promise<AttackRollResult['rolls'][] | null> {
    const options = new Set<string>(args.extraRollOptions ?? []);
    //const consumeAmmo = args.consumeAmmo ?? this.itemConsumesAmmo;
    //TODO: If ammo is consumed, check if there is ammo to consume

    const targets: { actor: ActorPTR2e, token?: TokenPTR2e }[] = (() => {
      if (args.targets) return args.targets.map(t => ({ actor: t, token: t.token?.object as TokenPTR2e }));
      return [...game.user.targets ?? []].map(t => ({ actor: t.actor as ActorPTR2e, token: t as TokenPTR2e }));
    })()

    const variants = args.variants ?? this.attack.variants?.length ? this.attack.variants : [];
    if(variants.length) args.skipDialog = false; 

    // Get context without target for basic information 
    const context = await this.actor.getCheckContext({
      attack: this.attack,
      domains: this.domains,
      statistic: this,
      item: this.item,
      options,
      traits: args.traits ?? this.item.traits,
    }) as CheckContext<ActorPTR2e, AttackCheck<TParent>, ItemPTR2e<ItemSystemsWithActions, ActorPTR2e>>;

    const selfEffectRolls = await extractEffectRolls({
      affects: "self",
      origin: this.actor,
      target: this.actor,
      item: this.item,
      attack: this.attack,
      action: this.attack,
      domains: this.domains,
      options,
      chanceModifier: (Number(this.actor.system?.modifiers?.effectChance) || 0),
      hasSenerenGrace: this.actor.rollOptions?.all?.["special:serene-grace"] ?? false
    });

    // const extraModifiers = args.modifiers ?? [];
    const contexts: Record<ActorUUID, CheckContext<ActorPTR2e, AttackCheck<TParent>, ItemPTR2e<ItemSystemsWithActions, ActorPTR2e>>> = {}
    let anyValidTargets = false;
    for (const target of targets) {
      const allyOrEnemy = this.actor.isAllyOf(target.actor) ? "ally" : this.actor.isEnemyOf(target.actor) ? "enemy" : "neutral";

      const currContext = contexts[target.actor.uuid] = await this.actor.getCheckContext({
        attack: this.attack,
        domains: this.domains,
        statistic: this,
        target: target,
        options: new Set([...options, `origin:${allyOrEnemy}`]),
        traits: args.traits ?? this.item.traits,
      }) as CheckContext<ActorPTR2e, AttackCheck<TParent>, ItemPTR2e<ItemSystemsWithActions, ActorPTR2e>>

      if (this.attack.isRanged && typeof currContext.target?.rangeIncrement === "number") {
        const rip = currContext.target!.rangeIncrement!;
        if (!rip) {
          anyValidTargets = true;
          continue;
        }
        if (rip >= 5) {
          currContext.dc = { value: Infinity };
          currContext.outOfRange = true;
          continue;
        }

        // TODO: Calculate Accuracy and determine if RIP is within range
        // This includes target evasion
        anyValidTargets = true;
      }

      currContext.notes = extractNotes(currContext.self.actor.synthetics.rollNotes, this.domains).filter(n => n.predicate.test(options))

      // extraModifiers.push(...currContext?.self.modifiers ?? []);
    }
    // TODO: Change 'false' here to game setting
    // eslint-disable-next-line no-constant-condition
    if (!anyValidTargets && false) {
      ui.notifications.warn(game.i18n.localize("PTR2E.AttackWarning.NoValidTargets"));
      return null;
    }

    const notes = extractNotes(context.self.actor.synthetics.rollNotes, this.domains).filter(n => n.predicate.test(options));

    //TODO: Apply just-in-time roll options from changes

    const checkContext: CheckRollContext & { contexts: Record<ActorUUID, CheckContext>, modifierDialog?: AttackModifierPopup } = {
      type: "attack-roll",
      identifier: args.identifier ?? `${context.self.item.slug}.${context.self.attack.slug}`,
      action: args.action || context.self.attack.slug,
      attack: context.self.attack,
      title: args.title || this.label || context.self.attack.name,
      actor: context.self.actor,
      token: context.self.token,
      item: context.self.item,
      options: context.options,
      notes,
      contexts: contexts as Record<ActorUUID, CheckContext>,
      domains: this.domains,
      damaging: args.damaging,
      createMessage: args.createMessage ?? true,
      variants,
      modifierDialog: args.modifierDialog,
      skipDialog: args.skipDialog ?? targets.length === 0,
      omittedSubrolls: (() => {
        const ommited = new Set<"damage" | "crit" | "accuracy">();
        if (context.self.attack.category === "status" || !context.self.attack.power) ommited.add("damage");
        if (context.self.attack.category === "status") ommited.add("crit");
        if (!context.self.attack.accuracy) ommited.add("accuracy");
        if(context.self.attack instanceof SummonAttackPTR2e && context.self.attack.damageType === "flat") ommited.add("crit");

        return ommited;
      })(),
      ppCost: context.self.attack.cost.powerPoints ?? 0,
      selfEffectRolls
    }
    const check = new CheckModifier(
      this.parent.slug,
      { modifiers: this.modifiers },
      args.modifiers ?? []
    );

    const rolls = await CheckPTR2e.rolls(check, checkContext, args.callback);
    if (rolls?.length) {
      //TODO: Apply post-roll options from changes
    }

    return rolls;
  }

  get breakdown(): string {
    return this.modifiers
      .filter((m) => !m.ignored)
      .map((m) => `${m.label}: ${m.signedValue}`)
      .join(", ");
  }
}

export { AttackStatistic, AttackCheck };
export type { AttackStatisticData };