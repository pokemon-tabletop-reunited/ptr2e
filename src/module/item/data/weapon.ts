import { ContainerPTR2e } from "@item";
import GearSystem, { GearSystemSource } from "./gear.ts";
import { BaseItemSourcePTR2e } from "./system.ts";
import { IdentificationSchema } from "@module/data/mixins/has-identification.ts";
import { MigrationSchema } from "@module/data/mixins/has-migrations.ts";
import { ContainerSchema } from "@module/data/mixins/has-container.ts";
import { DescriptionSchema } from "@module/data/mixins/has-description.ts";
import { ActionsSchema } from "@module/data/mixins/has-actions.ts";
import { ActionPTR2e } from "@data";
import { TraitsSchema } from "@module/data/mixins/has-traits.ts";
import { SlugSchema } from "@module/data/mixins/has-slug.ts";
import { GearSchema } from "@module/data/mixins/has-gear-data.ts";

/**
 * @category Item Data Models
 */
export default abstract class WeaponSystem extends GearSystem {


  static override defineSchema(): WeaponSystemSchema {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema() as WeaponSystemSchemaExtension,
      weaponType: new fields.StringField({ required: true, blank: true, initial: "", label: "PTR2E.FIELDS.weapon.weaponType.label", hint: "PTR2E.FIELDS.weapon.weaponType.hint" }),
      weaponPp: new fields.NumberField({ required: true, initial: 0, label: "PTR2E.FIELDS.weapon.weaponPp.label", hint: "PTR2E.FIELDS.weapon.weaponPp.hint" }),
      weaponRange: new fields.StringField({ required: true, initial: "", label: "PTR2E.FIELDS.weapon.weaponRange.label", hint: "PTR2E.FIELDS.weapon.weaponRange.hint" }),
    };
  }

  override async _preCreate(data: this["parent"]["_source"], options: DocumentModificationContext<this["parent"]["parent"]>, user: User) {
    const result = await super._preCreate(data, options, user);
    if (result === false) return false;

    if (!data.img || data.img === "icons/svg/item-bag.svg") {
      this.parent.updateSource({
        img: "/systems/ptr2e/img/icons/item_icon.webp"
      })
    }
    return result;
  }

  override async toEmbed(_config: foundry.abstract.DocumentHTMLEmbedConfig, options: EnrichmentOptions, additionalProperties: Record<string, unknown> = {}): Promise<HTMLElement | HTMLCollection | null> {
    return super.toEmbed(_config, options, additionalProperties, "weapon");
  }
}

export default interface WeaponSystem extends ModelPropsFromSchema<WeaponSystemSchema> {
  container: ContainerPTR2e | null;
  actions: Collection<ActionPTR2e>;

  _source: SourceFromSchema<WeaponSystemSchema>;
}

interface WeaponSystemSchema extends foundry.data.fields.DataSchema, WeaponSystemSchemaExtension {
  weaponType: foundry.data.fields.StringField<string, string, true, false, true>;
  weaponPp: foundry.data.fields.NumberField<number, number, true, false, true>;
  weaponRange: foundry.data.fields.StringField<string, string, true, false, true>;
}

type WeaponSystemSchemaExtension = IdentificationSchema & MigrationSchema & ContainerSchema & DescriptionSchema & ActionsSchema & TraitsSchema & SlugSchema & GearSchema;

export type WeaponSource = BaseItemSourcePTR2e<"weapon", WeaponSystemSource>;

interface WeaponSystemSource extends GearSystemSource { }