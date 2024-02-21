import { ContainerPTR2e } from '@item';
import { TemplateConstructor } from './data-template.ts';

/**
 * Adds container property to target data model.
 */
export default function HasContainer<BaseClass extends TemplateConstructor>(baseClass: BaseClass) {
	abstract class TemplateClass extends baseClass {

        /**
         * The container that the item is in.
         * @remarks
         * This is the container that the item is in, if any.
         * If the item is not in a container, this will be `null`.
         */
        abstract container: ContainerPTR2e | null;

		declare _source: InstanceType<typeof baseClass>['_source'] & {
            container: DocumentUUID;
        }

		static override defineSchema(): foundry.data.fields.DataSchema {
			const fields = foundry.data.fields;

			return {
				...super.defineSchema(),
                
                container: new fields.DocumentUUIDField( { required: false, nullable: true })
			};
		}

		override prepareBaseData() {
			super.prepareBaseData();

			Object.defineProperty(
				this,
				"container",
				{
					value: fromUuidSync(this._source.container, this.parent as ClientDocument | null) as ContainerPTR2e | null,
					writable: false,
					enumerable: false,
				}
			)
		}
	}

	return TemplateClass;
}