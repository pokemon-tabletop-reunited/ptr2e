import { ActiveEffectPTR2e } from "@effects";
import type ActorPTR2e from "./base.ts";
import { AuraEffectData } from "./data.ts";
import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { ScenePTR2e } from "@module/canvas/scene.ts";

function auraAffectsActor(data: AuraEffectData, origin: ActorPTR2e, actor: ActorPTR2e): boolean {
  return data.appliesSelfOnly ? origin === actor : (
    (data.includesSelf && origin === actor) ||
    (data.affects === "allies" && actor.isAllyOf(origin)) ||
    (data.affects === "enemies" && actor.isEnemyOf(origin)) ||
    (data.affects === "all" && actor !== origin)
  );
}

/** Review `removeOnExit` aura effects and remove any that no longer apply */
async function checkAreaEffects(this: ActorPTR2e): Promise<void> {
  if (!canvas.ready || game.user !== this.primaryUpdater) {
    return;
  }

  const thisTokens = this.getActiveTokens(true, true) as TokenDocumentPTR2e<ScenePTR2e>[];
  const toDelete: string[] = [];
  const toKeep: string[] = [];

  for (const e of this.effects) {
    const effect = e as ActiveEffectPTR2e
    const auraData = effect.flags.ptr2e?.aura;
    if (!auraData?.removeOnExit) continue;

    const auraActor = (await fromUuid(auraData.origin)) as ActorPTR2e | null;
    const auraToken = auraActor?.getActiveTokens(true, true).shift() as TokenDocumentPTR2e<ScenePTR2e> | null ?? null;
    const aura = auraToken?.auras.get(auraData.slug);

    // Make sure this isn't an identically-slugged aura with different effects
    const auraEffectData = auraActor?.auras
      .get(auraData.slug)
      ?.effects.find((e) => e.uuid === effect.flags?.core?.sourceId && auraAffectsActor(e, auraActor, this));

    for (const token of thisTokens) {
      if (auraEffectData && aura?.containsToken(token)) {
        toKeep.push(effect.id);
      } else {
        toDelete.push(effect.id);
      }
    }

    // If no tokens for this actor remain in the scene, always remove the effect
    if (thisTokens.length === 0) {
      toDelete.push(effect.id);
    }
  }

  // In case there are multiple tokens for this actor, avoid deleting aura effects if at least one token is
  // exposed to the aura
  const finalToDelete = toDelete.filter((id) => !toKeep.includes(id));
  if (finalToDelete.length > 0) {
    await this.deleteEmbeddedDocuments("ActiveEffect", finalToDelete);
  }
}

/** Get the user color most appropriate for a provided actor */
function userColorForActor(actor: ActorPTR2e): HexColorString {
  const user =
      game.users.find((u) => u.character === actor) ??
      game.users.players.find((u) => actor.testUserPermission(u, "OWNER")) ??
      actor.primaryUpdater;
  return user?.color.toString() as HexColorString ?? "#43dfdf";
}

export {
  auraAffectsActor,
  checkAreaEffects,
  userColorForActor
}