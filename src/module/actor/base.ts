/* eslint-disable no-fallthrough */
import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import {
  ActorDimensions,
  ActorSynthetics,
  ActorSystemPTR2e,
  Attribute,
  AuraData,
  HumanoidActorSystem,
  PokemonActorSystem,
} from "@actor";
import { ActiveEffectPTR2e, ActiveEffectSystem, EffectSourcePTR2e } from "@effects";
import { TypeEffectiveness } from "@scripts/config/effectiveness.ts";
import { ActionPTR2e, AttackPTR2e, PokemonType, PTRCONSTS, RollOptionChangeSystem, RollOptionManager, Trait } from "@data";
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
import { extractEffectRolls, extractEphemeralEffects, extractModifiers, extractTargetModifiers, processPreUpdateHooks } from "src/util/change-helpers.ts";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import * as R from "remeda";
import { ModifierPTR2e } from "@module/effects/modifiers.ts";
import { sluggify } from "@utils";
import { preImportJSON } from "@module/data/doc-helper.ts";
import { MigrationRunnerBase } from "@module/migration/runner/base.ts";
import { MigrationList, MigrationRunner } from "@module/migration/index.ts";
import MoveSystem from "@item/data/move.ts";
import SpeciesSystem from "@item/data/species.ts";
import { PickableThing } from "@module/apps/pick-a-thing-prompt.ts";
import { ActionUUID } from "src/util/uuid.ts";
import { ActorSizePTR2e } from "./data/size.ts";
import { auraAffectsActor, checkAreaEffects } from "./helpers.ts";

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

  constructor(data: object, context: DocumentConstructionContext<TParent> = {}) {
    super(data, context);

    Object.defineProperties(this, {
      // Prevent object-recursing code from getting into `_itemTypes`,
      _itemTypes: {
        configurable: false,
        enumerable: false,
      },
      // Add debounced checkAreaEffects method
      checkAreaEffects: {
        value: fu.debounce(checkAreaEffects, 50),
      },
    });
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
        (p) => p.system.cost === 0 && p.system.nodes[0]?.type === "root"
      ) ?? null
    );
  }

  get unconnectedRoots(): PerkPTR2e[] {
    return (this.itemTypes.perk as PerkPTR2e[]).filter(
      (p) => p.system.cost === 5 && p.system.nodes[0]?.type === "root"
    );
  }

  get perks(): Map<string, PerkPTR2e> {
    return (
      this._perks ??
      (this._perks = (this.itemTypes.perk as PerkPTR2e[]).reduce((acc, perk) => {
        acc.set(perk.system.originSlug ?? perk.slug, perk);
        if (perk.flags?.ptr2e?.tierSlug) acc.set(perk.flags.ptr2e.tierSlug + "", perk);
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

  get species() {
    return this._species ??= (this.items.get("actorspeciesitem")?.system as Maybe<SpeciesSystem>) ?? this.system.species ?? null;
  }

  get size() {
    return new ActorSizePTR2e({ value: ActorSizePTR2e.sizeFromRank(this.system.details.size.heightClass) ?? "medium" });
  }

  /**
   * With the exception of vehicles, actor heights aren't specified. For the purpose of three-dimensional
   * token-distance measurement, however, the system will generally treat actors as cubes.
   */
  get dimensions(): ActorDimensions {
    const size = this.size;
    return {
      length: size.length,
      width: size.width,
      height: Math.min(size.length, size.width),
    };
  }

  /** The recorded schema version of this actor, updated after each data migration */
  get schemaVersion(): number | null {
    return Number(this.system._migration?.version) || null;
  }

  /** Get an active GM or, failing that, a player who can update this actor */
  get primaryUpdater(): User | null {
    // 1. The first active GM, sorted by ID
    const { activeGM } = game.users;
    if (activeGM) return activeGM;

    const activeUsers = game.users.filter((u) => u.active);
    // 2. The user with this actor assigned
    const primaryPlayer = this.isToken ? null : activeUsers.find((u) => u.character?.id === this.id);
    if (primaryPlayer) return primaryPlayer;

    // 3. Anyone who can update the actor
    const firstUpdater = game.users
      .filter((u) => this.canUserModify(u, "update"))
      .sort((a, b) => (a.id > b.id ? 1 : -1))
      .shift();
    return firstUpdater ?? null;
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

  get alliance() {
    return this.system.details.alliance;
  }

  get luck(): number {
    return this.isAce ? this.system.skills.get("luck")!.total : 0;
  }

  get spendableLuck(): number {
    return Math.max(
      (
        (!this.party?.owner || this.party?.owner == this)
          ? this.luck
          : this.luck + this.party.owner.luck
      ) ?? 0 - 1, 0)
  }

  get nullifiableAbilities(): PickableThing[] {
    //@ts-expect-error - UUID only is valid.
    return this.itemTypes?.ability
      ?.filter(ability => !ability.system.isSuppressed && (ability.system.free || ability.system.slot !== null))
      .map(ability => ({
        value: ability.uuid
      })) ?? [];
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
      ephemeralModifiers: {},
      modifierAdjustments: { all: [], damage: [] },
      modifiers: { all: [], damage: [] },
      afflictions: { data: [], ids: new Set() },
      rollNotes: {},
      effects: {},
      toggles: [],
      attackAdjustments: [],
      tokenTags: new Map(),
      tokenOverrides: {},
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

    this.auras = new Map();
    this._party = null;
    this._perks = null;
    this._species = null;

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

    //@ts-expect-error - The getter needs to be added afterwards.
    this.flags.ptr2e.disableActionOptions = {
      collection: new Collection(),
      disabled: []
    }
    Object.defineProperty(this.flags.ptr2e.disableActionOptions, "options", {
      get: () => {
        return this.flags.ptr2e.disableActionOptions!.collection.filter(action => {
          if (!(action instanceof AttackPTR2e)) return true;
          return action.free ? true : action.slot ? this.attacks.actions[action.slot] === action : action.free;
        }).map(action => ({ value: action.uuid }));
      }
    });
  }

  /**
   * Step 4 - Prepare all embedded Document instances which exist within this primary Document.
   * */
  override prepareEmbeddedDocuments() {
    if (this.type === "ptu-actor") return super.prepareEmbeddedDocuments();
    super.prepareEmbeddedDocuments();
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
      if (this.attacks.actions[attack.slot]) {
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

      if (this.abilities.entries[ability.system.slot]) {
        if (this.abilities.entries[ability.system.slot].slug !== ability.slug) {
          this.abilities.available.push(this.abilities.entries[ability.system.slot]);
        }
        continue;
      }

      this.abilities.entries[ability.system.slot] = ability;
    }

    // Create Fling Action
    this.generateFlingAttack();
  }

  generateFlingAttack() {
    function getFlingAttack(
      { name, slug, power = 25, accuracy = 100, types = ["untyped"], free = false, variant = true, description = "", id = "" }:
        { name?: string, slug?: string, power?: number, accuracy?: number, types?: DeepPartial<AttackPTR2e['_source']['types']>, free?: boolean, variant?: boolean, description?: string, id?: string }
        = { name: "", slug: "", power: 25, accuracy: 100, types: ["untyped"], free: false, variant: true, description: "", id: "" }
    ): DeepPartial<AttackPTR2e['_source']> {
      return {
        slug: `fling${name?.length ? `-${slug}` : ""}`,
        name: `Fling${name?.length ? ` (${name})` : ""}`,
        type: "attack",
        traits: [
          "adaptable",
          "basic",
          "fling",
          "pp-updated"
        ],
        range: {
          target: "creature",
          distance: 10,
          unit: "m"
        },
        cost: {
          activation: "complex",
          powerPoints: 0
        },
        category: "physical",
        power: power || 25,
        accuracy: accuracy || 100,
        types: types?.length ? types : ["untyped"],
        description: description ? description : "<p>Effect: The Type, Power, Accuracy, and Range of this attack are modified by the Fling stats of the utilized item. When using Fling utilizing a Held creature, Fling's Power and Accuracy are as follows:</p><blockquote>Power = 20 + (userLift / 4) + (thrownWC * 3)<br>Accuracy = 75 + (userLift / 5) + userCatMod - (4 * thrownCatMod)<br>Range = 8 + (userLift / 6) + userCatMod - (2* thrownCatMod)</blockquote>",
        variant: variant ? "fling" : null,
        free,
        img: "systems/ptr2e/img/svg/untyped_icon.svg",
        ...(id ? { flingItemId: id } : {})
      }
    }
    const data = {
      "name": "Fling",
      "type": "move",
      "img": "systems/ptr2e/img/svg/untyped_icon.svg",
      "system": {
        "slug": "fling",
        "description": "<p>Effect: The Type, Power, Accuracy, and Range of this attack are modified by the Fling stats of the utilized item. When using Fling utilizing a Held creature, Fling's Power and Accuracy are as follows:</p><blockquote>Power = 20 + (userLift / 4) + (thrownWC * 3)<br>Accuracy = 75 + (userLift / 5) + userCatMod - (4 * thrownCatMod)<br>Range = 8 + (userLift / 6) + userCatMod - (2* thrownCatMod)</blockquote>",
        "traits": [
          "adaptable",
          "basic",
          "fling"
        ],
        "actions": [getFlingAttack({
          free: true,
          variant: false
        }), getFlingAttack({
          name: "Actor Toss",
          slug: "actor-toss",
        })],
        "grade": "E"
      },
      "_id": "flingattackitem0",
      "effects": []
    };

    const itemNames = new Set<string>();
    for (const item of this.items?.contents as unknown as ItemPTR2e[]) {
      if (!["consumable", "equipment", "gear", "weapon"].includes(item.type)) continue;
      if (!item.system.fling) continue;
      if (itemNames.has(item.slug)) continue;
      if (item.system.quantity !== undefined && typeof item.system.quantity === 'number' && item.system.quantity <= 0) continue;
      itemNames.add(item.slug);

      const flingData = item.system.fling as { power: number, accuracy: number, type: PokemonType, hide: boolean };
      if (flingData.hide) continue;

      data.system.actions.push(getFlingAttack({
        name: item.name, slug: item.slug, power: flingData.power, accuracy: flingData.accuracy, types: [flingData.type], id: item.id,
        description: `<p>Effect: The Type, Power, Accuracy, and Range of this attack are modified by the Fling stats of the utilized item.</p><p>This fling variant is based on ${item.link}</p>`
      }));
    }

    const existing = this.items.get(data._id) as Maybe<ItemPTR2e<MoveSystem, this>>;
    if (existing) {
      existing.updateSource(data);
      existing.reset();
      this.fling = existing;
    }
    else {
      this.fling = new ItemPTR2e(data, { parent: this });
    }

    this.items.set(this.fling.id, this.fling);
  }

  /**
   * Apply any transformations to the Actor data which are caused by ActiveEffects.
   */
  override applyActiveEffects() {
    if (this.type === "ptu-actor") return;
    // First finish preparing embedded documents based on System Information
    this.system.prepareEmbeddedDocuments();

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

  override *allApplicableEffects(): Generator<ActiveEffectPTR2e<this>> {
    if (game.ready) {
      const combatant = this.combatant;
      if (combatant) {
        const summons = combatant.parent?.summons;
        if (summons?.length) {
          for (const summon of summons) {
            for (const effect of summon.system.getApplicableEffects(this)) {
              yield new ActiveEffectPTR2e(effect.toObject(), { parent: this }) as ActiveEffectPTR2e<this>;
            }
          }
        }
      }
    }
    for (const trait of this.traits) {
      if (!trait.changes?.length) continue;
      const effect = Trait.effectsFromChanges.bind(trait)(this) as ActiveEffectPTR2e<this>;
      if (effect) yield effect;
    }
    yield* super.allApplicableEffects() as Generator<ActiveEffectPTR2e<this>>
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
    const typeImmunities = Object.keys(this.rollOptions.getFromDomain("immunities") ?? {}).filter(o => o.startsWith("type:"));
    for (const immunity of typeImmunities) {
      const type = immunity.split(":")[1] as PokemonType;
      effectiveness[type] = 0;
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
  // async togglePerkTree(active: boolean) {
  //   if (game.ptr.web.actor === this && active !== true) return game.ptr.web.close();
  //   else if (active !== false) return game.ptr.web.open(this);
  //   return;
  // }

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
  getSelfRollOptions(prefix: "self" | "target" | "origin" | "defensive" = "self"): string[] {
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

  getDefenseStat(attack: { category: AttackPTR2e["category"], defensiveStat: PTRCONSTS.Stat | null }, isCrit: boolean) {
    const stat: PTRCONSTS.Stat = attack.defensiveStat ?? (attack.category === "physical" ? "def" : "spd");
    return this.calcStatTotal(this.system.attributes[stat], isCrit);
  }

  getAttackStat(attack: { category: AttackPTR2e["category"], offensiveStat: PTRCONSTS.Stat | null }) {
    const stat: PTRCONSTS.Stat = attack.offensiveStat ?? (attack.category === "physical" ? "atk" : "spa");
    return this.calcStatTotal(this.system.attributes[stat], false);
  }

  calcStatTotal(stat: Attribute | Omit<Attribute, 'stage'>, isCrit: boolean): number {
    function isAttribute(attribute: Attribute | Omit<Attribute, 'stage'>): attribute is Attribute {
      return attribute.slug !== "hp";
    }
    if (!isAttribute(stat)) return stat.value;
    const stageModifier = () => {
      const stage = Math.clamp(stat.stage, -6, isCrit ? 0 : 6);
      return stage > 0 ? (2 + stage) / 2 : 2 / (2 + Math.abs(stage));
    };
    return stat.value * stageModifier();
  }

  async applyTickDamage({ ticks, apply, shield, pp }: { ticks: number, apply: false, shield?: boolean, pp?: boolean }): Promise<{ applied: number, update: Record<string, unknown> }>;
  async applyTickDamage({ ticks, apply, shield, pp }: { ticks: number, apply: true, shield?: boolean, pp?: boolean }): Promise<{ applied: number, message: ChatMessagePTR2e }>;
  async applyTickDamage({ ticks, apply, shield, pp }: { ticks: number, apply?: boolean, shield?: boolean, pp?: boolean }): Promise<{ applied: number, update?: Record<string, unknown>, message?: ChatMessagePTR2e }>;
  async applyTickDamage({ ticks, apply = true, shield = false, pp = false }: { ticks: number, apply?: boolean, shield?: boolean, pp?: boolean }): Promise<{ applied: number, update?: Record<string, unknown>, message?: ChatMessagePTR2e }> {
    const isDamage = ticks < 0;
    if (!pp) {
      const amount = Math.floor((this.system.health.max / 16) * Math.abs(ticks))
      const applied = shield
        ? Math.min(amount || 0, isDamage ? this.system.shield.value : Infinity)
        : Math.min(amount || 0, isDamage ? this.system.health.value : this.system.health.max - this.system.health.value);

      const update = shield
        ? {
          "system.shield.value": Math.max(
            this.system.shield.value - (isDamage ? applied : -applied),
            0
          )
        }
        : {
          "system.health.value": Math.clamp(
            this.system.health.value + (isDamage ? -amount : amount),
            0,
            this.system.health.max
          )
        } as Record<string, unknown>;
      if (!apply) {
        update["_id"] = this.id;
        return { applied, update };
      }

      await this.update(update);

      return {
        applied,
        //@ts-expect-error - Chat messages have not been properly defined yet
        message: await ChatMessagePTR2e.create({
          type: "damage-applied",
          system: {
            damageApplied: isDamage ? applied : -applied,
            shieldApplied: shield,
            target: this.uuid
          }
        })
      }
    }

    const amount = Math.floor((this.system.powerPoints.max / 16) * Math.abs(ticks));
    const applied = Math.min(amount || 0, isDamage ? this.system.powerPoints.value : this.system.powerPoints.max - this.system.powerPoints.value);

    const update = {
      "system.powerPoints.value": Math.clamp(
        this.system.powerPoints.value + (isDamage ? -amount : amount),
        0,
        this.system.powerPoints.max
      )
    } as Record<string, unknown>;

    if (!apply) {
      update["_id"] = this.id;
      return { applied, update };
    }

    await this.update(update);

    return {
      applied,
      //@ts-expect-error - Chat messages have not been properly defined yet
      message: await ChatMessagePTR2e.create({
        type: "damage-applied",
        system: {
          damageApplied: isDamage ? applied : -applied,
          target: this.uuid,
          ppApplied: true
        }
      })
    }
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
    const result = await change?.toggle(value, suboption) ?? null;
    if (result === null) return result;

    await processPreUpdateHooks(this);
    return result;
  }

  override async modifyTokenAttribute(
    attribute: string,
    value: number,
    isDelta?: boolean,
    isBar?: boolean
  ): Promise<this> {
    if (attribute === "health") {
      if (value >= 0) value = Math.floor(value);
      if (value < 0) value = Math.ceil(value);
    }
    if (isDelta && value != 0 && attribute === "health") {
      await this.applyDamage(value * -1);
      return this;
    }
    return super.modifyTokenAttribute(attribute, value, isDelta, isBar);
  }

  getEffectiveness(moveTypes: Set<PokemonType>, effectivenessStages = 0, ignoreImmune = false): number {
    let effectiveness = 1;
    for (const type of moveTypes) {
      effectiveness *= this.system.type.effectiveness[type] ?? 1;
    }
    if (ignoreImmune && effectiveness === 0) effectiveness = 1;
    if (effectivenessStages !== 0) {
      const positive = effectivenessStages > 0;
      for (let i = 0; i < Math.abs(effectivenessStages); i++) {
        effectiveness *= positive ? 2 : 0.5;
      }
    }
    return effectiveness;
  }

  async getUnderdogPerks(): Promise<PerkPTR2e[]> {
    if (!this.traits.has("underdog")) return [];
    if (!this.species) return [];

    const underdogPerks = await game.packs.get("ptr2e.core-perks")!.getDocuments({
      _id__in: [
        "underdogperk0001",
        "underdogperk0011",
        "underdogperk0021",
        "underdogperk0031",
        "underdogperk0041",
        "underdogperk0051",
        "underdogperk0002",
      ]
    }) as PerkPTR2e[];
    const webs = new Set([this.species!.evolutions?.uuid ?? this.species!.parent.flags?.core?.sourceId ?? []].flat());
    const baseConnection = `evolution-${this.species!.evolutions?.name ?? this.species!.parent.slug}`;
    return underdogPerks.map(perk => perk.clone({ "system.webs": webs, "system.nodes": perk.system._source.nodes.map(node => ({ ...node, connected: [baseConnection, ...node.connected] })) }));
  }

  isHumanoid(): this is ActorPTR2e<HumanoidActorSystem> {
    return this.traits.has("humanoid");
  }

  isPokemon(): this is ActorPTR2e<PokemonActorSystem> {
    return !this.isHumanoid();
  }

  isAllyOf(actor: ActorPTR2e): boolean {
    return this.alliance !== null && this !== actor && this.alliance === actor.alliance;
  }

  isEnemyOf(actor: ActorPTR2e): boolean {
    return this.alliance !== null && actor.alliance !== null && this.alliance !== actor.alliance;
  }

  async spendLuck(amount: number, pendingUpdates: Record<string, unknown>[] = [], notifications: { name: string, amount: number, leftover: number }[] = []): Promise<{ name: string, amount: number, leftover: number }[]> {
    // no "spending" a negative amount of luck
    if (amount < 0) return [];
    // If we can't afford it, don't spend it.
    if (amount > this.spendableLuck || this.spendableLuck - amount <= 0) return [];

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
            formula: (acc.groups[affliction.priority].type === "both" && result.damage?.type === "healing" && result.damage.formula) ? `(${result.damage.formula}) * -1` : result.damage?.formula,
            affliction,
          });
          if (result.damage?.type) {
            if (
              acc.groups[affliction.priority].type &&
              acc.groups[affliction.priority].type !== result.damage.type
            ) {
              if (acc.groups[affliction.priority].type === "damage") {
                const entry = acc.groups[affliction.priority].afflictions.at(-1)!
                entry.formula = `(${entry.formula}) * -1`;
              }
              else {
                for (const entry of acc.groups[affliction.priority].afflictions) {
                  entry.formula = `(${entry.formula}) * -1`;
                }
              }
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

    const sizePenalty = (() => {
      const target = context.target?.actor;
      if (!target) return null;
      const difference = target.size.difference(context.self.actor.size)
      if (difference >= 2) return new ModifierPTR2e({
        label: "PTR2E.Modifiers.size",
        slug: `size-penalty-unicqi-${appliesTo ?? fu.randomID()}`,
        modifier: difference >= 4 ? 2 : 1,
        method: "stage",
        type: "accuracy",
        appliesTo: appliesTo ? new Map([[appliesTo, true]]) : null,
      });
      if (difference <= -2) return new ModifierPTR2e({
        label: "PTR2E.Modifiers.size",
        slug: `size-penalty-unicqi-${appliesTo ?? fu.randomID()}`,
        modifier: difference <= -4 ? -2 : -1,
        method: "stage",
        type: "accuracy",
        appliesTo: appliesTo ? new Map([[appliesTo, true]]) : null,
      });
      return null;
    })();
    if (sizePenalty) context.self.modifiers.push(sizePenalty);

    const evasionStages = context.target?.actor?.evasionStage ?? 0;
    if (evasionStages !== 0 && !omittedSubrolls.has("accuracy")) {
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

    if (targetToken?.actor && selfToken?.actor) {
      const targetMarks = targetToken.actor.synthetics.tokenTags.get(selfToken.document.uuid);
      const originMarks = selfToken.actor.synthetics.tokenTags.get(targetToken.document.uuid);
      if (targetMarks) params.options.add(`target:mark:${targetMarks}`);
      if (originMarks) params.options.add(`origin:mark:${originMarks}`);
    }

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

    //TODO: Probably needs similar implementation to selfItem
    const selfAttack = params.attack?.clone();
    selfAttack?.prepareDerivedData();
    const selfAction = params.action;

    const actionTraitEffects = selfAttack?.traits.contents.flatMap(trait => {
      if (!trait.changes?.length) return [];
      const effect = Trait.effectsFromChanges.bind(trait)(this) as ActiveEffectPTR2e<this>;
      if (effect) return effect.toObject() as unknown as EffectSourcePTR2e[];
      return [];
    }) ?? []

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
          [...originEphemeralEffects, ...actionTraitEffects]
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

    // Target roll options
    const getTargetRollOptions = (actor: Maybe<ActorPTR2e>): string[] => {
      const targetOptions = actor?.getSelfRollOptions("target") ?? [];
      if (targetToken) {
        targetOptions.push("target"); // An indicator that there is any kind of target.
      }
      return targetOptions.sort();
    };

    const itemOptions = selfItem?.getRollOptions("item") ?? [];
    const actionOptions = selfAttack?.getRollOptions() ?? [];
    const actionRollOptions = Array.from(new Set([...itemOptions, ...actionOptions, ...getTargetRollOptions(targetToken?.actor)]));

    if (selfAttack) {
      for (const adjustment of selfActor.synthetics.attackAdjustments) {
        adjustment().adjustAttack?.(selfAttack, actionRollOptions);
      }
    }

    const actionTraits = (() => {
      const traits = params.traits?.map((t) => (typeof t === "string" ? t : t.slug)) ?? [];

      if (selfAttack) {
        for (const adjustment of selfActor.synthetics.attackAdjustments) {
          adjustment().adjustTraits?.(selfAttack, traits, actionRollOptions);
        }
      }

      return R.unique(traits).sort();
    })();

    let newFlatModifiers: ModifierPTR2e[] = [];
    if (selfAttack) {
      const actionTraitDomains = actionTraits.map((t) => `${t}-trait-${selfAttack.type}`)
      params.domains = R.unique([...params.domains, ...actionTraitDomains])

      const originalModifiers = params.statistic?.modifiers ?? [];
      const flatModsFromTraitDomains = extractModifiers(this.synthetics, actionTraitDomains);

      // Figure out which are new flat modifiers
      const target = params.target?.actor ?? targetToken?.actor ?? null;
      newFlatModifiers = flatModsFromTraitDomains.filter(
        (mod) => !originalModifiers.some((original) => original.slug === mod.slug)
      ).map(mod => {
        if (target) mod.appliesTo = new Map([[target.uuid, true]]);
        return mod;
      });
    }

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

    const targetDefensiveEffectRolls = await extractEffectRolls({
      affects: "defensive",
      origin: selfActor,
      target: targetToken?.actor ?? null,
      item: selfItem,
      attack: params.attack ?? null,
      action: params.action ?? null,
      domains: params.domains,
      options: [...params.options, ...itemOptions, ...targetRollOptions],
      chanceModifier: (Number(targetToken?.actor?.system?.modifiers?.effectChance) || 0),
      hasSenerenGrace: targetToken?.actor?.rollOptions?.all?.["special:serene-grace"] ?? false
    });

    const targetOriginFlatModifiers = await extractTargetModifiers({
      origin: this,
      target: params.target?.actor ?? targetToken?.actor ?? null,
      item: params.item ?? null,
      attack: params.attack ?? null,
      action: params.action ?? null,
      domains: params.domains,
      options: [...params.options, ...(params.item?.getRollOptions("item") ?? [])],
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
      ? selfAttack.getRangeIncrement(distance, selfActor.size)
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
      modifiers: [
        targetOriginFlatModifiers ?? [],
        newFlatModifiers ?? [],
      ].flat(),
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
      effectRolls: { target: targetEffectRolls, origin: targetOriginEffectRolls, defensive: targetDefensiveEffectRolls },
    };
  }

  public getContextualClone(
    rollOptions: string[],
    ephemeralEffects: EffectSourcePTR2e[]
  ): this {
    const rollOptionsAll = rollOptions.reduce(
      (options: Record<string, boolean>, option: string) => ({ ...options, [option]: true }),
      {}
    );
    const applicableEffects = ephemeralEffects.filter((effect) => !this.isImmuneToEffect(effect));

    return this.clone(
      {
        items: [fu.deepClone(this._source.items)].flat(),
        effects: [fu.deepClone(this._source.effects), applicableEffects].flat(),
        flags: { ptr2e: { rollOptions: { all: rollOptionsAll } } },
      },
      { keepId: true }
    );
  }

  /** Apply effects from an aura: will later be expanded to handle effects from measured templates */
  async applyAreaEffects(aura: AuraData, origin: { actor: ActorPTR2e; token: TokenDocumentPTR2e }, affected: Set<ActorPTR2e>): Promise<void> {
    if (
      game.user !== this.primaryUpdater ||
      origin.token.hidden
    ) {
      return;
    }

    const toCreate: EffectSourcePTR2e[] = [];
    const toUpdate = new Map<string, { _id: string; "flags.ptr2e.aura.amount": number }>();
    const rollOptions = aura.effects.some((e) => e.predicate.length > 0)
      ? new Set([...origin.actor.getRollOptions(), ...this.getSelfRollOptions("target")])
      : new Set([]);

    // Predicate for appliesSelfOnly is checking how many actors in the aura count, not whether it should apply to this actor.
    for (const data of aura.effects.filter(e => e.appliesSelfOnly ? origin.actor === this : e.predicate.test(rollOptions))) {
      const existing = this.appliedEffects.find(e => e.flags?.core?.sourceId === data.uuid) as ActiveEffectPTR2e | undefined;
      if (existing && !data.appliesSelfOnly) continue;

      if (!auraAffectsActor(data, origin.actor, this)) continue;

      const effect = existing ?? await fromUuid(data.uuid);
      if (!((effect instanceof ItemPTR2e && effect.type === "effect") || effect instanceof ActiveEffectPTR2e)) {
        console.warn(`Effect from ${data.uuid} not found`);
        continue;
      }

      const affectedActors = data.appliesSelfOnly ? affected
        .filter(actor => auraAffectsActor({ ...data, appliesSelfOnly: false, includesSelf: false }, origin.actor, actor))
        .filter(actor => {
          const rollOptions = data.predicate.length > 0
            ? new Set([
              ...origin.actor.getRollOptions(),
              ...actor.getSelfRollOptions("target")
            ])
            : new Set([]);
          return data.predicate.test(rollOptions);
        }) : new Set([]);

      if (existing) {
        const current = existing.flags.ptr2e.aura!.amount ?? 0;
        const newAmount = affectedActors.size;
        if (current === newAmount) continue;
        existing.flags.ptr2e.aura!.amount = newAmount;
        toUpdate.set(existing.uuid, { _id: existing.id, "flags.ptr2e.aura.amount": newAmount });
        continue;
      }

      const flags = {
        core: {
          sourceId: data.uuid,
        },
        ptr2e: {
          aura: {
            slug: aura.slug,
            origin: origin.actor.uuid,
            removeOnExit: data.removeOnExit,
            ...(data.appliesSelfOnly ? { amount: affectedActors.size } : {}),
          }
        }
      }

      const effects = (effect instanceof ItemPTR2e ? effect.effects : [effect]) as ActiveEffectPTR2e[];
      const sources = effects.map(e => fu.mergeObject(e.toObject(), { flags }) as unknown as EffectSourcePTR2e);
      toCreate.push(...sources);
    }

    if (toCreate.length > 0) {
      await this.createEmbeddedDocuments("ActiveEffect", toCreate);
    }
    if (toUpdate.size > 0) {
      await this.updateEmbeddedDocuments("ActiveEffect", Array.from(toUpdate.values()));
    }
  }

  isImmuneToEffect(data: ActiveEffectPTR2e | ActiveEffectPTR2e['_source']): boolean {
    const effect = data instanceof ActiveEffectPTR2e ? data : new ActiveEffectPTR2e(data);
    const immunities = this.rollOptions.getFromDomain("immunities");
    if (Object.keys(immunities).length === 0) return false;
    if (effect.traits.has("ignore-immunity")) return false;

    if (effect.traits.has("major-affliction") || effect.traits.has("minor-affliction")) {
      const name = effect.slug === "burn" ? "burned" : effect.slug;
      if (immunities[`affliction:${name}`] && !effect.traits.has(`ignore-immunity-${name}`)) return true;
    }

    for (const trait of effect.traits) {
      if (immunities[`trait:${trait}`] && !effect.traits.has(`ignore-immunity-${trait}`)) return true;
    }

    return false;
  }

  async applyRollEffects(toApply: ActiveEffectPTR2e["_source"][]) {
    const oldEffects = this.effects.filter(e => e.type === "affliction").map(e => e.clone({}, { keepId: true })) as unknown as ActiveEffectPTR2e[];
    const effects = await this.createEmbeddedDocuments("ActiveEffect", toApply) as ActiveEffectPTR2e[];

    const { notApplied, stacksUpdated } = toApply.reduce((acc, e) => {
      const effect = new ActiveEffectPTR2e(e);
      if (effects.some(ae => ae.slug === effect.slug)) {
        return acc;
      }
      const oldEffect = oldEffects.find(oe => oe.slug === effect.slug)
      if (oldEffect) {
        acc.stacksUpdated.push(oldEffect.uuid);
      } else {
        if (effect.type !== "advancement") acc.notApplied.push(effect);
      }
      return acc;
    }, { notApplied: [] as ActiveEffectPTR2e[], stacksUpdated: [] as string[] });

    if (!effects.length && !stacksUpdated.length && !notApplied.length) return;

    await ChatMessage.create({
      content: effects.length
        ? `<p>Applied the following effects to @UUID[${this.uuid}]:</p><ul>` + effects.map(e => `<li>@UUID[${e.uuid}]</li>`).join("") + "</ul>"
        : ""
        + (
          stacksUpdated.length
            ? `<p>The following effects their duration/stacks were updated on @UUID[${this.uuid}]:</p><ul>` + stacksUpdated.map(e => `<li>@UUID[${e}]</li>`).join("") + "</ul>"
            : ""
        )
        + (
          notApplied.length
            ? `<p>The following effects could not be applied to @UUID[${this.uuid}] due to immunities</p><ul>` + notApplied.map(e => `<li>${e.name}</li>`).join("") + "</ul>"
            : ""
        )
    })
  }

  private static getLoafingCount(creature: number, owner: number) {
    function statByLevel(level: number, owner = false) {
      return ((level + (owner ? 2 : 0)) / 100) + 70 + (level + (owner ? 2 : 0)) * ((Math.PI / 10) * Math.log((level + (owner ? 11 : 9)) / Math.PI));
    }

    const statByLevelOwner = statByLevel(owner, true);
    const statByLevelCreature = statByLevel(creature);
    const loafingCount = 1 + Math.floor((25 * (statByLevelCreature - statByLevelOwner)) / statByLevelOwner);

    return Math.clamp(loafingCount, 0, 4);
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
      const folder = game.folders.get(this.system.party.ownerOf) as FolderPTR2e | undefined;
      if (folder?.owner) {
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
      if (folder?.owner && !this.uuid?.endsWith(folder.owner)) {
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

    let newLevel: number | undefined;
    if (changed.system?.advancement?.experience?.current !== undefined) {
      if (this.species?.moves?.levelUp?.length) {
        // Check if level-up occurs
        const newExperience = Number(changed.system.advancement.experience.current);
        const nextExperienceThreshold = this.system.advancement.experience.next;
        if (nextExperienceThreshold && newExperience >= nextExperienceThreshold) {
          const level = newLevel = this.system.getLevel(newExperience);
          const currentLevel = this.system.advancement.level;

          const newMoves = this.species.moves.levelUp.filter(move => move.level > currentLevel && move.level <= level).filter(move => !this.itemTypes.move.some(item => item.slug == move.name));
          if (newMoves.length) {
            const moves = (await Promise.all(newMoves.map(move => fromUuid<ItemPTR2e<MoveSystem>>(move.uuid)))).flatMap(move => move ?? []);
            changed.items ??= [];
            //@ts-expect-error - Asserted that this is an Array.
            changed.items.push(...moves.map(move => move.toObject()));
          }
        }
        else newLevel = this.system.getLevel(newExperience);
      }
    }

    if (this.system.party.partyMemberOf || changed?.system?.party?.partyMemberOf) {
      const owner = this.system.party.partyMemberOf ? this.party?.owner : (() => {
        const party = game.folders.get(changed.system?.party?.partyMemberOf as string) as FolderPTR2e;
        if (!party) return null;
        if (party.owner)
          return fromUuidSync<ActorPTR2e<TSystem, null>>(party.owner);
        return null;
      })()
      if (owner?.hasPlayerOwner) {
        const ownerLevel = owner.system.advancement.level;
        const creatureLevel = newLevel ?? this.system.advancement.level;

        const loafingCount = ActorPTR2e.getLoafingCount(creatureLevel, ownerLevel);

        const loafingEffect = this.effects.get("loafingcondition") as ActiveEffectPTR2e | undefined;
        const currentCount = loafingEffect?.system.stacks ?? 0;

        if (loafingCount !== currentCount) {
          if (loafingEffect) {
            if (loafingCount === 0) {
              await loafingEffect.delete();
            } else {
              await loafingEffect.update({ "system.stacks": loafingCount });
            }
          } else {
            if (loafingCount > 0) {
              const effect = await ActiveEffectPTR2e.fromStatusEffect("loafing");
              const data = effect.clone({ "system.stacks": loafingCount }).toObject();
              data._id = "loafingcondition";
              await this.createEmbeddedDocuments("ActiveEffect", [data], { keepId: true });
            }
          }
        }
      } else {
        const loafingEffect = this.effects.get("loafingcondition") as ActiveEffectPTR2e | undefined;
        if (loafingEffect) {
          await loafingEffect.delete();
        }
      }
    }
    // 
    try {
      const updated = this.clone(changed, { keepId: true, addSource: true });
      await processPreUpdateHooks(updated);
    } catch (err) {
      console.error(err);
    }

    return super._preUpdate(changed, options, user);
  }

  protected override _onUpdate(
    changed: DeepPartial<this["_source"]>,
    options: DocumentUpdateContext<TParent>,
    userId: string
  ): void {
    super._onUpdate(changed, options, userId);

    // if (game.ptr.web.actor === this) game.ptr.web.refresh({ nodeRefresh: true });
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
    // if (game.ptr.web.actor === this) await game.ptr.web.refresh({ nodeRefresh: true });
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

    // const updates = [];
    // const originalRoot = this.originalRoot;
    // if (!originalRoot) throw new Error("No original root found.");
    // // const originalRootNode = game.ptr.web.collection.getName(originalRoot.slug, {
    // //   strict: true,
    // // });

    // // for (const root of this.unconnectedRoots) {
    // //   // const rootNode = game.ptr.web.collection.getName(root.slug, { strict: true });

    // //   // const path = game.ptr.web.collection.graph.getPurchasedPath(originalRootNode, rootNode);
    // //   if (path) {
    // //     updates.push({ _id: root.id, "system.cost": 1 });
    // //   }
    // // }
    // if (updates.length) await this.updateEmbeddedDocuments("Item", updates);
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
    // if (game.ptr.web.actor === this) game.ptr.web.refresh({ nodeRefresh: true });
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
    // if (game.ptr.web.actor === this) game.ptr.web.refresh({ nodeRefresh: true });
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
  _species: SpeciesSystem | null;

  get itemTypes(): Record<string, ItemPTR2e[]>;

  auras: Map<string, AuraData>;

  /** Added as debounced method */
  checkAreaEffects(): void;

  fling: ItemPTR2e<MoveSystem, this>;
}

type ActorFlags2e = ActorFlags & {
  ptr2e: {
    rollOptions: RollOptions & object;
    sheet?: {
      perkFlash?: boolean;
    };
    disableActionOptions?: {
      collection: Collection<ActionPTR2e>;
      get options(): PickableThing[];
      disabled: ActionUUID[];
    }
    editedSkills?: boolean
    skillOptions?: {
      data: (PickableThing & { base: number, investment: number, group?: string })[];
      get all(): PickableThing[];
      get species(): PickableThing[];
    }
    typeOptions?: {
      get options(): PickableThing[],
      get types(): PickableThing[];
    }
  };
};

export default ActorPTR2e;
