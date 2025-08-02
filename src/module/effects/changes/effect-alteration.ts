import { ActorPTR2e, DeferredValueParams, EffectAlteration } from "@actor";
import { ChangeModel, ChangeSchema } from "@data";
import { ItemAlteration } from "../alterations/item.ts";

export default class EffectAlterationChangeSystem extends ChangeModel {
  static override TYPE = "effect-alteration";

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      alterations: new fields.ArrayField(new fields.EmbeddedDataField(ItemAlteration)),
    };
  }

  get selector() {
    return this.key;
  }

  override apply(actor: ActorPTR2e): void {
    this.beforePrepareData(actor);
  }

  override beforePrepareData(
    actor: ActorPTR2e | null = this.actor,
    returnEarly = false
  ): void | ((options?: DeferredValueParams) => EffectAlteration | null) {
    if (this.ignored) return;
    if (!actor) return;

    const selector = this.resolveInjectedProperties(this.key);
    if (!selector) return;

    const construct = (options: DeferredValueParams = {}): EffectAlteration | null => {
      if (this.ignored || !this.alterations.length) return null;

      const rollOptions = Array.from(options.test ?? this.getRollOptions())
      if(options.injectables?.effect && typeof options.injectables.effect === "object" && 'slug' in options.injectables.effect) {
        rollOptions.push(`effect:${options.injectables.effect.slug}`);
      }

      const predicate = this.resolveInjectedProperties(this.predicate.clone(), {}, {effect: options.injectables?.effect})
      if(!predicate.test(rollOptions)) {
        return null;
      }

      return {
        alterations: this.alterations.map(alteration => alteration.clone())
      }
    };

    if(returnEarly) return construct;

    const modifiers = (actor.synthetics.effectAlterations[selector] ??= []);
    modifiers.push(construct);
  }
}

export default interface EffectAlterationChangeSystem extends ChangeModel, ModelPropsFromSchema<EffectAlterationSchema> {
  _source: SourceFromSchema<EffectAlterationSchema>;
  value: string;
}

interface EffectAlterationSchema extends ChangeSchema {
  alterations: foundry.data.fields.ArrayField<foundry.data.fields.EmbeddedDataField<ItemAlteration>>;
}

