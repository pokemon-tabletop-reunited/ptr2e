import { ContainerPTR2e } from "@item";
import { HasContainer, HasDescription, HasSlug, HasTraits, HasGearData } from "@module/data/index.ts";

const ContainerExtension = HasGearData(HasTraits(HasDescription(HasSlug(HasContainer(foundry.abstract.TypeDataModel)))))

/**
 * @category Item Data Models
 */
export default abstract class ContainerSystem extends ContainerExtension {
    /**
     * @internal
     */
    declare parent: ContainerPTR2e;

    /**
     * Whether the container is collapsed.
     * @defaultValue `false`
     */
    abstract collapsed: boolean;

    /**
     * @internal
     */
    declare _source: InstanceType<typeof ContainerExtension>['_source'] & {
        collapsed: boolean;
    }

    static override defineSchema(): foundry.data.fields.DataSchema {
        const fields = foundry.data.fields;
        return {
            ...super.defineSchema(),

            collapsed: new fields.BooleanField({ required: true, initial: false }),
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