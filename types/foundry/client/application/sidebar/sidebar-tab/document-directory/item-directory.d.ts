export {};

declare global {
    /** The sidebar directory which organizes and displays world-level Item documents. */
    class ItemDirectory<TItem extends Item<null>> extends DocumentDirectory<TItem> {
        static override documentName: "Item";

        protected override _canDragDrop(selector: string): boolean;

        protected override _getEntryContextOptions(): EntryContextOption[];

        protected _matchSearchEntries(query: RegExp, entryIds: Set<string>, folderIds: Set<string>, includeFolder: Function): void;
        protected _matchSearchFolders(query: RegExp, includeFolder: Function): void;

        createPopout(): SidebarTab;

        get collection(): DocumentCollection<TItem>;
    }
}
