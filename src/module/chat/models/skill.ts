import { SlugField } from "@module/data/fields/slug-field.ts";
import type SkillPTR2e from "@module/data/models/skill.ts";
import { RollNote } from "@system/notes.ts";
import type { CheckRoll } from "@system/rolls/check-roll.ts";
import { PredicateField } from "@system/predication/schema-data-fields.ts";
import type { AnyObject } from "fvtt-types/utils";

/**
 * Validate that Rolls belonging to the ChatMessage document are valid
 * @param {string} rollJSON     The serialized Roll data
 */
function validateRoll(rollJSON: unknown) {
  const roll = JSON.parse(rollJSON as string);
  if (!roll.evaluated)
    throw new Error(`Roll objects added to ChatMessage documents must be evaluated`);
}

const skillMessageSchema = {
  roll: new foundry.data.fields.JSONField({
    required: true,
    validate: validateRoll,
  }),
  origin: new foundry.data.fields.JSONField({ required: true }),
  slug: new SlugField({ required: true }),
  luckRoll: new foundry.data.fields.JSONField<
    { required: true, nullable: true },
    AnyObject,
    Roll.Evaluated<CheckRoll> | null,
    string | null
  >({ required: true, nullable: true }),
  appliedLuck: new foundry.data.fields.BooleanField({ required: true, initial: false }),
  rerolled: new foundry.data.fields.BooleanField({ required: true, initial: false }),
  result: new foundry.data.fields.SchemaField({
    modifiers: new foundry.data.fields.ArrayField(new foundry.data.fields.ObjectField(), { required: true, initial: [] }),
    domains: new foundry.data.fields.ArrayField(new SlugField(), { required: true, initial: [] }),
    type: new foundry.data.fields.StringField({ required: true, blank: true, initial: "" }),
    options: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField(), { required: true, initial: [] }),
    notes: new foundry.data.fields.ArrayField(
      new foundry.data.fields.SchemaField({
        selector: new foundry.data.fields.StringField({ required: true, blank: true, initial: "" }),
        title: new foundry.data.fields.StringField({ required: true, blank: true, initial: "" }),
        text: new foundry.data.fields.StringField({ required: true, blank: true, initial: "" }),
        predicate: new PredicateField({ required: true, initial: [] }),
        outcome: new foundry.data.fields.ArrayField(new foundry.data.fields.NumberField({ required: true, nullable: false }), { required: true, initial: [] }),
        visibility: new foundry.data.fields.StringField({ required: true, initial: "all", choices: ["all", "gm", "owner", "none"] }),
      }),
      { required: true, initial: [] }
    ),
  }, { required: true }),
};

export type SkillMessageSchema = typeof skillMessageSchema;

abstract class SkillMessageSystem extends foundry.abstract.TypeDataModel<SkillMessageSchema, ChatMessage.ConfiguredInstance> {

  /**
   * Define the schema for the SkillMessageSystem data model
   */
  static override defineSchema(): SkillMessageSchema {
    return skillMessageSchema;
  }

