import type { DeferredEffectRoll, DeferredValueParams, EffectRoll } from "@actor";
import { ChangeModel } from "@data";
import { UUIDUtils } from "src/util/uuid.ts";
import type { ChangeModelSchema } from "./change.ts";

const effectRollChangeSchema = {
  chance: new foundry.data.fields.NumberField({ required: true, nullable: false, initial: 10, min: 1, max: 100 }),
  affects: new foundry.data.fields.StringField<{ required: true, choices: Record<string, string>, initial: string }, "self" | "target" | "origin", "self" | "target" | "origin">({
    required: true,
    choices: ["self", "target", "origin"].reduce<Record<string, string>>((acc, affects) => ({ ...acc, [affects]: affects }), {}),
    initial: "target",
  })
}

export type EffectRollChangeSchema = typeof effectRollChangeSchema & ChangeModelSchema;

class EffectRollChangeSystem extends ChangeModel<EffectRollChangeSchema> {
  static override TYPE = "roll-effect";

  static override defineSchema(): EffectRollChangeSchema {
    const schema = super.defineSchema() as ChangeModelSchema;
    schema.value.validate = this.#validateUuid;
    return {
      ...schema,
      ...effectRollChangeSchema
    }
  }

  static #validateUuid(
    value: unknown
  ): undefined | foundry.data.validation.DataModelValidationFailure {
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
    return undefined;
  }

  get selector() {
    return this.key;
  }

  get uuid() {
    return this.value;
  }

  override apply(actor: Actor.ConfiguredInstance): void {
    if (!this.actor) return;

    const { selector, isCrit } = (() => {
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
      if (!(effect instanceof CONFIG.Item.documentClass && effect.type === "effect")) {
        this.failValidation(`unable to find effect item with uuid "${uuid}"`);
        return null;
      }

      return {
        effect: effect.uuid as ItemUUID,
        chance: this.chance,
        label: this.label ?? "",
        critOnly: isCrit,
      };
    }
  }

  protected async getItem(key: string): Promise<Maybe<ClientDocument>> {
    try {
      return (await fromUuid(key))?.clone({}, { keepId: true }) ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

interface EffectRollChangeSystem {
  value: string;
}

export default EffectRollChangeSystem;
