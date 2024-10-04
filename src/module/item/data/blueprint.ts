import { HasEmbed, HasMigrations } from "@data";
import { MigrationSchema } from "@module/data/mixins/has-migrations.ts";
import { BaseItemSourcePTR2e } from "./system.ts";
import { CollectionField } from "@module/data/fields/collection-field.ts";
import { Blueprint } from "@module/data/models/blueprint.ts";

export default abstract class BlueprintSystem extends HasEmbed(HasMigrations(foundry.abstract.TypeDataModel), "blueprint") {
  /**
   * All items in the system have the following properties, but since blueprints do not make use of them
   * they are left as null / empty strings.
   */
  get traits() { return null }
  set traits(_) { return; }
  get slug() { return "" }
  set slug(_) { return; }
  get description() { return "" }
  set description(_) { return; }

  static override defineSchema(): BlueprintSchema {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema() as MigrationSchema,
      id: new fields.DocumentIdField({initial: fu.randomID(), required: true, nullable: false}),
      blueprints: new CollectionField(new fields.EmbeddedDataField(Blueprint), "id"),
    }
  }
}

export default interface BlueprintSystem extends ModelPropsFromSchema<BlueprintSchema> {
  _source: SourceFromSchema<BlueprintSchema>;
}

interface BlueprintSchema extends foundry.data.fields.DataSchema, MigrationSchema {
  id: foundry.data.fields.DocumentIdField<string, true, false, true>;
}

export type BlueprintSource = BaseItemSourcePTR2e<"blueprint", BlueprintSystemSource>;

interface BlueprintSystemSource {
  slug: string;
}