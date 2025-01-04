import { ChangeModel } from "@data";
import { isImageOrVideoPath } from "@utils";
import type { ChangeModelSchema } from "./change.ts";

const tokenAlterationsChangeSchema = {
  texture: new foundry.data.fields.FilePathField({ required: true, categories: ["IMAGE", "VIDEO"], initial: null }),
  tint: new foundry.data.fields.ColorField({ required: true, nullable: true, initial: null }),
  scale: new foundry.data.fields.NumberField({ required: true, nullable: true, initial: null }),
  name: new foundry.data.fields.StringField({ required: true, nullable: true, initial: null }),
  light: new foundry.data.fields.ObjectField({ required: true, nullable: true, initial: null }),
  alpha: new foundry.data.fields.AlphaField({ required: true, nullable: true, initial: null })
}

export type TokenAlterationsChangeSchema = typeof tokenAlterationsChangeSchema & ChangeModelSchema;

class TokenAlterationsChangeSystem extends ChangeModel<TokenAlterationsChangeSchema> {
  static override TYPE = "token-alterations";

  static override defineSchema(): TokenAlterationsChangeSchema {
    return {
      ...super.defineSchema(),
      ...tokenAlterationsChangeSchema
    };
  }

  get selector() {
    return this.key;
  }

  override apply(actor: Actor.ConfiguredInstance): void {
    this.beforePrepareData(actor);
  }

  override beforePrepareData(actor: Actor.ConfiguredInstance | null = this.actor,): void {
    const src = this.resolveInjectedProperties(this.texture);
    if (!isImageOrVideoPath(src)) return this.failValidation("Missing or invalid value field");
    if (!actor) return;
    if (!this.test()) return;

    const texture: { src: ImageFilePath | VideoFilePath; scaleX?: number; scaleY?: number; tint?: Maybe<Color> } = {
      src,
      tint: this.tint
    }
    if (this.scale) {
      texture.scaleX = this.scale;
      texture.scaleY = this.scale;
    }
    actor.synthetics.tokenOverrides.texture = texture;
    if (this.alpha) actor.synthetics.tokenOverrides.alpha = this.alpha;
    if (this.name) actor.synthetics.tokenOverrides.name = this.name;
    if (this.light) actor.synthetics.tokenOverrides.light = this.light;
  }
}

export default TokenAlterationsChangeSystem;
export type { TokenAlterationsChangeSystem }