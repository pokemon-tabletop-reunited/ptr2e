/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionPTR2e } from "@data";
import { ItemPTR2e, ItemSystemPTR } from "@item";
import { DocumentSheetV2 } from "@item/sheets/document.ts";
import { isObject } from "@utils";
import { ApplicationV2Expanded } from "./appv2-expanded.ts";
import { HandlebarsRenderOptions } from "types/foundry/common/applications/handlebars-application.ts";

class GithubSheet extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      id: "github-commit-manager",
      tag: "form",
      classes: ["sheet", "github-commit-manager", "default-sheet"],
      position: {
        width: 565,
      },
      window: {
        title: "Github Commit Manager",
        minimizable: true,
        resizable: true,
      },
      actions: {
        finalize: async function (this: GithubSheet) {
          ui.notifications.info("Finalizing commit to Github");

          const commitMessage = this.element.querySelector<HTMLTextAreaElement>("[name='commit-message']")?.value;
          const prTitle = this.element.querySelector<HTMLInputElement>("[name='pr-title']")?.value;

          const result = await GithubManager.finalizeCommitToGithub({ message: commitMessage, title: prTitle });
          if (result.success) {
            ui.notifications.info("Successfully finalized commit to Github");
          }
          this.close();
        },
        cancel: async function (this: GithubSheet) {
          if (this.ongoing) {
            ui.notifications.info("Cancelling commit to Github");
            await GithubManager.finalizeCommitToGithub({ deletePR: true });
          }
          this.close();
        },
        delete: async function (this: GithubSheet, event: MouseEvent) {
          if (!this.ongoing) return;

          const button = event.target as HTMLButtonElement;
          const path = button.dataset.path;
          if (!path) return;
          button.disabled = true;

          const result = await GithubManager.finalizeCommitToGithub({ deletePR: path });
          if (result.success) {
            ui.notifications.info("Successfully deleted entry");
          }
          return this.render(true);
        },
      }
    },
    { inplace: false }
  );

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    main: {
      id: "main",
      template: "systems/ptr2e/templates/apps/github-main.hbs",
      scrollable: [".scroll"],
    },
  };

  ongoing = false;

  override async _prepareContext(options?: HandlebarsRenderOptions | undefined) {
    const context = await super._prepareContext(options);

    const status = await GithubManager.getCommitStatus();

    return {
      ...context,
      status,
      ongoing: this.ongoing = (status?.success && status.blobs.length > 0) ?? false,
    }
  }
}

class GithubManager {
  static VALID_DOCUMENT_TYPES: Record<string, string> = {
    move: "ptr2e.core-moves",
    species: "ptr2e.core-species",
    ability: "ptr2e.core-abilities",
    perk: "ptr2e.core-perks",
    effect: "ptr2e.core-effects",
    consumable: "ptr2e.core-gear",
    container: "ptr2e.core-gear",
    equipment: "ptr2e.core-gear",
    gear: "ptr2e.core-gear",
    weapon: "ptr2e.core-gear",
    summon: "ptr2e.core-summons"
  } as const;

  static async getExistingItem<TDocument extends ItemPTR2e>(
    item: TDocument,
    pack: CompendiumCollection<ItemPTR2e<ItemSystemPTR, null>>
  ) {
    const existing = await (async () => {
      const sourceId = item.flags?.core?.sourceId;
      if (sourceId) {
        const existing = await pack.getDocument(sourceId.split(".").at(-1)!);
        if (existing) return existing;
      }
      const index = await pack.getIndex({ fields: ["system.slug"] });
      const existing = index.find(
        (i) => item.slug === (i.system?.slug || game.ptr.util.sluggify(i.name))
      );
      if (existing) return pack.getDocument(existing._id);
      return null;
    })();
    return existing;
  }

