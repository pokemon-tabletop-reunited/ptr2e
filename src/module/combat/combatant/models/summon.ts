import { CombatantPTR2e, CombatantSystemPTR2e } from "@combat";
import { CombatantSystemSchema } from "../system.ts";
import { ActionsSchema } from "@module/data/mixins/has-actions.ts";
import { ItemPTR2e, SummonPTR2e } from "@item";

class SummonCombatantSystem extends CombatantSystemPTR2e {
  declare parent: CombatantPTR2e

  override get baseAV(): number {
    return this.item?.system.baseAV ?? 999;
  }

  get duration() {
    return this.item?.system.duration ?? 1;
  }

  get expired() {
    return this.activationsHad >= this.duration 
  }

  static override defineSchema(): SummonCombatantSchema {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema() as ActionsSchema & CombatantSystemSchema,
      owner: new fields.DocumentUUIDField({required: true, nullable: false}),
      item: new fields.JSONField({ required: true, nullable: false})
    }
  }
  override prepareBaseData(): void {
    super.prepareBaseData();
    
    this.item = (() => {
      if(!this._source.item) return null;
      const jsonData = (() => {
        try {
          return JSON.parse(this._source.item);
        } catch (error: unknown) {
          Hooks.onError("SummonCombatantSystem#prepareBaseData", error as Error, {
            log: "error",
          });
        }
      })();
      if(!jsonData) return null;

      try {
        return ItemPTR2e.fromJSON(jsonData) as SummonPTR2e;
      }
      catch (error: unknown) {
        Hooks.onError("SummonCombatantSystem#prepareBaseData", error as Error, {
          log: "error",
        });
      }
      return null;
    })();
  }

  override _preUpdate(changed: DeepPartial<this["parent"]["_source"]>, options: DocumentUpdateContext<this["parent"]["parent"]>, user: User): Promise<boolean | void> {
    if (changed.defeated) {
      changed.defeated = false;
    }
    return super._preUpdate(changed, options, user);
  }
}

interface SummonCombatantSystem extends CombatantSystemPTR2e, ModelPropsFromSchema<SummonCombatantSchema> {
  _source: SourceFromSchema<SummonCombatantSchema>;
}

interface SummonCombatantSchema extends CombatantSystemSchema {
  
  owner: foundry.data.fields.DocumentUUIDField<string, true, false, false>;
  item: foundry.data.fields.JSONField<SummonPTR2e | null, true, false, false>;
}

export default SummonCombatantSystem;