import type { ActorPTR2e } from "@actor";
import BasicChangeSystem from "./basic.ts";

export default class StatsAlterationChangeSystem extends BasicChangeSystem {
  static override TYPE = "stats-alteration";

  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      hp: new fields.NumberField({ required: true, nullable: true, initial: null }),
      atk: new fields.NumberField({ required: true, nullable: true, initial: null }),
      def: new fields.NumberField({ required: true, nullable: true, initial: null }),
      spa: new fields.NumberField({ required: true, nullable: true, initial: null }),
      spd: new fields.NumberField({ required: true, nullable: true, initial: null }),
      spe: new fields.NumberField({ required: true, nullable: true, initial: null }),
    };
  }

  paths: Record<"hp"|"atk"|"def"|"spa"|"spd"|"spe", string> = {
    hp: "system.attributes.hp.base",
    atk: "system.attributes.atk.base",
    def: "system.attributes.def.base",
    spa: "system.attributes.spa.base",
    spd: "system.attributes.spd.base",
    spe: "system.attributes.spe.base",
  } as const;
  
  override apply(actor: ActorPTR2e, rollOptions?: string[] | Set<string> | null): void {
    if (this.ignored) return;

    rollOptions ??= this.predicate.length > 0 ? new Set(rollOptions ?? actor.getRollOptions()) : null;
    if (!this.test(rollOptions)) return;

    for(const k in this.paths) {
      const key = k as keyof typeof this.paths;
      if(this[key] === null) continue;
      const currentValue = (foundry.utils.getProperty(actor, this.paths[key]) ?? null) as number | null;
      if(!currentValue) this.failValidation(`The path "${this.paths[key]}" is not valid for the actor ${actor.id}.`);
      
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

export default interface StatsAlterationChangeSystem {
  hp: number | null;
  atk: number | null;
  def: number | null;
  spa: number | null;
  spd: number | null;
  spe: number | null;
}
