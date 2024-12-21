/**
 * Abstract constructor suitable for use in data model template classes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TemplateConstructor = (new (...args: any[]) => foundry.abstract.TypeDataModel) & Pick<typeof foundry.abstract.TypeDataModel, 'defineSchema'>