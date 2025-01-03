import type { BlueprintSchema, Blueprint as BlueprintModel } from "./blueprint.ts";
import type { ActionSchema, ActionPTR2e } from "./action.ts";
import type { AttackSchema, AttackPTR2e } from "./attack.ts";
import type { PassiveSchema, PassivePTR2e } from "./passive.ts";
import type { PokeballActionPTR2e } from "./pokeball-action.ts";
import type { SummonActionSchema, SummonActionPTR2e } from "./summon.ts";
import type { SkillPTR2e, SkillSchema } from "./skill.ts";


/** @module data/models */
export { default as ActionPTR2e } from "./action.ts";
export { default as AttackPTR2e } from "./attack.ts";
export { default as PassivePTR2e } from "./passive.ts";
export { default as Trait} from "./trait.ts";
export { default as ClockPTR2e } from "./clock.ts";
export { default as ClockDatabase } from "./clock-database.ts";
export { default as SummonAttackPTR2e } from "./summon.ts";
export { default as PokeballActionPTR2e } from "./pokeball-action.ts";
export * from "./base.ts";
export * from "../../effects/changes/index.ts";

declare global {
  namespace PTR {
    namespace Models {
      namespace Blueprint {
        type Schema = BlueprintSchema;
        type Instance = BlueprintModel;
        type Source = foundry.data.fields.SchemaField.PersistedType<BlueprintSchema>;
      }
      namespace Action {
        type Schema = ActionSchema;
        type Instance = ActionPTR2e;
        type Source = foundry.data.fields.SchemaField.PersistedType<ActionSchema>;
        type AnyInstance = Instance | Models.Attack.Instance | Models.Passive.Instance | Models.PokeballAction.Instance | Models.Summon.Instance;

        namespace Models {
          namespace Attack {
            type Schema = AttackSchema;
            type Instance = AttackPTR2e;
            type Source = foundry.data.fields.SchemaField.PersistedType<AttackSchema>;
          }
          namespace Passive {
            type Schema = PassiveSchema;
            type Instance = PassivePTR2e;
            type Source = foundry.data.fields.SchemaField.PersistedType<PassiveSchema>;
          }
          namespace PokeballAction {
            type Schema = ActionSchema;
            type Instance = PokeballActionPTR2e
            type Source = foundry.data.fields.SchemaField.PersistedType<ActionSchema>;
          }
          namespace Summon {
            type Schema = SummonActionSchema;
            type Instance = SummonActionPTR2e;
            type Source = foundry.data.fields.SchemaField.PersistedType<SummonActionSchema>;
          }
        }
      }
      namespace Skill {
        type Schema = SkillSchema;
        type Instance = SkillPTR2e;
        type Source = foundry.data.fields.SchemaField.PersistedType<SkillSchema>;

        type CoreSkill = Pick<SkillSchema, 'slug' | 'favourite' | 'hidden' | 'group'>;
        type CustomSkill = CoreSkill & { label: string; description: string };
        type Skill = CoreSkill | CustomSkill;
      }
    }
  }
}