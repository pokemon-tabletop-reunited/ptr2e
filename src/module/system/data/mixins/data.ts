/* eslint-disable @typescript-eslint/no-unnecessary-type-arguments */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { AnyObject } from "fvtt-types/utils";

type DataSchema = foundry.data.fields.DataSchema;

type AnyDataModel = DataModel<DataSchema, AnyDataModel | null, AnyObject>;

declare class AnyDocument extends foundry.abstract.Document<
  foundry.abstract.Document.Type,
  {},
  AnyDocument
> {
  constructor(...args: any[]);
}

declare class MixableDataModel<
  Schema extends DataSchema = {},
> extends DataModel<Schema, AnyDataModel | null, {}> {
  // Mixins only work with `...args: any[]` specifically.
  constructor(...args: any[]);
}

declare abstract class MixableTypeDataModel extends foundry.abstract.TypeDataModel<{}, AnyDocument, {}, {}> {
  constructor(...args: any[]);
}

type MixSchemas<
  BaseClass extends DataModel.AnyConstructor,
  Schema extends DataSchema,
> = BaseClass & typeof MixableDataModel<Schema>;

function mixSchema<
  BaseClass extends DataModel.AnyConstructor,
  Schema extends DataSchema,
>(BaseClass: BaseClass, schema: Schema): MixSchemas<BaseClass, Schema> {
  class MixedSchemas extends (BaseClass as unknown as typeof MixableDataModel) {
    static override defineSchema() {
      return {
        ...super.defineSchema(),
        ...schema,
      };
    }
  }

  return MixedSchemas as never;
}

export {
  MixableDataModel, MixableTypeDataModel, mixSchema
}