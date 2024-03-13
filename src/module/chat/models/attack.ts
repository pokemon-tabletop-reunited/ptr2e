import { ActorPTR2e } from "@actor";
import AttackPTR2e from "@module/data/models/attack.ts";
import { ChatMessagePTR2e } from "../document.ts";

abstract class AttackMessageSystem extends foundry.abstract.TypeDataModel {
    declare parent: ChatMessagePTR2e<AttackMessageSystem>;

    /**
     * The rolled Accuracy Check (1d100)
     */
    abstract accuracyCheck: Rolled<Roll>;
    /**
     * The rolled Critical Check (1d100)
     */
    abstract critCheck: Rolled<Roll>;
    /**
     * The rolled Randomness Check (2d8)
     */
    abstract damageRandomness: Rolled<Roll>;
    /**
     * The actors that are being targeted by the attack
     */
    abstract targets: ActorPTR2e[];
    /**
     * The overrides for the accuracy check
     */
    abstract overrides: Record<string, AccuracySuccessCategory>;
    /**
     * The actor that is using the attack
     */
    abstract origin: ActorPTR2e;
    /**
     * The attack that is being used
     */
    abstract attack: AttackPTR2e;

    /**
     * Saved context for the attack that gets fulfilled when the message is rendered
     */
    abstract context: {
        targets: Map<string, { actor: ActorPTR2e, accuracy: AccuracyCalc, damage: DamageCalc | null }>;
        origin: ActorPTR2e;
        attack: AttackPTR2e;
        accuracyCheck: Rolled<Roll>;
        critCheck: Rolled<Roll>;
        damageRandomness: Rolled<Roll>;
        rollsHTML: {
            accuracyCheck: string;
            critCheck: string;
            damageRandomness: string;
            effectChecks: Map<string, string>;
        };
    } | null;

    declare _source: foundry.abstract.TypeDataModel['_source'] & {
        accuracyCheck: string;
        critCheck: string;
        damageRandomness: string;
        targets: {
            uuid: string;
            status: AccuracySuccessCategory;
        }[];
        origin: string;
        attack: string;
    }

