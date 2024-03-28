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
}