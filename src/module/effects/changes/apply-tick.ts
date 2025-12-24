import { ChangeModel, ChangeSchema, PokemonType, PTRCONSTS } from "@data";
import { ItemPTR2e } from "@item";

export default class ApplyTickChangeSystem extends ChangeModel {
  static override TYPE = "apply-tick";

  static override defineSchema() {
    return {
      ...super.defineSchema(),
      method: new foundry.data.fields.StringField<"HP" | "PP" | "Shield", "HP" | "PP" | "Shield", true>({
        required: true,
        nullable: false,
        initial: "HP",
        choices: {
          "HP": "PTR2E.Effect.FIELDS.ApplyTickMode.HP",
          "PP": "PTR2E.Effect.FIELDS.ApplyTickMode.PP",
          "Shield": "PTR2E.Effect.FIELDS.ApplyTickMode.Shield",
        }
      }),
      types: new foundry.data.fields.SetField(
        new foundry.data.fields.StringField<PokemonType, PokemonType, true>({
          required: true,
          initial: "untyped",
          choices: Object.values(PTRCONSTS.Types)
        }),
        { required: true, initial: [] }
      ),
      isFlat: new foundry.data.fields.BooleanField({
        required: true,
        initial: false,
        nullable: false,
      })
    }
  }

  override apply(): void {
    // Does nothing during apply phase.
  }

  override async preCreate({ effectSource, pendingItems, pendingEffects, }: ChangeModel.PreCreateParams): Promise<void> {
    if (this.ignored) return;
    if (!this.actor) return;

    const value = Number(this.resolveValue(this.value));
    if (isNaN(value)) return this.failValidation("Value field did not resolve to a number");

    if(this.isFlat) {
      if(this.method === "PP") {
        const current = this.actor.system.powerPoints.value;
        const newValue = Math.clamp(this.actor.system.powerPoints.value + value, 0, this.actor.system.powerPoints.max);
        await this.actor.update({ "system.powerPoints.value": newValue });
        ui.notifications.info(`Updated ${actor.name}'s Power Points from ${current} to ${newValue}.`);
      }
      else {
        await this.actor.applyDamage(value * -1, { healShield: this.method === "Shield" && value > 0, silent: false, flat: true });
      }
    } else {
      await this.actor.applyTickDamage({
        ticks: value,
        apply: true,
        shield: this.method === "Shield",
        pp: this.method === "PP",
        types: this.types
      })
    }

    // If this is not the only change, we keep the effect
    if (this.effect?.changes?.length > 1) {
      const changes = this.effect.changes.filter(c => c !== this);
      if (!changes.every(c => c.type === "apply-tick")) {
        return;
      }
    }

    // If this is the only change, we remove the effect
    if (this.effect.target instanceof ItemPTR2e) {
      pendingItems.splice(pendingItems.findIndex(i => i._id === this.effect.target!._id), 1);
    }
    pendingEffects.splice(pendingEffects.findIndex(e => e._id === this.effect._id || e === effectSource), 1);
  }

}

export default interface ApplyTickChangeSystem extends ChangeModel, ModelPropsFromSchema<ApplyTickChangeSchema> {
  _source: SourceFromSchema<ApplyTickChangeSchema>;
  value: number;
}

interface ApplyTickChangeSchema extends ChangeSchema {
  /** The method to apply the tick damage */
  method: foundry.data.fields.StringField<"HP" | "PP" | "Shield", "HP" | "PP" | "Shield", true>;
  types: foundry.data.fields.SetField<foundry.data.fields.StringField<PokemonType, PokemonType, true>>;
  isFlat: foundry.data.fields.BooleanField;
};