import { DocumentSheetConfiguration, DocumentSheetV2 } from "@item/sheets/document.ts";
import FolderPTR2e from "./document.ts";
import { HandlebarsRenderOptions } from "types/foundry/common/applications/api.js";
import { ActorPTR2e } from "@actor";
import { SocketRequestData } from "@scripts/hooks/socket.ts";

class FolderConfigPTR2e extends foundry.applications.api.HandlebarsApplicationMixin(
  DocumentSheetV2<FolderPTR2e>
) {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["folder-edit"],
      position: {
        width: 360,
        height: "auto",
      },
      form: {
        handler: FolderConfigPTR2e.#onSubmit,
        closeOnSubmit: true,
        submitOnChange: false,
      },
    },
    { inplace: false }
  );

  override get isEditable() {
    return true;
  }

  override get isVisible() {
    return true;
  }

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    base: {
      id: "base",
      template: "/systems/ptr2e/templates/folder/folder-edit.hbs",
    },
    members: {
      id: "members",
      template: "/systems/ptr2e/templates/folder/folder-members.hbs",
    },
    submit: {
      id: "submit",
      template: "/systems/ptr2e/templates/folder/folder-submit.hbs",
    },
  };

  override get id() {
    return this.document.id ? super.id : "folder-create";
  }

  /* -------------------------------------------- */

  override get title() {
    if (this.document.id)
      return `${game.i18n.localize("FOLDER.Update")}: ${this.document.name}`;
    return game.i18n.localize("FOLDER.Create");
  }

  /* -------------------------------------------- */

  // override async close(options={}) {
  //     if ( !this.options.form?.submitOnChange ) this.options.resolve?.(null);
  //     return super.close(options);
  // }

  override async _prepareContext(options?: DocumentSheetConfiguration<FolderPTR2e>) {
    const context = await super._prepareContext(options);
    const folder = this.document.toObject();
    //@ts-expect-error - This property exists
    const label = game.i18n.localize(Folder.implementation.metadata.label);

    const owner = this.document.owner ? await fromUuid(this.document.owner) : null;
    const team = [];
    for (const memberUuid of this.document.team) {
      const actor = await fromUuid(memberUuid);
      if (actor && actor instanceof ActorPTR2e) {
        team.push({ actor, folder: actor.folder });
      }
    }

    return {
      ...context,
      folder: folder,
      owner,
      team,
      name: folder._id ? folder.name : "",
      newName: game.i18n.format("DOCUMENT.New", { type: label }),
      safeColor:
        typeof folder.color === "string"
          ? folder.color
          : //@ts-expect-error - This property exists
          folder.color?.css ?? "#000000",
      sortingModes: { a: "FOLDER.SortAlphabetical", m: "FOLDER.SortManual" },
      submitText: game.i18n.localize(folder._id ? "FOLDER.Update" : "FOLDER.Create"),
      fields: this.document.schema.fields
    };
  }

  override _attachPartListeners(
    partId: string,
    htmlElement: HTMLElement,
    _options: HandlebarsRenderOptions
  ): void {
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
        if (owner) await owner.update({ "folder": null, "system.party.ownerOf": null });
        break;
      }
      case "team": {
        const actor = await fromUuid(uuid);
        if (actor && actor instanceof ActorPTR2e) {
          await actor.update({ "system.party.teamMemberOf": (actor as ActorPTR2e).system.party.teamMemberOf.filter(id => id !== this.document.id) });
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

    await actor.update({ "folder": this.document.id, "system.party.ownerOf": this.document.id });

    return this.render({ parts: ["members"] }).then(_ => { this.position.height = "auto"; return _ })
  }

  static async _onDropTeam(this: FolderConfigPTR2e, event: DragEvent) {
    if (!event.dataTransfer) return;

    const data = JSON.parse(event.dataTransfer.getData("text/plain"));
    if (!data) return;

    const actor = game.actors.get(data.id) ?? await fromUuid(data.uuid);
    if (!actor || !(actor instanceof ActorPTR2e)) return;

    await actor.update({ "system.party.teamMemberOf": Array.from(new Set(actor.system.party.teamMemberOf.concat(this.document.id))) });

    return this.render({ parts: ["members"] }).then(_ => { this.position.height = "auto"; return _ })
  }

  static async #onSubmit(
    this: FolderConfigPTR2e,
    event: SubmitEvent | Event,
    _form: HTMLFormElement,
    formData: FormDataExtended
  ) {
    event.preventDefault();
    if(!game.user.isGM) {
      if(!game.users.activeGM) {
        ui.notifications.error("Oops! A GM must be online to process this request.");
        // Throw error so that the form doesn't close
        throw new Error("No GM is currently online.");
      }
      const id = fu.randomID();

      const timeout = setTimeout(() => {
        ui.notifications.error("Request timed out. Please try again later.");
        game.socket.off("system.ptr2e", listener);
      }, 5000);

      const listener = (data: SocketRequestData) => {
        if (typeof data !== 'object' || !('request' in data)) return;
        if(data.id !== id && ["acknowledge","acknowledgeFailure"].includes(data.request)) return;

        ui.notifications.remove(notifId);
        if(data.request === "acknowledgeFailure") ui.notifications.error(data.message || "GM failed to process request.");
        else ui.notifications.info(data.message || "GM successfully processed request.");
        game.socket.off("system.ptr2e", listener);
        clearTimeout(timeout);

        if ("resolve" in this.options && typeof this.options.resolve === "function") {
          this.options.resolve(game.folders.get(data.documentId));
        }
      }

      const data = {
        request: "folderCreateOrUpdate",
        data: fu.mergeObject(formData.object, this.document.id ? { _id: this.document.id } : {
          source: (() => {
            const source = this.document.toObject()
            const merged = fu.mergeObject(source, formData.object, { inplace: false });
            if (!merged.name) merged.name = source.name;
            return merged;
          })(),
          pack: this.document.pack
        }),
        id
      }

      game.socket.on("system.ptr2e", listener);
      game.socket.emit("system.ptr2e", data)
      const notifId = ui.notifications.info("Sending request to GM...");
      return;
    }

    const data = formData.object as { name?: string } & Record<string, unknown>;
    const folder = await (async () => {
      if (!data.name?.trim()) data.name = Folder.defaultName();
      if (this.document.id) return await this.document.update(data);
      else {
        this.document.updateSource(data);
        return await FolderPTR2e.create(
          this.document instanceof Folder ? this.document.toObject() : this.document,
          { pack: this.document.pack }
        );
      }
    })();
    if ("resolve" in this.options && typeof this.options.resolve === "function")
      this.options.resolve(folder);
    return folder;
  }
}

export default FolderConfigPTR2e;
