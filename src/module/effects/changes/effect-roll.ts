import { ActorPTR2e, DeferredEffectRoll, DeferredValueParams, EffectRoll } from "@actor";
import { ChangeModel, ChangeSchema } from "@data";
import { ItemPTR2e } from "@item";
import { UUIDUtils } from "src/util/uuid.ts";

export default class EffectRollChangeSystem extends ChangeModel {
  static override TYPE = "roll-effect";

  static override defineSchema(): EffectRollSchema {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    schema.value.validate = this.#validateUuid;
    return {
      ...schema,
      chance: new fields.NumberField({ required: true, initial: 10, min: 1, max: 100 }),
      affects: new fields.StringField({
        required: true,
        choices: ["self", "target", "origin"].reduce<Record<string, string>>((acc, affects) => ({ ...acc, [affects]: affects }), {}),
        initial: "target",
      }),
    }
  }

  static #validateUuid(
    value: unknown
  ): void | foundry.data.validation.DataModelValidationFailure {
    if (!UUIDUtils.isItemUUID(value)) {
      return new foundry.data.validation.DataModelValidationFailure({
        invalidValue: value,
        message: game.i18n.localize("PTR2E.Effect.FIELDS.ChangeUuid.invalid.notAnItemUuid"),
        unresolved: false,
      });
    }
    if (game.ready && !fromUuidSync(value)) {
      return new foundry.data.validation.DataModelValidationFailure({
        invalidValue: value,
        message: game.i18n.format("PTR2E.Effect.FIELDS.ChangeUuid.invalid.itemNotFound", {
          uuid: value,
        }),
        unresolved: false,
      });
    }
  }

  get selector() {
    return this.key;
  }

  get uuid() {
    return this.value;
  }

  override apply(actor: ActorPTR2e): void {
    if (!this.actor) return;

    const {selector, isCrit} = (() => {
      const selector = this.resolveInjectedProperties(this.selector)
      const isCrit = selector.endsWith("-crit");
      return {
        selector: isCrit ? selector.slice(0, -5) : selector,
        isCrit,
      }
    })();
    const defferedEffect = this.#createDeferredEffectRoll(isCrit);
    const synthetics = (actor.synthetics.effects[selector] ??= {
      self: [],
      target: [],
      origin: [],
    });
    synthetics[this.affects].push(defferedEffect);
  }

  #createDeferredEffectRoll(isCrit = false): DeferredEffectRoll {
    return async (params: DeferredValueParams = {}): Promise<EffectRoll | null> => {
      if (!this.actor) return null;
      if (!this.test(params.test ?? this.actor.getRollOptions())) return null;
      
      const uuid = this.resolveInjectedProperties(this.uuid);
      if (!UUIDUtils.isItemUUID(uuid)) {
        this.failValidation(`"${uuid}" does not look like a UUID`);
        return null;
      }
      const effect: Maybe<ClientDocument> = await this.getItem(uuid);
      if (!(effect instanceof ItemPTR2e && effect.type === "effect")) {
        this.failValidation(`unable to find effect item with uuid "${uuid}"`);
        return null;
      }

      return {
        effect: effect.uuid,
        chance: this.chance,
        label: this.label,
        critOnly: isCrit,
      };
    }
  }

  protected async getItem(key: string): Promise<Maybe<ClientDocument>> {
    try {
      return (await fromUuid(key))?.clone({}, {keepId: true}) ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

export default interface EffectRollChangeSystem extends ChangeModel, ModelPropsFromSchema<EffectRollSchema> {
  _source: SourceFromSchema<EffectRollSchema>;
  value: string;
}

interface EffectRollSchema extends ChangeSchema {
  chance: foundry.data.fields.NumberField<number, number, true, false, true>;
  affects: foundry.data.fields.StringField<"self" | "target" | "origin", "self" | "target" | "origin", true, false, true>;
};