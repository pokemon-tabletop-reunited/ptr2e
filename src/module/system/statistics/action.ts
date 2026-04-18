import { ActionPTR2e, Trait } from "@data";
import * as R from "remeda";
import { BaseStatisticCheck, RollOptionConfig, Statistic, StatisticRollParameters } from "./statistic.ts";
import { AttackRollCallback, AttackRollResult } from "@system/rolls/check-roll.ts";
import { CheckModifier, ModifierPTR2e, StatisticModifier } from "@module/effects/modifiers.ts";
import { StatisticData } from "./data.ts";
import { ActorPTR2e } from "@actor";
import { ConsumablePTR2e, ItemPTR2e, ItemSystemsWithActions } from "@item";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import { CheckContext } from "@system/data.ts";
import { extractEffectRolls, extractNotes } from "src/util/change-helpers.ts";
import { CheckRollContext } from "@system/rolls/data.ts";
import { CheckPTR2e } from "@system/check.ts";
import { PlaceholderTrait } from "@module/data/models/trait.ts";

/**
 * A generic action statistic that can be used for any type of action.
 * It reuses the AttackStatistic workflow but omits its domains & accuracy, crit & damage rolls.
 */
class GenericActionStatistic extends Statistic {
  declare data: StatisticData;

  item: ItemPTR2e<ItemSystemsWithActions, ActorPTR2e>;
  action: ActionPTR2e;

  #check: GenericActionCheck<this> | null = null;

  constructor(action: ActionPTR2e, data: StatisticData = {
    slug: action.slug,
    label: action.name,
    check: {
      type: "generic-action"
    },
    defferedValueParams: {
      resolvables: {
        action
      },
      injectables: {
        action
      }
    },
    modifiers: [],
    domains: [],
    rollOptions: []
  }) {
    const { actor, item } = action;
    if (!actor) throw Error("Usable Generic Actions must have an actor for Statistic to be created.");

    if (!data.defferedValueParams) data.defferedValueParams = { resolvables: {}, injectables: {} };
    if (!data.defferedValueParams.resolvables) data.defferedValueParams.resolvables = {};
    if (!data.defferedValueParams.injectables) data.defferedValueParams.injectables = {};
    data.defferedValueParams.resolvables.actor ??= actor;
    data.defferedValueParams.injectables.actor ??= actor;
    data.defferedValueParams.resolvables.item ??= item;
    data.defferedValueParams.injectables.item ??= item;

    const itemRollOptions = item.getRollOptions("item");
    const itemTraits = item.traits!;

    data.domains = data.check!.domains = R.unique(
      [
        `all`,
        `check`,
        `${action.type}`,
        action.traits.contents.flatMap((t) => {
          const trait = t as PlaceholderTrait;
          if(!(trait.value && trait.placeholders && Array.isArray(trait.placeholders) && trait.placeholders.length)) return `${t.slug}-trait-${action.type}`

          return [
            `${trait.slug.replace(new RegExp(trait.placeholders.at(0)!.valuePattern), "").replace(/^-/, "").replace(/-$/, "")}-trait-${action.type}`,
            `${t.slug}-trait-${action.type}`
          ]
        }),
        `${action.slug}-${action.type}`,
        `${item.id}-${action.type}`,
        ...(data.domains ?? [])
      ].flat()
    );

    data.rollOptions = [
      ...actor.getRollOptions(data.domains),
      ...itemRollOptions,
      itemTraits.map((t) => t.slug),
    ].flat()

    super(actor, data);

    this.item = item as ItemPTR2e<ItemSystemsWithActions, ActorPTR2e>;
    this.action = action;
  }

  getCheck(): GenericActionCheck<this> {
    return this.#check ??= new GenericActionCheck(this, this.data, this.config);
  }

  override get check(): GenericActionCheck<this> {
    return this.#check ??= new GenericActionCheck(this, this.data, this.config);
  }
}

