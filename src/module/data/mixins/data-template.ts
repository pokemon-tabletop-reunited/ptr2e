/**
 * Abstract constructor suitable for use in data model template classes.
 */
export type TemplateConstructor = (new (...args: any[]) => foundry.abstract.TypeDataModel) & Pick<typeof foundry.abstract.TypeDataModel, 'defineSchema'>