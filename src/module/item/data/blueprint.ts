import { HasEmbed, HasMigrations } from "@data";
import { MigrationSchema } from "@module/data/mixins/has-migrations.ts";
import { BaseItemSourcePTR2e } from "./system.ts";
import { CollectionField } from "@module/data/fields/collection-field.ts";
import { Blueprint } from "@module/data/models/blueprint.ts";
import { ItemPTR2e } from "@item/document.ts";
import { SpeciesSystemModel } from "./index.ts";

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
      id: new fields.DocumentIdField({ initial: fu.randomID(), required: true, nullable: false }),
      blueprints: new CollectionField(new fields.EmbeddedDataField(Blueprint), "id"),
    }
  }

  async updateChildren(updates: Record<string, unknown>[]) {
    if (!updates.every(u => u._id)) {
      throw new Error("Cannot update children without an id");
    }

    const children = this.toObject().blueprints;
    const map = new Map(children.map(c => [c.id, c]));
    for (const update of updates) {
      const child = map.get(update._id as string);
      if (!child) {
        throw new Error(`Could not find child with id ${update._id}`);
      }
      delete update._id;
      fu.mergeObject(child, update, { inplace: true })
    }

    return this.parent.update({ "system.blueprints": children });
  }

  async createChildren(children: (RollTable | ItemPTR2e<BlueprintSystem | SpeciesSystemModel>)[]) {
    const existing = this.toObject().blueprints;
    const newChildren = children.flatMap((c: RollTable | ItemPTR2e<BlueprintSystem | SpeciesSystemModel>): Partial<Blueprint['_source']>[] => {
      if (c instanceof ItemPTR2e && c.system instanceof BlueprintSystem) {
        return c.system.blueprints.map(b => ({
          ...b.toObject(),
          id: fu.randomID()
        }));
      }
      return [{
        species: c.uuid,
        id: fu.randomID(),
      }]
    });

    return this.parent.update({ "system.blueprints": existing.concat(newChildren) });
  }

  async deleteChildren(ids: string[]) {
    const children = this.toObject().blueprints.filter(c => !ids.includes(c.id as string));
    return this.parent.update({ "system.blueprints": children });
  }
}

export default interface BlueprintSystem extends ModelPropsFromSchema<BlueprintSchema> {
  _source: SourceFromSchema<BlueprintSchema>;
}

interface BlueprintSchema extends foundry.data.fields.DataSchema, MigrationSchema {
  id: foundry.data.fields.DocumentIdField<string, true, false, true>;
  blueprints: CollectionField<foundry.data.fields.EmbeddedDataField<Blueprint>>;
}

export type BlueprintSource = BaseItemSourcePTR2e<"blueprint", BlueprintSystemSource>;

interface BlueprintSystemSource {
  slug: string;
}