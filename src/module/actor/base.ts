/* eslint-disable no-fallthrough */
import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import {
  ActorSynthetics,
  ActorSystemPTR2e,
  Attribute,
  HumanoidActorSystem,
  PokemonActorSystem,
} from "@actor";
import { ActiveEffectPTR2e, ActiveEffectSystem, EffectSourcePTR2e } from "@effects";
import { TypeEffectiveness } from "@scripts/config/effectiveness.ts";
import { AttackPTR2e, PokemonType, RollOptionChangeSystem, RollOptionManager } from "@data";
import { ActorFlags } from "types/foundry/common/documents/actor.js";
import type { RollOptions } from "@module/data/roll-option-manager.ts";
import FolderPTR2e from "@module/folder/document.ts";
import { CombatantPTR2e, CombatPTR2e } from "@combat";
import AfflictionActiveEffectSystem from "@module/effects/data/affliction.ts";
import { ChatMessagePTR2e } from "@chat";
import { AbilityPTR2e, ItemPTR2e, ItemSystemPTR, ItemSystemsWithActions, PerkPTR2e } from "@item";
import { ActionsCollections } from "./actions.ts";
import { CustomSkill } from "@module/data/models/skill.ts";
import { BaseStatisticCheck, Statistic, StatisticCheck } from "@system/statistics/statistic.ts";
import { CheckContext, CheckContextParams, RollContext, RollContextParams } from "@system/data.ts";
import { extractEffectRolls, extractEphemeralEffects } from "src/util/rule-helpers.ts";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import * as R from "remeda";
import { ModifierPTR2e } from "@module/effects/modifiers.ts";
import { sluggify } from "@utils";
import { preImportJSON } from "@module/data/doc-helper.ts";
import { MigrationRunnerBase } from "@module/migration/runner/base.ts";
import { MigrationList, MigrationRunner } from "@module/migration/index.ts";
import MoveSystem from "@item/data/move.ts";

interface ActorParty {
  owner: ActorPTR2e<ActorSystemPTR2e, null> | null;
  party: ActorPTR2e<ActorSystemPTR2e, null>[];
}

class ActorPTR2e<
  TSystem extends ActorSystemPTR2e = ActorSystemPTR2e,
  TParent extends TokenDocumentPTR2e | null = TokenDocumentPTR2e | null,
