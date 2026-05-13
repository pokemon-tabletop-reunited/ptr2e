import { SummonPTR2e } from "@item";
import { CombatantPTR2e } from "@module/combat/combatant/index.ts";

export async function createSummonCombatant({ name, owner, item }: CreateSummonCombatantArgs) {
  const combatants = await game.combat?.createEmbeddedDocuments("Combatant", [{
    name,
    type: "summon",
    system: {
      owner,
      item
    }
  }])

  if (!combatants?.length) throw new Error("Failed to create summon combatant.");

  ChatMessage.create({
    content: `Added: ${(combatants as CombatantPTR2e[]).map(c => c.link).join(", ")} to Combat.`,
  });
}

export interface CreateSummonCombatantArgs { name: string, owner: Maybe<string>, item: ReturnType<SummonPTR2e["toObject"]> & { uuid: ItemUUID } }