import { ActorPTR2e } from "@actor";
import { ChangeModel, ChangeSchema } from "@data";
import ResolvableValueField from "@module/data/fields/resolvable-value-field.ts";
import Clock from "@module/data/models/clock.ts";

export default class CreateClockChangeSystem extends ChangeModel {
  static override TYPE = "create-clock";

  static override defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    schema.key.validate = CreateClockChangeSystem.#validateId
    return {
      ...schema,
      max: new ResolvableValueField<true, false, true>({
        required: true,
        nullable: false,
        initial: 4,
        label: "PTR2E.FIELDS.clock.max.label",
        hint: "PTR2E.FIELDS.clock.max.hint",
      }),
      color: new fields.ColorField({
        required: true,
        nullable: true,
        initial: null,
        label: "PTR2E.FIELDS.clock.color.label",
        hint: "PTR2E.FIELDS.clock.color.hint",
      }),
      private: new fields.BooleanField({
        required: true,
        nullable: false,
        initial: false,
        label: "PTR2E.FIELDS.clock.private.label",
        hint: "PTR2E.FIELDS.clock.private.hint",
      }),
    }
  }

  static #validateId(
    value: unknown
  ): void | foundry.data.validation.DataModelValidationFailure {
    const isValid = foundry.data.validators.isValidId(value as string);
    if(!isValid) {
      return new foundry.data.validation.DataModelValidationFailure({
        invalidValue: value,
        message: game.i18n.localize("PTR2E.Effect.FIELDS.ChangeId.invalid"),
        unresolved: false,
      });
    }
  }

  get id() {
    return this.key;
  }

  override apply(actor: ActorPTR2e): void {
    if (this.ignored) return;
    if (!this.actor) return;

    const id = this.resolveInjectedProperties(this.id);
    if (!id || !foundry.data.validators.isValidId(id)) return this.failValidation("id field resolved empty");

    const clocks = actor.system.clocks;
    // Check if the clock already exists
    if (clocks.get(id)) return;

    const max = parseInt(this.resolveValue(this.max, 4, { evaluate: true }) as string);
    if (isNaN(max) || max < 1 || max > 20) {
      return this.failValidation("max field resolved invalid");
    }

    const baseValue = this.resolveValue(this.value, 0, { evaluate: true }) as number;
    if (isNaN(baseValue) || baseValue < 0 || baseValue > max) {
      return this.failValidation("value field resolved invalid");
    }

    const label = this.resolveInjectedProperties(this.label);
    if (!label || label === "null") return this.failValidation("label field resolved empty");

    const data: Partial<Clock["_source"]> = {
      id,
      value: baseValue || 0,
      label: label || `${this.effect.name} Clock`,
      color: this.color || "#d0b8a3",
      max,
      private: this.private
    };

    const newClock = new Clock(data, {parent: this.actor.system});
    clocks.set(id, newClock);
  }

  override onDelete(actorUpdates: Record<string, unknown>): void {
    super.onDelete?.(actorUpdates);

    if(this.ignored) return;
    if(!this.actor) return;

    const id = this.resolveInjectedProperties(this.id);
    if (!id || !foundry.data.validators.isValidId(id)) return;

    const clocks = this.actor.system.clocks;
    // Check if the clock already exists
    if (!clocks.get(id)) return;
    clocks.delete(id);

    // Remove the clock from the source
    const sourceClocks = fu.duplicate(this.actor.system._source.clocks);
    const clockIndex = sourceClocks.findIndex((clock) => clock.id === id);
    if (clockIndex !== -1) {
      sourceClocks.splice(clockIndex, 1);
      actorUpdates["system.clocks"] = sourceClocks;
    }
  }
}

export default interface CreateClockChangeSystem extends ChangeModel, ModelPropsFromSchema<CreateClockSchema> {
  _source: SourceFromSchema<CreateClockSchema>;
  value: string;
}

interface CreateClockSchema extends ChangeSchema {
  /** The maximum number of segments for the clock */
  max: ResolvableValueField<true, false, true>;
  /** The color of the clock */
  color: foundry.data.fields.ColorField<true, false, false>;
  /** Whether the clock is private */
  private: foundry.data.fields.BooleanField<boolean, boolean, true, false, false>;
};