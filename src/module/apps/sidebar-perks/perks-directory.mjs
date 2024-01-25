export class PerkDirectory extends ItemDirectory {

    /** @inheritDoc */
    get title() {
        return `${game.i18n.localize("DOCUMENT.Perks")} Directory`;
    }

    /** @override */
    async _onCreateEntry(event, { _skipDeprecated = false } = {}) {
        event.preventDefault();
        event.stopPropagation();
        const button = event.currentTarget;
        const li = button.closest(".directory-item");
        const data = { folder: li?.dataset?.folderId, type: "perk" };
        const options = { width: 320, left: window.innerWidth - 630, top: button.offsetTop };
        return Item.createDialog(data, options);
    }

    /** @inheritdoc */
    _onSearchFilter(event, query, rgx, html) {
        const isSearch = true //!!query;
        let entryIds = new Set();
        const folderIds = new Set();
        const autoExpandFolderIds = new Set();

        // Match entries and folders
        if (isSearch) {

            // Include folders and their parents, auto-expanding parent folders
            const includeFolder = (folder, autoExpand = true) => {
                if (!folder) return;
                if (typeof folder === "string") folder = this.collection.folders.get(folder);
                if (!folder) return;
                const folderId = folder._id;
                if (folderIds.has(folderId)) {
                    // If this folder is not already auto-expanding, but it should be, add it to the set
                    if (autoExpand && !autoExpandFolderIds.has(folderId)) autoExpandFolderIds.add(folderId);
                    return;
                }
                folderIds.add(folderId);
                if (autoExpand) autoExpandFolderIds.add(folderId);
                if (folder.folder) includeFolder(folder.folder);
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
                }
                else el.classList.toggle("collapsed", !game.folders._expanded[el.dataset.uuid]);
            }
            else el.style.display = (!isSearch || entryIds.has(el.dataset.entryId)) ? "flex" : "none";
        }
    }

    /** @inheritdoc */
    _matchSearchEntries(query, entryIds, folderIds, includeFolder) {
        super._matchSearchEntries(query, entryIds, folderIds, includeFolder);

        const entries = this.collection.index ?? this.collection.contents;
        for (const entry of entries) {
            if (entry.type !== "perk") entryIds.delete(entry._id);
        }
    }

    /** @inheritdoc */
    async close(options = {}) {
        if (game.ptr.tree.editMode) return this.minimize();
        return super.close(options);
    }

    /** @inheritdoc */
    renderPopout() {
        const pop = this.createPopout();
        pop.render(true, {top: 0, left: window.innerWidth - 310});
    }
}