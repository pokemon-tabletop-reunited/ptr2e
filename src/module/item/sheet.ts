import { ItemPTR2e } from "@item";

class ItemSheetPTR2e<TItem extends ItemPTR2e> extends ItemSheet<TItem, ItemSheetOptions> {
    
}

interface ItemSheetPTR2e<TItem extends ItemPTR2e> extends ItemSheet<TItem, ItemSheetOptions> {

}

interface ItemSheetOptions extends DocumentSheetOptions {

}

export { ItemSheetPTR2e }
export type { ItemSheetOptions }