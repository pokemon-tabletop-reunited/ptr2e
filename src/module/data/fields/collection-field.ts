import type { AnyObject } from "fvtt-types/utils";

import fields = foundry.data.fields;

class CollectionField<
  ElementFieldType extends fields.DataField.Any,
  Options extends fields.ArrayField.AnyOptions = fields.ArrayField.DefaultOptions<
  fields.ArrayField.AssignmentElementType<ElementFieldType>
  >,
  AssignmentElementType = fields.ArrayField.AssignmentElementType<ElementFieldType>,
  InitializedElementType = fields.ArrayField.InitializedElementType<ElementFieldType>,
  AssignmentType = fields.ArrayField.AssignmentType<AssignmentElementType, Options>,
  InitializedType extends Collection<InitializedElementType> = Collection<InitializedElementType>,
  PersistedElementType = fields.ArrayField.PersistedElementType<ElementFieldType>,
  PersistedType extends PersistedElementType[] | null | undefined = fields.ArrayField.PersistedType<
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

  override initialize(value: PersistedType, model: foundry.abstract.DataModel.Any, options?: AnyObject) {
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