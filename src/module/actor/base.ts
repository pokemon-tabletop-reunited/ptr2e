/* eslint-disable no-fallthrough */
import type {
  ActorDimensions,
  ActorSynthetics,
  Attribute,
  AuraData,
} from "@actor";
import type { TypeEffectiveness } from "@scripts/config/effectiveness.ts";
import type { PokemonType, PTRCONSTS } from "@data";
import { RollOptionManager, Trait } from "@data";
import type { RollOptions } from "@module/data/roll-option-manager.ts";
import type AfflictionActiveEffectSystem from "@module/effects/data/affliction.ts";
import { ActionsCollections } from "./actions.ts";
import type { CustomSkill } from "@module/data/models/skill.ts";
import type { BaseStatisticCheck, StatisticCheck } from "@system/statistics/statistic.ts";
import { Statistic } from "@system/statistics/statistic.ts";
import type { CheckContext, CheckContextParams, RollContext, RollContextParams } from "@system/data.ts";
import { extractEffectRolls, extractEphemeralEffects, extractModifiers, extractTargetModifiers, processPreUpdateHooks } from "src/util/change-helpers.ts";
import * as R from "remeda";
import { ModifierPTR2e } from "@module/effects/modifiers.ts";
import { preImportJSON } from "@module/data/doc-helper.ts";
import type SpeciesSystem from "@item/data/species.ts";
import type { PickableThing } from "@module/apps/pick-a-thing-prompt.ts";
import { ActorSizePTR2e } from "./data/size.ts";
import { auraAffectsActor, checkAreaEffects } from "./helpers.ts";
import type { DeepPartial } from "fvtt-types/utils";
import { sluggify } from "@utils";
// import type { InexactPartial } from "fvtt-types/utils";
// import { MigrationRunnerBase } from "@module/migration/runner/base.ts";
// import { MigrationList, MigrationRunner } from "@module/migration/index.ts";
// import type { AnyDocument } from "node_modules/fvtt-types/src/foundry/client/data/abstract/client-document.d.mts";

interface ActorParty {
  owner: ActorPTR2e | null;
  party: ActorPTR2e[];
}

class ActorPTR2e extends Actor {
  /** Has this document completed `DataModel` initialization? */
  declare initialized: boolean;

