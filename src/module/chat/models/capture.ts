import { resolveCapture } from "@actor/helpers.ts";
import { SlugField } from "@module/data/fields/slug-field.ts";
import type PokeballActionPTR2e from "@module/data/models/pokeball-action.ts";
import type { CaptureRoll } from "@system/rolls/capture-roll.ts";
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

const captureMessageSchema = {
  rolls: new foundry.data.fields.SchemaField({
    accuracy: new foundry.data.fields.JSONField<{ required: true, nullable: true, validate: ((param: unknown) => void) }, AnyObject, Roll.Evaluated<CaptureRoll>>({ required: true, nullable: true, validate: validateRoll }),
    crit: new foundry.data.fields.JSONField<{ required: true, nullable: true, validate: ((param: unknown) => void) }, AnyObject, Roll.Evaluated<CaptureRoll>>({ required: true, nullable: true, validate: validateRoll }),
    shake1: new foundry.data.fields.JSONField<{ required: true, nullable: true, validate: ((param: unknown) => void) }, AnyObject, Roll.Evaluated<CaptureRoll>>({ required: true, nullable: true, validate: validateRoll }),
    shake2: new foundry.data.fields.JSONField<{ required: true, nullable: true, validate: ((param: unknown) => void) }, AnyObject, Roll.Evaluated<CaptureRoll>>({ required: true, nullable: true, validate: validateRoll }),
    shake3: new foundry.data.fields.JSONField<{ required: true, nullable: true, validate: ((param: unknown) => void) }, AnyObject, Roll.Evaluated<CaptureRoll>>({ required: true, nullable: true, validate: validateRoll }),
    shake4: new foundry.data.fields.JSONField<{ required: true, nullable: true, validate: ((param: unknown) => void) }, AnyObject, Roll.Evaluated<CaptureRoll>>({ required: true, nullable: true, validate: validateRoll }),
  }),
  origin: new foundry.data.fields.JSONField<{ required: true }, AnyObject, Actor.ConfiguredInstance>({ required: true }),
  target: new foundry.data.fields.DocumentUUIDField({ required: true, nullable: true, type: "Actor", readonly: true, }),
  slug: new SlugField(),
  result: new foundry.data.fields.SchemaField({
    modifiers: new foundry.data.fields.ArrayField(new foundry.data.fields.ObjectField(), { required: true, initial: [] }),
    domains: new foundry.data.fields.ArrayField(new SlugField(), { required: true, initial: [] }),
    type: new foundry.data.fields.StringField({ required: true, blank: true, initial: "" }),
    options: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField(), { required: true, initial: [] }),
  }, { required: true }),
}

export type CaptureMessageSchema = typeof captureMessageSchema;

abstract class CaptureMessageSystem extends foundry.abstract.TypeDataModel<CaptureMessageSchema, ChatMessage.ConfiguredInstance> {

  declare parent: ChatMessage.ConfiguredInstance & { system: CaptureMessageSystem };

  /**
   * Define the schema for the DamageAppliedMessageSystem data model
   */
  static override defineSchema(): CaptureMessageSchema {
    return captureMessageSchema;
  }

  get currentOrigin(): Promise<Maybe<Actor.ConfiguredInstance>> {
    return this.context?.origin?.uuid ? fromUuid<Actor.ConfiguredInstance>(this.context.origin.uuid as ActorUUID) : Promise.resolve(null);
  }

  override prepareBaseData(): void {
    this.context = null;

    const fromRollData = (rollData: string | null) => {
      if (!rollData) return null;
      try {
        return Roll.fromJSON(rollData) as unknown as Roll.Evaluated<CaptureRoll>;
      } catch (error: unknown) {
        Hooks.onError("CaptureMessageSystem#prepareBaseData", error as Error, {
          log: "error",
        });
      }
      return null;
    };

    const fromActorData = (actorData: string) => {
      if (!actorData) return null;

      const jsonData = (() => {
        try {
          return JSON.parse(actorData);
        } catch (error: unknown) {
          Hooks.onError("CaptureMessageSystem#prepareBaseData", error as Error, {
            log: "error",
          });
        }
      })();
      if (!jsonData) return null;

      const worldActor = fromUuidSync(jsonData.uuid) as Maybe<Actor.ConfiguredInstance>;
      if (worldActor) return worldActor;

      try {
        return CONFIG.Actor.documentClass.fromJSON(actorData) as Actor.ConfiguredInstance;
      } catch (error: unknown) {
        Hooks.onError("CaptureMessageSystem#prepareBaseData", error as Error, {
          log: "error",
        });
      }
      return null;
    };

    this.origin = fromActorData(this._source.origin)!;
    this.action = this.origin.actions.get(this._source.slug) as PokeballActionPTR2e;

    this.rolls = {
      accuracy: fromRollData(this._source.rolls.accuracy)!,
      crit: fromRollData(this._source.rolls.crit)!,
      shake1: fromRollData(this._source.rolls.shake1)!,
      shake2: fromRollData(this._source.rolls.shake2)!,
      shake3: fromRollData(this._source.rolls.shake3)!,
      shake4: fromRollData(this._source.rolls.shake4)!,
    };
  }

