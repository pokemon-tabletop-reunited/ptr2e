import type { AuraAppearanceData, AuraData, AuraEffectData } from "@actor";
import { userColorForActor } from "@actor/helpers.ts";
import { ChangeModel } from "@data";
import { DataUnionField } from "@module/data/fields/data-union-field.ts";
import ResolvableValueField from "@module/data/fields/resolvable-value-field.ts";
import { StrictArrayField, StrictBooleanField, StrictNumberField, StrictStringField } from "@module/data/fields/strict-primitive-fields.ts";
import { PredicateField } from "@system/predication/schema-data-fields.ts";
import { isImageOrVideoPath } from "@utils";
import type { ChangeModelSchema } from "./change.ts";

const auraEffectSchema = (() => {
  const fields = foundry.data.fields;

  const effectSchemaField = new fields.SchemaField({
    uuid: new StrictStringField({ required: true, blank: false, nullable: false, initial: undefined }),
    affects: new StrictStringField<
      { required: true; nullable: false; blank: false; initial: "all", choices: ["allies", "enemies", "all"] },
      "allies" | "enemies" | "all",
      "allies" | "enemies" | "all"
    >({
      required: true,
      nullable: false,
      blank: false,
      initial: "all",
      choices: ["allies", "enemies", "all"],
    }),
    events: new StrictArrayField(
      new StrictStringField<
        { required: true; blank: false; nullable: false; initial: "enter", choices: ["enter", "turn-start", "turn-end"] },
        "enter" | "turn-start" | "turn-end",
        "enter" | "turn-start" | "turn-end"
      >({
        required: true,
        blank: false,
        nullable: false,
        initial: "enter",
        choices: ["enter", "turn-start", "turn-end"],
      }),
      { required: true, nullable: false, initial: ["enter"] },
    ),
    appliesSelfOnly: new StrictBooleanField({
      required: true,
      nullable: false,
      initial: false,
    }),
    predicate: new PredicateField({ required: false, nullable: false }),
    removeOnExit: new StrictBooleanField({
      required: true,
      nullable: false,
      initial: true,
    }),
    includesSelf: new StrictBooleanField({
      required: false,
      nullable: false,
      initial: (d: unknown) => (d as { affects: string }).affects !== "enemies",
    }),
  });

  const xyPairSchema = ({ integer }: { integer: boolean }) => ({
    x: new StrictNumberField({
      required: true,
      integer,
      nullable: false,
      initial: undefined,
    }),
    y: new StrictNumberField({
      required: true,
      integer,
      nullable: false,
      initial: undefined,
    }),
  });

  const appearanceSchema = {
    border: new fields.SchemaField(
      {
        color: new DataUnionField(
          [
            new StrictStringField({
              required: true,
              choices: ["user-color"],
              initial: undefined,
            }),
            new fields.ColorField({ required: true, nullable: false, initial: undefined }),
          ],
          {
            required: true,
            nullable: false,
            initial: "#000000",
          },
        ),
        alpha: new fields.AlphaField({
          required: true,
          nullable: false,
          initial: 0.75,
        }),
      },
      {
        required: false,
        nullable: true,
        initial: () => ({ color: "#000000", alpha: 0.75 }),
      },
    ),
    highlight: new fields.SchemaField(
      {
        color: new DataUnionField(
          [
            new StrictStringField({
              required: true,
              nullable: false,
              choices: ["user-color"],
              initial: undefined,
            }),
            new fields.ColorField({ required: true, nullable: false, initial: undefined }),
          ],
          {
            required: true,
            nullable: false,
            initial: "user-color",
          },
        ),
        alpha: new fields.AlphaField({
          required: false,
          nullable: false,
          initial: 0.25,
        }),
      },
      {
        required: false,
        nullable: false,
        initial: () => ({ color: "user-color", alpha: 0.25 }),
      },
    ),
    texture: new fields.SchemaField(
      {
        src: new StrictStringField({
          required: true,
          nullable: false,
          initial: undefined,
          label: "TOKEN.ImagePath",
        }),
        alpha: new fields.AlphaField({
          required: true,
          nullable: false,
          initial: 1,
        }),
        scale: new StrictNumberField({
          required: true,
          nullable: false,
          positive: true,
          initial: 1,
          label: "Scale",
        }),
        translation: new fields.SchemaField(xyPairSchema({ integer: true }), {
          required: false,
          nullable: true,
          initial: null,
        }),
        loop: new StrictBooleanField({
          required: false,
          nullable: false,
          initial: true,
        }),
        playbackRate: new StrictNumberField({
          required: false,
          nullable: false,
          positive: true,
          max: 4,
          initial: 1,
        }),
      },
      { required: false, nullable: true, initial: null },
    ),
  };

  return {
    radius: new ResolvableValueField({
      required: true,
      nullable: false,
      initial: 1,
    }),
    effects: new StrictArrayField(effectSchemaField, {
      required: true,
      nullable: false
    }),
    appearance: new fields.SchemaField(appearanceSchema, {
      required: true,
      nullable: false,
      initial: {
        border: { color: "#FF0000", alpha: 0.75 },
        highlight: { color: "user-color", alpha: 0.25 },
        texture: null
      }
    }),
    mergeExisting: new StrictBooleanField({
      required: true,
      nullable: false,
      initial: true
    })
  };
})();

