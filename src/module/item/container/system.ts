import { ContainerPTR2e } from "@item";
import { HasContainer, HasDescription, HasSlug, HasTraits, HasGearData } from "@module/data/index.ts";

const ContainerExtension = HasGearData(HasTraits(HasDescription(HasSlug(HasContainer(foundry.abstract.TypeDataModel)))))

abstract class ContainerSystem extends ContainerExtension {
    declare parent: ContainerPTR2e;

    /**
     * Whether the container is collapsed.
     * @defaultValue `false`
     */
    abstract collapsed: boolean;

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
}

export { ContainerSystem }