import { ActorPTR2e } from "@actor";
import { ItemPTR2e } from "@item";
import { PTRCONSTS, ActionType, ActionCost, Delay, Priority, Trait } from "@data";
import { RangePTR2e } from "@data";

class ActionPTR2e extends foundry.abstract.DataModel {
    static TYPE: ActionType = "generic" as const;

    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            slug: new fields.StringField({ required: true, label: "PTR2E.FIELDS.slug.label", hint: "PTR2E.FIELDS.slug.hint" }),
            name: new fields.StringField({ required: true, initial: "New Action", label: "PTR2E.FIELDS.actionName.label", hint: "PTR2E.FIELDS.actionName.hint" }),
            description: new fields.HTMLField({ required: false, nullable: true, label: "PTR2E.FIELDS.description.label", hint: "PTR2E.FIELDS.description.hint" }),
            traits: new fields.SetField(new fields.StringField({validate: Trait.isValid}), { label: "PTR2E.FIELDS.actionTraits.label", hint: "PTR2E.FIELDS.actionTraits.hint" }),
            type: new fields.StringField({
                required: true, blank: false, initial: this.TYPE,
                validate: value => value === this.TYPE || Object.values(PTRCONSTS.ActionTypes).includes(value as ActionType),
                validationError: `must be equal to "${this.TYPE}"`,
                label: "PTR2E.FIELDS.actionType.label", hint: "PTR2E.FIELDS.actionType.hint"
            }),
            range: new fields.EmbeddedDataField(RangePTR2e, { required: false, nullable: true }),
            cost: new fields.SchemaField({
                activation: new fields.StringField({ required: true, choices: Object.values(PTRCONSTS.ActivationCost), initial: PTRCONSTS.ActivationCost.SIMPLE, label: "PTR2E.FIELDS.activationCost.label", hint: "PTR2E.FIELDS.activationCost.hint" }),
                powerPoints: new fields.NumberField({ required: true, initial: 0, min: 0, integer: true, label: "PTR2E.FIELDS.powerPoints.label", hint: "PTR2E.FIELDS.powerPoints.hint" }),
                trigger: new fields.StringField({ required: false, nullable: true, label: "PTR2E.FIELDS.trigger.label", hint: "PTR2E.FIELDS.trigger.hint" }),
                delay: new fields.NumberField({ required: false, nullable: true, min: 1, max: 3, integer: true, label: "PTR2E.FIELDS.delay.label", hint: "PTR2E.FIELDS.delay.hint" }),
                priority: new fields.NumberField({ required: false, nullable: true, min: 1, max: 7, integer: true, label: "PTR2E.FIELDS.priority.label", hint: "PTR2E.FIELDS.priority.hint" }),
            })
        }
    }

    get img() {
        if (this.parent) {
            if ('img' in this.parent) return this.parent.img as string;
            if ('parent' in this.parent && this.parent.parent && 'img' in this.parent.parent) return this.parent.parent.img as string;
        }
        return 'icons/svg/explosion.svg';
    }

    get actor(): ActorPTR2e | null {
        if (this.parent?.parent instanceof ActorPTR2e) return this.parent.parent;
        if (this.parent?.parent instanceof ItemPTR2e && this.parent.parent.actor instanceof ActorPTR2e) return this.parent.parent.actor;
        return null;
    }

    get item(): ItemPTR2e {
        if (this.parent instanceof ItemPTR2e) return this.parent;
        if (this.parent?.parent instanceof ItemPTR2e) return this.parent.parent;
        throw new Error("Action is not a child of an item");
    }

    prepareDerivedData() {
        this.traits = this._source.traits.reduce((acc: Map<string, Trait>, traitSlug: string) => {
            const trait = game.ptr.data.traits.get(traitSlug)
            if (trait) acc.set(traitSlug, trait);
            return acc;
        }, new Map());
    }
}
interface ActionPTR2e extends foundry.abstract.DataModel {
    /**
     * A slug for the action.
     * @remarks
     * This is a unique identifier for the action, which is used to reference it in the system.
     * It is derived from the name of the action.
     */
    slug: string
    /**
     * The name of the action.
     * @remarks
     * Supports localization.
     */
    name: string
    /**
     * The effect description of the action.
     */
    description: string
    /**
     * A record of traits that the item has.
     * @remarks
     * This is a record of traits that the item has, keyed by the trait's name.
     * @example
     * ```typescript
     * const item = new ItemPTR2e({ name: 'Flashlight', "system.traits": ["light"] });
     * console.log(item.system.traits); // { "light": TraitPTR2e }
     * ```
     */
    traits: Map<string, Trait>
    /**
     * The type of the action.
     * @defaultValue `'generic'`
     * @remarks
     * This is one of `'attack'`, `'camping'`, `'downtime'`, `'exploration'`, `'passive'`, or `'generic'`.
     */
    type: ActionType

    /**
     * The costs associated with using the action.
     */
    cost: {
        /**
         * The activation cost of the action.
         * @defaultValue `'simple'`
         * @remarks
         * This is one of `'simple'`, `'complete'`, or `'free'`.
         */
        activation: ActionCost,
        /**
         * The power points required to use the action.
         * @defaultValue `0`
         */
        powerPoints: number,
        /**
         * The trigger for the action.
         * @remarks
         * Todo: Decide what value this should be.
         */
        trigger?: string,
        /**
         * The delay of the action.
         * @defaultValue `1`
         * @remarks
         * This is one of `1`, `2`, or `3`.
         */
        delay?: Delay,
        /**
         * The priority of the action.
         * @defaultValue `0`
         */
        priority?: Priority,
    }

    /**
     * The range of the action.
     * @remarks
     * This is the range of the action.
     * It can be one of `'self'`, `'ally'`, `'enemy'`, `'creature'`, `'object'`, `'blast'`, `'cone'`, `'line'`, `'wide-line'`, `'emanation'`, `'field'`, `'aura'`, `'allied-aura'`, or `'enemy-aura'`.
     */
    range: RangePTR2e[]

    _source: {
        traits: string[]
    } & foundry.abstract.DataModel['_source']
}

export default ActionPTR2e;