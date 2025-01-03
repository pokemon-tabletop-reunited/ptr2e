import type { DeferredEphemeralEffect, DeferredValueParams } from "@actor";
import { ChangeModel } from "@data";
import { UUIDUtils } from "src/util/uuid.ts";
import type { ActiveEffectSystem, EffectSourcePTR2e } from "@effects";
import { ItemPTR2e } from "@item";
import type { ChangeModelSchema } from "./change.ts";

const ephemeralEffectChangeSchema = {
  affects: new foundry.data.fields.StringField<{ required: true, choices: Record<string, string>, initial: string}, "self" | "target" | "origin", "self" | "target" | "origin">({
    required: true,
    choices: ["target", "origin", "self"].reduce<Record<string, string>>((acc, affects) => ({ ...acc, [affects]: affects }), {}),
    initial: "target",
  }),
}

export type EphemeralEffectChangeSchema = typeof ephemeralEffectChangeSchema & ChangeModelSchema;

class EphemeralEffectChangeSystem extends ChangeModel<EphemeralEffectChangeSchema> {
  static override TYPE = "ephemeral-effect";

  static override defineSchema() {
    const schema = super.defineSchema() as ChangeModelSchema;
    schema.value.validate = EphemeralEffectChangeSystem.#validateUuid;
    return {
      ...schema,
      ...ephemeralEffectChangeSchema
    };
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
    return this.value as string;
  }

  override afterPrepareData() {
    const selector = this.resolveInjectedProperties(this.selector);
    const defferedEffect = this.#createDeferredEffect();
    const synthetics = (this.actor!.synthetics.ephemeralEffects[selector] ??= {
      origin: [],
      target: [],
      self: [],
    });
    synthetics[this.affects].push(defferedEffect);
  }

  protected async getItem(key: string): Promise<Maybe<ClientDocument>> {
    try {
      return (await fromUuid(key))?.clone() ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  override apply() {
    this.afterPrepareData();
  }

  #createDeferredEffect(): DeferredEphemeralEffect {
    return async (params: DeferredValueParams = {}): Promise<EffectSourcePTR2e[] | null> => {
      if (!this.actor) return null;
      if (!this.test(params.test ?? this.actor.getRollOptions())) {
        return null;
      }

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

      const source = effect.toObject();

      // An ephemeral effect will be added to a contextual clone's item source array and cannot include any asynchronous change models
      const hasForbiddenCMs = source.effects.some((e) =>
        (e.system as ActiveEffectSystem["_source"]).changes.some(
          (c) =>
            typeof c.key === "string" &&
            (c.key === "choice-set" ||
              (c.key === "grant-item" &&
                !("inMemoryOnly" in c && c.inMemoryOnly === true)) ||
              (c.key === "grant-effect" &&
                !("inMemoryOnly" in c && c.inMemoryOnly === true)))
        )
      );
      if (hasForbiddenCMs) {
        this.failValidation("an ephemeral effect may not include a choice set or grant");
      }

      return source.effects as EffectSourcePTR2e[];
    };
  }
}

export default EphemeralEffectChangeSystem;
export type { EphemeralEffectChangeSystem }