  constructor(data: Actor.ConstructorData, context?: foundry.abstract.DataModel.DataValidationOptions<ActorPTR2e>) {
    super(data, context);

    Object.defineProperties(this, {
      // Prevent object-recursing code from getting into `_itemTypes`,
      _itemTypes: {
        configurable: false,
        enumerable: false,
      },
      // Add debounced checkAreaEffects method
      checkAreaEffects: {
        value: foundry.utils.debounce(checkAreaEffects, 50),
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

  get originalRoot(): PTR.Item.System.Perk.ParentInstance | null {
    return (
      (this.itemTypes.perk as PTR.Item.System.Perk.ParentInstance[]).find(
        (p) => p.system.cost === 0 && p.system.nodes[0]?.type === "root"
      ) ?? null
    );
  }

  get unconnectedRoots(): PTR.Item.System.Perk.ParentInstance[] {
    return (this.itemTypes.perk as PTR.Item.System.Perk.ParentInstance[]).filter(
      (p) => p.system.cost === 5 && p.system.nodes[0]?.type === "root"
    );
  }

  get perks(): Map<string, PTR.Item.System.Perk.ParentInstance> {
    return (
      this._perks ??
      (this._perks = (this.itemTypes.perk as PTR.Item.System.Perk.ParentInstance[]).reduce((acc, perk) => {
        acc.set(perk.system.originSlug ?? perk.slug, perk);
        if (perk.flags?.ptr2e?.tierSlug) acc.set(perk.flags.ptr2e.tierSlug + "", perk);
        return acc;
      }, new Map<string, PTR.Item.System.Perk.ParentInstance>()))
    );
  }

  get combatant(): Combatant.ConfiguredInstance | null {
    const combatants = (game.combat as Combat.ConfiguredInstance | undefined)?.combatants.filter(
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
    return this._species ??= (this.items.get("actorspeciesitem")?.system as Maybe<SpeciesSystem>) ?? this.system.species as unknown as SpeciesSystem ?? null;
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
  get primaryUpdater(): User.ConfiguredInstance | null {
    // 1. The first active GM, sorted by ID
    const { activeGM } = game.users;
    if (activeGM) return activeGM;

    const activeUsers = game.users.filter((u: User.ConfiguredInstance) => u.active);
    // 2. The user with this actor assigned
    const primaryPlayer = this.isToken ? null : activeUsers.find((u: User.ConfiguredInstance) => u.character?.id === this.id);
    if (primaryPlayer) return primaryPlayer;

    // 3. Anyone who can update the actor
    const firstUpdater = game.users
      .filter((u: User.ConfiguredInstance) => this.canUserModify(u, "update"))
      .sort((a: User.ConfiguredInstance, b: User.ConfiguredInstance) => (a.id! > b.id! ? 1 : -1))
      .shift();
    return firstUpdater ?? null;
  }

  get party(): ActorParty | null {
    if (!this.folder) return null;

    return (this._party ??= ((): ActorParty | null => {
      const owner = ((): ActorPTR2e | null => {
        if (this.folder?.owner)
          return fromUuidSync<ActorPTR2e>(this.folder.owner as ActorUUID) as ActorPTR2e
        return null;
      })();
      const party = ((): ActorPTR2e[] => {
        const uuid = (() => {
          if (this.parent instanceof CONFIG.Token.documentClass) {
            return this.parent.baseActor?.uuid ?? this.uuid;
          }
          return this.uuid;
        })();

        if (this.folder?.isFolderOwner(uuid) || this.folder?.isInParty(uuid))
          return this.folder.party.flatMap((u) =>
            u === uuid
              ? (this as ActorPTR2e)
              : fromUuidSync(u) as ActorPTR2e ?? []
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
    options?: Omit<foundry.abstract.DataModel.DataValidationOptions, "parent">
  ): Actor.Source {

    if (data && '_stats' in data && data._stats && typeof data._stats === 'object' && 'systemId' in data._stats && data._stats.systemId === "ptu") {
      data.type = "ptu-actor";

      for (const item of data.items as Item.ConfiguredInstance[]) {
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
        flush: foundry.utils.debounce(() => {
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

    //@ts-expect-error - Getter is added seperately.
    this.flags.ptr2e.disableActionOptions = {
      collection: new Collection(),
      disabled: []
    }
    Object.defineProperty(this.flags.ptr2e!.disableActionOptions, "options", {
      get: () => {
        return this.flags.ptr2e!.disableActionOptions!.collection.filter(action => {
          if (!(action instanceof CONFIG.PTR.models.actions.attack)) return true;
          const attack = action as unknown as PTR.Models.Action.Models.Attack.Instance;
          return attack.free ? true : attack.slot ? this.attacks.actions[attack.slot] === attack : attack.free;
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

    for (const ability of this.itemTypes.ability as PTR.Item.System.Ability.ParentInstance[]) {
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
      { name, slug, power = 25, accuracy = 100, types = ["untyped"] as const, free = false, variant = true, description = "", id = "" }:
        { name?: string, slug?: string, power?: number, accuracy?: number, types?: PokemonType[], free?: boolean, variant?: boolean, description?: string, id?: string }
        = { name: "", slug: "", power: 25, accuracy: 100, types: ["untyped"] as const, free: false, variant: true, description: "", id: "" }
    ): DeepPartial<PTR.Models.Action.Models.Attack.Source> {
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
      "type": "move" as const,
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
    for (const item of this.items?.contents as unknown as Item.ConfiguredInstance[]) {
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

    const existing = this.items.get(data._id) as Maybe<Item.ConfiguredInstance>;
    if (existing) {
      existing.updateSource(data);
      existing.reset();
      this.fling = existing;
    }
    else {
      this.fling = new CONFIG.Item.documentClass(data, { parent: this }) as PTR.Item.System.Move.ParentInstance;
    }

    this.items.set(this.fling.id!, this.fling);
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
    const changes: PTR.ActiveEffect.Changes.Source[] = [];
    // Afflictions don't always have changes, so we need to track them separately
    const afflictions: ActiveEffect.ConfiguredInstance[] = [];
    for (const effect of this.allApplicableEffects() as unknown as Generator<
      ActiveEffect.ConfiguredInstance,
      void,
      void
    >) {
      if (!effect.active) continue;
      changes.push(
        ...effect.system.changes.map((change: PTR.ActiveEffect.Changes.Instance) => {
          const c = foundry.utils.deepClone(change) as PTR.ActiveEffect.Changes.Source;
          c.priority = c.priority ?? c.mode! * 10;
          return c;
        })
      );
      for (const statusId of effect.statuses) this.statuses.add(statusId);
      if (!effect.system.changes.length && effect.type === "affliction")
        afflictions.push(
          effect as ActiveEffect.ConfiguredInstance
        );
    }
    changes.sort((a, b) => a.priority! - b.priority!);

    // Apply all changes
    for (const change of changes) { //@ts-expect-error - FIXME: Based on the above code this seems to be source, however the code clearly expects an Instance, I'm very confused how this functions, and I wrote it myself!
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

  override *allApplicableEffects(): Generator<ActiveEffect.ConfiguredInstance> {
    if (game.ready) {
      const combatant = this.combatant;
      if (combatant) {
        const summons = combatant.parent?.summons;
        if (summons?.length) {
          for (const summon of summons) {
            for (const effect of summon.system.getApplicableEffects(this)) {
              yield new CONFIG.ActiveEffect.documentClass(effect.toObject(), { parent: this });
            }
          }
        }
      }
    }
    for (const trait of this.traits) {
      if (!trait.changes?.length) continue;
      const effect = Trait.effectsFromChanges.bind(trait)(this) as ActiveEffect.ConfiguredInstance;
      if (effect) yield effect;
    }
    yield* super.allApplicableEffects() as Generator<ActiveEffect.ConfiguredInstance>
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
    const effects: ActiveEffect.ConfiguredInstance[] = [];
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

  getDefenseStat(attack: { category: PTR.Models.Action.Models.Attack.Instance["category"], defensiveStat: PTRCONSTS.Stat | null }, isCrit: boolean) {
    const stat: PTRCONSTS.Stat = attack.defensiveStat ?? (attack.category === "physical" ? "def" : "spd");
    return this.calcStatTotal(this.system.attributes[stat], isCrit);
  }

  getAttackStat(attack: { category: PTR.Models.Action.Models.Attack.Instance["category"], offensiveStat: PTRCONSTS.Stat | null }) {
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
          await CONFIG.ChatMessage.documentClass.create(
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
      await CONFIG.ChatMessage.documentClass.create({
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

    const effect = await fromUuid<ActiveEffect.ConfiguredInstance>(effectUuid, { relative: this });
    const change = effect?.changes.find(
      (c: PTR.ActiveEffect.Changes.Instance): c is PTR.ActiveEffect.Changes.Models.RollOption.Instance =>
        c instanceof CONFIG.PTR.models.changes["roll-option"] && c.domain === domain && c.option === option,
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
  ) {
    if (attribute === "health") {
      if (value >= 0) value = Math.floor(value);
      if (value < 0) value = Math.ceil(value);
    }
    if (isDelta && value != 0 && attribute === "health") {
      await this.applyDamage(value * -1);
      return this;
    }
    return super.modifyTokenAttribute(attribute, value, !!isDelta, !!isBar);
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

  async getUnderdogPerks(): Promise<PTR.Item.System.Perk.ParentInstance[]> {
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
    }) as PTR.Item.System.Perk.ParentInstance[];
    const webs = new Set([this.species!.evolutions?.uuid ?? this.species!.parent.flags?.core?.sourceId ?? []].flat());
    const baseConnection = `evolution-${this.species!.evolutions?.name ?? this.species!.parent.slug}`;
    return underdogPerks.map(perk => perk.clone({ "system.webs": webs, "system.nodes": perk.system._source.nodes.map(node => ({ ...node, connected: [baseConnection, ...node.connected] })) }));
  }

  isHumanoid(): this is ActorPTR2e {
    return this.traits.has("humanoid");
  }

  isPokemon(): this is ActorPTR2e {
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
      toUpdate: Partial<ActiveEffect.ConstructorData>[];
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

    const updates: DeepPartial<PTR.Actor.Source> = {};
    const validAfflictionUpdates = afflictions.toUpdate.filter((update) => update._id);
    if (validAfflictionUpdates.length > 0)
      //@ts-expect-error - Circularity based error
      updates.effects = validAfflictionUpdates as ActiveEffect.ConstructorData[];

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
    if (!foundry.utils.isEmpty(updates)) {
      await this.update(updates);
      if (newHealth !== oldHealth) {
        await CONFIG.ChatMessage.documentClass.create({
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
      await CONFIG.ChatMessage.documentClass.create({
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
    const output: string[] = [];

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
      (s) => (s as ActiveEffect.ConfiguredInstance).system.removeAfterCombat
    );
    this.deleteEmbeddedDocuments(
      "ActiveEffect",
      applicable.map((s) => s.id)
    );
  }

  async getCheckContext<
    TStatistic extends BaseStatisticCheck<unknown, unknown>,
    TItem extends Item.ConfiguredInstance
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
      context.target?.token?.actor?.uuid as ActorUUID | null ??
      (context.target?.actor?.id ? context.target.actor.uuid as ActorUUID : null) ??
      null;

    const rangePenalty = rangeIncrement
      ? new ModifierPTR2e({
        label: "PTR2E.Modifiers.rip",
        slug: `range-penalty-unicqi-${appliesTo ?? foundry.utils.randomID()}`,
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
        slug: `size-penalty-unicqi-${appliesTo ?? foundry.utils.randomID()}`,
        modifier: difference >= 4 ? 2 : 1,
        method: "stage",
        type: "accuracy",
        appliesTo: appliesTo ? new Map([[appliesTo, true]]) : null,
      });
      if (difference <= -2) return new ModifierPTR2e({
        label: "PTR2E.Modifiers.size",
        slug: `size-penalty-unicqi-${appliesTo ?? foundry.utils.randomID()}`,
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
        slug: `evasion-modifier-unicqi-${appliesTo ?? foundry.utils.randomID()}`,
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
          slug: `accuracy-modifier-unicqi-${appliesTo ?? foundry.utils.randomID()}`,
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
          slug: `crit-modifier-unicqi-${appliesTo ?? foundry.utils.randomID()}`,
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
    TItem extends Item.ConfiguredInstance
  >(params: RollContextParams<TStatistic, TItem>): Promise<RollContext<this, TStatistic, TItem>>;
  protected async getRollContext(params: RollContextParams): Promise<RollContext<this>> {
    const [selfToken, targetToken]: [Token.ConfiguredInstance | null, Token.ConfiguredInstance | null] =
      canvas.ready && !params.viewOnly
        ? [
          canvas.tokens!.controlled.find((t) => t.actor === this) ??
          (this.getActiveTokens().shift() as Token.ConfiguredInstance) ??
          null,
          params.target?.token ??
          (params.target?.actor?.getActiveTokens().shift() as Token.ConfiguredInstance) ??
          null,
        ]
        : [null, null];

    if (targetToken?.actor && selfToken?.actor) {
      const targetMarks = targetToken.actor.synthetics.tokenTags.get(selfToken.document.uuid as TokenDocumentUUID);
      const originMarks = selfToken.actor.synthetics.tokenTags.get(targetToken.document.uuid as TokenDocumentUUID);
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

    const selfItem = ((): Item.ConfiguredInstance | null => {
      // 1. Simplest case: no context clone, so used the item passed to this method
      if (selfActor === this) return params.item ?? null;

      // 2. Get the item from the statistic if it's stored therein
      if (
        statistic &&
        "item" in statistic &&
        statistic.item instanceof CONFIG.Item.documentClass &&
        ("actions" in statistic.item.system ||
          ("consumableType" in statistic.item.system &&
            (statistic.item.system as PTR.Item.System.Consumable.Instance).consumableType &&
            (statistic.item.system as PTR.Item.System.Consumable.Instance).consumableType === "pokeball"))
      ) {
        return statistic.item as Item.ConfiguredInstance
      }

      // 3. Get the item directly from the context clone
      const itemClone = selfActor.items.get(params.item?.id ?? "") as unknown as
        | Item.ConfiguredInstance
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

    //TODO: Probably needs similar implementation to selfItem
    const selfAttack = params.attack?.clone();
    selfAttack?.prepareDerivedData();
    const selfAction = params.action;

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
        if (target) mod.appliesTo = new Map([[target.uuid as ActorUUID, true]]);
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
      effectRolls: { target: targetEffectRolls, origin: targetOriginEffectRolls },
    };
  }

  protected getContextualClone(
    rollOptions: string[],
    ephemeralEffects: PTR.ActiveEffect.Source[]
  ): this {
    const rollOptionsAll = rollOptions.reduce(
      (options: Record<string, boolean>, option: string) => ({ ...options, [option]: true }),
      {}
    );
    const applicableEffects = ephemeralEffects.filter((effect) => !this.isImmuneToEffect(effect));

    return this.clone(
      {
        items: [foundry.utils.deepClone(this._source.items)].flat(),
        effects: [foundry.utils.deepClone(this._source.effects), applicableEffects].flat(),
        flags: { ptr2e: { rollOptions: { all: rollOptionsAll } } },
      },
      { keepId: true }
    );
  }

  /** Apply effects from an aura: will later be expanded to handle effects from measured templates */
  async applyAreaEffects(aura: AuraData, origin: { actor: ActorPTR2e; token: TokenDocument.ConfiguredInstance }, affected: Set<ActorPTR2e>): Promise<void> {
    if (
      game.user !== this.primaryUpdater ||
      origin.token.hidden
    ) {
      return;
    }

    const toCreate: PTR.ActiveEffect.Source[] = [];
    const toUpdate = new Map<string, { _id: string; "flags.ptr2e.aura.amount": number }>();
    const rollOptions = aura.effects.some((e) => e.predicate.length > 0)
      ? new Set([...origin.actor.getRollOptions(), ...this.getSelfRollOptions("target")])
      : new Set([]);

    // Predicate for appliesSelfOnly is checking how many actors in the aura count, not whether it should apply to this actor.
    for (const data of aura.effects.filter(e => e.appliesSelfOnly ? origin.actor === this : e.predicate.test(rollOptions))) {
      const existing = this.appliedEffects.find(e => e.flags?.core?.sourceId === data.uuid) as ActiveEffect.ConfiguredInstance | undefined;
      if (existing && !data.appliesSelfOnly) continue;

      if (!auraAffectsActor(data, origin.actor, this)) continue;

      const effect = existing ?? await fromUuid<ActiveEffect.ConfiguredInstance>(data.uuid);
      if (!((effect instanceof CONFIG.Item.documentClass && effect.type === "effect") || effect instanceof CONFIG.ActiveEffect.documentClass)) {
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

      const effects = (effect instanceof CONFIG.Item.documentClass ? effect.effects : [effect]) as ActiveEffect.ConfiguredInstance[];
      const sources = effects.map(e => foundry.utils.mergeObject(e.toObject(), { flags }) as unknown as PTR.ActiveEffect.Source);
      toCreate.push(...sources);
    }

    if (toCreate.length > 0) {
      await this.createEmbeddedDocuments("ActiveEffect", toCreate);
    }
    if (toUpdate.size > 0) {
      await this.updateEmbeddedDocuments("ActiveEffect", Array.from(toUpdate.values()));
    }
  }

  isImmuneToEffect(data: ActiveEffect.ConfiguredInstance | ActiveEffect.ConstructorData): boolean {
    const effect = data instanceof CONFIG.ActiveEffect.documentClass ? data : new CONFIG.ActiveEffect.documentClass(data);
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

  async applyRollEffects(toApply: ActiveEffect.ConstructorData[]) {
    const oldEffects = this.effects.filter(e => e.type === "affliction").map(e => e.clone({}, { keepId: true })) as unknown as ActiveEffect.ConfiguredInstance[];
    const effects = await this.createEmbeddedDocuments("ActiveEffect", toApply) as ActiveEffect.ConfiguredInstance[];

    const { notApplied, stacksUpdated } = toApply.reduce((acc, e) => {
      const effect = new CONFIG.ActiveEffect.documentClass(e);
      if (effects.some(ae => ae.slug === effect.slug)) {
        return acc;
      }
      const oldEffect = oldEffects.find(oe => oe.slug === effect.slug)
      if (oldEffect) {
        acc.stacksUpdated.push(oldEffect.uuid);
      } else {
        acc.notApplied.push(effect);
      }
      return acc;
    }, { notApplied: [] as ActiveEffect.ConfiguredInstance[], stacksUpdated: [] as string[] });

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

  // static override async createDocuments<T extends foundry.abstract.Document.AnyConstructor, Temporary extends boolean | undefined>(
  //   this: T,
  //   data: Actor.ConstructorData[],
  //   operation?: Record<string, unknown> & {
  //     temporary?: Temporary;
  //   }
  // ): Promise<foundry.abstract.Document.ToStoredIf<T, Temporary>[] | undefined> {
  //   const sources = data.map((d) => (d instanceof CONFIG.Actor.documentClass ? d.toObject() : d));

  //   for (const source of [...sources]) {
  //     if (!["flags", "items", "system"].some((k) => k in source)) {
  //       // The actor has no migratable data: set schema version and return early
  //       source.system = {
  //         _migration: { version: MigrationRunnerBase.LATEST_SCHEMA_VERSION },
  //       };
  //     }
  //     const lowestSchemaVersion = Math.min(
  //       (source.system as { _migration?: { version?: number } })?._migration?.version ?? MigrationRunnerBase.LATEST_SCHEMA_VERSION,
  //       ...((source.items ?? []) as PTR.Item.Source[]).map(
  //         (i) =>
  //           (i?.system as unknown as PTR.Item.ItemSystemPTR)?._migration?.version ??
  //           MigrationRunnerBase.LATEST_SCHEMA_VERSION
  //       )
  //     );

  //     const tokenDefaults = foundry.utils.deepClone(game.settings.get("core", "defaultToken"));
  //     const actor = new CONFIG.Actor.documentClass(foundry.utils.mergeObject({ prototypeToken: tokenDefaults }, source));
  //     await MigrationRunner.ensureSchemaVersion(
  //       actor,
  //       MigrationList.constructFromVersion(lowestSchemaVersion)
  //     );

  //     sources.splice(sources.indexOf(source), 1, actor.toObject());
  //   }

  //   return super.createDocuments(sources, operation) as Promise<foundry.abstract.Document.ToStoredIf<T, Temporary>[] | undefined>;
  // }

  // static override async createDialog(
  //   data: Record<string, unknown> = {},
  //   context: Record<string, unknown> & {
  //     parent?: AnyDocument;
  //     pack: string | null;
  //   } &
  //     InexactPartial<
  //       DialogOptions & {
  //         perksOnly?: boolean;
  //         types?: string[];
  //       }
  //     > = { pack: null }) {
  //   if (!Array.isArray(context.types)) context.types = this.TYPES.filter(t => t !== "ptu-actor");
  //   else {
  //     if (context.types.length) context.types = context.types.filter(t => t !== "ptu-actor");
  //     else context.types = this.TYPES.filter(t => t !== "ptu-actor");
  //   }
  //   if (context.pack === undefined) context.pack = null;
  //   return super.createDialog(data, context);
  // }

  // protected override _onEmbeddedDocumentChange(): void {
  //   super._onEmbeddedDocumentChange();

  //   // Send any accrued warnings to the console
  //   this.synthetics.preparationWarnings.flush();
  // }

  // // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // override async _preCreate(data: foundry.data.fields.SchemaField.AssignmentType<Actor.Schema>, options: foundry.abstract.Document.PreCreateOptions<any>, user: User): Promise<boolean | void> {
  //   const result = await super._preCreate(data, options, user);
  //   if (result === false) return false;
  //   if (this.type === 'ptu-actor') throw new Error("PTU Actors cannot be created directly.");
  //   if (options.fail === true) return false;

  //   if (this.system.party.ownerOf) {
  //     const folder = game.folders.get(this.system.party.ownerOf) as Folder.ConfiguredInstance;
  //     if (folder.owner) {
  //       throw new Error("Cannot create an actor that owns a party folder already owned by another actor.");
  //     }
  //   }
  // }

  // override async _preUpdate(
  //   changed: PTR.Actor.SourceWithSystem,
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   options: foundry.abstract.Document.PreUpdateOptions<any>,
  //   user: User
  // ): Promise<boolean | void> {
  //   if (!changed) return false;
  //   if (changed.system?.party?.ownerOf) {
  //     const folder = game.folders.get(changed.system.party.ownerOf as string) as Folder.ConfiguredInstance;
  //     if (folder?.owner && !this.uuid?.endsWith(folder.owner)) {
  //       throw new Error("Cannot change the owner of a party folder to an actor that does not own it. Please remove the current party owner first.");
  //     }
  //   }

  //   if (changed.system?.health?.value !== undefined) {
  //     const fainted = this.effects.get("faintedcondition") !== undefined;
  //     if ((changed.system.health.value as number) <= 0 && !fainted) {
  //       const effects: ActiveEffect.ConstructorData[] = [];
  //       effects.push(
  //         (
  //           await CONFIG.ActiveEffect.documentClass.fromStatusEffect("dead")
  //         ).toObject() as ActiveEffect.ConstructorData
  //       );

  //       const weary = this.effects.get("wearycondition00") as
  //         | ActiveEffect.ConfiguredInstance
  //         | undefined;
  //       if (!weary) {
  //         effects.push(
  //           (
  //             await CONFIG.ActiveEffect.documentClass.fromStatusEffect("weary")
  //           ).toObject() as ActiveEffect.ConstructorData
  //         );
  //       } else {
  //         await weary.update({ "system.stacks": weary.system.stacks + 1 });
  //       }

  //       await this.createEmbeddedDocuments("ActiveEffect", effects, { keepId: true });
  //     } else if ((changed.system.health.value as number) > 0 && fainted) {
  //       await this.deleteEmbeddedDocuments("ActiveEffect", ["faintedcondition"]);
  //     }
  //   }

  //   if (changed.system?.advancement?.experience?.current !== undefined) {
  //     const next = this.system.advancement.experience.next;
  //     if (next && Number(changed.system.advancement.experience.current) >= next) {
  //       changed.flags ??= {};
  //       changed.flags.ptr2e ??= {};
  //       changed.flags.ptr2e.sheet ??= {};
  //       changed.flags.ptr2e.sheet.perkFlash = true;
  //     }
  //   }

  //   if (changed.system?.shield !== undefined) {
  //     if (
  //       typeof changed.system.shield.value === "number" &&
  //       changed.system.shield.value > this.system.shield.value
  //     ) {
  //       changed.system.shield.max ??= changed.system.shield.value;
  //     } else if (changed.system.shield.value === 0) {
  //       changed.system.shield.max = 0;
  //     }
  //   }

  //   if (changed.system?.traits !== undefined && this.system?.traits?.suppressedTraits?.size) {
  //     if (changed.system.traits instanceof Set) {
  //       changed.system.traits = Array.from(changed.system.traits);
  //     }
  //     else if (!Array.isArray(changed.system.traits)) {
  //       //@ts-expect-error - During an update this should be an array
  //       if (changed.system.traits instanceof Collection) changed.system.traits = [...changed.system.traits];
  //       else changed.system.traits = [];
  //     }

  //     const suppressedTraits = this.system.traits.suppressedTraits;
  //     const sourceTraits = this.system._source.traits!;
  //     const intersection = sourceTraits.filter(trait => suppressedTraits.has(trait));
  //     if (intersection.length) {
  //       changed.system.traits = Array.from(new Set([...changed.system.traits, ...intersection]))
  //     }
  //   }

  //   if (changed.system?.advancement?.experience?.current !== undefined) {
  //     if (this.species?.moves?.levelUp?.length) {
  //       // Check if level-up occurs
  //       const newExperience = Number(changed.system.advancement.experience.current);
  //       const nextExperienceThreshold = this.system.advancement.experience.next;
  //       if (nextExperienceThreshold && newExperience >= nextExperienceThreshold) {
  //         const level = this.system.getLevel(newExperience);
  //         const currentLevel = this.system.advancement.level;

  //         const newMoves = this.species.moves.levelUp.filter(move => move.level > currentLevel && move.level <= level).filter(move => !this.itemTypes.move.some(item => item.slug == move.name));
  //         if (newMoves.length) {
  //           const moves = (await Promise.all(newMoves.map(move => fromUuid<PTR.Item.System.Move.ParentInstance>(move.uuid)))).flatMap((move) => move ?? []);
  //           changed.items ??= [];
  //           //@ts-expect-error - Asserted that this is an Array.
  //           changed.items.push(...moves.map(move => move.toObject()));
  //         }
  //       }
  //     }
  //   }

  //   // 
  //   try {
  //     const updated = this.clone(changed, { keepId: true, addSource: true });
  //     await processPreUpdateHooks(updated);
  //   } catch (err) {
  //     console.error(err);
  //   }

  //   return super._preUpdate(changed, options, user);
  // }

  // protected override _onUpdate(
  //   changed: foundry.data.fields.SchemaField.InnerAssignmentType<Actor.Schema>,
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   options: foundry.abstract.Document.OnUpdateOptions<any>,
  //   userId: string
  // ): void {
  //   super._onUpdate(changed, options, userId);

  //   // if (game.ptr.web.actor === this) game.ptr.web.refresh({ nodeRefresh: true });
  // }

  // protected override async _onCreateDescendantDocuments(
  //   parent: ClientDocument,
  //   collection: "effects" | "items",
  //   documents: ActiveEffect.ConfiguredInstance[] | Item.ConfiguredInstance[],
  //   results: ActiveEffect.ConstructorData[] | Item.ConstructorData[],
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   options: foundry.abstract.Document.OnCreateOptions<any> & InexactPartial<{ render: boolean }>,
  //   userId: string
  // ) {
  //   super._onCreateDescendantDocuments(parent, collection, documents, results, options, userId);
  //   // if (game.ptr.web.actor === this) await game.ptr.web.refresh({ nodeRefresh: true });
  //   if (!this.unconnectedRoots.length) return;

  //   function isEffect(
  //     collection: "effects" | "items",
  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     _documents: any[]
  //   ): _documents is ActiveEffect.ConfiguredInstance[] {
  //     return collection === "effects";
  //   }
  //   if (isEffect(collection, documents)) return;

  //   const perks = (documents as Item.ConfiguredInstance[]).filter((d) => d.type === "perk") as PTR.Item.System.Perk.ParentInstance[];
  //   if (!perks.length) return;

  //   // const updates = [];
  //   // const originalRoot = this.originalRoot;
  //   // if (!originalRoot) throw new Error("No original root found.");
  //   // // const originalRootNode = game.ptr.web.collection.getName(originalRoot.slug, {
  //   // //   strict: true,
  //   // // });

  //   // // for (const root of this.unconnectedRoots) {
  //   // //   // const rootNode = game.ptr.web.collection.getName(root.slug, { strict: true });

  //   // //   // const path = game.ptr.web.collection.graph.getPurchasedPath(originalRootNode, rootNode);
  //   // //   if (path) {
  //   // //     updates.push({ _id: root.id, "system.cost": 1 });
  //   // //   }
  //   // // }
  //   // if (updates.length) await this.updateEmbeddedDocuments("Item", updates);
  // }

  // protected override _onDeleteDescendantDocuments(
  //   parent: ClientDocument,
  //   collection: "effects" | "items",
  //   documents: ClientDocument[],
  //   ids: string[],
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   options: foundry.abstract.Document.OnDeleteOptions<any> & InexactPartial<{ render: boolean }>,
  //   userId: string
  // ): void {
  //   super._onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId);
  //   // if (game.ptr.web.actor === this) game.ptr.web.refresh({ nodeRefresh: true });
  // }

  // protected override _onUpdateDescendantDocuments(
  //   parent: ClientDocument,
  //   collection: "effects" | "items",
  //   documents: ClientDocument[], //ActiveEffect.ConfiguredInstance[] | Item.ConfiguredInstance[],
  //   changes: ActiveEffect.ConstructorData[] | Item.ConstructorData[],
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   options: foundry.abstract.Document.OnUpdateOptions<any> & InexactPartial<{ render: boolean }>,
  //   userId: string
  // ): void {
  //   super._onUpdateDescendantDocuments(parent, collection, documents, changes, options, userId);
  //   // if (game.ptr.web.actor === this) game.ptr.web.refresh({ nodeRefresh: true });
  // }

  override async toggleStatusEffect(
    statusId: string,
    { active, overlay = false, all = false, }: { active?: boolean; overlay?: boolean; all?: boolean } = {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    const status = CONFIG.statusEffects.find((e) => e.id === statusId);
    if (!status)
      throw new Error(`Invalid status ID "${statusId}" provided to Actor#toggleStatusEffect`);
    const existing: string[] = [];

    // Find the effect with the static _id of the status effect
    if (status._id) {
      const effect = this.effects.get(status._id as string);
      if (effect) existing.push(effect.id);
    }

    // If no static _id, find all single-status effects that have this status
    else {
      for (const effect of this.effects) {
        const statuses = effect.statuses;
        if (statuses.size === 1 && statuses.has(status.id)) existing.push(effect.id);
      }
    }

    if ((status.system as PTR.ActiveEffect.SystemSource)?.stacks) {
      const slug = sluggify(game.i18n.localize(status.name!));
      for (const id of existing) {
        const effect = this.effects.get(id) as ActiveEffect.ConfiguredInstance
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
    const effect = await CONFIG.ActiveEffect.documentClass.fromStatusEffect(statusId);
    if (overlay) effect.updateSource({ "flags.core.overlay": true });
    return CONFIG.ActiveEffect.documentClass.create(effect.toObject(), { parent: this, keepId: true });
  }

  hasStatus(statusId: string): boolean {
    const status = CONFIG.statusEffects.find((e) => e.id === statusId);
    if (!status)
      throw new Error(`Invalid status ID "${statusId}" provided to ActorPTR2e#hasStatus`);

    // Find the effect with the static _id of the status effect
    if (status._id) {
      const effect = this.effects.get(status._id as string);
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
      (s) => (s as ActiveEffect.ConfiguredInstance).system.removeAfterCombat || (s as ActiveEffect.ConfiguredInstance).system.removeOnRecall
    );
    await this.deleteEmbeddedDocuments(
      "ActiveEffect",
      applicable.map((s) => s.id!)
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

interface ActorPTR2e extends Actor {
  system: PTR.Actor.SystemInstance;

  _party: ActorParty | null;

  health: {
    percent: number;
  };

  synthetics: ActorSynthetics;

  _actions: ActionsCollections;
  _perks: Map<string, PTR.Item.System.Perk.ParentInstance> | null;

  rollOptions: RollOptionManager<this>;

  attacks: {
    slots: number;
    actions: Record<number, PTR.Models.Action.Models.Attack.Instance>;
    available: PTR.Models.Action.Models.Attack.Instance[];
  };

  abilities: {
    slots: 1 | 2 | 3 | 4;
    entries: Record<number, PTR.Item.System.Ability.ParentInstance>;
    available: PTR.Item.System.Ability.ParentInstance[];
    free: PTR.Item.System.Ability.ParentInstance[];
  }

  skills: Record<string, Statistic>;
  _species: SpeciesSystem | null;

  // get itemTypes(): Record<string, Item.ConfiguredInstance[]>;

  auras: Map<string, AuraData>;

  /** Added as debounced method */
  checkAreaEffects(): void;

  fling: PTR.Item.System.Move.ParentInstance;
}

export default ActorPTR2e;
