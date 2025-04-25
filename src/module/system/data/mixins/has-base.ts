import { MixableTypeDataModel } from "./data";
import { HasActions, type ActionsSchema } from "./has-actions";
import { HasContainer, type ContainerSchema } from "./has-container";
import { HasDescription, type DescriptionSchema } from "./has-description";
import { HasMigrations, type MigrationsSchema } from "./has-migrations";
import { HasPublication, type PublicationSchema } from "./has-publication";
import { HasSlug, type SlugSchema } from "./has-slug";
import { HasTraits, type TraitsSchema } from "./has-traits";

export function HasBase<BaseClass extends typeof MixableTypeDataModel>(baseClass: BaseClass) {
  abstract class TemplateClass extends HasMigrations(HasContainer(HasDescription(HasActions(HasTraits(HasPublication(HasSlug(baseClass))))))) { }

  return TemplateClass;
}

export type HasBaseSchema = ContainerSchema & DescriptionSchema & SlugSchema & TraitsSchema & MigrationsSchema & PublicationSchema & ActionsSchema