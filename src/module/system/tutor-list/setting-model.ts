import { CollectionField } from "@module/data/fields/collection-field.ts";
import { SlugField } from "@module/data/fields/slug-field.ts";
import { TutorListData } from "@scripts/config/tutor-list.ts";
import { sluggify } from "@utils";

export const TutorListVersion = 2 as const;

export const tutorListSchemaSchema = {
  // Slug of trait or Ability Name
  slug: new SlugField({ required: true, nullable: false }),
  // Type of trait or Ability
  type: new foundry.data.fields.StringField<
    {required: true, nullable: false, initial: string, choices: ["trait", "egg", "ability", "universal"]},
    "trait" | "egg" | "ability" | "universal",
    "trait" | "egg" | "ability" | "universal"
  >({
    choices: ["trait", "egg", "ability", "universal"] as const,
    initial: "trait",
    required: true,
    nullable: false,
  }),
  moves: new CollectionField(
    new foundry.data.fields.SchemaField({
      // Slug of move
      slug: new SlugField({ required: true, nullable: false }),
      // Uuid of move
      uuid: new foundry.data.fields.StringField(),
    })
  ),
};

export type TutorListSchemaSchema = typeof tutorListSchemaSchema;

class TutorListSchema extends foundry.abstract.DataModel<TutorListSchemaSchema> {
  static override defineSchema(): TutorListSchemaSchema {
    return tutorListSchemaSchema
  }

  get id() {
    return `${this.slug}-${this.type}`;
  }
}


const tutorListSettingsSchema = {
  list: new CollectionField(new foundry.data.fields.EmbeddedDataField(TutorListSchema), "id"),
  _migration: new foundry.data.fields.SchemaField({
    version: new foundry.data.fields.NumberField({ required: true, nullable: true, initial: null }),
    previous: new foundry.data.fields.SchemaField({
      schema: new foundry.data.fields.NumberField({ required: true, nullable: true, initial: null }),
      system: new foundry.data.fields.StringField({ required: false, blank: true }),
      foundry: new foundry.data.fields.StringField({ required: false, blank: true }),
    }, { required: false, nullable: true, initial: null }),
  }),
}

export type TutorListSettingsSchema = typeof tutorListSettingsSchema;

export class TutorListSettings extends foundry.abstract.DataModel<TutorListSettingsSchema> {
  static override defineSchema(): TutorListSettingsSchema {
    return tutorListSettingsSchema
  }

  get(id: string) {
    return this.list.get(id);
  }

  getName(slug: string) {
    return this.list.filter(tutor => tutor.slug === slug);
  }

  getType(slug: string, type: this["list"]['contents'][number]["type"]) {
    return this.get(`${slug}-${type}`);
  }

  static async initializeAndMigrate() {
    const tutorList = game.settings.get("ptr2e", "tutorListData");

    // Migrate Tutor List
    if (foundry.utils.isNewerVersion(TutorListVersion, tutorList._migration?.version ?? 0)) {
      const moveIndex = await game.packs.get("ptr2e.core-moves")!.getIndex();
      const moveMap = new Map<string, string>();
      for (const move of moveIndex) {
        moveMap.set(sluggify(move.name!), move.uuid);
      }

      const tutorData = [];
      // Initialize Tutor List
      for (const data of TutorListData) {
        const tutor = {
          ...data,
          moves: [] as { slug: string, uuid: string }[]
        };
        for (const move of data.moves) {
          const uuid = moveMap.get(move);
          if (!uuid) {
            console.warn(`Unable to load ${move} for Tutor List ${data.slug} (${data.type}). Skipping...`);
            continue;
          }
          tutor.moves.push({ slug: move, uuid });
        }
        tutorData.push(tutor);
      }

      await game.settings.set("ptr2e", "tutorListData", {
        list: tutorData,
        _migration: {
          version: TutorListVersion,
          previous: {
            schema: typeof tutorList._migration?.version === "number" ? tutorList._migration.version : null,
            foundry: game.version,
            system: game.system.version
          }
        }
      });
    }
  }
}