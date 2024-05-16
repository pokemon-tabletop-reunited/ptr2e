import { ActorPTR2e } from "@actor";
import { ChatMessagePTR2e } from "@chat";
import { SlugField } from "@module/data/fields/slug-field.ts";
import SkillPTR2e from "@module/data/models/skill.ts";
import { CheckRoll } from "@system/rolls/check-roll.ts";

interface SkillMessageSystem
    extends foundry.abstract.TypeDataModel,
        ModelPropsFromSchema<SkillMessageSchema> {
    _source: SourceFromSchema<SkillMessageSchema>;

    context: {
        actor?: ActorPTR2e;
        skill?: SkillPTR2e;
        roll?: Rolled<CheckRoll>;
        luckRoll?: Rolled<CheckRoll> | null;
        appliedLuck?: boolean;
    } | null;
}

type SkillMessageSchema = {
    roll: foundry.data.fields.JSONField<Rolled<CheckRoll>, true, false, false>;
    origin: foundry.data.fields.JSONField<ActorPTR2e["_source"], true, false, false>;
    slug: SlugField<true, false, false>;
    luckRoll: foundry.data.fields.JSONField<Rolled<CheckRoll>, true, true, false>;
    appliedLuck: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
};

abstract class SkillMessageSystem extends foundry.abstract.TypeDataModel {
    declare parent: ChatMessagePTR2e<SkillMessageSystem>;

    /**
     * Define the schema for the AttackMessageSystem data model
     */
    static override defineSchema(): SkillMessageSchema {
        const fields = foundry.data.fields;
        return {
            roll: new fields.JSONField({
                required: true,
                validate: SkillMessageSystem.#validateRoll,
            }),
            origin: new fields.JSONField({ required: true }),
            slug: new SlugField({ required: true }),
            luckRoll: new fields.JSONField({ required: true, nullable: true }),
            appliedLuck: new fields.BooleanField({ required: true, initial: false }),
        };
    }

    /**
     * Validate that Rolls belonging to the ChatMessage document are valid
     * @param {string} rollJSON     The serialized Roll data
     */
    static #validateRoll(rollJSON: any) {
        const roll = JSON.parse(rollJSON);
        if (!roll.evaluated)
            throw new Error(`Roll objects added to ChatMessage documents must be evaluated`);
    }

    override prepareBaseData(): void {
        this.context = null;

        let roll;
        try {
            roll = Roll.fromJSON(this._source.roll) as Rolled<CheckRoll>;
        } catch (error: any) {
            Hooks.onError("SkillMessageSystem#roll", error, { log: "error", data: this._source });
        }

        let luckRoll;
        try {
            if (this._source.luckRoll)
                luckRoll = Roll.fromJSON(this._source.luckRoll) as Rolled<CheckRoll>;
            else luckRoll = null;
        } catch (error: any) {
            Hooks.onError("SkillMessageSystem#luckRoll", error, {
                log: "error",
                data: this._source,
            });
        }

        const origin = (() => {
            const origin = JSON.parse(this._source.origin);
            if (!origin) return null;
            const actor = fromUuidSync(origin.uuid) as ActorPTR2e;
            return actor ?? new ActorPTR2e(origin);
        })();
        if (!origin)
            Hooks.onError(
                "SkillMessageSystem#origin",
                new Error(`Could not find origin actor with UUID ${this._source.origin}`),
                { log: "error", data: this._source }
            );

        const skill = origin?.system.skills.get(this._source.slug);
        if (!skill && origin)
            Hooks.onError(
                "SkillMessageSystem#skill",
                new Error(`Could not find skill with slug ${this._source.slug}`),
                { log: "error", data: this._source }
            );

        this.context = {
            actor: origin ?? undefined,
            skill,
            roll,
            luckRoll,
            appliedLuck: this._source.appliedLuck,
        };
    }

    async getHTMLContent(_content: string) {
        const context: this["context"] & Record<string, unknown> = this.context ?? {};
        context.degreeOfSuccess = context.roll
            ? context.roll.total > 0
                ? Math.ceil(context.roll.total / -10) - 1
                : Math.floor(context.roll.total / -10) + 1
            : null;

        if (context.luckRoll && typeof context.degreeOfSuccess === "number") {
            context.degreeOfSuccess *= -1;
        }

        context.rollHTML = await (async (isPrivate: boolean = false) => {
            if (!context.roll) return "";
            const innerRollHTML = await context.roll.render({ isPrivate });
            const luckRollHTML = context.luckRoll
                ? await context.luckRoll.render({ isPrivate })
                : null;
            return renderTemplate("systems/ptr2e/templates/chat/rolls/skill-check.hbs", {
                roll: context.roll,
                inner: innerRollHTML,
                innerLuck: luckRollHTML,
                isPrivate,
                degreeOfSuccess: context.degreeOfSuccess,
                luckRoll: context.luckRoll?.total,
                appliedLuck: this._source.appliedLuck,
                breakdown: context.roll.data.breakdown,
            });
        })();

        if(context.luckRoll) {
            context.label = "End of Day Luck Roll";
        }

        return renderTemplate("systems/ptr2e/templates/chat/skill.hbs", context);
    }

    activateListeners(html: JQuery<HTMLElement>) {
        html.find("button[data-action='increase-luck']").on("click", this.applyLuck.bind(this));
    }

    private async applyLuck() {
        if (this.appliedLuck) {
            ui.notifications.warn("You have already applied this luck increase.");
            return;
        }

        if (!this.context?.actor) return;
        if(!this.luckRoll?.total) return;

        await this.context.actor.update({
            "system.skills": this.context.actor.system.skills.map((skill) => {
                return skill.slug === "luck"
                    ? {
                          ...skill,
                          value: (skill.value ?? 0) + this.luckRoll!.total,
                      }
                    : skill;
            }),
        });
        ui.notifications.info(`Successfully applied Luck increase of ${this.luckRoll!.total} to ${this.context.actor.name}. New total: ${this.context.actor.system.skills.get('luck')!.total}`)

        await this.parent.update({ "system.appliedLuck": true });
    }
}

export default SkillMessageSystem;
