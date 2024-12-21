import { ItemSystemPTR } from "@item";
import { ItemPTR2e } from "./document.ts";

export default class ItemDirectoryPTR2e<TItem extends ItemPTR2e<ItemSystemPTR, null>> extends ItemDirectory<TItem> {
    protected override _onDrop(event: DragEvent): void {
        const data = TextEditor.getDragEventData(event) as DropCanvasData;
        if ( !data?.type ) return;
        const target = (event.target as HTMLElement)?.closest(".directory-item") || null;

        if(data.type === "ActiveEffect") {
            this._handleDroppedEntry(target as HTMLElement, data);
            return;
        }
        return super._onDrop(event);
    }

    protected override _createDroppedEntry(entry: TItem, folderId?: string | undefined): Promise<TItem> {
        const data = entry.toObject();
        data.folder = folderId || null;
        const options = { keepId: false };
        if(data._id) {
            const statusEffect = CONFIG.statusEffects.find(effect => effect._id === data._id);
            if(statusEffect) options.keepId = true;
        }
        //@ts-expect-error - This is a valid check
        return entry.constructor.create(data, options);
    }
}