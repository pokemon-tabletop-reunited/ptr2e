import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import {
    ActorSheetPTR2e,
    ActorSynthetics,
    ActorSystemPTR2e,
    Attribute,
    HumanoidActorSystem,
    PokemonActorSystem,
} from "@actor";
import { ActiveEffectPTR2e, EffectSourcePTR2e } from "@effects";
import { TypeEffectiveness } from "@scripts/config/effectiveness.ts";
import { AttackPTR2e, PokemonType, RollOptionManager } from "@data";
import { ActorFlags } from "types/foundry/common/documents/actor.js";
import type { RollOptions } from "@module/data/roll-option-manager.ts";
import FolderPTR2e from "@module/folder/document.ts";
import { CombatantPTR2e, CombatPTR2e } from "@combat";
import AfflictionActiveEffectSystem from "@module/effects/data/affliction.ts";
import { ChatMessagePTR2e } from "@chat";
import { ItemPTR2e, ItemSystemsWithActions, MovePTR2e } from "@item";
import { ActionsCollections } from "./actions.ts";
import { CustomSkill } from "@module/data/models/skill.ts";
import { BaseStatisticCheck, Statistic } from "@system/statistics/statistic.ts";
import { CheckContext, CheckContextParams, RollContext, RollContextParams } from "@system/data.ts";
import { extractEphemeralEffects } from "src/util/rule-helpers.ts";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import * as R from "remeda";
import { ModifierPTR2e } from "@module/effects/modifiers.ts";

type ActorParty = {
    owner: ActorPTR2e<ActorSystemPTR2e, null> | null;
    party: ActorPTR2e<ActorSystemPTR2e, null>[];
};

class ActorPTR2e<
    TSystem extends ActorSystemPTR2e = ActorSystemPTR2e,
    TParent extends TokenDocumentPTR2e | null = TokenDocumentPTR2e | null,