  async getHTMLContent() {
    const renderRolls = async (isPrivate: boolean) => {
      const renderInnerRoll = async (roll: Roll.Evaluated<CaptureRoll> | null, isPrivate: boolean) => {
        return roll ? roll.render({ isPrivate }) : null;
      };

      // TODO: Implement effect checks
      const rolls = {
        accuracy: await renderTemplate(
          "systems/ptr2e/templates/chat/rolls/accuracy-check.hbs",
          {
            inner: await renderInnerRoll(this.rolls.accuracy, isPrivate),
            isPrivate,
            type: "accuracy",
            label: "PTR2E.Capture.AccuracyCheck",
          }
        ),
        crit: await renderTemplate("systems/ptr2e/templates/chat/rolls/crit-check.hbs", {
          inner: await renderInnerRoll(this.rolls.crit, isPrivate),
          isPrivate,
          type: "crit",
          label: "PTR2E.Capture.CritCheck",
        }),
        shake1: await renderTemplate(
          "systems/ptr2e/templates/chat/rolls/shake-check.hbs",
          {
            inner: await renderInnerRoll(this.rolls.shake1, isPrivate),
            isPrivate,
            count: 1,
            label: "PTR2E.Capture.ShakeCheck",
          }
        ),
        shake2: await renderTemplate(
          "systems/ptr2e/templates/chat/rolls/shake-check.hbs",
          {
            inner: await renderInnerRoll(this.rolls.shake2, isPrivate),
            isPrivate,
            count: 2,
            label: "PTR2E.Capture.ShakeCheck",
          }
        ),
        shake3: await renderTemplate(
          "systems/ptr2e/templates/chat/rolls/shake-check.hbs",
          {
            inner: await renderInnerRoll(this.rolls.shake3, isPrivate),
            isPrivate,
            count: 3,
            label: "PTR2E.Capture.ShakeCheck",
          }
        ),
        shake4: await renderTemplate(
          "systems/ptr2e/templates/chat/rolls/shake-check.hbs",
          {
            inner: await renderInnerRoll(this.rolls.shake4, isPrivate),
            isPrivate,
            count: 4,
            label: "PTR2E.Capture.ShakeCheck",
          }
        ),
      };

      return rolls;
    };

    const context: CaptureMessageRenderContext = this.context ?? (this.context = {
      origin: this.origin,
      action: this.action,
      rolls: await renderRolls(false),
      state: (() => {
        const data = {
          accuracy: (this.rolls.accuracy?.total ?? 1) <= 0,
          crit: (this.rolls.crit?.total ?? 1) <= 0,
          shake1: (this.rolls.shake1?.total ?? 1) <= 0,
          shake2: (this.rolls.shake2?.total ?? 1) <= 0,
          shake3: (this.rolls.shake3?.total ?? 1) <= 0,
          shake4: (this.rolls.shake4?.total ?? 1) <= 0,
          success: false,
          delay: 12
        }
        data.success = data.accuracy && ((data.crit && data.shake1) || (!data.crit && data.shake1 && data.shake2 && data.shake3 && data.shake4));
        if (data.accuracy) {
          if (data.crit) {
            data.delay = 5.5
          }
          else {
            if (!data.shake3) {
              data.delay = 10;
            }
            if (!data.shake2) {
              data.delay = 8;
            }
            if (!data.shake1) {
              data.delay = 6;
            }
          }
        }
        else {
          data.delay = 2.5;
        }
        return data;
      })(),
      target: this.target ? (await fromUuid<Actor.ConfiguredInstance>(this.target)) : null,
    });

    return renderTemplate("systems/ptr2e/templates/chat/capture.hbs", context);
  }

