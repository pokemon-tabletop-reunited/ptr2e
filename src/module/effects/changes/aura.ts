import { ActorPTR2e, AuraAppearanceData, AuraData, AuraEffectData } from "@actor";
import { userColorForActor } from "@actor/helpers.ts";
import { ChangeModel, ChangeSchema } from "@data";
import { DataUnionField } from "@module/data/fields/data-union-field.ts";
import ResolvableValueField from "@module/data/fields/resolvable-value-field.ts";
import { StrictArrayField, StrictBooleanField, StrictNumberField, StrictStringField } from "@module/data/fields/strict-primitive-fields.ts";
import { PredicateField } from "@system/predication/schema-data-fields.ts";
import { isImageOrVideoPath } from "@utils";

export default class AuraChangeSystem extends ChangeModel {
  static override TYPE = "aura";

  static override defineSchema(): AuraChangeSystemSchema {
    const fields = foundry.data.fields;

    const effectSchemaField: foundry.data.fields.SchemaField<AuraEffectSchema> = new fields.SchemaField({
      uuid: new StrictStringField({ required: true, blank: false, nullable: false, initial: undefined }),
      affects: new StrictStringField({
        required: true,
        nullable: false,
        blank: false,
        initial: "all",
        choices: ["allies", "enemies", "all"],
      }),
      events: new StrictArrayField(
        new StrictStringField({
          required: true,
          blank: false,
          nullable: false,
          initial: undefined,
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
        initial: (d) => d.affects !== "enemies",
      }),
    });

    const xyPairSchema = ({ integer }: { integer: boolean }): xyPairSchema => ({
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

    const appearanceSchema: AuraAppearanceSchema = {
      border: new fields.SchemaField(
        {
          color: new DataUnionField(
            [
              new StrictStringField<"user-color", "user-color", true, false, false>({
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
        } as const,
        {
          required: false,
          nullable: true,
          initial: () => ({ color: "#000000", alpha: 0.75 }),
        } as const,
      ),
      highlight: new fields.SchemaField(
        {
          color: new DataUnionField(
            [
              new StrictStringField<"user-color", "user-color", true, false, false>({
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
        } as const,
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
          } as const),
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
        } as const,
        { required: false, nullable: true, initial: null },
      ),
    };

    return {
      ...super.defineSchema(),
      radius: new ResolvableValueField<true, false, true>({
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
  }

  override apply(actor: ActorPTR2e): void {
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

  #processAppearanceData(actor: ActorPTR2e): AuraAppearanceData {
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
      highlight: { color: Number(highlight.color), alpha: highlight.alpha },
      texture: texture?.alpha && textureSrc ? { ...texture, src: textureSrc } : null,
    };
  }
}

export default interface AuraChangeSystem extends ChangeModel, ModelPropsFromSchema<AuraChangeSystemSchema> {
  _source: SourceFromSchema<AuraChangeSystemSchema>;

  value: string | number;
}

interface AuraChangeSystemSchema extends ChangeSchema {
  /** The radius of the aura in meters, or a string that resolves to one. */
  radius: ResolvableValueField<true, false, true>;
  /** References to effects included in this aura */
  effects: StrictArrayField<
    foundry.data.fields.SchemaField<AuraEffectSchema>,
    SourceFromSchema<AuraEffectSchema>[],
    ModelPropsFromSchema<AuraEffectSchema>[],
    true,
    false,
    true
  >;
  /**
   * Custom border, highlight, and texture for the aura: if omitted, the border color will be black, the fill
   * color the user's configured color, and no texture.
   */
  appearance: foundry.data.fields.SchemaField<
    AuraAppearanceSchema,
    SourceFromSchema<AuraAppearanceSchema>,
    ModelPropsFromSchema<AuraAppearanceSchema>,
    true,
    false,
    true
  >;
  /**
   * If another aura with the same slug is already being emitted, merge this aura's data in with the other's,
   * combining effects as well as merging `colors` data.
   */
  mergeExisting: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
}

interface AuraEffectSchema extends foundry.data.fields.DataSchema {
  uuid: StrictStringField<string, string, true, false, false>;
  affects: StrictStringField<"allies" | "enemies" | "all", "allies" | "enemies" | "all", true, false, true>;
  appliesSelfOnly: StrictBooleanField<true, false, true>;
  events: foundry.data.fields.ArrayField<
    StrictStringField<"enter" | "turn-start" | "turn-end", "enter" | "turn-start" | "turn-end", true, false, false>,
    ("enter" | "turn-start" | "turn-end")[],
    ("enter" | "turn-start" | "turn-end")[],
    true,
    false,
    true
  >;
  /** A predicating limiting whether the effect is transmitted to an actor */
  predicate: PredicateField<false, false, true>;
  /** Whether to remove the effect from an actor immediately after its token exits the area */
  removeOnExit: StrictBooleanField<true, false, true>;
  /** Whether the effect is applied to the actor emitting the aura */
  includesSelf: StrictBooleanField<false, false, true>;
  /** An array of alterations to apply to the effect before transmitting it */
  // alterations: StrictArrayField<EmbeddedDataField<ItemAlteration>>;
};

interface AuraAppearanceSchema extends foundry.data.fields.DataSchema {
  /** Configuration of the border's color and alpha */
  border: foundry.data.fields.SchemaField<
    {
      color: DataUnionField<
        StrictStringField<"user-color", "user-color", true, false, false> | foundry.data.fields.ColorField<true, false, false>,
        true,
        false,
        true
      >;
      alpha: foundry.data.fields.AlphaField<true, false, true>;
    },
    { color: "user-color" | HexColorString; alpha: number },
    { color: "user-color" | Color; alpha: number },
    false,
    true,
    true
  >;
  /** Configuration of the highlight's color and alpha */
  highlight: foundry.data.fields.SchemaField<
    {
      color: DataUnionField<
        StrictStringField<"user-color", "user-color", true, false, false> | foundry.data.fields.ColorField<true, false, false>,
        true,
        false,
        true
      >;
      alpha: foundry.data.fields.AlphaField<false, false, true>;
    },
    { color: "user-color" | HexColorString; alpha: number },
    { color: "user-color" | Color; alpha: number },
    false,
    false,
    true
  >;
  /** Configuration for a texture (image or video) drawn as part of the aura */
  texture: foundry.data.fields.SchemaField<
    AuraTextureSchema,
    SourceFromSchema<AuraTextureSchema>,
    ModelPropsFromSchema<AuraTextureSchema>,
    false,
    true,
    true
  >;
}

interface AuraTextureSchema extends foundry.data.fields.DataSchema {
  /** The path to the texture file: can be injected */
  src: StrictStringField<string, string, true, false, false>;
  alpha: foundry.data.fields.AlphaField<true, false, true>;
  /** A manual rescaling of the texture resource */
  scale: StrictNumberField<number, number, true, false, true>;
  /** A manual x/y translation of the texture resource */
  translation: foundry.data.fields.SchemaField<
    xyPairSchema,
    SourceFromSchema<xyPairSchema>,
    ModelPropsFromSchema<xyPairSchema>,
    false,
    true,
    true
  >;
  /** If the `src` is a video, whether to loop it */
  loop: StrictBooleanField<false, false, true>;
  /** If the `src` is a video, the playback rate of resulting `HTMLVideoElement` */
  playbackRate: StrictNumberField<number, number, false, false, true>;
};

interface xyPairSchema extends foundry.data.fields.DataSchema {
  x: StrictNumberField<number, number, true, false, false>;
  y: StrictNumberField<number, number, true, false, false>;
}