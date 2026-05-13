import { DocumentSheetConfiguration } from "@item/sheets/document.ts";
import FolderPTR2e from "./document.ts";
import { ActorPTR2e } from "@actor";
import { DocumentSheetConfigurationExpanded } from "@module/apps/appv2-expanded.ts";

class FolderConfigPTR2e extends foundry.applications.sheets.FolderConfig {
  static override DEFAULT_OPTIONS = {
    classes: ["folder-edit"],
    position: {
      width: 480
    },
    form: {
      handler: FolderConfigPTR2e.#onSubmit,
      closeOnSubmit: true,
      submitOnChange: false,
    },
  } as unknown as Omit<DeepPartial<DocumentSheetConfigurationExpanded>, "uniqueId">;

  override get isEditable() {
    return true;
  }

  override get isVisible() {
    return true;
  }

  static PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    base: {
      id: "base",
      template: "systems/ptr2e/templates/folder/folder-edit.hbs",
    },
    members: {
      id: "members",
      template: "systems/ptr2e/templates/folder/folder-members.hbs",
    },
    footer: { template: "templates/generic/form-footer.hbs" }
  };

  private owner: ActorPTR2e | null = null;
  private team: ActorPTR2e[] = [];

  override async _prepareContext(options?: DocumentSheetConfiguration<FolderPTR2e>) {
    const context = await super._prepareContext(options) as Record<string, unknown> & { document: FolderPTR2e, team: { actor: ActorPTR2e, folder: FolderPTR2e }[] }
    const folder = context.document

    context.owner = this.owner ?? (folder.owner ? await fu.fromUuid<ActorPTR2e>(folder.owner) : null)
    context.team = [];
    for (const memberUuid of folder.team) {
      const actor = await fu.fromUuid<ActorPTR2e>(memberUuid);
      if (actor && actor instanceof ActorPTR2e) {
        context.team.push({ actor, folder: actor.folder as FolderPTR2e });
      }
    }
    for (const member of this.team) {
      if (context.team.find(m => m.actor.id === member.id)) continue;
      context.team.push({ actor: member, folder: member.folder as FolderPTR2e });
    }

    return context;
  }

  _attachPartListeners(
    partId: string,
    htmlElement: HTMLElement,
    _options: foundry.applications.api.HandlebarsRenderOptions
  ): void {
    //@ts-expect-error - Outdated Types
    super._attachPartListeners(partId, htmlElement, _options);
    if (partId === "members") {
      const ownerFieldset = htmlElement.querySelector<HTMLFieldSetElement>("fieldset.owner");
      const teamFieldset = htmlElement.querySelector<HTMLFieldSetElement>("fieldset.team");

      ownerFieldset?.addEventListener("drop", FolderConfigPTR2e._onDropOwner.bind(this));
      teamFieldset?.addEventListener("drop", FolderConfigPTR2e._onDropTeam.bind(this));

      for (const dismiss of htmlElement.querySelectorAll<HTMLAnchorElement>(".dismiss a[data-action='remove']")) {
        dismiss.addEventListener("click", FolderConfigPTR2e._onDismiss.bind(this));
      }
    }
  }

  static async _onDismiss(this: FolderConfigPTR2e, event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const { type, uuid } = target.dataset;
    if (!type || !uuid) return;

    switch (type) {
      case "owner": {
        const owner = await fromUuid(uuid);
        if (owner) {
          if (!this.document.id) this.owner = null;
          else await owner.update({ "folder": null, "system.party.ownerOf": null });
        }
        break;
      }
      case "team": {
        const actor = await fromUuid(uuid);
        if (actor && actor instanceof ActorPTR2e) {
          if (!this.document.id) this.team = this.team.filter(member => member.id !== actor.id);
          else await actor.update({ "system.party.teamMemberOf": (actor as ActorPTR2e).system.party.teamMemberOf.filter(id => id !== this.document.id) });
        }
        break
      }
    }

    return this.render({ parts: ["members"] }).then(_ => { this.position.height = "auto"; return _ })
  }

  static async _onDropOwner(this: FolderConfigPTR2e, event: DragEvent) {
    if (!event.dataTransfer) return;
    if (this.document.owner) {
      const owner = await fromUuid(this.document.owner);
      if (owner) {
        ui.notifications.warn("Folder already has an owner. If you mean to update the owner, please remove the old one first.");
        return;
      }
    }

    const data = JSON.parse(event.dataTransfer.getData("text/plain"));
    if (!data) return;

    const actor = game.actors.get(data.id) ?? await fromUuid(data.uuid);
    if (!actor || !(actor instanceof ActorPTR2e)) return;

    if (!this.document.id) this.owner = actor;
    else await actor.update({ "folder": this.document.id, "system.party.ownerOf": this.document.id, "system.party.partyMemberOf": null });

    return this.render({ parts: ["members"] });//.then(_ => { this.position.height = "auto"; return _ })
  }

  static async _onDropTeam(this: FolderConfigPTR2e, event: DragEvent) {
    if (!event.dataTransfer) return;

    const data = JSON.parse(event.dataTransfer.getData("text/plain"));
    if (!data) return;

    const actor = game.actors.get(data.id) ?? await fromUuid(data.uuid);
    if (!actor || !(actor instanceof ActorPTR2e)) return;

    if (!this.document.id) this.team.push(actor);
    else await actor.update({ "system.party.teamMemberOf": Array.from(new Set(actor.system.party.teamMemberOf.concat(this.document.id))) });

    return this.render({ parts: ["members"] });//.then(_ => { this.position.height = "auto"; return _ })
  }

  static async #onSubmit(
    this: FolderConfigPTR2e,
    event: SubmitEvent | Event,
    _form: HTMLFormElement,
    formData: FormDataExtended
  ) {
    event.preventDefault();
    if (!game.user.isGM) {
      const data = fu.mergeObject(formData.object, this.document.id ? { _id: this.document.id } : {
        source: (() => {
          const source = this.document.toObject()
          const merged = fu.mergeObject(source, formData.object, { inplace: false });
          if (!merged.name) merged.name = source.name;
          return merged;
        })(),
        pack: this.document.pack
      });

      const notifId = ui.notifications.info("Sending request to GM...");
      try {
        const result = await game.ptr.sockets.system.executeAsGM(game.ptr.sockets.systemEvents.folderCreateOrUpdate, data);
        ui.notifications.remove(notifId);
        ui.notifications.info(result.message || "GM successfully processed request.");
        if ("resolve" in this.options && typeof this.options.resolve === "function") {
          this.options.resolve(game.folders.get(result.documentId));
        }
      }
      catch (error) {
        ui.notifications.remove(notifId);
        if(error instanceof Error && error.cause)
          ui.notifications.error((error.cause + "") || "GM failed to process request.");
        else
          throw error;
      }
      return;
    }

    const data = formData.object as { name?: string } & Record<string, unknown>;
    const folder = await (async () => {
      if (!data.name?.trim()) data.name = Folder.defaultName();
      if (this.document.id) return await this.document.update(data);
      else {
        this.document.updateSource(data);
        const folder = await FolderPTR2e.create(
          this.document instanceof Folder ? this.document.toObject() : this.document,
          { pack: this.document.pack, keepId: true }
        );
        if (!folder) return folder;
        if (this.owner) {
          await this.owner.update({ "folder": folder.id, "system.party.ownerOf": folder.id, "system.party.partyMemberOf": null });
        }
        if (this.team.length) {
          for (const member of this.team) {
            await member.update({ "system.party.teamMemberOf": Array.from(new Set(member.system.party.teamMemberOf.concat(folder.id))) });
          }
        }
        return folder;
      }
    })();
    if ("resolve" in this.options && typeof this.options.resolve === "function")
      this.options.resolve(folder);
    return folder;
  }
}

interface FolderConfigPTR2e {
  get document(): FolderPTR2e
}

export default FolderConfigPTR2e;