> extends Actor<TParent, TSystem> {
  /** Has this document completed `DataModel` initialization? */
  declare initialized: boolean;

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  get alliance(): string {
    return "";
  }

  get traits() {
    return this.system.traits;
  }

  get attributes() {
    return this.system.attributes;
  }

  get actions() {
    return this._actions;
  }

  get originalRoot(): PerkPTR2e | null {
    return (
      (this.itemTypes.perk as PerkPTR2e[]).find(
        (p) => p.system.cost === 0 && p.system.node.type === "root"
      ) ?? null
    );
  }

  get unconnectedRoots(): PerkPTR2e[] {
    return (this.itemTypes.perk as PerkPTR2e[]).filter(
      (p) => p.system.cost === 5 && p.system.node.type === "root"
    );
  }

  get perks(): Map<string, PerkPTR2e> {
    return (
      this._perks ??
      (this._perks = (this.itemTypes.perk as PerkPTR2e[]).reduce((acc, perk) => {
        acc.set(perk.system.originSlug ?? perk.slug, perk);
        return acc;
      }, new Map<string, PerkPTR2e>()))
    );
  }

  get combatant(): CombatantPTR2e | null {
    const combatants = (game.combat as CombatPTR2e | undefined)?.combatants.filter(
      (c) => c.actor === this
    );
    return combatants?.length
      ? combatants.length > 1
        ? combatants.find((c) => c.actor === this) ?? null
        : combatants[0]
      : null;
  }

  get level() {
    return this.system.advancement.level;
  }

  get speed() {
    return this.system.attributes.spe.value;
  }

  get netStages() {
    return (
      this.system.attributes.atk.stage +
      this.system.attributes.def.stage +
      this.system.attributes.spa.stage +
      this.system.attributes.spd.stage +
      this.system.attributes.spe.stage +
      this.system.battleStats.accuracy.stage +
      this.system.battleStats.evasion.stage +
      this.system.battleStats.critRate.stage
    );
  }

  /** The recorded schema version of this actor, updated after each data migration */
  get schemaVersion(): number | null {
    return Number(this.system._migration?.version) || null;
  }

  get party(): ActorParty | null {
    if (!this.folder) return null;

    return (this._party ??= ((): ActorParty | null => {
      const owner = ((): ActorPTR2e<TSystem, null> | null => {
        if (this.folder?.owner)
          return fromUuidSync<ActorPTR2e<TSystem, null>>(this.folder.owner);
        return null;
      })();
      const party = ((): ActorPTR2e<TSystem, null>[] => {
        const uuid = (() => {
          if (this.parent instanceof TokenDocumentPTR2e) {
            return this.parent.baseActor?.uuid ?? this.uuid;
          }
          return this.uuid;
        })();

        if (this.folder?.isFolderOwner(uuid) || this.folder?.isInParty(uuid))
          return this.folder.party.flatMap((u) =>
            u === uuid
              ? (this as ActorPTR2e<TSystem, null>)
              : fromUuidSync<ActorPTR2e<TSystem, null>>(u) ?? []
          );
        return [];
      })();

      return owner || party.length ? { owner, party } : null;
    })());
  }

  get isAce(): boolean {
    return this.system.traits.has("ace");
  }

  get luck(): number {
    return this.isAce ? this.system.skills.get("luck")!.total : 0;
  }

  get spendableLuck(): number {
    return (!this.party?.owner || this.party?.owner == this)
      ? this.luck
      : this.luck + this.party.owner.luck;
  }

  async spendLuck(amount: number, pendingUpdates: Record<string, unknown>[] = [], notifications: { name: string, amount: number, leftover: number }[] = []): Promise<{ name: string, amount: number, leftover: number }[]> {
    // no "spending" a negative amount of luck
    if (amount < 0) return [];
    // If we can't afford it, don't spend it.
    if (amount > this.spendableLuck) return [];

    const luck = this.luck;
    if (luck > 0) {
      const skills = this.system.toObject().skills;
      const luckSkill = skills.find((skill) => skill.slug === "luck");
      if (!luckSkill) return [];
      luckSkill.value = Math.max(luck - amount, 1);

      amount -= luck;
      notifications.push({ name: this.name, amount: luck - luckSkill.value, leftover: luckSkill.value });
      pendingUpdates.push({ _id: this.id, "system.skills": skills });
    }
    if (amount <= 0) {
      if (pendingUpdates.length) await Actor.updateDocuments(pendingUpdates);
      return notifications;
    }

    // we need to spend it from our owner, if we have one
    const owner = this.party?.owner;
    if (!owner || owner == this) return [];

    return await owner.spendLuck(amount, pendingUpdates, notifications);
  }

  protected override _initializeSource(
    data: Record<string, unknown>,
    options?: DataModelConstructionOptions<TParent> | undefined
  ): this["_source"] {

    if (data && '_stats' in data && data._stats && typeof data._stats === 'object' && 'systemId' in data._stats && data._stats.systemId === "ptu") {
      data.type = "ptu-actor";

      for (const item of data.items as ItemPTR2e[]) {
        if (item._stats.systemId === "ptu") {
          item.type = "ptu-item";
        }
      }
    }
    return super._initializeSource(data, options);
  }

  /**
   * Step 1 - Copies data from source object to instance attributes
   * */
  override _initialize() {
    this.initialized = false;
    const preparationWarnings = new Set<string>();
    this.synthetics = {
      ephemeralEffects: {},
      modifierAdjustments: { all: [], damage: [] },
      modifiers: { all: [], damage: [] },
      afflictions: { data: [], ids: new Set() },
      rollNotes: {},
      effects: {},
      toggles: [],
      attackAdjustments: [],
      preparationWarnings: {
        add: (warning: string) => preparationWarnings.add(warning),
        flush: fu.debounce(() => {
          for (const warning of preparationWarnings) {
            console.warn(warning);
          }
          preparationWarnings.clear();
        }, 10), // 10ms also handles separate module executions
      },
    };

    this._party = null;
    this._perks = null;

    this.rollOptions = new RollOptionManager(this);

    this._actions = new ActionsCollections(this);

    this.attacks = {
      slots: 6,
      actions: Array.fromRange(6).reduce((acc, i) => ({ ...acc, [i]: null }), {}),
      available: [],
    };

    this.abilities = {
      slots: 1,
      entries: {},
      available: [],
      free: []
    }

    super._initialize();
  }

  /**
   * Step 2 - Prepare data for use by the instance. This method is called automatically by DataModel#_initialize workflow
   * The work done by this method should be idempotent. There are situations in which prepareData may be called more than once.
   * */
  override prepareData() {
    if (this.initialized) return;
    if (this.type === "ptu-actor") return super.prepareData();

    // Todo: Add appropriate `self:` options to the rollOptions
    this.rollOptions.addOption("self", `type:${this.type}`);

    this.system.type.effectiveness = this._calculateEffectiveness();

    this.initialized = true;
    super.prepareData();
  }

  /**
   * Step 3 - Prepare data related to this Document itself, before any embedded Documents or derived data is computed.
   * */
  override prepareBaseData() {
    if (this.type === "ptu-actor") return super.prepareBaseData();
    super.prepareBaseData();

    if (this.system.shield.value > 0) this.rollOptions.addOption("self", "state:shielded");
    switch (true) {
      case this.system.health.value <= Math.floor(this.system.health.max * 0.25): {
        this.rollOptions.addOption("self", "state:desperation-1-4");
      }
      case this.system.health.value <= Math.floor(this.system.health.max * (1 / 3)): {
        this.rollOptions.addOption("self", "state:desperation-1-3");
      }
      case this.system.health.value <= Math.floor(this.system.health.max * 0.5): {
        this.rollOptions.addOption("self", "state:desperation-1-2");
      }
      case this.system.health.value <= Math.floor(this.system.health.max * 0.75): {
        this.rollOptions.addOption("self", "state:desperation-3-4");
      }
    }
    switch (true) {
      case this.system.health.value == this.system.health.max: {
        this.rollOptions.addOption("self", "state:healthy");
      }
      case this.system.health.value >= Math.floor(this.system.health.max * 0.75): {
        this.rollOptions.addOption("self", "state:intrepid-3-4");
      }
      case this.system.health.value >= Math.floor(this.system.health.max * 0.5): {
        this.rollOptions.addOption("self", "state:intrepid-1-2");
      }
      case this.system.health.value >= Math.floor(this.system.health.max * (1 / 3)): {
        this.rollOptions.addOption("self", "state:intrepid-1-3");
      }
      case this.system.health.value >= Math.floor(this.system.health.max * 0.25): {
        this.rollOptions.addOption("self", "state:intrepid-1-4");
      }
    }
  }

  /**
   * Step 4 - Prepare all embedded Document instances which exist within this primary Document.
   * */
  override prepareEmbeddedDocuments() {
    if (this.type === "ptu-actor") return super.prepareEmbeddedDocuments();
    return super.prepareEmbeddedDocuments();
  }

  /**
   * Step 5 - Apply transformations or derivations to the values of the source data object.
   * Compute data fields whose values are not stored to the database.
   * */
  override prepareDerivedData() {
    if (this.type === "ptu-actor") return super.prepareDerivedData();
    this.system.type.effectiveness = this._calculateEffectiveness();

    super.prepareDerivedData();

    this.skills = this.prepareSkills();

    this.attacks.slots = this.system.slots;
    this.attacks.actions = Array.fromRange(this.attacks.slots).reduce(
      (acc, i) => ({ ...acc, [i]: null }),
      {}
    );

    for (const attack of this.actions.attack) {
      if (attack.free) continue;

      if (attack.slot === null) {
        this.attacks.available.push(attack);
        continue;
      }
      if (this.attacks.actions[attack.slot] !== null) {
        if (this.attacks.actions[attack.slot].slug !== attack.slug) {
          this.attacks.available.push(this.attacks.actions[attack.slot]);
        }
        continue;
      }
      this.attacks.actions[attack.slot] = attack;
    }

    this.abilities.slots = this.level >= 80 ? 4 : this.level >= 50 ? 3 : this.level >= 20 ? 2 : 1;
    this.abilities.entries = Array.fromRange(this.abilities.slots).reduce(
      (acc, i) => ({ ...acc, [i]: null }),
      {}
    );

    for (const ability of this.itemTypes.ability as AbilityPTR2e[]) {
      if (ability.system.free) {
        this.abilities.free.push(ability);
        continue;
      };

      if (ability.system.slot === null) {
        this.abilities.available.push(ability);
        continue;
      }

      if (this.abilities.entries[ability.system.slot] !== null) {
        if (this.abilities.entries[ability.system.slot].slug !== ability.slug) {
          this.abilities.available.push(this.abilities.entries[ability.system.slot]);
        }
        continue;
      }

      this.abilities.entries[ability.system.slot] = ability;
    }
  }

  /**
   * Apply any transformations to the Actor data which are caused by ActiveEffects.
   */
  override applyActiveEffects() {
    if (this.type === "ptu-actor") return;
    this.statuses ??= new Set();

    // Identify which special statuses had been active
    const specialStatuses = new Map();
    for (const statusId of Object.values(CONFIG.specialStatusEffects)) {
      specialStatuses.set(statusId, this.statuses.has(statusId));
    }
    this.statuses.clear();

    // Organize non-disabled effects by their application priority
    const changes = [];
    // Afflictions don't always have changes, so we need to track them separately
    const afflictions: ActiveEffectPTR2e<ActorPTR2e, AfflictionActiveEffectSystem>[] = [];
    for (const effect of this.allApplicableEffects() as unknown as Generator<
      ActiveEffectPTR2e<ActorPTR2e>,
      void,
      void
    >) {
      if (!effect.active) continue;
      changes.push(
        ...effect.changes.map((change) => {
          const c = foundry.utils.deepClone(change);
          c.priority = c.priority ?? c.mode * 10;
          return c;
        })
      );
      for (const statusId of effect.statuses) this.statuses.add(statusId);
      if (!effect.changes.length && effect.type === "affliction")
        afflictions.push(
          effect as ActiveEffectPTR2e<ActorPTR2e, AfflictionActiveEffectSystem>
        );
    }
    changes.sort((a, b) => a.priority! - b.priority!);

    // Apply all changes
    for (const change of changes) {
      change.effect.apply(this, change.clone());
    }
    for (const affliction of afflictions) {
      affliction.system.apply(this);
    }

    // Apply special statuses that changed to active tokens
    let tokens;
    for (const [statusId, wasActive] of specialStatuses) {
      const isActive = this.statuses.has(statusId);
      if (isActive === wasActive) continue;
      tokens ??= this.getActiveTokens();
      for (const token of tokens) token._onApplyStatusEffect(statusId, isActive);
    }
  }

  _calculateEffectiveness(): Record<PokemonType, number> {
    const types = game.settings.get("ptr2e", "pokemonTypes") as TypeEffectiveness;
    const effectiveness = {} as Record<PokemonType, number>;
    for (const key in types) {
      const typeKey = key as PokemonType;
      effectiveness[typeKey] = 1;
      for (const key of this.system.type.types) {
        const type = key as PokemonType;
        effectiveness[typeKey] *= types[type].effectiveness[typeKey];
      }
    }
    return effectiveness;
  }

  private prepareSkills(): Record<string, Statistic> {
    const skills = {} as Record<string, Statistic>;
    for (const skill of this.system.skills) {
      const domains = [
        "all",
        "skill-check",
        `${skill.slug}`,
        `${skill.slug}-check`,
        skill.group ? [`${skill.group}-based`, `${skill.group}-based-check`] : [],
      ].flat();

      const label = (() => {
        const baseKey = skill.group
          ? `PTR2E.Skills.${skill.group}.${skill.slug}`
          : `PTR2E.Skills.${skill.slug}`;
        if (game.i18n.has(baseKey + ".label"))
          return game.i18n.localize(baseKey + ".label");
        const customSkill = game.ptr.data.skills.get(skill.slug) as CustomSkill;
        return customSkill?.label ?? Handlebars.helpers.formatSlug(skill.slug);
      })();

      const statistic = new Statistic(this, {
        slug: skill.slug,
        label,
        domains,
        modifiers: [],
        check: { type: "skill-check" },
      });

      skills[skill.slug] = statistic;
    }
    return skills;
  }

  /**
   * Toggle the perk tree for this actor
   * @param {boolean} active
   */
  async togglePerkTree(active: boolean) {
    if (game.ptr.web.actor === this && active !== true) return game.ptr.web.close();
    else if (active !== false) return game.ptr.web.open(this);
    return;
  }

  getRollOptions(domains: string[] = []): string[] {
    const withAll = Array.from(new Set(["all", ...domains]));
    const { rollOptions } = this;
    const toReturn = new Set<string>();

    for (const domain of withAll) {
      for (const [option, value] of Object.entries(
        rollOptions.getFromDomain(domain as keyof RollOptions) ?? {}
      )) {
        if (value) toReturn.add(option);
      }
    }

    return Array.from(toReturn);
  }

  /** Get roll options from this actor's effects, traits, and other properties */
  getSelfRollOptions(prefix: "self" | "target" | "origin" = "self"): string[] {
    const { rollOptions } = this;
    return Object.keys(rollOptions.all).flatMap((o) =>
      o.startsWith("self:") && rollOptions.all[o]
        ? o.replace(/^self/, prefix)
        : o.startsWith("trait:") && rollOptions.all[o]
          ? `${prefix}:${o}`
          : []
    );
  }

  override getRollData(): Record<string, unknown> {
    const rollData = { actor: this };
    return rollData;
  }

  /**
   * Debug only method to get all effects.
   * @remarks
   * Marked as deprecated because it is not intended for use in production code.
   * @deprecated
   */
  get allEffects() {
    const effects = [];
    for (const effect of this.allApplicableEffects()) {
      effects.push(effect);
    }
    return effects;
  }

  get critStage() {
    return this.system.battleStats.critRate.stage + (this.system.modifiers["crit"] ?? 0);
  }

  get evasionStage() {
    return this.system.battleStats.evasion.stage + (this.system.modifiers["evasion"] ?? 0);
  }

  get accuracyStage() {
    return this.system.battleStats.accuracy.stage + (this.system.modifiers["accuracy"] ?? 0);
  }

  get speedStage() {
    return this.system.attributes.spe.stage + (this.system.modifiers["speed"] ?? 0);
  }

  getDefenseStat(attack: { category: AttackPTR2e["category"] }, isCrit: boolean) {
    return attack.category === "physical"
      ? this.calcStatTotal(this.system.attributes.def, isCrit)
      : this.calcStatTotal(this.system.attributes.spd, isCrit);
  }
  getAttackStat(attack: { category: AttackPTR2e["category"] }) {
    return attack.category === "physical"
      ? this.calcStatTotal(this.system.attributes.atk, false)
      : this.calcStatTotal(this.system.attributes.spa, false);
  }

  calcStatTotal(stat: Attribute, isCrit: boolean) {
    const stageModifier = () => {
      const stage = Math.clamp(stat.stage, -6, isCrit ? 0 : 6);
      return stage > 0 ? (2 + stage) / 2 : 2 / (2 + Math.abs(stage));
    };
    return stat.value * stageModifier();
  }

  async applyDamage(
    damage: number,
    { silent, healShield } = { silent: false, healShield: false }
  ) {
    // Damage is applied to shield first, then health
    // Shields cannot be healed
    if (damage > 0 || healShield) {
      const damageAppliedToShield = Math.min(damage || 0, this.system.shield.value);
      if (this.system.shield.value > 0 && damageAppliedToShield === 0) return 0;
      if (damageAppliedToShield > 0 || healShield) {
        const isShieldBroken = this.system.shield.value - damageAppliedToShield <= 0;
        await this.update({
          "system.shield.value": Math.max(
            this.system.shield.value - damage,
            0
          ),
        });
        if (!silent) {
          //@ts-expect-error - Chat messages have not been properly defined yet
          await ChatMessagePTR2e.create(
            {
              type: "damage-applied",
              system: {
                notes:
                  damage < 0
                    ? [
                      `Shield healed for ${Math.abs(
                        damageAppliedToShield
                      )} health`,
                      `Shield remaining: ${this.system.shield.value}`,
                    ]
                    : [
                      `Shield took ${damageAppliedToShield} damage`,
                      isShieldBroken
                        ? "Shield broken!"
                        : `Shield remaining: ${this.system.shield.value}`,
                    ],
                damageApplied: damageAppliedToShield,
                shieldApplied: true,
                target: this.uuid,
              }
            }
          );
        }
        return damageAppliedToShield;
      }
    }

    const damageApplied = Math.min(damage || 0, this.system.health.value);
    if (damageApplied === 0) return 0;
    await this.update({
      "system.health.value": Math.clamp(
        this.system.health.value - damage,
        0,
        this.system.health.max
      ),
    });
    if (!silent) {
      //@ts-expect-error - Chat messages have not been properly defined yet
      await ChatMessagePTR2e.create({
        type: "damage-applied",
        system: {
          damageApplied: damageApplied,
          target: this.uuid,
        },
      });
    }
    return damageApplied;
  }

  /** Toggle the provided roll option (swapping it from true to false or vice versa). */
  async toggleRollOption(
    domain: string,
    option: string,
    effectUuid: string | null = null,
    value?: boolean,
    suboption: string | null = null,
  ): Promise<boolean | null> {
    if (!(typeof effectUuid === "string")) return null;

    const effect = await fromUuid<ActiveEffectPTR2e>(effectUuid, { relative: this as Actor });
    const change = effect?.changes.find(
      (c): c is RollOptionChangeSystem =>
        c instanceof RollOptionChangeSystem && c.domain === domain && c.option === option,
    );
    return change?.toggle(value, suboption) ?? null;
  }

  override async modifyTokenAttribute(
    attribute: string,
    value: number,
    isDelta?: boolean,
    isBar?: boolean
  ): Promise<this> {
    if (isDelta && value != 0 && attribute === "health") {
      await this.applyDamage(value * -1);
      return this;
    }
    return super.modifyTokenAttribute(attribute, value, isDelta, isBar);
  }

  getEffectiveness(moveTypes: Set<PokemonType>) {
    let effectiveness = 1;
    for (const type of moveTypes) {
      effectiveness *= this.system.type.effectiveness[type] ?? 1;
    }
    return effectiveness;
  }

  isHumanoid(): this is ActorPTR2e<HumanoidActorSystem> {
    return this.type === "humanoid";
  }

  isPokemon(): this is ActorPTR2e<PokemonActorSystem> {
    return this.type === "pokemon";
  }

  hasEmbeddedSpecies(): boolean {
    return !!this.system._source.species;
  }

  async onEndActivation() {
    if (!(game.user === game.users.activeGM)) return;
    if (!this.synthetics.afflictions.data.length) return;
    const rollNotes: { options: string[], domains: string[], html: string }[] = [];
    const afflictions = this.synthetics.afflictions.data.reduce<{
      toDelete: string[];
      toUpdate: Partial<ActiveEffectPTR2e<ActorPTR2e>["_source"]>[];
      groups: Record<number, {
        afflictions: { formula?: string; affliction: AfflictionActiveEffectSystem }[];
        type?: "healing" | "damage" | "both";
      }>;
    }>(
      (acc, affliction) => {
        const result = affliction.onEndActivation();
        if (result.note) rollNotes.push(result.note);
        if (result.type === "delete") acc.toDelete.push(affliction.parent.id);
        else if (result.type === "update") acc.toUpdate.push(result.update);
        if (result.damage) {
          acc.groups[affliction.priority] ??= { afflictions: [] };

          acc.groups[affliction.priority].afflictions.push({
            formula: result.damage?.formula,
            affliction,
          });
          if (result.damage?.type) {
            if (
              acc.groups[affliction.priority].type &&
              acc.groups[affliction.priority].type !== result.damage.type
            ) {
              acc.groups[affliction.priority].type = "both";
            } else {
              acc.groups[affliction.priority].type = result.damage.type;
            }
          }
        }
        return acc;
      },
      {
        toDelete: [],
        toUpdate: [],
        groups: {},
      }
    );

    const sortedGroups = Object.entries(afflictions.groups).sort(
      ([a], [b]) => Number(a) - Number(b)
    );
    function getFormula(type: "healing" | "damage" | "both"): string {
      switch (type) {
        case "healing":
          return "floor(min(((@formula) * @health.max) + @health.value, @health.max))";
        case "damage":
          return "ceil(max(0, @health.value - ((@formula) * @health.max)))";
        case "both":
          return "round(clamp(@health.value - ((@formula) * @health.max), 0, @health.max))";
      }
    }

    let newHealth = this.system.health.value;
    const notes: string[][] = [];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, group] of sortedGroups) {
      if (!group.type) continue;
      if (group.type === "healing" && newHealth === this.system.health.max) continue;
      if (group.type && newHealth === 0) break;

      const groupFormula = group.afflictions.map(({ formula }) => formula).join(" + ");
      const rollFormula = getFormula(group.type);
      const result = (
        await new Roll(rollFormula, {
          formula: groupFormula,
          actor: this,
          health: {
            max: this.system.health.max,
            value: newHealth,
          },
        }).roll()
      ).total;

      const numberResult = Number(result);
      if (!Number.isNaN(numberResult)) {
        notes.push(
          await this._generateHealthChangeNotes(group, {
            old: newHealth,
            new: numberResult,
          })
        );
        newHealth = numberResult;
      }
    }

    const updates: DeepPartial<ActorPTR2e["_source"]> = {};
    const validAfflictionUpdates = afflictions.toUpdate.filter((update) => update._id);
    if (validAfflictionUpdates.length > 0)
      updates.effects = validAfflictionUpdates as foundry.documents.ActorSource["effects"];

    const oldHealth = this.system.health.value;
    if (newHealth !== oldHealth) {
      updates.system = {
        health: {
          value: newHealth,
        },
      };
    }

    if (afflictions.toDelete.length !== 0) {
      await this.deleteEmbeddedDocuments("ActiveEffect", afflictions.toDelete);
    }
    if (!fu.isEmpty(updates)) {
      await this.update(updates);
      if (newHealth !== oldHealth) {
        //@ts-expect-error - Chat messages have not been properly defined yet
        await ChatMessagePTR2e.create({
          type: "damage-applied",
          system: {
            notes,
            rollNotes: rollNotes.map(note => note.html),
            damageApplied: oldHealth - newHealth,
            target: this.uuid,
            result: {
              type: "affliction-dot",
              options: Array.from(new Set(rollNotes.flatMap(note => note.options))),
              domains: Array.from(new Set(rollNotes.flatMap(note => note.domains))),
            }
          },
        });
      }
    } else if (notes.length > 0) {
      //@ts-expect-error - Chat messages have not been properly defined yet
      await ChatMessagePTR2e.create({
        type: "damage-applied",
        system: {
          notes,
          rollNotes: rollNotes.map(note => note.html),
          damageApplied: 0,
          undone: true,
          target: this.uuid,
          result: {
            type: "affliction-dot",
            options: Array.from(new Set(rollNotes.flatMap(note => note.options))),
            domains: Array.from(new Set(rollNotes.flatMap(note => note.domains))),
          }
        },
      });
    }
  }

  /**
   * Generate a list of notes for the health change of end of turn afflictions
   */
  async _generateHealthChangeNotes(
    group: {
      afflictions: { formula?: string; affliction: AfflictionActiveEffectSystem }[];
      type?: "healing" | "damage" | "both";
    },
    health: { old: number; new: number }
  ): Promise<string[]> {
    const output = [];

    for (const { formula, affliction } of group.afflictions) {
      if (!formula) continue;
      const result = (
        await new Roll("@formula * @actor.system.health.max", {
          formula,
          actor: this,
        }).roll()
      ).total;
      output.push(`${affliction.parent.link}: ${formula} (${result})`);
    }

    const healthChange = health.new - health.old;
    if (health.new > health.old) {
      output.push(`<span class='damage'>Healed for ${healthChange} health</span>`);
    } else if (health.new < health.old) {
      output.push(`<span class='damage'>Took ${Math.abs(healthChange)} damage</span>`);
    } else {
      output.push(`<span class='damage'>No change in health</span>`);
    }

    return output;
  }

  /**
   * Delete all effects that should be deleted when combat ends
   */
  onEndCombat() {
    const applicable = this.effects.filter(
      (s) => (s as ActiveEffectPTR2e<this>).system.removeAfterCombat
    );
    this.deleteEmbeddedDocuments(
      "ActiveEffect",
      applicable.map((s) => s.id)
    );
  }

  async getCheckContext<
    TStatistic extends BaseStatisticCheck<unknown, unknown>,
    TItem extends ItemPTR2e<ItemSystemsWithActions, ActorPTR2e>,
  >(
    params: CheckContextParams<TStatistic, TItem>
  ): Promise<CheckContext<this, TStatistic, TItem>> {
    const context = await this.getRollContext(params);

    const omittedSubrolls: CheckContext['omittedSubrolls'] = new Set();

    const rangeIncrement = (() => {
      const rangeIncrement = context.target?.rangeIncrement ?? null;
      if (rangeIncrement === -Infinity) {
        omittedSubrolls.add("accuracy")
        return null;
      }
      return rangeIncrement;
    })();

    const appliesTo =
      context.target?.token?.actor?.uuid ??
      (context.target?.actor?.id ? context.target.actor.uuid : null) ??
      null;

    const rangePenalty = rangeIncrement
      ? new ModifierPTR2e({
        label: "PTR2E.Modifiers.rip",
        slug: `range-penalty-unicqi-${appliesTo ?? fu.randomID()}`,
        modifier: Math.min(-((rangeIncrement * (rangeIncrement + 1)) / 2), 0),
        method: "stage",
        type: "accuracy",
        appliesTo: appliesTo ? new Map([[appliesTo, true]]) : null,
      })
      : null;
    if (rangePenalty) context.self.modifiers.push(rangePenalty);

    const evasionStages = context.target?.actor?.evasionStage ?? 0;
    if (evasionStages !== 0) {
      const evasionModifier = new ModifierPTR2e({
        label: "PTR2E.Modifiers.evasion",
        slug: `evasion-modifier-unicqi-${appliesTo ?? fu.randomID()}`,
        modifier: evasionStages,
        method: "stage",
        type: "evasion",
        appliesTo: appliesTo ? new Map([[appliesTo, true]]) : null,
      });
      context.self.modifiers.push(evasionModifier);
    }

    const accuracyStages = context.self.actor.accuracyStage;
    if (accuracyStages != 0) {
      context.self.modifiers.push(
        new ModifierPTR2e({
          slug: `accuracy-modifier-unicqi-${appliesTo ?? fu.randomID()}`,
          label: "PTR2E.Modifiers.accuracy",
          modifier: accuracyStages,
          method: "stage",
          type: "accuracy",
          appliesTo: appliesTo ? new Map([[appliesTo, true]]) : null,
        })
      );
    }

    const critStages = context.self.actor.critStage;
    if (critStages != 0) {
      context.self.modifiers.push(
        new ModifierPTR2e({
          slug: `crit-modifier-unicqi-${appliesTo ?? fu.randomID()}`,
          label: "PTR2E.Modifiers.crit",
          modifier: critStages,
          method: "stage",
          type: "crit",
          appliesTo: appliesTo ? new Map([[appliesTo, true]]) : null,
        })
      );
    }

    return { ...context, omittedSubrolls };
  }

  protected getRollContext<
    TStatistic extends BaseStatisticCheck<unknown, unknown>,
    TItem extends ItemPTR2e<ItemSystemsWithActions, ActorPTR2e>,
  >(params: RollContextParams<TStatistic, TItem>): Promise<RollContext<this, TStatistic, TItem>>;
  protected async getRollContext(params: RollContextParams): Promise<RollContext<this>> {
    const [selfToken, targetToken]: [TokenPTR2e | null, TokenPTR2e | null] =
      canvas.ready && !params.viewOnly
        ? [
          canvas.tokens.controlled.find((t) => t.actor === this) ??
          (this.getActiveTokens().shift() as TokenPTR2e) ??
          null,
          params.target?.token ??
          (params.target?.actor?.getActiveTokens().shift() as TokenPTR2e) ??
          null,
        ]
        : [null, null];

    const originEphemeralEffects = await extractEphemeralEffects({
      affects: "origin",
      origin: this,
      target: params.target?.actor ?? targetToken?.actor ?? null,
      item: params.item ?? null,
      attack: params.attack ?? null,
      action: params.action ?? null,
      domains: params.domains,
      options: [...params.options, ...(params.item?.getRollOptions("item") ?? [])],
    });

    const initialActionOptions =
      params.traits?.map((t) => `self:action:trait:${typeof t === "string" ? t : t.slug}`) ??
      [];

    const selfActor =
      params.viewOnly || !targetToken?.actor
        ? this
        : this.getContextualClone(
          [
            ...Array.from(params.options),
            ...targetToken.actor.getSelfRollOptions("target"),
            ...initialActionOptions,
          ].filter(R.isTruthy),
          originEphemeralEffects
        );

    //TODO: Implement Move Variants
    //const attackActions = params.attack ? [params.attack] : [];

    const statistic = params.viewOnly
      ? params.statistic
      : (() => {
        if (params.attack) {
          const attack = selfActor.actions.attack.get(params.attack?.slug);
          if (!attack) return null;
          return attack.statistic?.check as Maybe<StatisticCheck>;
        } else if (params.action) {
          const action = selfActor.actions.get(params.action.slug);
          if (!action) return null;
          return (action as { statistic?: Statistic }).statistic
            ?.check as Maybe<StatisticCheck>;
        }
        return null;
      })() ?? params.statistic;

    const selfItem = ((): ItemPTR2e<ItemSystemsWithActions, ActorPTR2e> | null => {
      // 1. Simplest case: no context clone, so used the item passed to this method
      if (selfActor === this) return params.item ?? null;

      // 2. Get the item from the statistic if it's stored therein
      if (
        statistic &&
        "item" in statistic &&
        statistic.item instanceof ItemPTR2e &&
        ("actions" in statistic.item.system ||
          ("consumableType" in statistic.item.system &&
            statistic.item.system.consumableType &&
            statistic.item.system.consumableType === "pokeball"))
      ) {
        return statistic.item as ItemPTR2e<ItemSystemsWithActions, ActorPTR2e>;
      }

      // 3. Get the item directly from the context clone
      const itemClone = selfActor.items.get(params.item?.id ?? "") as unknown as
        | ItemPTR2e<ItemSystemsWithActions, ActorPTR2e>
        | undefined;
      if (itemClone) return itemClone;

      // 4 Give up :(
      return params.item ?? null;
    })();

    //TODO: Probably needs similar implementation to selfItem
    const selfAttack = params.attack?.clone();
    selfAttack?.prepareDerivedData();
    const selfAction = params.action;

    const itemOptions = selfItem?.getRollOptions("item") ?? [];

    if (selfAttack) {
      for (const adjustment of selfActor.synthetics.attackAdjustments) {
        adjustment.adjustAttack?.(selfAttack, itemOptions);
      }
    }

    const actionTraits = (() => {
      const traits = params.traits?.map((t) => (typeof t === "string" ? t : t.slug)) ?? [];

      if (selfAttack) {
        for (const adjustment of selfActor.synthetics.attackAdjustments) {
          adjustment.adjustTraits?.(selfAttack, traits, itemOptions);
        }
      }

      return R.unique(traits).sort();
    })();

    // Calculate distance and range increment, set as a roll option
    const distance = selfToken && targetToken ? selfToken.distanceTo(targetToken) : 0;
    const [originDistance, targetDistance] =
      typeof distance === "number"
        ? [`origin:distance:${distance}`, `target:distance:${distance}`]
        : [null, null];

    const originRollOptions =
      selfToken && targetToken
        ?
        R.unique([
          ...selfActor.getSelfRollOptions("origin"),
          ...actionTraits.map((t) => `origin:action:trait:${t}`),
          ...(originDistance ? [originDistance] : []),
        ]).filter(R.isTruthy)
        : [];

    // Target roll options
    const getTargetRollOptions = (actor: Maybe<ActorPTR2e>): string[] => {
      const targetOptions = actor?.getSelfRollOptions("target") ?? [];
      if (targetToken) {
        targetOptions.push("target"); // An indicator that there is any kind of target.
      }
      return targetOptions.sort();
    };
    const targetRollOptions = getTargetRollOptions(targetToken?.actor);

    // Get ephemeral effects from this actor that affect the target while being attacked
    const targetEphemeralEffects = await extractEphemeralEffects({
      affects: "target",
      origin: selfActor,
      target: targetToken?.actor ?? null,
      item: selfItem,
      attack: params.attack ?? null,
      action: params.action ?? null,
      domains: params.domains,
      options: [...params.options, ...itemOptions, ...targetRollOptions],
    });

    const targetEffectRolls = await extractEffectRolls({
      affects: "target",
      origin: selfActor,
      target: targetToken?.actor ?? null,
      item: selfItem,
      attack: params.attack ?? null,
      action: params.action ?? null,
      domains: params.domains,
      options: [...params.options, ...itemOptions, ...targetRollOptions],
      chanceModifier: (Number(selfActor.system?.modifiers?.effectChance) || 0),
      hasSenerenGrace: selfActor?.rollOptions?.all?.["special:serene-grace"] ?? false,
    })

    const targetOriginEffectRolls = await extractEffectRolls({
      affects: "origin",
      origin: selfActor,
      target: targetToken?.actor ?? null,
      item: selfItem,
      attack: params.attack ?? null,
      action: params.action ?? null,
      domains: params.domains,
      options: [...params.options, ...itemOptions, ...targetRollOptions],
      chanceModifier: (Number(targetToken?.actor?.system?.modifiers?.effectChance) || 0),
      hasSenerenGrace: targetToken?.actor?.rollOptions?.all?.["special:serene-grace"] ?? false
    })

    // Clone the actor to recalculate its AC with contextual roll options
    const targetActor = params.viewOnly
      ? null
      : (params.target?.actor ?? targetToken?.actor)?.getContextualClone(
        [...params.options, ...itemOptions, ...originRollOptions].filter(R.isTruthy),
        targetEphemeralEffects
      ) ?? null;

    const rollOptions = new Set(
      [
        ...params.options,
        ...selfActor.getRollOptions(params.domains),
        ...(targetActor ? getTargetRollOptions(targetActor) : targetRollOptions),
        ...actionTraits.map((t) => `self:action:trait:${t}`),
        ...itemOptions,
        ...(targetDistance ? [targetDistance] : []),
      ].filter(R.isTruthy)
    );

    const rangeIncrement = selfAttack
      ? selfAttack.getRangeIncrement(distance)
      : selfAction &&
        "getRangeIncrement" in selfAction &&
        selfAction.getRangeIncrement &&
        typeof selfAction.getRangeIncrement === "function"
        ? selfAction.getRangeIncrement(distance)
        : null;
    if (rangeIncrement) rollOptions.add(`target:range-increment:${rangeIncrement}`);

    const self = {
      actor: selfActor,
      token: selfToken?.document ?? null,
      statistic,
      item: selfItem,
      attack: selfAttack!,
      action: selfAction!,
      modifiers: [],
    };

    const target =
      targetActor && targetToken && distance !== null
        ? { actor: targetActor, token: targetToken.document, distance, rangeIncrement }
        : null;
    return {
      options: rollOptions,
      self,
      target,
      traits: actionTraits,
      effectRolls: { target: targetEffectRolls, origin: targetOriginEffectRolls },
    };
  }

  protected getContextualClone(
    rollOptions: string[],
    ephemeralEffects: EffectSourcePTR2e[]
  ): this {
    const rollOptionsAll = rollOptions.reduce(
      (options: Record<string, boolean>, option: string) => ({ ...options, [option]: true }),
      {}
    );
    const applicableEffects = ephemeralEffects.filter((effect) => !this.isImmuneTo(effect));

    return this.clone(
      {
        items: [fu.deepClone(this._source.items)].flat(),
        effects: [fu.deepClone(this._source.effects), applicableEffects].flat(),
        flags: { ptr2e: { rollOptions: { all: rollOptionsAll } } },
      },
      { keepId: true }
    );
  }

  //TODO: Implement
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isImmuneTo(_effect: EffectSourcePTR2e): boolean {
    return false;
  }

  async applyRollEffects(toApply: ActiveEffectPTR2e["_source"][]) {
    const effects = await this.createEmbeddedDocuments("ActiveEffect", toApply) as ActiveEffectPTR2e[];
    await ChatMessage.create({
      content: `<p>Applied the following effects to @UUID[${this.uuid}]:</p><ul>` + effects.map(e => `<li>@UUID[${e.uuid}]</li>`).join("") + "</ul>"
    })
  }

  static override async createDocuments<TDocument extends foundry.abstract.Document>(
    this: ConstructorOf<TDocument>,
    data?: (TDocument | PreCreate<TDocument["_source"]>)[],
    context?: DocumentModificationContext<TDocument["parent"]>
  ): Promise<TDocument[]>;
  static override async createDocuments(
    data: (ActorPTR2e | PreCreate<ActorPTR2e["_source"]>)[] = [],
    context: DocumentModificationContext<TokenDocumentPTR2e | null> = {}
  ): Promise<Actor<TokenDocument<Scene | null> | null>[]> {
    const sources = data.map((d) => (d instanceof ActorPTR2e ? d.toObject() : d));

    for (const source of [...sources]) {
      if (!["flags", "items", "system"].some((k) => k in source)) {
        // The actor has no migratable data: set schema version and return early
        source.system = {
          _migration: { version: MigrationRunnerBase.LATEST_SCHEMA_VERSION },
        };
      }
      const lowestSchemaVersion = Math.min(
        source.system?._migration?.version ?? MigrationRunnerBase.LATEST_SCHEMA_VERSION,
        ...(source.items ?? []).map(
          (i) =>
            (i?.system as ItemSystemPTR)?._migration?.version ??
            MigrationRunnerBase.LATEST_SCHEMA_VERSION
        )
      );

      const tokenDefaults = fu.deepClone(game.settings.get("core", "defaultToken"));
      const actor = new this(fu.mergeObject({ prototypeToken: tokenDefaults }, source));
      await MigrationRunner.ensureSchemaVersion(
        actor,
        MigrationList.constructFromVersion(lowestSchemaVersion)
      );

      sources.splice(sources.indexOf(source), 1, actor.toObject());
    }

    return super.createDocuments(sources, context);
  }

  static override async createDialog<TDocument extends foundry.abstract.Document>(this: ConstructorOf<TDocument>, data?: Record<string, unknown>, context?: { parent?: TDocument["parent"]; pack?: Collection<TDocument> | null; types?: string[] } & Partial<FormApplicationOptions>): Promise<TDocument | null>;
  static override async createDialog(data: Record<string, unknown> = {}, context: { parent?: TokenDocumentPTR2e | null; pack?: Collection<ActorPTR2e> | null; types?: string[] } & Partial<FormApplicationOptions> = {}) {
    if (!Array.isArray(context.types)) context.types = this.TYPES.filter(t => t !== "ptu-actor");
    else {
      if (context.types.length) context.types = context.types.filter(t => t !== "ptu-actor");
      else context.types = this.TYPES.filter(t => t !== "ptu-actor");
    }
    return super.createDialog(data, context);
  }

  protected override _onEmbeddedDocumentChange(): void {
    super._onEmbeddedDocumentChange();

    // Send any accrued warnings to the console
    this.synthetics.preparationWarnings.flush();
  }

  protected override async _preCreate(
    data: this["_source"],
    options: DocumentModificationContext<TParent> & { fail?: boolean },
    user: User
  ): Promise<boolean | void> {
    const result = await super._preCreate(data, options, user);
    if (result === false) return false;
    if (this.type === 'ptu-actor') throw new Error("PTU Actors cannot be created directly.");
    if (options.fail === true) return false;

    if (this.system.party.ownerOf) {
      const folder = game.folders.get(this.system.party.ownerOf) as FolderPTR2e;
      if (folder.owner) {
        throw new Error("Cannot create an actor that owns a party folder already owned by another actor.");
      }
    }
  }

  protected override async _preUpdate(
    changed: DeepPartial<this["_source"]>,
    options: DocumentModificationContext<TParent>,
    user: User
  ): Promise<boolean | void> {
    if (changed.system?.party?.ownerOf) {
      const folder = game.folders.get(changed.system.party.ownerOf as Maybe<string>) as FolderPTR2e;
      if (folder?.owner && folder.owner !== this.uuid) {
        throw new Error("Cannot change the owner of a party folder to an actor that does not own it. Please remove the current party owner first.");
      }
    }

    if (changed.system?.health?.value !== undefined) {
      const fainted = this.effects.get("faintedcondition") !== undefined;
      if ((changed.system.health.value as number) <= 0 && !fainted) {
        const effects: ActiveEffectPTR2e["_source"][] = [];
        effects.push(
          (
            await ActiveEffectPTR2e.fromStatusEffect("dead")
          ).toObject() as ActiveEffectPTR2e["_source"]
        );

        const weary = this.effects.get("wearycondition00") as
          | ActiveEffectPTR2e<this>
          | undefined;
        if (!weary) {
          effects.push(
            (
              await ActiveEffectPTR2e.fromStatusEffect("weary")
            ).toObject() as ActiveEffectPTR2e["_source"]
          );
        } else {
          await weary.update({ "system.stacks": weary.system.stacks + 1 });
        }

        await this.createEmbeddedDocuments("ActiveEffect", effects, { keepId: true });
      } else if ((changed.system.health.value as number) > 0 && fainted) {
        await this.deleteEmbeddedDocuments("ActiveEffect", ["faintedcondition"]);
      }
    }

    if (changed.system?.advancement?.experience?.current !== undefined) {
      const next = this.system.advancement.experience.next;
      if (next && Number(changed.system.advancement.experience.current) >= next) {
        changed.flags ??= {}; //@ts-expect-error - flags is not defined in the base class
        changed.flags.ptr2e ??= {}; //@ts-expect-error - flags is not defined in the base class
        changed.flags.ptr2e.sheet ??= {}; //@ts-expect-error - flags is not defined in the base class
        changed.flags.ptr2e.sheet.perkFlash = true;
      }
    }

    if (changed.system?.shield !== undefined) {
      if (
        typeof changed.system.shield.value === "number" &&
        changed.system.shield.value > this.system.shield.value
      ) {
        changed.system.shield.max ??= changed.system.shield.value;
      } else if (changed.system.shield.value === 0) {
        changed.system.shield.max = 0;
      }
    }

    if (changed.system?.traits !== undefined && this.system?.traits?.suppressedTraits?.size) {
      if (changed.system.traits instanceof Set) {
        //@ts-expect-error - During an update this should be an array
        changed.system.traits = Array.from(changed.system.traits);
      }
      else if (!Array.isArray(changed.system.traits)) {
        //@ts-expect-error - During an update this should be an array
        if (changed.system.traits instanceof Collection) changed.system.traits = [...changed.system.traits];
        //@ts-expect-error - During an update this should be an array
        else changed.system.traits = [];
      }

      const suppressedTraits = this.system.traits.suppressedTraits;
      const sourceTraits = this.system._source.traits;
      const intersection = sourceTraits.filter(trait => suppressedTraits.has(trait));
      if (intersection.length) {
        //@ts-expect-error - During an update this should be an array
        changed.system.traits = Array.from(new Set([...changed.system.traits, ...intersection]))
      }
    }

    if (changed.system?.advancement?.experience?.current !== undefined) {
      if (this.system.species?.moves?.levelUp?.length) {
        // Check if level-up occurs
        const newExperience = Number(changed.system.advancement.experience.current);
        const nextExperienceThreshold = this.system.advancement.experience.next;
        if (nextExperienceThreshold && newExperience >= nextExperienceThreshold) {
          const level = this.system.getLevel(newExperience);
          const currentLevel = this.system.advancement.level;

          const newMoves = this.system.species.moves.levelUp.filter(move => move.level > currentLevel && move.level <= level).filter(move => !this.itemTypes.move.some(item => item.slug == move.name));
          if (newMoves.length) {
            const moves = (await Promise.all(newMoves.map(move => fromUuid<ItemPTR2e<MoveSystem>>(move.uuid)))).flatMap(move => move ?? []);
            changed.items ??= [];
            //@ts-expect-error - Asserted that this is an Array.
            changed.items.push(...moves.map(move => move.toObject()));
          }
        }
      }

    }

    return super._preUpdate(changed, options, user);
  }

  protected override _onUpdate(
    changed: DeepPartial<this["_source"]>,
    options: DocumentUpdateContext<TParent>,
    userId: string
  ): void {
    super._onUpdate(changed, options, userId);

    if (game.ptr.web.actor === this) game.ptr.web.refresh({ nodeRefresh: true });
  }

  protected override async _onCreateDescendantDocuments(
    parent: this,
    collection: "effects" | "items",
    documents: ActiveEffectPTR2e<this>[] | ItemPTR2e<ItemSystemPTR, this>[],
    results: ActiveEffectPTR2e<this>["_source"][] | ItemPTR2e<ItemSystemPTR, this>["_source"][],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: any,
    userId: string
  ) {
    super._onCreateDescendantDocuments(parent, collection, documents, results, options, userId);
    if (game.ptr.web.actor === this) await game.ptr.web.refresh({ nodeRefresh: true });
    if (!this.unconnectedRoots.length) return;

    function isEffect(
      collection: "effects" | "items",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      _documents: any[]
    ): _documents is ActiveEffectPTR2e<typeof parent>[] {
      return collection === "effects";
    }
    if (isEffect(collection, documents)) return;

    const perks = documents.filter((d) => d.type === "perk") as PerkPTR2e[];
    if (!perks.length) return;

    const updates = [];
    const originalRoot = this.originalRoot;
    if (!originalRoot) throw new Error("No original root found.");
    const originalRootNode = game.ptr.web.collection.getName(originalRoot.slug, {
      strict: true,
    });

    for (const root of this.unconnectedRoots) {
      const rootNode = game.ptr.web.collection.getName(root.slug, { strict: true });

      const path = game.ptr.web.collection.graph.getPurchasedPath(originalRootNode, rootNode);
      if (path) {
        updates.push({ _id: root.id, "system.cost": 1 });
      }
    }
    if (updates.length) await this.updateEmbeddedDocuments("Item", updates);
  }

  protected override _onDeleteDescendantDocuments(
    parent: this,
    collection: "effects" | "items",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    documents: any[],
    ids: string[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: any,
    userId: string
  ): void {
    super._onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId);
    if (game.ptr.web.actor === this) game.ptr.web.refresh({ nodeRefresh: true });
  }

  protected override _onUpdateDescendantDocuments(
    parent: this,
    collection: "effects" | "items",
    documents: ActiveEffectPTR2e<this>[] | ItemPTR2e<ItemSystemPTR, this>[],
    changes: ActiveEffectPTR2e<this>["_source"][] | ItemPTR2e<ItemSystemPTR, this>["_source"][],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: any,
    userId: string
  ): void {
    super._onUpdateDescendantDocuments(parent, collection, documents, changes, options, userId);
    if (game.ptr.web.actor === this) game.ptr.web.refresh({ nodeRefresh: true });
  }

  override async toggleStatusEffect(
    statusId: string,
    { active, overlay = false, all = false, }: { active?: boolean; overlay?: boolean; all?: boolean } = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const status = CONFIG.statusEffects.find((e) => e.id === statusId);
    if (!status)
      throw new Error(`Invalid status ID "${statusId}" provided to Actor#toggleStatusEffect`);
    const existing = [];

    // Find the effect with the static _id of the status effect
    if (status._id) {
      const effect = this.effects.get(status._id);
      if (effect) existing.push(effect.id);
    }

    // If no static _id, find all single-status effects that have this status
    else {
      for (const effect of this.effects) {
        const statuses = effect.statuses;
        if (statuses.size === 1 && statuses.has(status.id)) existing.push(effect.id);
      }
    }

    if ((status.system as ActiveEffectSystem["_source"])?.stacks) {
      const slug = sluggify(game.i18n.localize(status.name));
      for (const id of existing) {
        const effect = this.effects.get(id) as ActiveEffectPTR2e<this>;
        if (effect.slug === slug) {
          if (overlay) {
            if (!all && effect.system.stacks > 1)
              effect.update({ "system.stacks": effect.system.stacks - 1 });
            else effect.delete();
          } else {
            effect.update({ "system.stacks": effect.system.stacks + 1 });
          }
          return false;
        }
      }
    }

    // Remove the existing effects unless the status effect is forced active
    if (existing.length) {
      if (active) return true;
      await this.deleteEmbeddedDocuments("ActiveEffect", existing);
      return false;
    }

    // Create a new effect unless the status effect is forced inactive
    if (!active && active !== undefined) return;
    const effect = await ActiveEffectPTR2e.fromStatusEffect(statusId);
    if (overlay) effect.updateSource({ "flags.core.overlay": true });
    //@ts-expect-error - Active effects aren't typed properly yet
    return ActiveEffectPTR2e.create(effect.toObject(), { parent: this, keepId: true });
  }

  hasStatus(statusId: string): boolean {
    const status = CONFIG.statusEffects.find((e) => e.id === statusId);
    if (!status)
      throw new Error(`Invalid status ID "${statusId}" provided to ActorPTR2e#hasStatus`);

    // Find the effect with the static _id of the status effect
    if (status._id) {
      const effect = this.effects.get(status._id);
      if (effect) return true;
    }

    // If no static _id, find all single-status effects that have this status
    else {
      for (const effect of this.effects) {
        const statuses = effect.statuses;
        if (statuses.has(status.id)) return true;
      }
    }
    return false;
  };


  async heal({ fractionToHeal = 1.0, removeWeary = true, removeExposed = false, removeAllStacks = false }: { fractionToHeal?: number, removeWeary?: boolean; removeExposed?: boolean; removeAllStacks?: boolean } = {}): Promise<void> {
    const health = Math.clamp(
      (this.system.health?.value ?? 0) + Math.floor((this.system.health?.max ?? 0) * fractionToHeal),
      0,
      this.system.health?.max ?? 0);
    await this.update({
      "system.health.value": health,
      "system.powerPoints.value": this.system.powerPoints?.max ?? 0,
    });

    // remove effects
    const applicable = this.effects.filter(
      (s) => (s as ActiveEffectPTR2e<this>).system.removeAfterCombat || (s as ActiveEffectPTR2e<this>).system.removeOnRecall
    );
    await this.deleteEmbeddedDocuments(
      "ActiveEffect",
      applicable.map((s) => s.id)
    );


    // remove exposure
    if (removeExposed) {
      await this.toggleStatusEffect("exposed", { active: false, all: removeAllStacks, overlay: true });
    }

    // remove weary
    if (!this.hasStatus("exposed") && removeWeary) {
      await this.toggleStatusEffect("weary", { active: false, all: removeAllStacks, overlay: true });
    }
  }

  /** Assess and pre-process this JSON data, ensuring it's importable and fully migrated */
  override async importFromJSON(json: string): Promise<this> {
    const processed = await preImportJSON(this, json);
    return processed ? super.importFromJSON(processed) : this;
  }
}

