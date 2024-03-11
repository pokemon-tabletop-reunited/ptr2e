import { ActorPTR2e } from "@actor";
import AttackPTR2e from "@module/data/models/attack.ts";

abstract class AttackMessageSystem extends foundry.abstract.TypeDataModel {
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
        targets: Map<string, { actor: ActorPTR2e, degreeOfSuccess: DegreeOfSuccess, damage: DamageCalc | null }>;
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
        targets: string[];
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
            targets: new fields.ArrayField(new fields.DocumentUUIDField({ required: true, type: 'Actor' })),
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

        this.targets = this._source.targets.map(uuid => {
            const actor = fromUuidSync(uuid) as ActorPTR2e;
            if (!actor) Hooks.onError("AttackMessageSystem#targets", new Error(`Could not find target actor with UUID ${uuid}`), { log: 'error', data: this._source });
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

            const targets = new Map<string, { actor: ActorPTR2e, degreeOfSuccess: DegreeOfSuccess, damage: DamageCalc | null }>();
            for (const target of this.targets.values()) {
                const degreeOfSuccess = this._calculateDegreeOfSuccess({ accuracyCheck: this.accuracyCheck, target });
                const damage = await this._calculateDamage({ damageRandomness: this.damageRandomness, target, critModifier: degreeOfSuccess.degree });
                targets.set(target.uuid, { actor: target, degreeOfSuccess, damage });
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
    }: { accuracyCheck: Rolled<Roll>; target: ActorPTR2e }): DegreeOfSuccess {
        // Step 1: Check if the move has an accuracy, if not it always is a hit
        const moveAccuracy = this.attack.accuracy;
        if (moveAccuracy === null) return { category: DegreesOfSuccessTypes.HIT, degree: 1 };

        // Step 2: Calculate non-stage accuracy modifiers
        const accuracyModifiers: number[] = [];
        const accuracyModifier = accuracyModifiers.reduce((acc, mod) => acc * mod, 1);

        // Step 3: Calculate stage accuracy modifiers
        const originAccuracyStage = this.origin.getAccuracyStage();
        const targetEvasionStage = target.getEvasionStage();
        const adjustedStages = Math.clamp(originAccuracyStage - targetEvasionStage, -6, 6);
        const stageModifier = adjustedStages > 0 ? ((3 + adjustedStages) / 3) : (3 / (3 + Math.abs(adjustedStages)));

        // Step 4: Calculate the accuracy check
        const accuracyRoll = accuracyCheck.total;
        const accuracyDC = moveAccuracy * accuracyModifier * stageModifier;

        // Step 5: Determine the degree of success
        //TODO: Implement the degree of success calculation
        return accuracyRoll <= accuracyDC ? { category: DegreesOfSuccessTypes.HIT, degree: 1 } : { category: DegreesOfSuccessTypes.MISS, degree: 1 };
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
}

const DegreesOfSuccessTypes = {
    CRITICAL: "critical",
    HIT: "hit",
    MISS: "miss",
    FUMBLE: "fumble"
} as const;
type DegreeOfSuccessCategory = typeof DegreesOfSuccessTypes[keyof typeof DegreesOfSuccessTypes];

type DegreeOfSuccess = {
    category: DegreeOfSuccessCategory;
    degree: number;
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