import { ActorPTR2e } from "@actor";
import { ChatMessagePTR2e } from "@chat";
import { SlugField } from "@module/data/fields/slug-field.ts";
import SkillPTR2e from "@module/data/models/skill.ts";

interface SkillMessageSystem extends foundry.abstract.TypeDataModel, ModelPropsFromSchema<SkillMessageSchema> {
    _source: SourceFromSchema<SkillMessageSchema>;

    context: {
        actor?: ActorPTR2e,
        skill?: SkillPTR2e,
        roll?: Rolled<Roll>,
    } | null;
}

type SkillMessageSchema = {
    roll: foundry.data.fields.JSONField<Rolled<Roll>, true, false, false>;
    origin: foundry.data.fields.JSONField<ActorPTR2e['_source'], true, false, false>;
    slug: SlugField<true, false, false>;
}

abstract class SkillMessageSystem extends foundry.abstract.TypeDataModel {
    declare parent: ChatMessagePTR2e<SkillMessageSystem>;

    /**
     * Define the schema for the AttackMessageSystem data model
     */
    static override defineSchema(): SkillMessageSchema {
        const fields = foundry.data.fields;
        return {
            roll: new fields.JSONField({ required: true, validate: SkillMessageSystem.#validateRoll }),
            origin: new fields.JSONField({ required: true }),
            slug: new SlugField({ required: true }),
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

        let roll;
        try {
            roll = Roll.fromJSON(this._source.roll) as Rolled<Roll>;
        } catch (error: any) {
            Hooks.onError("SkillMessageSystem#roll", error, { log: 'error', data: this._source });
        }

        const origin = (() => {
            const origin = JSON.parse(this._source.origin);
            if (!origin) return null;
            const actor = fromUuidSync(origin.uuid) as ActorPTR2e;
            return actor ?? new ActorPTR2e(origin);
        })();
        if (!origin) Hooks.onError("SkillMessageSystem#origin", new Error(`Could not find origin actor with UUID ${this._source.origin}`), { log: 'error', data: this._source });
        
        const skill = origin?.system.skills.get(this._source.slug);
        if (!skill && origin) Hooks.onError("SkillMessageSystem#skill", new Error(`Could not find skill with slug ${this._source.slug}`), { log: 'error', data: this._source });

        this.context = {
            actor: origin ?? undefined,
            skill,
            roll
        }
    }

    async getHTMLContent(_content: string) {
        const context: this['context'] & Record<string,unknown> = this.context ?? {};
        context.degreeOfSuccess = context.roll 
            ? context.roll.total > 0
                ? Math.ceil(context.roll.total / -10) - 1
                : Math.floor(context.roll.total / -10) + 1
            : null;

        context.rollHTML = await (async (isPrivate: boolean = false) => {
            if(!context.roll) return "";
            const innerRollHTML = await context.roll.render({isPrivate});
            return renderTemplate('systems/ptr2e/templates/chat/rolls/skill-check.hbs', {roll: context.roll, inner: innerRollHTML, isPrivate, degreeOfSuccess: context.degreeOfSuccess});
        })();

        return renderTemplate('systems/ptr2e/templates/chat/skill.hbs', context);
    }
}

export default SkillMessageSystem;