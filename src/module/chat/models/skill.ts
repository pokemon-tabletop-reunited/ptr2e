import { ActorPTR2e } from "@actor";
import { ChatMessagePTR2e } from "@chat";
import { SlugField } from "@module/data/fields/slug-field.ts";
import SkillPTR2e from "@module/data/models/skill.ts";
import { ModifierPTR2e } from "@module/effects/modifiers.ts";
import { RollNote } from "@system/notes.ts";
import { CheckRoll } from "@system/rolls/check-roll.ts";
import { CheckContextRollNotesSchemaField } from "./attack.ts";
import { PredicateField } from "@system/predication/schema-data-fields.ts";

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

interface SkillMessageSchema extends foundry.data.fields.DataSchema {
  roll: foundry.data.fields.JSONField<Rolled<CheckRoll>, true, false, false>;
  origin: foundry.data.fields.JSONField<ActorPTR2e["_source"], true, false, false>;
  slug: SlugField<string, string, true, false, false>;
  luckRoll: foundry.data.fields.JSONField<Rolled<CheckRoll>, true, true, false>;
  appliedLuck: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
  rerolled: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
  result: foundry.data.fields.SchemaField<
    SkillMessageContextSchema,
    foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<SkillMessageContextSchema>>,
    foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<SkillMessageContextSchema>>,
    true,
    false,
    true
  >
}

