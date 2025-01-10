import GearSystem, { type GearSystemSchema } from "./gear.ts";

const weaponSchema = {
  weaponType: new foundry.data.fields.StringField({ required: true, blank: true, initial: "", label: "PTR2E.FIELDS.weapon.weaponType.label", hint: "PTR2E.FIELDS.weapon.weaponType.hint" }),
  weaponPp: new foundry.data.fields.NumberField({ required: true, initial: 0, label: "PTR2E.FIELDS.weapon.weaponPp.label", hint: "PTR2E.FIELDS.weapon.weaponPp.hint" }),
  weaponRange: new foundry.data.fields.StringField({ required: true, initial: "", label: "PTR2E.FIELDS.weapon.weaponRange.label", hint: "PTR2E.FIELDS.weapon.weaponRange.hint" }),
}

export type WeaponSchema = typeof weaponSchema & GearSystemSchema;

/**
 * @category Item Data Models
 */
export default abstract class WeaponSystem extends GearSystem {


  static override defineSchema(): WeaponSchema {
    return {
      ...super.defineSchema() as GearSystemSchema,
      ...weaponSchema,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async _preCreate(data: foundry.abstract.TypeDataModel.ParentAssignmentType<WeaponSchema, Item.ConfiguredInstance>, options: foundry.abstract.Document.PreCreateOptions<any>, user: User.ConfiguredInstance): Promise<boolean | void> {
    const result = await super._preCreate(data, options, user);
    if (result === false) return false;

    if (!data.img || data.img === "icons/svg/item-bag.svg") {
      this.parent.updateSource({
        img: "systems/ptr2e/img/icons/weapon_icon.webp"
      })
    }
    return result;
  }

  override async toEmbed(_config: TextEditor.DocumentHTMLEmbedConfig, options: TextEditor.EnrichmentOptions, additionalProperties: Record<string, unknown> = {}): Promise<HTMLElement | HTMLCollection | null> {
    return super.toEmbed(_config, options, additionalProperties, "weapon");
  }
}