  static getDiffableItem<TDocument extends ItemPTR2e>(
    item: TDocument["_source"],
    packItem: TDocument["_source"]
  ) {
    const diff = fu.diffObject<Record<string, any>>(packItem, item);
    if (diff.flags?.core) {
      delete diff.flags.core;
      if (fu.isEmpty(diff.flags)) {
        delete diff.flags;
      }
    }
    delete diff.sort;
    delete diff._id;
    delete diff._stats;
    delete diff.folder;
    delete diff.ownership;
    if (diff.system?.actions) {
      diff.system.actions = fu.diffObject(
        (packItem.system as { actions: object }).actions,
        (item.system as { actions: object }).actions
      );
      for (const [index, action] of Object.entries(diff.system.actions) as [
        string,
        Record<string, any>,
      ][]) {
        for (const [key, value] of Object.entries(action)) {
          if (value === null || value === undefined) {
            delete action[key];
          }
          if (isObject(value) && !fu.isEmpty(value)) {
            for (const [k, v] of Object.entries(value)) {
              if (!v) {
                delete (value as any)[k];
              }
            }
            if (fu.isEmpty(value)) {
              delete action[key];
            }
          }
        }
        if (fu.isEmpty(action)) {
          delete diff.system.actions[index];
        }
      }
      if (fu.isEmpty(diff.system.actions)) {
        delete diff.system.actions;
      }
    }
    if (fu.isEmpty(diff.system)) {
      delete diff.system;
    }

    console.debug(`PTR2e | GithubManager#getDiffableItem - Diffable item:`, diff);

    return diff;
  }

  static prepareUpdateData<TDocument extends ItemPTR2e>(
    diff: Record<string, any>,
    packItem: TDocument["_source"]
  ) {
    const data: Record<string, any> = fu.mergeObject(packItem, diff, { inplace: false });
    if ('actions' in packItem.system && diff.system?.actions !== undefined) {
      const actions = data.system.actions = packItem.system.actions as unknown as ActionPTR2e[];
      for (const [key, action] of Object.entries<ActionPTR2e>(diff.system.actions)) {
        const index = parseInt(key);
        if (actions[index]) {
          actions[index] = fu.mergeObject(actions[index], action, { inplace: false });
        } else {
          data.system.actions.push(action);
        }
      }
    }

    if (data.flags?.core) {
      if (data.flags.core?.sourceId) {
        delete data.flags.core.sourceId;
      }
      if (fu.isEmpty(data.flags.core)) {
        delete data.flags.core;
      }
      if (fu.isEmpty(data.flags)) {
        delete data.flags;
      }
    }
    if (!data.folder) {
      delete data.folder;
    }
    delete data.sort;
    delete data.ownership;
    delete data._stats;

    for (const action of (Array.isArray(data.system.actions) ? data.system.actions : Object.values(data.system.actions ?? {}))) {
      for (const [key, value] of Object.entries(action)) {
        if (!value) {
          delete action[key];
        }
        if (isObject(value) && !fu.isEmpty(value)) {
          for (const [k, v] of Object.entries(value)) {
            if (!v) {
              delete (value as any)[k];
            }
          }
        }
      }
    }
    for (const [key, value] of Object.entries(data.system)) {
      if (!value) {
        delete data.system[key];
      }
    }

    if (data.system.abilities) {
      for (const key in data.system.abilities) {
        for (const ability of data.system.abilities[key]) {
          if (ability.uuid) delete ability.uuid;
        }
      }
    }

    if (data.system.moves) {
      for (const key in data.system.moves) {
        for (const move of data.system.moves[key]) {
          if (move.uuid) delete move.uuid;
        }
      }
    }

    console.debug(`PTR2e | GithubManager#prepareUpdateData - Prepared data for update:`, data);

    // Check if valid document
    try {
      const tempItem = new ItemPTR2e(fu.deepClone(data), { keepId: true });
      tempItem.validate();
    } catch (error) {
      ui.notifications.error(
        "Unable to validate document, please check console for more information."
      );
      console.error(
        `PTR2e | GithubManager#prepareUpdateData - Document Validation Failed!`,
        error
      );
      return null;
    }

    return data;
  }

  static async commitItemToGithubSheet<TDocument extends ItemPTR2e>(this: DocumentSheetV2<TDocument>) {
    return GithubManager.commitItemToGithub(this.document);
  }