interface SkillMessageContextSchema extends foundry.data.fields.DataSchema {
  domains: foundry.data.fields.ArrayField<SlugField, string[], string[], true, false, true>;
  modifiers: foundry.data.fields.ArrayField<foundry.data.fields.ObjectField<ModifierPTR2e>, ModifierPTR2e[], ModifierPTR2e[], true, false, true>;
  options: foundry.data.fields.ArrayField<foundry.data.fields.StringField, string[], string[], true, false, true>;
  type: foundry.data.fields.StringField<string, string, true, false, true>;
  notes: foundry.data.fields.ArrayField<
    CheckContextRollNotesSchemaField,
    foundry.data.fields.SourcePropFromDataField<CheckContextRollNotesSchemaField>[],
    foundry.data.fields.ModelPropFromDataField<CheckContextRollNotesSchemaField>[],
    true, false, true>;
}

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
      rerolled: new fields.BooleanField({ required: true, initial: false }),
      result: new fields.SchemaField({
        modifiers: new fields.ArrayField(new fields.ObjectField(), { required: true, initial: [] }),
        domains: new fields.ArrayField(new SlugField(), { required: true, initial: [] }),
        type: new fields.StringField({ required: true, blank: true, initial: "" }),
        options: new fields.ArrayField(new fields.StringField(), { required: true, initial: [] }),
        notes: new fields.ArrayField(
          new fields.SchemaField({
            selector: new fields.StringField({ required: true, blank: true, initial: "" }),
            title: new fields.StringField({ required: true, blank: true, initial: "" }),
            text: new fields.StringField({ required: true, blank: true, initial: "" }),
            predicate: new PredicateField({ required: true, initial: [] }),
            outcome: new fields.ArrayField(new fields.NumberField(), { required: true, initial: [] }),
            visibility: new fields.StringField({ required: true, initial: "all", choices: ["all", "gm", "owner", "none"] }),
          }),
          { required: true, initial: [] }
        ),
      }, { required: true }),
    };
  }

  /**
   * Validate that Rolls belonging to the ChatMessage document are valid
   * @param {string} rollJSON     The serialized Roll data
   */
  static #validateRoll(rollJSON: unknown) {
    const roll = JSON.parse(rollJSON as string);
    if (!roll.evaluated)
      throw new Error(`Roll objects added to ChatMessage documents must be evaluated`);
  }

  override prepareBaseData(): void {
    this.context = null;

    let roll;
    try {
      roll = Roll.fromJSON(this._source.roll) as Rolled<CheckRoll>;
    } catch (error) {
      Hooks.onError("SkillMessageSystem#roll", error as Error, { log: "error", data: this._source });
    }

    let luckRoll;
    try {
      if (this._source.luckRoll)
        luckRoll = Roll.fromJSON(this._source.luckRoll) as Rolled<CheckRoll>;
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
      const actor = fromUuidSync(origin.uuid) as ActorPTR2e;
      return actor ?? new ActorPTR2e(origin);
    })();
    if (!origin)
      Hooks.onError(
        "SkillMessageSystem#origin",
        new Error(`Could not find origin actor with UUID ${this._source.origin}`),
        { log: "error", data: this._source }
      );

    const skill = origin?.system.skills[this._source.slug];
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

  private readonly challengeRatings = {
    "60": "+60 (Effortless)",
    "50": "+50 (Trivial)",
    "40": "+40 (Easy)",
    "30": "+30 (Simple)",
    "20": "+20 (Routine)",
    "10": "+10 (Ordinary)",
    "0": "+0 (Demanding)",
    "-10": "-10 (Taxing)",
    "-20": "-20 (Challenging)",
    "-30": "-30 (Difficult)",
    "-40": "-40 (Intense)",
    "-50": "-50 (Insane)",
    "-60": "-60 (Impossible)",
  } as const;

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
      return foundry.applications.handlebars.renderTemplate("systems/ptr2e/templates/chat/rolls/skill-check.hbs", {
        roll: context.roll,
        inner: innerRollHTML,
        innerLuck: luckRollHTML,
        isPrivate,
        degreeOfSuccess: context.degreeOfSuccess,
        luckRoll: context.luckRoll?.total,
        appliedLuck: this._source.appliedLuck,
        breakdown: (() => {
          if (context.roll.data.breakdown) return context.roll.data.breakdown;

          let breakdown = `<div class="dice-roll" data-action="expandRoll"><div class="dice-result"><div class="dice-formula">Roll breakdown</div><div class="dice-tooltip"><div class="wrapper">`;
          for (const modifier of this.result.modifiers) {
            if (modifier.modifier === 0 && modifier.slug !== "challenge-rating") continue;

            //@ts-expect-error - Index type is correct, but TypeScript doesn't like it
            breakdown += `<span class="d-flex flex-row justify-content-evenly"><span class="fb-45"><b>${modifier.label}:</b></span><span class="fb-45 ${modifier.modifier >= 0 ? "pos" : "neg"}">${modifier.slug === "challenge-rating" ? this.challengeRatings[modifier.modifier.toString()] : modifier.modifier > 0 ? `+${modifier.modifier}` : modifier.modifier}</span></span>`;
          }

          return breakdown + "</div></div></div></div>";
        })(),
        rerolled: this._source.rerolled,
        notes: RollNote.notesToHTML(this.result.notes.map(n => new RollNote(n)))?.outerHTML
      });
    })();

    if (context.luckRoll) {
      context.label = "End of Day Luck Roll";
    }

    return foundry.applications.handlebars.renderTemplate("systems/ptr2e/templates/chat/skill.hbs", context);
  }

  activateListeners(html: JQuery<HTMLElement>) {
    html.find("button[data-action='increase-luck']").on("click", this.applyLuck.bind(this));
  }

  public async reroll() {
    if (this.rerolled) return;
    if (!this.context?.actor) return;
    if (!this.context?.roll) return;

    const reroll = (await this.context.roll.clone().roll()) as Rolled<CheckRoll>;
    await this.parent.update({ "system.roll": reroll.toJSON(), "system.rerolled": true });
  }

  get currentOrigin(): Promise<Maybe<ActorPTR2e>> {
    return this.context?.actor?.uuid ? fromUuid<ActorPTR2e>(this.context.actor.uuid) : Promise.resolve(null);
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

    const roll = fu.duplicate(this.roll);
    //@ts-expect-error - As this is an object duplicate, the property is no longer read-only.
    roll.total -= number;

    await this.parent.update({ "system.roll": roll });

    await ChatMessagePTR2e.create({
      whisper: ChatMessagePTR2e.getWhisperRecipients("GM") as unknown as string[],
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
      "system.skills": Object.fromEntries(Object.entries(this.context.actor.system.skills).map(([slug, skill]) => {
        return slug === "luck"
          ? [slug, {
            ...skill,
            value: (skill.value ?? 0) + this.luckRoll!.total,
          }]
          : [slug, skill];
      })),
    });
    ui.notifications.info(
      `Successfully applied Luck increase of ${this.luckRoll!.total} to ${this.context.actor.name
      }. New total: ${this.context.actor.system.skills["luck"]!.total}`
    );

    await this.parent.update({ "system.appliedLuck": true });
  }
}

export default SkillMessageSystem;
