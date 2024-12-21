import { ActiveEffectPTR2e } from "@effects";
import ActorPTR2e from "./base.ts";
import { AuraEffectData } from "./data.ts";
import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { ScenePTR2e } from "@module/canvas/scene.ts";
import { htmlQuery } from "@utils";
import { ChatMessagePTR2e } from "@chat";

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

async function resolveCapture(originUuid: string, targetUuid: string, success: boolean): Promise<void> {
  const originActor = await fromUuid<ActorPTR2e>(originUuid);
  if (!(originActor instanceof ActorPTR2e)) return void ui.notifications.error("Unable to resolve capture; origin actor could not be detected.");
  const targetActor = await fromUuid<ActorPTR2e>(targetUuid);
  if (!(targetActor instanceof ActorPTR2e)) return void ui.notifications.error("Unable to resolve capture; target actor could not be detected.");
  if(targetActor.party?.owner === targetActor) return void ui.notifications.error("Unable to resolve capture; target actor is a party leader.");

  const isPlayerCapture = originActor.hasPlayerOwner;
  const actors = isPlayerCapture
    ? (() => {
      const playerCharacters = game.users.filter(u => !u.isGM && !!u.character).map(u => u.character!).filter(c => c.party?.owner === c) as ActorPTR2e[]
      if(!playerCharacters.length) return [originActor];
      if(!playerCharacters.find(pc => pc.uuid === originActor.uuid)) playerCharacters.push(originActor);
      return playerCharacters;
    })()
    : (() => {
      const nonPlayerCharacters = game.actors.filter(a => !a.hasPlayerOwner && a.uuid !== originActor.uuid && !!a.party && a.party.owner === a) as ActorPTR2e[];
      return [originActor, ...nonPlayerCharacters];
    })()
  const trainerOptions = actors.reduce((acc, actor) => {
    acc[actor.uuid] = actor.name;
    return acc;
  }, {} as Record<string, string>);

  const addToParty = (originActor.party?.party?.length ?? 0) <= 6

  return void foundry.applications.api.DialogV2.prompt({
    content: `${!success ? "<p><b>Please Note</b> This capture Failed! Are you sure you mean to apply it?</p>" : ""}<p>${game.i18n.localize("PTR2E.CaptureDialog.Instructions")}</p>
            <div class="form-group"><label>${game.i18n.localize("PTR2E.CaptureDialog.Trainer.label")}</label><div class="form-fields"><select name="trainer">
            ${Object.entries(trainerOptions).map(([key, value]) => `<option value="${key}" ${key === originUuid ? "selected" : ""}>${value}</option>`).join("")}
            </select></div></div>
            <div class="form-group"><label>${game.i18n.localize("PTR2E.CaptureDialog.Party.label")}</label><div class="form-fields"><input type="checkbox" name="party" ${addToParty ? "checked='checked'" : ""}/></div><p class="hint">${game.i18n.localize("PTR2E.CaptureDialog.Party.hint")}</p></div>`,
    window: { title: game.i18n.localize("PTR2E.CaptureDialog.Title") },
    ok: {
      label: game.i18n.localize("PTR2E.ActorSheet.Settings.Save"),
      action: "ok",
      callback: async (_event, target, element) => {
        const html = element ?? target;
        const trainer = htmlQuery<HTMLInputElement>(html, '[name="trainer"]')?.value;
        const party = htmlQuery<HTMLInputElement>(html, '[name="party"]')?.checked ?? false;

        const trainerActor = trainer === originUuid ? originActor : await fromUuid<ActorPTR2e>(trainer);
        if(!trainerActor) return void ui.notifications.error("Unable to resolve capture; trainer actor could not be detected.");
        if(!trainerActor.folder) return void ui.notifications.error("Unable to resolve capture; trainer actor is not in a folder.");

        if(targetActor.isToken) {
          const newActor = await ActorPTR2e.create(targetActor.clone({
            folder: trainerActor.folder.id,
            ownership: fu.duplicate(trainerActor.ownership),
            "system.party": {
              partyMemberOf: party ? trainerActor.folder.id : null,
              teamMemberOf: []
            },
            prototypeToken: {
              actorLink: true
            }
          }).toObject());
          if(!newActor) return void ui.notifications.error("Unable to resolve capture; new actor could not be created.");
          return void await ChatMessagePTR2e.create({
            speaker: { alias: "Pokemon Tabletop Reunited"},
            content: `${trainerActor.link} has captured ${newActor.link}!`
          })
        }

        await targetActor.update({
          folder: trainerActor.folder.id,
          ownership: fu.duplicate(trainerActor.ownership),
          "system.party": {
            partyMemberOf: party ? trainerActor.folder.id : null,
            teamMemberOf: []
          },
          prototypeToken: {
            actorLink: true
          }
        })

        await ChatMessagePTR2e.create({
          speaker: { alias: "Pokemon Tabletop Reunited"},
          content: `${trainerActor.link} has captured ${targetActor.link}!`
        })
      }
    },
    rejectClose: false
  });
}

export {
  auraAffectsActor,
  checkAreaEffects,
  userColorForActor,
  resolveCapture
}