  override prepareBaseData(): void {
    this.context = null;

    let roll;
    try {
      roll = Roll.fromJSON(this._source.roll) as unknown as Roll.Evaluated<CheckRoll>;
    } catch (error) {
      Hooks.onError("SkillMessageSystem#roll", error as Error, { log: "error", data: this._source });
    }

    let luckRoll;
    try {
      if (this._source.luckRoll)
        luckRoll = Roll.fromJSON(this._source.luckRoll) as unknown as Roll.Evaluated<CheckRoll>;
      else luckRoll = null;
    } catch (error) {
      Hooks.onError("SkillMessageSystem#luckRoll", error as Error, {
        log: "error",
        data: this._source,
      });
    }

    const origin = (() => {
      const origin = JSON.parse(this._source.origin);
      if (!origin) return null;
      const actor = fromUuidSync<Actor.ConfiguredInstance>(origin.uuid) as Actor.ConfiguredInstance | null;
      return actor ?? new CONFIG.Actor.documentClass(origin);
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

  async getHTMLContent() {
    const context: this["context"] & Record<string, unknown> = this.context ?? {};
    context.degreeOfSuccess = context.roll
      ? context.roll.total > 0
        ? Math.ceil(context.roll.total / -10) - 1
        : Math.floor(context.roll.total / -10) + 1
      : null;

    if (context.luckRoll && typeof context.degreeOfSuccess === "number") {
      context.degreeOfSuccess *= -1;
    }

    context.rollHTML = await (async (isPrivate = false) => {
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
        rerolled: this._source.rerolled,
        notes: RollNote.notesToHTML(this.result.notes.map(n => new RollNote(n)))?.outerHTML
      });
    })();

    if (context.luckRoll) {
      context.label = "End of Day Luck Roll";
    }

    return renderTemplate("systems/ptr2e/templates/chat/skill.hbs", context);
  }

  activateListeners(html: JQuery<HTMLElement>) {
    html.find("button[data-action='increase-luck']").on("click", this.applyLuck.bind(this));
  }

  public async reroll() {
    if (this.rerolled) return;
    if (!this.context?.actor) return;
    if (!this.context?.roll) return;

    const reroll = (await this.context.roll.clone().roll()) as Roll.Evaluated<CheckRoll>;
    await this.parent.update({ "system.roll": reroll.toJSON(), "system.rerolled": true });
  }

  get currentOrigin(): Promise<Maybe<Actor.ConfiguredInstance>> {
    return this.context?.actor?.uuid ? fromUuid<Actor.ConfiguredInstance>(this.context.actor.uuid) : Promise.resolve(null);
  }

  public async applyLuckIncrease(number: number) {
    if (!this.context?.roll) return;
    if (!this.context.actor) return;
    const currentResult = this.context.roll.total;
    if ((currentResult - number) % 10 !== 0) {
      ui.notifications.warn("Luck increases must be multiples of 10.");
      return;
    }

    const actor = await this.currentOrigin;
    if (!actor) return;

    const luck = actor.spendableLuck;
    if (luck < number || luck - number <= 0) {
      ui.notifications.warn("You do not have enough Luck to apply this increase.");
      return;
    }

    const spent = await actor.spendLuck(number);
    if (!spent?.length) {
      ui.notifications.warn("Something went wrong while trying to apply Luck!");
      return;
    }

    const notification = `Luck spent: ${spent.map(s => `${s.name} (Used ${s.amount}, leftover: ${s.leftover})`).join(", ")}`
    ui.notifications.info(notification);

    const roll = foundry.utils.duplicate(this.roll);
    //@ts-expect-error - As this is an object duplicate, the property is no longer read-only.
    roll.total -= number;

    await this.parent.update({ "system.roll": roll });

    await CONFIG.ChatMessage.documentClass.create({
      whisper: CONFIG.ChatMessage.documentClass.getWhisperRecipients("GM") as unknown as string[],
      speaker: { alias: actor.name },
      content: notification,
    })
  }

  private async applyLuck() {
    if (this.appliedLuck) {
      ui.notifications.warn("You have already applied this luck increase.");
      return;
    }

    if (!this.context?.actor) return;
    if (!this.luckRoll?.total) return;

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
    ui.notifications.info(
      `Successfully applied Luck increase of ${this.luckRoll!.total} to ${this.context.actor.name
      }. New total: ${this.context.actor.system.skills.get("luck")!.total}`
    );

    await this.parent.update({ "system.appliedLuck": true });
  }
}

interface SkillMessageSystem {
  context: {
    actor?: Actor.ConfiguredInstance;
    skill?: SkillPTR2e;
    roll?: Roll.Evaluated<CheckRoll>;
    luckRoll?: Roll.Evaluated<CheckRoll> | null;
    appliedLuck?: boolean;
  } | null;
}

export default SkillMessageSystem;
