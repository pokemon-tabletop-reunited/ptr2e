import { ItemPTR2e, ItemSystemPTR } from "@item";
import { DocumentSheetV2 } from "@item/sheets/document.ts";
import { isObject } from "@utils";

class GithubManager {
    static VALID_DOCUMENT_TYPES: Record<string, string> = {
        move: "ptr2e.core-moves",
        species: "ptr2e.core-species",
        ability: "ptr2e.core-abilities",
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
                (i) => item.slug === (i.system.slug || game.ptr.util.sluggify(i.name))
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
                    if (!value) {
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

    static async commitItemToGithub<TDocument extends ItemPTR2e>(
        this: DocumentSheetV2<TDocument>,
        _event: Event
    ) {
        const document = this.document;

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
            ui.notifications.error(`Cannot find existing item in '${pack.name}' pack`);
            return;
        }

        const itemData = document.toObject();
        const existingData = existing.toObject();

        const diff = GithubManager.getDiffableItem(itemData, existingData);
        if (fu.isEmpty(diff)) {
            ui.notifications.info(`No changes to commit`);
            return;
        }

        const realDiff = GithubManager.prepareUpdateData(diff, existingData);
        if (!realDiff) return;

        if(diff.name) {
            diff["old_name"] = existingData.name;
        }
        try {
            return GithubManager.applyGithubCommit(realDiff as ItemPTR2e["_source"], diff);
        }
        catch {
            ui.notifications.error("An unexpected error occured.");
        }
    }

    static API_URL = "https://2e.ptr.wiki/foundry" as const;

    static async applyGithubCommit<TDocument extends ItemPTR2e>(
        realDiff: TDocument["_source"],
        diff: Record<string, any>
    ) {
        console.debug(realDiff, diff);

        const identity = await (async () => {
            const id = game.user.getFlag("ptr2e", "dev-identity") as string;
            if (id) {
                const result = await fetch(GithubManager.API_URL+"/identify", {
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

            const result = await fetch(GithubManager.API_URL+"/identify", {
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
        })();
        if (!identity) {
            ui.notifications.error("Unable to identify user for Github commit");
            return;
        }

        async function authenticateAndCommit(identity: string, options?: {retry: boolean}) {
            const commit = await fetch(GithubManager.API_URL+"/commit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Powered-By": "FoundryVTT PTR2e",
                    identity: btoa(identity),
                },
                body: JSON.stringify({
                    data: realDiff,
                    diff: diff,
                }),
            });
            if(commit.ok) {
                const commitJson = await commit.json();
                if(commitJson['auth_url']) {
                    if(options?.retry) {
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
                    return await authenticateAndCommit(identity, {retry: true});
                }
                if(!commitJson['error']) ui.notifications.info("Successfully committed changes to Github");
                return commitJson;
            }
        }

        const result = await authenticateAndCommit(identity);
        if(result) {
            if(!result.success) {
                if(result.error) {
                    ui.notifications.error("We received an error: "+result.error);
                } else {
                    ui.notifications.error("An unexpected error occured.");
                }
            }
            else {
                ui.notifications.info("Successfully committed changes to Github");
            }
        }
        else {
            ui.notifications.error("An unexpected error occured.");
        }

        return result;
    }
}

export default GithubManager;
