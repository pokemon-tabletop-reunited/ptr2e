import { SpeciesPTR2e } from "@item";
import { ItemSheetPTR2e } from "@item";

export default class SpeciesSheetPTR2e extends ItemSheetPTR2e<SpeciesPTR2e> {
    override get isEditable(): boolean {
        if(this.object.flags.ptr2e.disabled === true) return false;
        return super.isEditable;
    }
}