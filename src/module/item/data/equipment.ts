import GearSystem, { type GearSystemSchema } from "./gear.ts";

export type EquipmentSchema = GearSystemSchema

/**
 * @category Item Data Models
 */
export default abstract class EquipmentSystem extends GearSystem {
    /**
     * @internal
     */
    // declare parent: EquipmentPTR2e;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    override async _preCreate(data: foundry.abstract.TypeDataModel.ParentAssignmentType<EquipmentSchema, Item.ConfiguredInstance>, options: foundry.abstract.Document.PreCreateOptions<any>, user: User.ConfiguredInstance): Promise<boolean | void> {
        const result = await super._preCreate(data, options, user);
        if (result === false) return false;

        if(!data.img || data.img === "icons/svg/item-bag.svg") {
            this.parent.updateSource({
                img: "systems/ptr2e/img/icons/equipment_icon.webp"
            })
        }
    }

    override async toEmbed(_config: TextEditor.DocumentHTMLEmbedConfig, options: TextEditor.EnrichmentOptions, additionalProperties: Record<string, unknown> = {}): Promise<HTMLElement | HTMLCollection | null> {
        return super.toEmbed(_config, options, additionalProperties, "equipment");
    }
}