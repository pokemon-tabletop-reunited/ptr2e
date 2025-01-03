import type { AuraEffectData } from "./data.ts";
import { htmlQuery } from "@utils";

function auraAffectsActor(data: AuraEffectData, origin: Actor.ConfiguredInstance, actor: Actor.ConfiguredInstance): boolean {
  return data.appliesSelfOnly ? origin === actor : (
    (data.includesSelf && origin === actor) ||
    (data.affects === "allies" && actor.isAllyOf(origin)) ||
    (data.affects === "enemies" && actor.isEnemyOf(origin)) ||
    (data.affects === "all" && actor !== origin)
  );
}

/** Review `removeOnExit` aura effects and remove any that no longer apply */
async function checkAreaEffects(this: Actor.ConfiguredInstance): Promise<void> {
  if (!canvas.ready || game.user !== this.primaryUpdater) {
    return;
  }

  const thisTokens = this.getActiveTokens(true, true) as TokenDocument.ConfiguredInstance[];
  const toDelete: string[] = [];
  const toKeep: string[] = [];

  for (const e of this.effects) {
    const effect = e as ActiveEffect.ConfiguredInstance
    const auraData = effect.flags.ptr2e?.aura;
    if (!auraData?.removeOnExit) continue;

    const auraActor = (await fromUuid(auraData.origin)) as Actor.ConfiguredInstance | null;
    const auraToken = auraActor?.getActiveTokens(true, true).shift() as TokenDocument.ConfiguredInstance | null ?? null;
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
function userColorForActor(actor: Actor.ConfiguredInstance): HexColorString {
  const user =
    game.users.find((u) => u.character === actor) ??
    game.users.players.find((u) => actor.testUserPermission(u, "OWNER")) ??
    actor.primaryUpdater;
  return user?.color.toString() as HexColorString ?? "#43dfdf";
}

async function resolveCapture(originUuid: string, targetUuid: string, success: boolean): Promise<void> {
  const originActor = await fromUuid<Actor.ConfiguredInstance>(originUuid as ActorUUID);
  if (!(originActor instanceof CONFIG.Actor.documentClass)) return void ui.notifications.error("Unable to resolve capture; origin actor could not be detected.");
  const targetActor = await fromUuid<Actor.ConfiguredInstance>(targetUuid as ActorUUID);
  if (!(targetActor instanceof CONFIG.Actor.documentClass)) return void ui.notifications.error("Unable to resolve capture; target actor could not be detected.");
  if (targetActor.party?.owner === targetActor) return void ui.notifications.error("Unable to resolve capture; target actor is a party leader.");

  const isPlayerCapture = originActor.hasPlayerOwner;
  const actors = isPlayerCapture
    ? (() => {
      const playerCharacters = game.users.filter(u => !u.isGM && !!u.character).map(u => u.character!).filter(c => c.party?.owner === c) as Actor.ConfiguredInstance[]
      if (!playerCharacters.length) return [originActor];
      if (!playerCharacters.find(pc => pc.uuid === originActor.uuid)) playerCharacters.push(originActor);
      return playerCharacters;
    })()
    : (() => {
      const nonPlayerCharacters = game.actors.filter(a => !a.hasPlayerOwner && a.uuid !== originActor.uuid && !!a.party && a.party.owner === a) as Actor.ConfiguredInstance[];
      return [originActor, ...nonPlayerCharacters];
    })()
  const trainerOptions = actors.reduce((acc, actor) => {
    acc[actor.uuid] = actor.name;
    return acc;
  }, {} as Record<string, string>);

  const addToParty = (originActor.party?.party?.length ?? 0) <= 6

  return void foundry.applications.api.DialogV2.prompt<foundry.applications.api.DialogV2.WaitOptions, void>({
    content: `${!success ? "<p><b>Please Note</b> This capture Failed! Are you sure you mean to apply it?</p>" : ""}<p>${game.i18n.localize("PTR2E.CaptureDialog.Instructions")}</p>
            <div class="form-group"><label>${game.i18n.localize("PTR2E.CaptureDialog.Trainer.label")}</label><div class="form-fields"><select name="trainer">
            ${Object.entries(trainerOptions).map(([key, value]) => `<option value="${key}" ${key === originUuid ? "selected" : ""}>${value}</option>`).join("")}
            </select></div></div>
            <div class="form-group"><label>${game.i18n.localize("PTR2E.CaptureDialog.Party.label")}</label><div class="form-fields"><input type="checkbox" name="party" ${addToParty ? "checked='checked'" : ""}/></div><p class="hint">${game.i18n.localize("PTR2E.CaptureDialog.Party.hint")}</p></div>`,
    //@ts-expect-error - fvtt-types incorrect types
    window: { title: game.i18n.localize("PTR2E.CaptureDialog.Title") },
    ok: {
      label: game.i18n.localize("PTR2E.ActorSheet.Settings.Save"),
      action: "ok",
      callback: async (_event, target, element) => {
        const html = element ?? target;
        const trainer = htmlQuery<HTMLInputElement>(html, '[name="trainer"]')?.value as ActorUUID;
        const party = htmlQuery<HTMLInputElement>(html, '[name="party"]')?.checked ?? false;

        const trainerActor = trainer === originUuid ? originActor : await fromUuid<Actor.ConfiguredInstance>(trainer);
        if (!trainerActor) return void ui.notifications.error("Unable to resolve capture; trainer actor could not be detected.");
        if (!trainerActor.folder) return void ui.notifications.error("Unable to resolve capture; trainer actor is not in a folder.");

        if (targetActor.isToken) {
          const newActor = await CONFIG.Actor.documentClass.create(targetActor.clone({
            folder: trainerActor.folder.id,
            ownership: foundry.utils.duplicate(trainerActor.ownership),
            "system.party": {
              partyMemberOf: party ? trainerActor.folder.id : null,
              teamMemberOf: []
            },
            prototypeToken: {
              actorLink: true
            }
          }).toObject());
          if (!newActor) return void ui.notifications.error("Unable to resolve capture; new actor could not be created.");
          return void await CONFIG.ChatMessage.documentClass.create({
            speaker: { alias: "Pokemon Tabletop Reunited" },
            content: `${trainerActor.link} has captured ${newActor.link}!`
          })
        }

        await targetActor.update({
          folder: trainerActor.folder.id,
          ownership: foundry.utils.duplicate(trainerActor.ownership),
          "system.party": {
            partyMemberOf: party ? trainerActor.folder.id : null,
            teamMemberOf: []
          },
          prototypeToken: {
            actorLink: true
          }
        })

        await CONFIG.ChatMessage.documentClass.create({
          speaker: { alias: "Pokemon Tabletop Reunited" },
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