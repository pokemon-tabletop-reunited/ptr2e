import { ActorPTR2e } from "@actor";
import AttackPTR2e from "@module/data/models/attack.ts";

abstract class AttackMessageSystem extends foundry.abstract.TypeDataModel {
    /**
     * The rolled Accuracy Check (1d100)
     */
    abstract accuracyCheck: Roll;
    /**
     * The rolled Randomness Check (2d8)
     */
    abstract damageRandomness: Roll;
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

    declare _source: foundry.abstract.TypeDataModel['_source'] & {
        accuracyCheck: string;
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
            damageRandomness: new fields.JSONField({ required: true, validate: AttackMessageSystem.#validateRoll }),
            targets: new fields.ArrayField(new fields.DocumentUUIDField({ required: true, type: 'Actor' })),
            origin: new fields.JSONField({ required: true}),
            attack: new fields.StringField({ required: true}),
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
        try {
            this.accuracyCheck = Roll.fromJSON(this._source.accuracyCheck);
        } catch (error: any) {
            Hooks.onError("AttackMessageSystem#accuracyCheck", error, {log: 'error', data: this._source});
        }
        
        try {
            this.damageRandomness = Roll.fromJSON(this._source.damageRandomness);
        } catch (error: any) {
            Hooks.onError("AttackMessageSystem#damageRandomness", error, {log: 'error', data: this._source});
        }

        this.targets = this._source.targets.map(uuid => {
            const actor = fromUuidSync(uuid) as ActorPTR2e;
            if(!actor) Hooks.onError("AttackMessageSystem#targets", new Error(`Could not find target actor with UUID ${uuid}`), {log: 'error', data: this._source});
            return actor;
        });
        
        const origin = (() => {
            const origin = JSON.parse(this._source.origin);
            if(!origin) return null;
            const actor = fromUuidSync(origin.uuid) as ActorPTR2e;
            return actor ?? new ActorPTR2e(origin);
        })();
        if(!origin) Hooks.onError("AttackMessageSystem#origin", new Error(`Could not find origin actor with UUID ${this._source.origin}`), {log: 'error', data: this._source});
        this.origin = origin as ActorPTR2e;

        this.attack = this.origin.actions.attack.get(this._source.attack) as AttackPTR2e;
        if(!this.attack) Hooks.onError("AttackMessageSystem#attack", new Error(`Could not find attack with slug ${this._source.attack} in ${this._source.origin}`), {log: 'error', data: this._source});
    }

    async getHTMLContent(_content: string) {
        return `<h1>${this.origin.name}'s ${this.attack.name}</h1><p>Accuracy Roll: ${this.accuracyCheck.total}</p><p>Damage Roll: ${this.damageRandomness.total}</p><p>Targets: ${this.targets.map(t => t.name).join(", ")}</p>`;
    }
}



export { AttackMessageSystem }