  public async applyLuckIncrease(number: number) {
    const roll = foundry.utils.duplicate(this.parent.system.rolls.accuracy);
    if (roll == undefined) return;
    const currentResult = roll.total!;
    if ((currentResult - number) % 10 !== 0) {
      ui.notifications.warn("Luck increases must be multiples of 10.");
      return;
    }

    const actor = await this.currentOrigin;
    if (!actor) return;

    const luck = actor.system.skills.get("luck")!.total;
    if (luck < number) {
      ui.notifications.warn("You do not have enough Luck to apply this increase.");
      return;
    }

    const skills = actor.system.skills.map((skill) => {
      return skill.slug === "luck"
        ? {
          ...skill,
          value: luck - number,
        }
        : skill;
    });
    await actor.update({ "system.skills": skills });

    const notification = `Successfully applied Luck to this roll, spending ${number} Luck from ${actor.name
      }. New total: ${actor.system.skills.get("luck")!.total}`
    ui.notifications.info(notification);

    roll.total! -= number;

    await this.parent.update({ "system.rolls.accuracy": roll });

    await CONFIG.ChatMessage.documentClass.create({
      whisper: CONFIG.ChatMessage.documentClass.getWhisperRecipients("GM") as unknown as string[],
      speaker: { alias: actor.name },
      content: notification,
    });
  }

  activateListeners(html: JQuery<HTMLElement>) {
    html.find("[data-action='apply-capture']").on("click", async (event) => {
      event.preventDefault();
      const { originUuid, targetUuid, success } = (event.currentTarget as HTMLButtonElement).dataset;
      if (!originUuid || !targetUuid) return;

      resolveCapture(originUuid, targetUuid, success === "true");
    });
  }
}

interface CaptureMessageSystem {
  context: Maybe<CaptureMessageRenderContext>;
  action: PokeballActionPTR2e;
}
interface CaptureMessageRenderContext {
  origin: Actor.ConfiguredInstance;
  action: PokeballActionPTR2e;
  rolls: {
    accuracy: string | null;
    crit: string | null;
    shake1: string | null;
    shake2: string | null;
    shake3: string | null;
    shake4: string | null;
  }
  state: {
    accuracy: boolean;
    crit: boolean;
    shake1: boolean;
    shake2: boolean;
    shake3: boolean;
    shake4: boolean;
    success: boolean;
    delay: number;
  }
  target: Maybe<Actor.ConfiguredInstance>
}

// interface CaptureMessageSchema extends foundry.data.fields.DataSchema {
//   origin: foundry.data.fields.JSONField<ActorPTR2e, true, false, false>;
//   slug: SlugField<string, string, true, false, false>;
//   rolls: foundry.data.fields.SchemaField<
//     RollsSchema,
//     SourceFromSchema<RollsSchema>,
//     ModelPropsFromSchema<RollsSchema>,
//     true,
//     false,
//     true
//   >;
//   target: foundry.data.fields.DocumentUUIDField<string, true, true, false>;
//   result: foundry.data.fields.SchemaField<
//     CaptureMessageContextSchema,
//     foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<CaptureMessageContextSchema>>,
//     foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<CaptureMessageContextSchema>>,
//     true,
//     false,
//     true
//   >
// }

// interface RollsSchema extends foundry.data.fields.DataSchema {
//   accuracy: foundry.data.fields.JSONField<Rolled<CaptureRoll>, true, true, false>;
//   crit: foundry.data.fields.JSONField<Rolled<CaptureRoll>, true, true, false>;
//   shake1: foundry.data.fields.JSONField<Rolled<CaptureRoll>, true, true, false>;
//   shake2: foundry.data.fields.JSONField<Rolled<CaptureRoll>, true, true, false>;
//   shake3: foundry.data.fields.JSONField<Rolled<CaptureRoll>, true, true, false>;
//   shake4: foundry.data.fields.JSONField<Rolled<CaptureRoll>, true, true, false>;
// }

// interface CaptureMessageContextSchema extends foundry.data.fields.DataSchema {
//   domains: foundry.data.fields.ArrayField<SlugField, string[], string[], true, false, true>;
//   modifiers: foundry.data.fields.ArrayField<foundry.data.fields.ObjectField<ModifierPTR2e>, ModifierPTR2e[], ModifierPTR2e[], true, false, true>;
//   options: foundry.data.fields.ArrayField<foundry.data.fields.StringField, string[], string[], true, false, true>;
//   type: foundry.data.fields.StringField<string, string, true, false, true>;
// }

export default CaptureMessageSystem;
