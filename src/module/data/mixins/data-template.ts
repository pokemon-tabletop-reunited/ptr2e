/**
 * Abstract constructor suitable for use in data model template classes.
 */

import type { AnyDocument } from "node_modules/fvtt-types/src/foundry/client/data/abstract/client-document.d.mts";
import type TypeDataModel from "node_modules/fvtt-types/src/foundry/common/abstract/type-data.d.mts";
import type { DataSchema } from "node_modules/fvtt-types/src/foundry/common/data/fields.d.mts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// export type TemplateConstructor = (abstract new (...args: any[]) => foundry.abstract.TypeDataModel<DataSchema, AnyDocument>) & Pick<typeof foundry.abstract.TypeDataModel, 'defineSchema'>
export type TemplateConstructor = typeof AnyTypeDataModel;

declare abstract class AnyTypeDataModel extends TypeDataModel<DataSchema, AnyDocument> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(...args: any[]);
}