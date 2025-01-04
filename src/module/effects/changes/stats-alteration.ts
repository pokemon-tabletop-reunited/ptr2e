import BasicChangeSystem from "./basic.ts";
import type { ChangeModelSchema } from "./change.ts";

const statsAlterationChangeSchema = {
  hp: new foundry.data.fields.NumberField({ required: true, nullable: true, initial: null }),
  atk: new foundry.data.fields.NumberField({ required: true, nullable: true, initial: null }),
  def: new foundry.data.fields.NumberField({ required: true, nullable: true, initial: null }),
  spa: new foundry.data.fields.NumberField({ required: true, nullable: true, initial: null }),
  spd: new foundry.data.fields.NumberField({ required: true, nullable: true, initial: null }),
  spe: new foundry.data.fields.NumberField({ required: true, nullable: true, initial: null }),
}

export type StatsAlterationChangeSchema = typeof statsAlterationChangeSchema & ChangeModelSchema;

class StatsAlterationChangeSystem extends BasicChangeSystem<StatsAlterationChangeSchema> {
  static override TYPE = "stats-alteration";

  static override defineSchema(): StatsAlterationChangeSchema {
    return {
      ...super.defineSchema(),
      ...statsAlterationChangeSchema,
    }
  }

  paths: Record<"hp" | "atk" | "def" | "spa" | "spd" | "spe", string> = {
    hp: "system.attributes.hp.base",
    atk: "system.attributes.atk.base",
    def: "system.attributes.def.base",
    spa: "system.attributes.spa.base",
    spd: "system.attributes.spd.base",
    spe: "system.attributes.spe.base",
  } as const;

  override apply(actor: Actor.ConfiguredInstance, rollOptions?: string[] | Set<string> | null): void {
    if (this.ignored) return;

    rollOptions ??= this.predicate.length > 0 ? new Set(rollOptions ?? actor.getRollOptions()) : null;
    if (!this.test(rollOptions)) return;

    for (const k in this.paths) {
      const key = k as keyof typeof this.paths;
      if (this[key] === null) continue;
      const currentValue = (foundry.utils.getProperty(actor, this.paths[key]) ?? null) as number | null;
      if (!currentValue) this.failValidation(`The path "${this.paths[key]}" is not valid for the actor ${actor.id}.`);

      const newValue = BasicChangeSystem.getNewValue(CONST.ACTIVE_EFFECT_MODES.ADD, currentValue, this[key], this.merge);
      if (newValue instanceof foundry.data.validation.DataModelValidationFailure) {
        return this.failValidation(newValue.asError().message);
      }

      try {
        foundry.utils.setProperty(actor, this.paths[key], newValue);
      } catch (error) {
        if (error instanceof Error) {
          return this.failValidation(error.message);
        }
        console.warn(error);
      }
    }
  }
}

export default StatsAlterationChangeSystem;
export type { StatsAlterationChangeSystem };