class GenericActionCheck<TParent extends GenericActionStatistic = GenericActionStatistic> implements BaseStatisticCheck<StatisticRollParameters<AttackRollCallback>, AttackRollResult['rolls'][], TParent> {
  parent: TParent;
  type: "attack-roll";
  label: string;
  domains: string[];
  mod: number;
  modifiers: ModifierPTR2e[];
  additionalOptions: Set<string>;

  constructor(parent: TParent, data: StatisticData, config: RollOptionConfig = {}) {
    this.parent = parent;
    data.check = fu.mergeObject(data.check ?? {}, { type: this.type });

    const extraDomains = new Set<string>();
    this.additionalOptions = new Set<string>();

    if(this.item.system.ammo) {
      extraDomains.add("uses-ammo");
      const ammoItem = (() => {
        try {
          return fromUuidSync(this.item.system.ammo as string) as ConsumablePTR2e | null;
        }
        catch {
          return null;
        }
      })();
      if(ammoItem) {
        extraDomains.add(`ammo-${ammoItem.slug}`);
        extraDomains.add(`ammo-${ammoItem.id}`);
        for(const trait of ammoItem.traits ?? []) {
          extraDomains.add(`ammo-trait-${trait.slug}`);
        }
        for(const option of ammoItem.getRollOptions("item", { includeActor: false})) {
          this.additionalOptions.add(`ammo:${option}`);
        }
      }
    }

    data.check.domains = Array.from(new Set(data.check.domains ?? []));
    this.domains = R.unique(R.filter([data.domains, data.check.domains, ...extraDomains].flat(), R.isTruthy));

    this.label = data.check?.label
      ? game.i18n.localize(data.check.label) || this.parent.label
      : this.parent.label;

    const parentModifiers = parent.modifiers.map((modifier) => modifier.clone());
    const checkOnlyModifiers = [
      data.check?.modifiers ?? [],
    ].flat();

    const rollOptions = parent.createRollOptions(this.domains, config);
    for (const option of this.additionalOptions) rollOptions.add(option);

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
  get action(): ActionPTR2e {
    return this.parent.action;
  }
  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  get itemConsumesAmmo() {
    return false;
  }

  async roll(args: StatisticRollParameters<AttackRollCallback> = {}): Promise<AttackRollResult['rolls'][] | null> {
    const options = new Set<string>(args.extraRollOptions ?? []);
    for (const option of this.additionalOptions) options.add(option);

    const targets: { actor: ActorPTR2e, token?: TokenPTR2e }[] = (() => {
      if (args.targets) return args.targets.map(t => ({ actor: t, token: t.token?.object as TokenPTR2e }));
      return [...game.user.targets ?? []].map(t => ({ actor: t.actor as ActorPTR2e, token: t as TokenPTR2e }));
    })()

    const selfOptions = new Set([...options, "targets:self"]);

    // Get context without target for basic information 
    const context = await this.actor.getCheckContext({
      action: this.action,
      domains: this.domains,
      statistic: this,
      item: this.item,
      options: selfOptions,
      traits: args.traits ?? this.item.traits,
    }) as CheckContext<ActorPTR2e, GenericActionCheck<TParent>, ItemPTR2e<ItemSystemsWithActions, ActorPTR2e>>;

    const traitEffects = this.action.traits.contents.flatMap(trait => {
      if (!trait.changes?.length) return [];
      const effect = Trait.effectsFromChanges.bind(trait)(this.actor)
      if (effect) return effect.toObject();
      return [];
    }) ?? []

    const selfEffectRolls = await extractEffectRolls({
      affects: "self",
      origin: this.actor.clone({ effects: [fu.deepClone(this.actor._source.effects), traitEffects].flat() }, { keepId: true }),
      target: this.actor,
      item: this.item,
      attack: null,
      action: this.action,
      domains: this.domains,
      options: selfOptions,
      chanceModifier: (Number(this.actor.system?.modifiers?.effectChance) || 0),
      hasSenerenGrace: this.actor.rollOptions?.all?.["special:serene-grace"] ?? false,
      effectAlterations: this.actor.synthetics.effectAlterations,
    });

    // const extraModifiers = args.modifiers ?? [];
    const contexts: Record<ActorUUID, CheckContext<ActorPTR2e, GenericActionCheck<TParent>, ItemPTR2e<ItemSystemsWithActions, ActorPTR2e>>> = {}
    let anyValidTargets = false;
    for (const target of targets) {
      const allyOrEnemy = this.actor.isAllyOf(target.actor) ? "ally" : this.actor.isEnemyOf(target.actor) ? "enemy" : "neutral";
      const targetsSelf = target.actor === this.actor;

      const targetDomains = allyOrEnemy === "enemy"
        ? this.domains.map(d => `hostile-${d}`)
        : allyOrEnemy === "ally"
          ? this.domains.map(d => `allied-${d}`)
          : [];

      const domains = R.unique([...this.domains, ...targetDomains]);

      const currContext = contexts[target.actor.uuid] = await this.actor.getCheckContext({
        action: this.action,
        domains: domains,
        statistic: this,
        target: target,
        options: new Set([...options, `origin:${allyOrEnemy}`, ...(targetsSelf ? ["targets:self"] : [])]),
        traits: args.traits ?? this.item.traits
      }) as CheckContext<ActorPTR2e, GenericActionCheck<TParent>, ItemPTR2e<ItemSystemsWithActions, ActorPTR2e>>

      anyValidTargets = true;

      currContext.notes = extractNotes(currContext.self.actor.synthetics.rollNotes, domains).filter(n => n.predicate.test(options))

      // extraModifiers.push(...currContext?.self.modifiers ?? []);
    }
    // TODO: Change 'false' here to game setting
    // eslint-disable-next-line no-constant-condition
    if (!anyValidTargets && game.settings.get("ptr2e", "preferences.must-target")) {
      ui.notifications.warn(game.i18n.localize("PTR2E.AttackWarning.NoValidTargets"));
      return null;
    }

    const notes = extractNotes(context.self.actor.synthetics.rollNotes, this.domains).filter(n => n.predicate.test(options));

    //TODO: Apply just-in-time roll options from changes

    const checkContext: CheckRollContext & { contexts: Record<ActorUUID, CheckContext> } = {
      type: this.type,
      identifier: args.identifier ?? `${context.self.item.slug}.${context.self.action.slug}`,
      action: args.action || context.self.action.slug,
      title: args.title || this.label || context.self.action.name,
      actor: context.self.actor,
      token: context.self.token,
      item: context.self.item,
      options: context.options,
      notes,
      contexts: contexts as Record<ActorUUID, CheckContext>,
      domains: this.domains,
      damaging: args.damaging,
      createMessage: args.createMessage ?? true,
      skipDialog: true,
      omittedSubrolls: new Set(["accuracy", "crit", "damage"]),
      ppCost: context.self.action.cost.powerPoints ?? 0,
      selfEffectRolls,
      consumePP: true,
    }
    const check = new CheckModifier(
      this.parent.slug,
      { modifiers: this.modifiers },
      args.modifiers ?? []
    );

    const rolls = await CheckPTR2e.rolls(check, checkContext, args.callback);

    if(rolls?.length) {
      if(this.item.system.ammo) {
        const ammoItem = (() => {
          try {
            return fromUuidSync(this.item.system.ammo as string) as ConsumablePTR2e | null;
          }
          catch {
            return null;
          }
        })();
        if(ammoItem) {
          const currentQuantity = ammoItem.system.quantity;
          if(currentQuantity > 0) {
            await ammoItem.update({ "system.quantity": currentQuantity - 1 });
            ui.notifications.info(`Consumed 1 ${ammoItem.name}. ${currentQuantity - 1} remaining.`);
          }
        }
      }
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

export {
  GenericActionStatistic,
  GenericActionCheck,
};