interface ActorPTR2e<
  TSystem extends ActorSystemPTR2e = ActorSystemPTR2e,
  TParent extends TokenDocumentPTR2e | null = TokenDocumentPTR2e | null,
> extends Actor<TParent, TSystem> {
  get folder(): FolderPTR2e<ActorPTR2e<TSystem, null>> | null;

  _party: ActorParty | null;

  health: {
    percent: number;
  };

  synthetics: ActorSynthetics;

  _actions: ActionsCollections;
  _perks: Map<string, PerkPTR2e> | null;

  level: number;

  flags: ActorFlags2e;

  rollOptions: RollOptionManager<this>;

  attacks: {
    slots: number;
    actions: Record<number, AttackPTR2e>;
    available: AttackPTR2e[];
  };

  abilities: {
    slots: 1 | 2 | 3 | 4;
    entries: Record<number, AbilityPTR2e>;
    available: AbilityPTR2e[];
    free: AbilityPTR2e[];
  }

  skills: Record<string, Statistic>;

  get itemTypes(): Record<string, ItemPTR2e[]>;
}

type ActorFlags2e = ActorFlags & {
  ptr2e: {
    rollOptions: RollOptions & object;
    sheet?: {
      perkFlash?: boolean;
    };
  };
};

export default ActorPTR2e;
