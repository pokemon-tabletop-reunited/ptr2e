import type { EmptyObject } from 'fvtt-types/utils';
import type { ChatMessagePTR2e } from './document.ts';
import type * as models from './models/index.ts';
import type { AttackMessageSchema } from './models/attack.ts';
import type { DamageAppliedSchema } from './models/damage-applied.ts';
import type { SkillMessageSchema } from './models/skill.ts';
import type { CaptureMessageSchema } from './models/capture.ts';

export { default as ChatMessagePTR2e } from './document.ts';
export * from "./models/index.ts";

type ItemMessage = ChatMessagePTR2e & { type: "item", system: models.ItemMessageSystem };
type AttackMessage = ChatMessagePTR2e & { type: "attack", system: models.AttackMessageSystem };
type DamageAppliedMessage = ChatMessagePTR2e & { type: "damage-applied", system: models.DamageAppliedMessageSystem };
type SkillMessage = ChatMessagePTR2e & { type: "skill", system: models.SkillMessageSystem };
type CaptureMessage = ChatMessagePTR2e & { type: "capture", system: models.CaptureMessageSystem };

declare global {
  namespace PTR {
    namespace ChatMessage {
      type Instance = ChatMessagePTR2e;
      type Source = foundry.data.fields.SchemaField.PersistedType<globalThis.ChatMessage.Schema>;
      namespace System {
        namespace Item {
          type Schema = EmptyObject
          type Instance = models.ItemMessageSystem
          type Source = foundry.data.fields.SchemaField.PersistedType<Schema>
          type ParentInstance = ItemMessage
          type ParentSource = PTR.ChatMessage.Source & { system: Source }
        }
        namespace Attack {
          type Schema = AttackMessageSchema
          type Instance = models.AttackMessageSystem
          type Source = foundry.data.fields.SchemaField.PersistedType<Schema>
          type ParentInstance = AttackMessage
          type ParentSource = PTR.ChatMessage.Source & { system: Source }
        }
        namespace DamageApplied {
          type Schema = DamageAppliedSchema
          type Instance = models.DamageAppliedMessageSystem
          type Source = foundry.data.fields.SchemaField.PersistedType<Schema>
          type ParentInstance = DamageAppliedMessage
          type ParentSource = PTR.ChatMessage.Source & { system: Source }
        }
        namespace Skill {
          type Schema = SkillMessageSchema
          type Instance = models.SkillMessageSystem
          type Source = foundry.data.fields.SchemaField.PersistedType<Schema>
          type ParentInstance = SkillMessage
          type ParentSource = PTR.ChatMessage.Source & { system: Source }
        }
        namespace Capture {
          type Schema = CaptureMessageSchema
          type Instance = models.CaptureMessageSystem
          type Source = foundry.data.fields.SchemaField.PersistedType<Schema>
          type ParentInstance = CaptureMessage
          type ParentSource = PTR.ChatMessage.Source & { system: Source }
        }
      }
    }
  }
}