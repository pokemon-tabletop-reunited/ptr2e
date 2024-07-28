import { ContainerPTR2e } from "@item";
import { HasContainer, HasDescription, HasSlug, HasTraits, HasGearData, HasEmbed, HasMigrations } from "@module/data/index.ts";
import { BaseItemSourcePTR2e } from "./system.ts";
import { GearSystemSource } from "./gear.ts";
import { SlugSchema } from "@module/data/mixins/has-slug.ts";
import { MigrationSchema } from "@module/data/mixins/has-migrations.ts";
import { TraitsSchema } from "@module/data/mixins/has-traits.ts";
import { DescriptionSchema } from "@module/data/mixins/has-description.ts";
import { ContainerSchema } from "@module/data/mixins/has-container.ts";
import { GearSchema } from "@module/data/mixins/has-gear-data.ts";

const ContainerExtension = HasEmbed(HasMigrations(HasGearData(HasTraits(HasDescription(HasSlug(HasContainer(foundry.abstract.TypeDataModel)))))), "container");

/**
 * @category Item Data Models
 */
export default abstract class ContainerSystem extends ContainerExtension {
    /**
     * @internal
     */
    declare parent: ContainerPTR2e;

    static override defineSchema(): ContainerSystemSchema {
        const fields = foundry.data.fields;
        return {
            ...super.defineSchema() as ContainerSystemSchemaExtension,

            collapsed: new fields.BooleanField({ required: true, initial: false, label: "PTR2E.FIELDS.collapsed.label", hint: "PTR2E.FIELDS.collapsed.hint"}),
        };
    }

    override async _preCreate(data: this["parent"]["_source"], options: DocumentModificationContext<this["parent"]["parent"]>, user: User): Promise<boolean | void> {
        const result = await super._preCreate(data, options, user);
        if (result === false) return false;

        if(!data.img || data.img === "icons/svg/item-bag.svg") {
            this.parent.updateSource({
                img: "/systems/ptr2e/img/icons/item_icon.webp"
            })
        }
    }
}

export default interface ConsumableSystem extends ModelPropsFromSchema<ContainerSystemSchema> {
  container: ContainerPTR2e | null;

  _source: SourceFromSchema<ContainerSystemSchema>;
}


interface ContainerSystemSchema extends foundry.data.fields.DataSchema, ContainerSystemSchemaExtension {

}

type ContainerSystemSchemaExtension = SlugSchema & MigrationSchema & TraitsSchema & DescriptionSchema & ContainerSchema & GearSchema;

export type ContainerSource = BaseItemSourcePTR2e<"container", ContainerSystemSource>;

interface ContainerSystemSource extends Omit<GearSystemSource, 'actions'> {
    collapsed: boolean;
}