import { ChangeSchema } from "../data.ts";
import GrantItemChangeSystem from "../grant-item.ts";
import ChangeForm, { ChangeFormContext } from "./base.ts";

class GrantItemForm extends ChangeForm<GrantItemChangeSystem> {
    override get template() {
        return "systems/ptr2e/templates/effects/changes/grant-item.hbs";
    }

    override async _prepareContext() {
        const context: ChangeFormContext<GrantItemChangeSystem> & {
            granted?: ClientDocument | null;
        } = await super._prepareContext();
        const uuid = this.change.uuid ? String(this.change.uuid) : null;
        context.granted = uuid ? await fromUuid(uuid) : null;
        return context;
    }

    override updateObject(source: SourceFromSchema<ChangeSchema>): void {
        super.updateObject(source);
        if('value' in source && typeof source.value === "string") source.value = source.value.trim();
    }
}

export default GrantItemForm;