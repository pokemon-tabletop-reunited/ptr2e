/**
 * Abstract constructor suitable for use in data model template classes.
 */

import type { AnyDocument } from "node_modules/fvtt-types/src/foundry/client/data/abstract/client-document.d.mts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TemplateConstructor = (abstract new (...args: any[]) => foundry.abstract.TypeDataModel<DataSchema, AnyDocument>) & Pick<typeof foundry.abstract.TypeDataModel, 'defineSchema'>