export type AuraChangeSchema = typeof auraEffectSchema & ChangeModelSchema;

class AuraChangeSystem extends ChangeModel<AuraChangeSchema> {
  static override TYPE = "aura";

  static override defineSchema(): AuraChangeSchema {
    return {
      ...super.defineSchema() as ChangeModelSchema,
      ...auraEffectSchema
    };
  }

  override apply(actor: Actor.ConfiguredInstance): void {
    if (!this.test()) return;

    const radius = Math.clamp(Math.ceil(Number(this.resolveValue(this.radius))), 1, 50);

    if (!(Number.isInteger(radius) && radius > 0)) {
      this.failValidation("Aura radius must be a positive integer.");
      return;
    }

    const dimensions = actor.dimensions;
    const tokenSizeAlteredRadius = radius + Math.min(dimensions.length, dimensions.width) / 2;

    const data: AuraData = {
      slug: this.slug,
      radius: tokenSizeAlteredRadius,
      effects: this.#processEffects(),
      traits: [],
      appearance: this.#processAppearanceData(actor),
    }

    // Late validation check of effect UUID
    for (const effect of data.effects) {
      const indexEntry = fromUuidSync(effect.uuid);
      if (!(indexEntry && "type" in indexEntry && typeof indexEntry.type === "string")) {
        this.failValidation(`Unable to resolve effect uuid: ${effect.uuid}`);
        return;
      }
      if (indexEntry.type !== "effect") {
        this.failValidation(`Item with uuid ${effect.uuid} is not an effect item.`);
      }
    }

    const existing = actor.auras.get(this.slug);
    if (existing && this.mergeExisting) {
      existing.radius = data.radius;
      existing.appearance = data.appearance;
      for (const effect of data.effects) {
        const existingIndex = existing.effects.findIndex(e => e.uuid === effect.uuid);
        if (existingIndex === -1) {
          existing.effects.splice(existingIndex, 1, effect)
        } else {
          existing.effects.push(effect);
        }
      }
    } else {
      actor.auras.set(this.slug, data);
    }
  }

  #processEffects(): AuraEffectData[] {
    return this.effects.map(e => ({
      ...e,
      uuid: this.resolveInjectedProperties(e.uuid)
    }))
  }

  #processAppearanceData(this: AuraChangeSystem, actor: Actor.ConfiguredInstance): AuraAppearanceData {
    const appearance = foundry.utils.deepClone(this.appearance);
    const { border, highlight, texture } = appearance;
    const textureSrc = ((): ImageFilePath | VideoFilePath | null => {
      if (!texture) return null;
      const maybeTextureSrc = this.resolveInjectedProperties(texture.src);
      return isImageOrVideoPath(maybeTextureSrc) ? maybeTextureSrc : "icons/svg/hazard.svg";
    })();

    if (border) {
      border.color =
        border.color === "user-color" ? Color.fromString(userColorForActor(actor)) : border.color;
    }
    highlight.color =
      highlight.color === "user-color" ? Color.fromString(userColorForActor(actor)) : highlight.color;

    return {
      border: border && { color: Number(border.color), alpha: border.alpha },
      highlight: { color: Number(highlight.color), alpha: highlight.alpha ?? 1 },
      texture: (texture?.alpha && textureSrc) ? { ...texture, src: textureSrc } : null
    };
  }
}

interface AuraChangeSystem {
  value: string | number;
}

export default AuraChangeSystem;
export type { AuraChangeSystem };