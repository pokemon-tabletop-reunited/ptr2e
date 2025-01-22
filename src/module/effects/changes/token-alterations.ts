import { ActorPTR2e } from "@actor";
import { ChangeModel } from "@data";
import { isImageOrVideoPath } from "@utils";

export default class TokenAlterationsChangeSystem extends ChangeModel {
  static override TYPE = "token-alterations";

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      texture: new fields.FilePathField({ required: true, categories: ["IMAGE", "VIDEO"], initial: null }),
      tint: new fields.ColorField({ required: true, nullable: true, initial: null }),
      scale: new fields.NumberField({ required: true, nullable: true, initial: null }),
      name: new fields.StringField({ required: true, nullable: true, initial: null }),
      light: new fields.ObjectField({ required: true, nullable: true, initial: null }),
      alpha: new fields.AlphaField({ required: true, nullable: true, initial: null })
    };
  }

  get selector() {
    return this.key;
  }

  override apply(actor: ActorPTR2e): void {
    this.beforePrepareData(actor);
  }

  override beforePrepareData(actor: ActorPTR2e | null = this.actor,): void {
    const src = this.resolveInjectedProperties(this.texture);
    if (!isImageOrVideoPath(src)) return this.failValidation("Missing or invalid value field");
    if(!actor) return;
    if(!this.test()) return;

    if(src.includes("modules/ptr2e-pkmn-sprites") && !game.modules.get("ptr2e-pkmn-sprites")?.active) return;
    
    const texture: { src: ImageFilePath | VideoFilePath; scaleX?: number; scaleY?: number; tint?: Maybe<Color> } = {
      src,
      tint: this.tint
    }
    if(this.scale) {
      texture.scaleX = this.scale;
      texture.scaleY = this.scale;
    }
    actor.synthetics.tokenOverrides.texture = texture;
    if(this.alpha) actor.synthetics.tokenOverrides.alpha = this.alpha;
    if(this.name) actor.synthetics.tokenOverrides.name = this.name;
    if(this.light) actor.synthetics.tokenOverrides.light = this.light;
  }
}

export default interface TokenAlterationChangeSystem {
  texture: string | null;
  tint: string | null;
  scale: number | null;
  name: string | null;
  alpha: foundry.data.fields.ModelPropFromDataField<foundry.data.fields.AlphaField> | null;
  light: Partial<ModelPropsFromSchema<foundry.data.LightDataSchema>> | null;
}