> extends Actor<TParent, TSystem> {
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

    get combatant(): CombatantPTR2e | null {
        const combatants = (game.combat as CombatPTR2e | undefined)?.combatants.filter(
            (c) => c.actorId === this.id && !c.actor?.token
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

    protected override _initializeSource(
        data: any,
        options?: DataModelConstructionOptions<TParent> | undefined
    ): this["_source"] {
        if (data?._stats?.systemId === "ptu") {
            data.type = "ptu-actor";

            for (const item of data.items) {
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
        const preparationWarnings = new Set<string>();
        this.synthetics = {
            ephemeralEffects: {},
            modifierAdjustments: { all: [], damage: [] },
            modifiers: { all: [], damage: [] },
            preparationWarnings: {
                add: (warning: string) => preparationWarnings.add(warning),
                flush: fu.debounce(() => {
                    for (const warning of preparationWarnings) {
                        console.warn(warning);
                    }
                    preparationWarnings.clear();
                }, 10), // 10ms also handles separate module executions
            },
            afflictions: { data: [], ids: new Set() },
            rollNotes: {},
        };

        this._party = null;

        this.rollOptions = new RollOptionManager(this);

        this._actions = new ActionsCollections(this);

        this.attacks = {
            slots: 6,
            actions: Array.fromRange(6).reduce((acc, i) => ({ ...acc, [i]: null }), {}),
            available: [],
        };

        super._initialize();
    }

    /**
     * Step 2 - Prepare data for use by the instance. This method is called automatically by DataModel#_initialize workflow
     * The work done by this method should be idempotent. There are situations in which prepareData may be called more than once.
     * */
    override prepareData() {
        if (this.type === "ptu-actor") return super.prepareData();

        this.rollOptions.addOption("self", `type:${this.type}`);

        this.health = {
            percent: Math.floor(Math.random() * 100),
        };

        this.system.type.effectiveness = this._calculateEffectiveness();
        this.flags;

        super.prepareData();
    }

    /**
     * Step 3 - Prepare data related to this Document itself, before any embedded Documents or derived data is computed.
     * */
    override prepareBaseData() {
        if (this.type === "ptu-actor") return super.prepareBaseData();
        return super.prepareBaseData();
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

            const item = attack.item;
            if (item.type === "move") {
                const move = item as MovePTR2e;
                const primaryAttack = move.system.attack;
                if (
                    primaryAttack.slug !== attack.slug &&
                    primaryAttack.slot !== null &&
                    this.attacks.actions[primaryAttack.slot]?.slug === primaryAttack.slug
                ) {
                    attack.free = true;
                }
            }

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
        for (const effect of this.allApplicableEffects() as Generator<
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
            change.effect.apply(this, change);
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
        const toReturn: Set<string> = new Set();

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
            o.startsWith("self:") && rollOptions.all[o] ? o.replace(/^self/, prefix) : []
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

    //TODO: This should add any relevant modifiers
    getEvasionStage() {
        return this.system.battleStats.evasion.stage;
    }
    //TODO: This should add any relevant modifiers
    getAccuracyStage() {
        return this.system.battleStats.accuracy.stage;
    }

    getDefenseStat(attack: AttackPTR2e, critModifier: number) {
        return attack.category === "physical"
            ? this.calcStatTotal(this.system.attributes.def, critModifier > 1)
            : this.calcStatTotal(this.system.attributes.spd, critModifier > 1);
    }
    getAttackStat(attack: AttackPTR2e, critModifier: number) {
        return attack.category === "physical"
            ? this.calcStatTotal(this.system.attributes.atk, critModifier > 1)
            : this.calcStatTotal(this.system.attributes.spa, critModifier > 1);
    }

    calcStatTotal(stat: Attribute, isCrit: boolean) {
        const stageModifier = () => {
            const stage = Math.clamp(stat.stage, -6, 6);
            return stage > 0 ? (2 + stage) / 2 : 2 / (2 + Math.abs(stage));
        };
        return isCrit ? stat.value : stat.value * stageModifier();
    }

    async applyDamage(damage: number) {
        const damageApplied = Math.min(damage || 0, this.system.health.value);
        if (damageApplied === 0) return 0;
        await this.update({
            "system.health.value": Math.clamped(
                this.system.health.value - damage,
                0,
                this.system.health.max
            ),
        });
        return damageApplied;
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
        if (!this.synthetics.afflictions.data.length) return;
        const afflictions = this.synthetics.afflictions.data.reduce<{
            toDelete: string[];
            toUpdate: Partial<ActiveEffectPTR2e<ActorPTR2e>["_source"]>[];
            groups: {
                [key: number]: {
                    afflictions: { formula?: string; affliction: AfflictionActiveEffectSystem }[];
                    type?: "healing" | "damage" | "both";
                };
            };
        }>(
            (acc, affliction) => {
                const result = affliction.onEndActivation();
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
                //@ts-expect-error
                await ChatMessagePTR2e.create({
                    type: "damage-applied",
                    system: {
                        notes,
                        damageApplied: oldHealth - newHealth,
                        target: this.uuid,
                    },
                });
            }
        } else if (notes.length > 0) {
            //@ts-expect-error
            await ChatMessagePTR2e.create({
                type: "damage-applied",
                system: {
                    notes,
                    damageApplied: 0,
                    undone: true,
                    target: this.uuid,
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
        TStatistic extends BaseStatisticCheck<any, any>,
        TItem extends ItemPTR2e<ItemSystemsWithActions, ActorPTR2e>,
    >(
        params: CheckContextParams<TStatistic, TItem>
    ): Promise<CheckContext<this, TStatistic, TItem>> {
        const context = await this.getRollContext(params);
        const rangeIncrement = context.target?.rangeIncrement ?? null;

        const appliesTo = context.target?.token?.actor?.uuid ?? (context.target?.actor?.id ? context.target.actor.uuid : null) ?? null;

        const rangePenalty = rangeIncrement ? new ModifierPTR2e({
            label: "Range Penalty",
            slug: `range-penalty-${appliesTo ?? fu.randomID()}`,
            modifier: Math.min(-(rangeIncrement * (rangeIncrement + 1) / 2), 0),
            method: "stage",
            type: "accuracy",
            appliesTo: appliesTo ? new Map([[appliesTo, true]]) : null,
        }) : null
        if(rangePenalty) context.self.modifiers.push(rangePenalty);

        return { ...context};
    }

    protected getRollContext<
        TStatistic extends BaseStatisticCheck<any, any>,
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
                      R.compact([
                          ...Array.from(params.options),
                          ...targetToken.actor.getSelfRollOptions("target"),
                          ...initialActionOptions,
                      ]),
                      originEphemeralEffects
                  );

        //TODO: Implement Move Variants
        //const attackActions = params.attack ? [params.attack] : [];

        const statistic = params.statistic;

        const selfItem = ((): ItemPTR2e<ItemSystemsWithActions, ActorPTR2e> | null => {
            // 1. Simplest case: no context clone, so used the item passed to this method
            if (selfActor === this) return params.item ?? null;

            // 2. Get the item from the statistic if it's stored therein
            if (
                statistic &&    
                "item" in statistic &&
                statistic.item instanceof ItemPTR2e &&
                "actions" in statistic.item.system
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
        const selfAttack = params.attack;

        const itemOptions = selfItem?.getRollOptions("item") ?? [];
        const actionTraits = R.uniq(
            params.traits?.map((t) => (typeof t === "string" ? t : t.slug)) ?? []
        );

        // Calculate distance and range increment, set as a roll option
        const distance = selfToken && targetToken ? selfToken.distanceTo(targetToken) : 0;
        const [originDistance, targetDistance] =
            typeof distance === "number"
                ? [`origin:distance:${distance}`, `target:distance:${distance}`]
                : [null, null];

        const originRollOptions = selfToken && targetToken 
            ? R.compact(
                R.uniq([
                    ...selfActor.getSelfRollOptions('origin'),
                    ...actionTraits.map((t) => `origin:action:trait:${t}`),
                    ...(originDistance ? [originDistance] : [])
                ])
            )
            : [];

        // Target roll options
        const getTargetRollOptions = (actor: Maybe<ActorPTR2e>): string[] => {
            const targetOptions = actor?.getSelfRollOptions("target") ?? [];
            if(targetToken) {
                targetOptions.push("target") // An indicator that there is any kind of target.
            }
            return targetOptions.sort();
        }
        const targetRollOptions = getTargetRollOptions(targetToken?.actor);

        // Get ephemeral effects from this actor that affect the target while being attacked
        const targetEphemeralEffects = await extractEphemeralEffects({
            affects: "target",
            origin: selfActor,
            target: targetToken?.actor ?? null,
            item: selfItem,
            attack: params.attack ?? null,
            domains: params.domains,
            options: [...params.options, ...itemOptions, ...targetRollOptions],
        });

        // Clone the actor to recalculate its AC with contextual roll options
        const targetActor = params.viewOnly
            ? null
            : (params.target?.actor ?? targetToken?.actor)?.getContextualClone(
                  R.compact([...params.options, ...itemOptions, ...originRollOptions]),
                  targetEphemeralEffects,
              ) ?? null;

        const rollOptions = new Set(
            R.compact([
                ...params.options,
                ...selfActor.getRollOptions(params.domains),
                ...(targetActor ? getTargetRollOptions(targetActor) : targetRollOptions),
                ...actionTraits.map(t => `self:action:trait:${t}`),
                ...itemOptions,
                ...(targetDistance ? [targetDistance] : []),
            ])
        )

        const rangeIncrement = selfAttack ? selfAttack.getRangeIncrement(distance) : null;
        if(rangeIncrement) rollOptions.add(`target:range-increment:${rangeIncrement}`);

        const self = {
            actor: selfActor,
            token: selfToken?.document ?? null,
            statistic,
            item: selfItem,
            attack: selfAttack!,
            modifiers: []
        }

        const target = 
            targetActor && targetToken && distance !== null
                ? { actor: targetActor, token: targetToken.document, distance, rangeIncrement }
                : null;
        return {
            options: rollOptions,
            self,
            target,
            traits: actionTraits
        }
    }

    protected getContextualClone(
        rollOptions: string[],
        ephemeralEffects: EffectSourcePTR2e[],
    ): this {
        const rollOptionsAll = rollOptions.reduce(
            (options: Record<string, boolean>, option: string) => ({ ...options, [option]: true }),
            {}
        );
        const applicableEffects = ephemeralEffects.filter((effect) => !this.isImmuneTo(effect));

        return this.clone({
            items: [fu.deepClone(this._source.items), applicableEffects].flat(),
            flags: { ptr2e: { rollOptions: { all: rollOptionsAll } } },
        });
    }

    //TODO: Implement
    isImmuneTo(_effect: EffectSourcePTR2e): boolean {
        return false;
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

        if (options.fail === true) return false;
    }
}

interface ActorPTR2e<
    TSystem extends ActorSystemPTR2e = ActorSystemPTR2e,
    TParent extends TokenDocumentPTR2e | null = TokenDocumentPTR2e | null,
> extends Actor<TParent, TSystem> {
    get folder(): FolderPTR2e<ActorPTR2e<TSystem, null>> | null;

    sheet: ActorSheetPTR2e;

    _party: ActorParty | null;

    health: {
        percent: number;
    };

    synthetics: ActorSynthetics;

    _actions: ActionsCollections;

    level: number;

    flags: ActorFlags2e;

    rollOptions: RollOptionManager<this>;

    attacks: {
        slots: number;
        actions: Record<number, AttackPTR2e>;
        available: AttackPTR2e[];
    };

    skills: Record<string, Statistic>;
}

type ActorFlags2e = ActorFlags & {
    ptr2e: {
        rollOptions: RollOptions & {};
    };
};

export default ActorPTR2e;