    /**
     * Define the schema for the AttackMessageSystem data model
     */
    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            accuracyCheck: new fields.JSONField({ required: true, validate: AttackMessageSystem.#validateRoll }),
            critCheck: new fields.JSONField({ required: true, validate: AttackMessageSystem.#validateRoll }),
            damageRandomness: new fields.JSONField({ required: true, validate: AttackMessageSystem.#validateRoll }),
            targets: new fields.ArrayField(new fields.SchemaField({
                uuid: new fields.DocumentUUIDField({ required: true, type: 'Actor' }),
                status: new fields.StringField({ required: false, choices: Object.values(AccuracySuccessCategories) })
            })),
            origin: new fields.JSONField({ required: true }),
            attack: new fields.StringField({ required: true }),
        }
    }

    /**
     * Validate that Rolls belonging to the ChatMessage document are valid
     * @param {string} rollJSON     The serialized Roll data
     */
    static #validateRoll(rollJSON: any) {
        const roll = JSON.parse(rollJSON);
        if (!roll.evaluated) throw new Error(`Roll objects added to ChatMessage documents must be evaluated`);
    }

    override prepareBaseData(): void {
        this.context = null;

        try {
            this.accuracyCheck = Roll.fromJSON(this._source.accuracyCheck) as Rolled<Roll>;
        } catch (error: any) {
            Hooks.onError("AttackMessageSystem#accuracyCheck", error, { log: 'error', data: this._source });
        }

        try {
            this.critCheck = Roll.fromJSON(this._source.critCheck) as Rolled<Roll>;
        } catch (error: any) {
            Hooks.onError("AttackMessageSystem#critCheck", error, { log: 'error', data: this._source });
        }

        try {
            this.damageRandomness = Roll.fromJSON(this._source.damageRandomness) as Rolled<Roll>;
        } catch (error: any) {
            Hooks.onError("AttackMessageSystem#damageRandomness", error, { log: 'error', data: this._source });
        }

        this.overrides = {};
        this.targets = this._source.targets.map(({ uuid, status }) => {
            const actor = fromUuidSync(uuid) as ActorPTR2e;
            if (!actor) Hooks.onError("AttackMessageSystem#targets", new Error(`Could not find target actor with UUID ${uuid}`), { log: 'error', data: this._source });
            if (status) this.overrides[actor.uuid] = status;
            return actor;
        });

        const origin = (() => {
            const origin = JSON.parse(this._source.origin);
            if (!origin) return null;
            const actor = fromUuidSync(origin.uuid) as ActorPTR2e;
            return actor ?? new ActorPTR2e(origin);
        })();
        if (!origin) Hooks.onError("AttackMessageSystem#origin", new Error(`Could not find origin actor with UUID ${this._source.origin}`), { log: 'error', data: this._source });
        this.origin = origin as ActorPTR2e;

        this.attack = this.origin.actions.attack.get(this._source.attack) as AttackPTR2e;
        if (!this.attack) Hooks.onError("AttackMessageSystem#attack", new Error(`Could not find attack with slug ${this._source.attack} in ${this._source.origin}`), { log: 'error', data: this._source });
    }

    async getHTMLContent(_content: string) {
        const renderRolls = async (isPrivate: boolean) => {
            const renderRollsInner = async (roll: Roll, isPrivate: boolean) => {
                return roll.render({ isPrivate });
            }

            const rolls: {
                accuracyCheck: string,
                critCheck: string,
                damageRandomness: string,
                effectChecks: Map<string, string>
            } = {
                accuracyCheck: await renderTemplate('/systems/ptr2e/templates/chat/rolls/accuracy-check.hbs', {
                    inner: await renderRollsInner(this.accuracyCheck, isPrivate),
                    isPrivate,
                    type: "accuracy",
                    label: "PTR2E.Attack.AccuracyCheck"
                }),
                critCheck: await renderTemplate('/systems/ptr2e/templates/chat/rolls/crit-check.hbs', {
                    inner: await renderRollsInner(this.critCheck, isPrivate),
                    isPrivate,
                    type: "crit",
                    label: "PTR2E.Attack.CritCheck"
                }),
                damageRandomness: await renderTemplate('/systems/ptr2e/templates/chat/rolls/damage-randomness.hbs', {
                    inner: await renderRollsInner(this.damageRandomness, isPrivate),
                    isPrivate,
                    type: "damage",
                    label: "PTR2E.Attack.DamageRandomness"
                }),
                // TODO: Implement effect checks
                effectChecks: new Map()
            }

            return rolls;
        };

        const context = await (async () => {
            if (this.context) return this.context;

            const targets = new Map<string, { actor: ActorPTR2e, accuracy: AccuracyCalc, damage: DamageCalc | null }>();
            for (const target of this.targets.values()) {
                const accuracy = this._calculateDegreeOfSuccess({ accuracyCheck: this.accuracyCheck, target });
                const damage = await this._calculateDamage({ damageRandomness: this.damageRandomness, target, critModifier: accuracy.category === AccuracySuccessCategories.CRITICAL ? 1.5 : 1 });
                targets.set(target.uuid, { actor: target, accuracy, damage });
            }

            return this.context = {
                targets,
                origin: this.origin,
                attack: this.attack,
                accuracyCheck: this.accuracyCheck,
                critCheck: this.critCheck,
                damageRandomness: this.damageRandomness,
                rollsHTML: await renderRolls(false)
            }
        })();

        return renderTemplate('systems/ptr2e/templates/chat/attack.hbs', context);
    }

    _calculateDegreeOfSuccess({
        accuracyCheck,
        target,
    }: { accuracyCheck: Rolled<Roll>; target?: ActorPTR2e }): AccuracyCalc {
        // Step 0: If an override is present, we should return that.
        // Calculation should still proceed in case the override is incorrect.
        const override = this.overrides[target?.uuid ?? ""];

        // Step 1: Check if the move has an accuracy, if not it always is a hit
        const moveAccuracy = this.attack.accuracy;
        if (moveAccuracy === null) return { category: override || AccuracySuccessCategories.HIT, context: { moveAccuracy, override: !!override } };

        // Step 2: Calculate non-stage accuracy modifiers
        const accuracyModifiers: number[] = [];
        const accuracyModifier = accuracyModifiers.reduce((acc, mod) => acc * mod, 1);

        // Step 3: Calculate stage accuracy modifiers
        const originAccuracyStage = this.origin.getAccuracyStage();
        const targetEvasionStage = target?.getEvasionStage() ?? 0;
        const adjustedStages = Math.clamp(originAccuracyStage - targetEvasionStage, -6, 6);
        const stageModifier = adjustedStages > 0 ? ((3 + adjustedStages) / 3) : (3 / (3 + Math.abs(adjustedStages)));

        // Step 4: Calculate the accuracy check
        const accuracyRoll = accuracyCheck.total;
        const accuracyDC = moveAccuracy * accuracyModifier * stageModifier;

        const context = {
            moveAccuracy,
            otherModifiers: accuracyModifier,
            adjustedStages,
            stageModifier,
            accuracyRoll,
            accuracyDC,
            override: !!override
        }

        // Step 5: Determine the degree of success
        //TODO: Implement the degree of success calculation
        return accuracyRoll <= accuracyDC ? { category: override || AccuracySuccessCategories.HIT, context } : { category: override || AccuracySuccessCategories.MISS, context };
    }

    async _calculateDamage({
        damageRandomness,
        target,
        critModifier
    }: { damageRandomness: Rolled<Roll>, target: ActorPTR2e, critModifier: number }): Promise<DamageCalc | null> {
        // Step 1: Check if the move has Power, if not, return null.
        const movePower = this.attack.power;
        if (movePower === null) return null;

        // Step 2: Calculate non-stage other modifiers
        const otherModifiers: number[] = [];
        const otherModifier = otherModifiers.reduce((acc, mod) => acc * mod, 1);

        // Step 3: Calculate appropriate Attack & Defense stats
        const originAttack = this.origin.getAttackStat(this.attack, critModifier);
        const targetDefense = target.getDefenseStat(this.attack, critModifier);

        // Step 4: Calculate type effectiveness
        const typeEffectiveness = target.getEffectiveness(this.attack.types);

        // Step 4: Calculate the damage roll
        const context = {
            level: this.origin.level,
            power: movePower,
            attack: originAttack,
            defense: targetDefense,
            targets: this.targets.length > 1 ? 0.75 : 1,
            critical: critModifier,
            random: damageRandomness.total, // number between 2 and 16
            stab: this.attack.stab,
            type: typeEffectiveness,
            other: otherModifier
        }

        if (typeEffectiveness === 0) return { value: 0, context };

        const damageCalc = await new Roll("((((((2 * @level) / 5) + 2) * @power * (@attack / @defense)) / 50) + 2) * @targets * @critical * ((100 - @random) / 100) * @stab * @type * @other", context).roll();

        function roundToNearestDownOnPoint5(value: number) {
            const decimal = value - Math.floor(value);
            return decimal > 0.5 ? Math.ceil(value) : Math.floor(value);
        }

        return {
            roll: damageCalc,
            value: Math.max(otherModifier >= 1 ? 1 : 0, roundToNearestDownOnPoint5(damageCalc.total)),
            context
        }
    }

    async updateTarget(targetUuid: string, { status }: { status: AccuracySuccessCategory }) {
        const target = this.context?.targets.get(targetUuid);
        if (!target) return false;

        const source = fu.duplicate(this._source.targets);
        const index = source.findIndex(t => t.uuid === targetUuid);
        if (index === -1) return false;

        source[index].status = status;
        return await this.parent.update({"system.targets": source});
    }

    async applyDamage(targetUuid: string) {
        const target = this.context?.targets.get(targetUuid);
        if (!target) return false;

        const damage = target.damage;
        if (!damage) return false;

        const damageApplied = await target.actor.applyDamage(damage.value);

        // @ts-ignore
        return ChatMessage.create({
            type: "damage-applied",
            system: {
                target: targetUuid,
                damageApplied
            }
        })
    }

    activateListeners(html: JQuery<HTMLElement>) {
        html.find(".apply-damage").on('click', (event) => {
            const targetUuid = (event.currentTarget.closest("[data-target-uuid]") as HTMLElement)?.dataset?.targetUuid;
            if (!targetUuid) return;
            this.applyDamage(targetUuid);
        });
    }
}

const AccuracySuccessCategories = {
    CRITICAL: "critical",
    HIT: "hit",
    MISS: "miss",
    FUMBLE: "fumble"
} as const;

type AccuracyCalc = {
    category: AccuracySuccessCategory;
    context: AccuracyContext;
}
type AccuracySuccessCategory = typeof AccuracySuccessCategories[keyof typeof AccuracySuccessCategories];
type AccuracyContext = {
    moveAccuracy: number | null;
    otherModifiers?: number;
    adjustedStages?: number;
    stageModifier?: number;
    accuracyRoll?: number;
    accuracyDC?: number;
    override: boolean;
}

type DamageCalc = {
    roll: Rolled<Roll>;
    value: number;
    context: DamageContext;
} | {
    value: 0;
    context: DamageContext;
}
type DamageContext = {
    level: number;
    power: number;
    attack: number;
    defense: number;
    targets: number;
    critical: number;
    random: number;
    stab: number;
    type: number;
    other: number;
}


export { AttackMessageSystem }