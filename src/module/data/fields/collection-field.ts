import type { AnyObject } from "fvtt-types/utils";
import type DataModel from "node_modules/fvtt-types/src/foundry/common/abstract/data.d.mts";
import type { ArrayField, DataField } from "node_modules/fvtt-types/src/foundry/common/data/fields.d.mts";

class CollectionField<
  ElementFieldType extends DataField.Any,
  Options extends ArrayField.AnyOptions = ArrayField.DefaultOptions<
    ArrayField.AssignmentElementType<ElementFieldType>
  >,
  AssignmentElementType = ArrayField.AssignmentElementType<ElementFieldType>,
  InitializedElementType = ArrayField.InitializedElementType<ElementFieldType>,
  AssignmentType = ArrayField.AssignmentType<AssignmentElementType, Options>,
  InitializedType extends Collection<InitializedElementType> = Collection<InitializedElementType>,
  PersistedElementType = ArrayField.PersistedElementType<ElementFieldType>,
  PersistedType extends PersistedElementType[] | null | undefined = ArrayField.PersistedType<
    AssignmentElementType,
    PersistedElementType,
    Options
  >,
> extends foundry.data.fields.ArrayField<ElementFieldType, Options, AssignmentElementType, InitializedElementType, AssignmentType, InitializedType, PersistedElementType, PersistedType> {
  /**
   * The field that is used as the key for the map.
   */
  keyField: string;

  constructor(elementField: ElementFieldType, keyField = "slug", options?: Options) {
    super(elementField, options);
    this.keyField = keyField;
  }

  override initialize(value: PersistedType, model: DataModel.Any, options?: AnyObject) {
    if (!value) return value as unknown as InitializedType;

    if (Array.isArray(value)) {
      return value.reduce((acc: InitializedType, element) => {
        const initializedElement = this.element.initialize(element, model, options) as InitializedElementType;
        acc.set((element as unknown as Record<string, string>)[this.keyField] ?? (initializedElement as unknown as Record<string, string>)[this.keyField], initializedElement);
        return acc;
      }, new Collection() as InitializedType);
    }

    return value;
  }
}

export { CollectionField }