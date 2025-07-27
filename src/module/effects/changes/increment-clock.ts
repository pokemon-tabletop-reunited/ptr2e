import { ChangeModel, ChangeSchema } from "@data";
import { ItemPTR2e } from "@item";
import Clock from "@module/data/models/clock.ts";

export default class IncrementClockChangeSystem extends ChangeModel {
  static override TYPE = "increment-clock";

  static override defineSchema() {
    const schema = super.defineSchema();
    schema.key.validate = IncrementClockChangeSystem.#validateId
    return {
      ...schema,
    }
  }

  static #validateId(
    value: unknown
  ): void | foundry.data.validation.DataModelValidationFailure {
    const isValid = foundry.data.validators.isValidId(value as string);
    if (!isValid) {
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

  override apply() {
    return;
  }

  override async preCreate({ effectSource, pendingItems, pendingEffects, }: ChangeModel.PreCreateParams): Promise<void> {
    if (this.ignored) return;
    if (!this.actor) return;

    const id = this.resolveInjectedProperties(this.id);
    if (!id || !foundry.data.validators.isValidId(id)) return this.failValidation("id field resolved empty");

    const clocks = this.actor.system.clocks;
    // Check if the clock already exists
    const clock = clocks.get(id);
    if (!clock) return this.failValidation("Clock not found");

    const value = Number(this.resolveInjectedProperties(this.value));
    if (isNaN(value)) return this.failValidation("Value field did not resolve to a number");

    const newValue = Math.clamp(clock.value + value, 0, clock.max);
    if (newValue === clock.value) return this.failValidation("Clock value did not change");

    // Update the clock value
    const sourceClocks = fu.duplicate(this.actor.system._source.clocks);
    const index = sourceClocks.findIndex((c) => c.id === clock.id);
    if (index === -1) {
      const clock = this.actor.system.clocks.get(id as string)?.toObject() as Clock.Source;
      if (!clock) return this.failValidation("Clock not found");
      sourceClocks.push({
        ...clock,
        value: clock.value <= 0 ? clock.max : clock.value - 1,
      });
    }
    else sourceClocks[index].value = newValue;
    await this.actor.update({ "system.clocks": sourceClocks });

    // If this is not the only change, we keep the effect
    if (this.effect?.changes?.length > 1) {
      const changes = this.effect.changes.filter(c => c !== this);
      if (!changes.every(c => c.type === "increment-clock")) {
        return;
      }
    }

    // If this is the only change, we remove the effect
    if (this.effect.target instanceof ItemPTR2e) {
      pendingItems.splice(pendingItems.findIndex(i => i._id === this.effect.target!._id), 1);
    }
    pendingEffects.splice(pendingEffects.findIndex(e => e._id === this.effect._id || e === effectSource), 1);

    const sourceId = (this.effect?.flags?.core?.sourceId || this.effect?._stats?.compendiumSource) as string;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: game.i18n.format("PTR2E.Effect.IncrementClock", {
        clock: clock.label,
        value,
        total: newValue,
        effect: sourceId ? ((await fu.fromUuid<ItemPTR2e>(sourceId))?.link ?? this.effect.name) : this.effect.name,
      }),
    })
  }

}

export default interface IncrementClockChangeSystem extends ChangeModel, ModelPropsFromSchema<IncrementClockSchema> {
  _source: SourceFromSchema<IncrementClockSchema>;
  value: number;
}

interface IncrementClockSchema extends ChangeSchema {
};