  static async commitItemToGithub<TDocument extends ItemPTR2e>(
    document: TDocument,
  ) {
    if (!GithubManager.VALID_DOCUMENT_TYPES[document.type]) {
      ui.notifications.error(`Cannot commit ${document.type} to Github`);
      return;
    }

    const pack = game.packs.get(
      GithubManager.VALID_DOCUMENT_TYPES[document.type]
    ) as CompendiumCollection<ItemPTR2e<ItemSystemPTR, null>>;
    if (!pack) {
      ui.notifications.error(`Cannot find pack for ${document.type}`);
      return;
    }

    const existing = await GithubManager.getExistingItem(document, pack);
    if (!existing) {
      try {
        return GithubManager.saveBlobToGithub(document.toObject() as ItemPTR2e["_source"]);
      }
      catch {
        ui.notifications.error("An unexpected error occured.");
        return;
      }
    }

    if (existing.type == "effect" && existing.pack == "ptr2e.core-effects" && existing.folder?.id === "V4skAU6G3OH5fXgD") {
      ui.notifications.error("You cannot commit the Core Afflictions to Github in this manner.");
      return
    }

    const isPack = document === existing;
    const itemData = document.toObject();
    const existingData = existing.toObject();

    const diff = isPack ? itemData as Record<string, any> : GithubManager.getDiffableItem(itemData, existingData);
    if (fu.isEmpty(diff)) {
      ui.notifications.info(`No changes to commit`);
      return;
    }

    const realDiff = GithubManager.prepareUpdateData(diff, existingData);
    if (!realDiff) return;

    if (diff.name) {
      diff["old_name"] = existingData.name;
    }
    try {
      await GithubManager.saveBlobToGithub(realDiff as ItemPTR2e["_source"], diff);
    }
    catch {
      ui.notifications.error("An unexpected error occured.");
    }
    return new GithubSheet().render(true);
  }

  static API_URL = "https://2e.ptr.wiki/foundry" as const;

