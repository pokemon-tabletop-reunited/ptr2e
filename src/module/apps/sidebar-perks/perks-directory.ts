import { PTRItem } from "src/module/item/base.ts";
import ItemSystemBase from "src/module/item/document.ts";

class PerkDirectory extends ItemDirectory<PTRItem<ItemSystemBase, null>> {

    override get title() {
        return `${game.i18n.localize("DOCUMENT.Perks")} Directory`;
    }

    async _onCreateEntry(event: { preventDefault: () => void; stopPropagation: () => void; currentTarget: any; }, { } = {}) {
        event.preventDefault();
        event.stopPropagation();
        const button = event.currentTarget;
        const li = button.closest(".directory-item");
        const data = { folder: li?.dataset?.folderId, type: "perk" };
        const options = { width: 320, left: window.innerWidth - 630, top: button.offsetTop };
        return Item.createDialog(data, options);
    }

    /** @inheritdoc */
    override _onSearchFilter(_event: any, _query: any, rgx: any, html: { querySelectorAll: (arg0: string) => any; }) {
        const isSearch = true //!!query;
        let entryIds: Set<string> = new Set();
        const folderIds: Set<string> = new Set();
        const autoExpandFolderIds = new Set();

        // Match entries and folders
        if (isSearch) {

            // Include folders and their parents, auto-expanding parent folders
            const includeFolder = (folder: Folder<EnfolderableDocument> | undefined, autoExpand = true) => {
                if (!folder) return;
                if (typeof folder === "string") folder = this.collection.folders.get(folder);
                if (!folder) return;
                const folderId = folder._id!;
                if (folderIds.has(folderId)) {
                    // If this folder is not already auto-expanding, but it should be, add it to the set
                    if (autoExpand && !autoExpandFolderIds.has(folderId)) autoExpandFolderIds.add(folderId);
                    return;
                }
                folderIds.add(folderId);
                if (autoExpand) autoExpandFolderIds.add(folderId);
                if (folder.folder) includeFolder(folder.folder as Folder<EnfolderableDocument>);
            };

            // First match folders
            this._matchSearchFolders(rgx, includeFolder);

            // Next match entries
            this._matchSearchEntries(rgx, entryIds, folderIds, includeFolder);
        }

        // Toggle each directory item
        for (let el of html.querySelectorAll(".directory-item")) {
            if (el.classList.contains("hidden")) continue;
            if (el.classList.contains("folder")) {
                let match = isSearch && folderIds.has(el.dataset.folderId);
                el.style.display = (!isSearch || match) ? "flex" : "none";
                if (autoExpandFolderIds.has(el.dataset.folderId)) {
                    if (isSearch && match) el.classList.remove("collapsed");
                } // @ts-ignore
                else el.classList.toggle("collapsed", !game.folders._expanded[el.dataset.uuid]);
            }
            else el.style.display = (!isSearch || entryIds.has(el.dataset.entryId)) ? "flex" : "none";
        }
    }

    override _matchSearchEntries(query: RegExp, entryIds: Set<string>, folderIds: Set<string>, includeFolder: Function) {
        super._matchSearchEntries(query, entryIds, folderIds, includeFolder);

        // @ts-ignore
        const entries = this.collection.index ?? this.collection.contents;
        for (const entry of entries) {
            if (entry.type !== "perk") entryIds.delete(entry._id);
        }
    }

    override async close(options = {}) {
        if (game.ptr.tree.editMode) { this.minimize(); return; }
        return super.close(options);
    }

    override renderPopout() {
        const pop = this.createPopout();
        pop.render(true, { top: 0, left: window.innerWidth - 310 });
    }
}

interface PerkDirectory extends ItemDirectory<PTRItem<ItemSystemBase, null>> {

}

export { PerkDirectory }