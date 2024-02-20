/**
 * Abstract constructor suitable for use in data model template classes.
 */
export type TemplateConstructor = (abstract new (...args: any[]) => foundry.abstract.TypeDataModel) & Pick<typeof foundry.abstract.TypeDataModel, 'defineSchema'>