  static async getIdentity() {
    const id = game.user.getFlag("ptr2e", "dev-identity") as string;
    if (id) {
      const result = await fetch(GithubManager.API_URL + "/identify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Powered-By": "FoundryVTT PTR2e",
        },
        body: JSON.stringify({ id }),
      });
      if (result.status === 200) {
        game.user.unsetFlag("ptr2e", "dev-identity");

      } else if (result.status === 202) {
        return id;
      }
    }

    const result = await fetch(GithubManager.API_URL + "/identify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Powered-By": "FoundryVTT PTR2e",
      },
      body: JSON.stringify({ id: fu.randomID() + game.user.name + game.user.id }),
    });
    if (result.status === 200) {
      const json = await result.json();
      const identity = json.identity as string;
      if (!identity) return null;

      await game.user.setFlag("ptr2e", "dev-identity", atob(identity));
      return atob(identity);
    } else if (result.status === 202) {
      throw new Error("An unexpected error occured.");
    }

    return null;
  }

  static async saveBlobToGithub<TDocument extends ItemPTR2e>(
    realDiff: TDocument["_source"],
    diff?: Record<string, any>
  ) {
    const identity = await GithubManager.getIdentity();
    if (!identity) {
      ui.notifications.error("Unable to identify user for Github commit");
      return;
    }

    async function authenticateAndCommit(identity: string, options?: { retry: boolean }) {
      const commit = await fetch(GithubManager.API_URL + "/commit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Powered-By": "FoundryVTT PTR2e",
          identity: btoa(identity),
        },
        body: JSON.stringify({
          data: realDiff,
          diff: diff || {},
          flags: {
            new: true
          }
        }),
      });
      if (commit.ok) {
        const commitJson = await commit.json();
        if (commitJson['auth_url']) {
          if (options?.retry) {
            ui.notifications.error("Unable to authenticate user for Github commit");
            return null;
          }
          const reference = window.open(commitJson['auth_url'], identity, "popup=true");
          await new Promise((resolve) => {
            reference?.addEventListener("close", () => {
              resolve(true);
            });
            reference?.addEventListener("unload", () => {
              resolve(true);
            });
          });
          return await authenticateAndCommit(identity, { retry: true });
        }
        return commitJson;
      }
    }

    const result = await authenticateAndCommit(identity);
    if (result) {
      if (!result.success) {
        if (result.error) {
          ui.notifications.error("We received an error: " + result.error);
        } else {
          ui.notifications.error("An unexpected error occured.");
        }
      }
      else {
        ui.notifications.info("Successfully added file to next commit.");
      }
    }
    else {
      ui.notifications.error("An unexpected error occured.");
    }

    return result;
  }

  static async finalizeCommitToGithub({ deletePR = false, message, title }: { deletePR?: boolean | string, message?: string, title?: string } = { deletePR: false }) {
    const identity = await GithubManager.getIdentity();
    if (!identity) {
      ui.notifications.error("Unable to identify user for Github commit");
      return;
    }

    async function authenticateAndFinalizeCommit(identity: string, options?: { retry: boolean }) {
      const commit = await fetch(GithubManager.API_URL + "/commit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Powered-By": "FoundryVTT PTR2e",
          identity: btoa(identity),
        },
        body: JSON.stringify({
          flags: {
            new: true,
            ...(deletePR ? { delete: deletePR } : { commit: true }),
            ...(message ? { message } : { message: "Auto Generated message for PTR2e Foundry Data Github Sync." }),
            ...(title ? { title } : {}),
          }
        }),
      });
      if (commit.ok) {
        const commitJson = await commit.json();
        if (commitJson['auth_url']) {
          if (options?.retry) {
            ui.notifications.error("Unable to authenticate user for Github commit");
            return null;
          }
          const reference = window.open(commitJson['auth_url'], identity, "popup=true");
          await new Promise((resolve) => {
            reference?.addEventListener("close", () => {
              resolve(true);
            });
            reference?.addEventListener("unload", () => {
              resolve(true);
            });
          });
          return await authenticateAndFinalizeCommit(identity, { retry: true });
        }
        return commitJson;
      }
    }

    const result = await authenticateAndFinalizeCommit(identity);
    if (result) {
      if (!result.success) {
        if (result.error) {
          ui.notifications.error("We received an error: " + result.error);
        } else {
          ui.notifications.error("An unexpected error occured.");
        }
      }
    }
    else {
      ui.notifications.error("An unexpected error occured.");
    }

    return result;
  }

  static async getCommitStatus() {
    const identity = await GithubManager.getIdentity();
    if (!identity) {
      ui.notifications.error("Unable to identify user for Github commit");
      return;
    }

    async function authenticateAndGetStatus(identity: string, options?: { retry: boolean }) {
      const commit = await fetch(GithubManager.API_URL + "/commit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Powered-By": "FoundryVTT PTR2e",
          identity: btoa(identity),
        },
        body: JSON.stringify({
          flags: {
            new: true,
            status: true
          }
        }),
      });
      if (commit.ok) {
        const commitJson = await commit.json();
        if (commitJson['auth_url']) {
          if (options?.retry) {
            ui.notifications.error("Unable to authenticate user for Github commit");
            return null;
          }
          const reference = window.open(commitJson['auth_url'], identity, "popup=true");
          await new Promise((resolve) => {
            reference?.addEventListener("close", () => {
              resolve(true);
            });
            reference?.addEventListener("unload", () => {
              resolve(true);
            });
          });
          return await authenticateAndGetStatus(identity, { retry: true });
        }
        return commitJson;
      }
      else {
        try {
          const commitJson = await commit.json();
          return {
            success: false,
            status: commit.status,
            error: commitJson.error,
          }
        } catch {
          return {
            success: false,
            status: commit.status,
          }
        }
      }
    }

    const result = await authenticateAndGetStatus(identity);
    if (result) {
      if (!result.success) {
        if (result.status === 404) {
          return {
            success: true,
            blobs: []
          }
        }
        if (result.error) {
          ui.notifications.error("We received an error: " + result.error);
        } else {
          ui.notifications.error("An unexpected error occured.");
        }
      }
    }
    else {
      ui.notifications.error("An unexpected error occured.");
    }

    return result as {
      success: boolean;
      blobs: { name: string, path: string, message: string }[];
    }
  }
}

export default GithubManager;
export { GithubSheet };
