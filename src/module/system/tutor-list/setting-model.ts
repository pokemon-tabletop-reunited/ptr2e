import { CollectionField } from "@module/data/fields/collection-field.ts";
import { SlugField } from "@module/data/fields/slug-field.ts";
import { TutorListData } from "@scripts/config/tutor-list.ts";
import { sluggify } from "@utils";

export const TutorListVersion = 1 as const;

export class TutorListSettings extends foundry.abstract.DataModel {
  static override defineSchema(): TutorListSettingsSchema {
    return {
      list: new CollectionField(
        new foundry.data.fields.SchemaField({
          // Slug of trait or Ability Name
          slug: new SlugField({required: true, nullable: false}),
          // Type of trait or Ability
          type: new foundry.data.fields.StringField({
            choices: ["trait", "ability", "universal"],
            initial: "trait",
            required: true,
            nullable: false,
          }),
          moves: new CollectionField(
            new foundry.data.fields.SchemaField({
              // Slug of move
              slug: new SlugField({required: true, nullable: false}),
              // Uuid of move
              uuid: new foundry.data.fields.StringField(),
            })
          ),
        })
      ),
      _migration: new foundry.data.fields.SchemaField({
        version: new foundry.data.fields.NumberField({ required: true, nullable: true, initial: null }),
        previous: new foundry.data.fields.SchemaField({
          schema: new foundry.data.fields.NumberField({ required: true, nullable: true, initial: null }),
          system: new foundry.data.fields.StringField({ required: false, blank: true }),
          foundry: new foundry.data.fields.StringField({ required: false, blank: true }),
        }, { required: false, nullable: true, initial: null }),
      }),
    }
  }

  static async initializeAndMigrate() {
    const tutorList = game.settings.get("ptr2e", "tutorListData");
    
    // Migrate Tutor List
    if(fu.isNewerVersion(TutorListVersion, tutorList._migration?.version ?? 0)) {
      const moveIndex = await game.packs.get("ptr2e.core-moves")!.getIndex();
      const moveMap = new Map<string, string>();
      for(const move of moveIndex) {
        moveMap.set(sluggify(move.name), move.uuid);
      }
      
      const tutorData = [];
      // Initialize Tutor List
      for(const data of TutorListData) {
        const tutor = {
          ...data,
          moves: [] as {slug: string, uuid: string}[]
        };
        for(const move of data.moves) {
          const uuid = moveMap.get(move);
          if(!uuid) {
            console.warn(`Unable to load ${move} for Tutor List ${data.slug} (${data.type}). Skipping...`);
            continue;
          }
          tutor.moves.push({slug: move, uuid});
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

export interface TutorListSettings extends foundry.abstract.DataModel, ModelPropsFromSchema<TutorListSettingsSchema> {
  _source: SourceFromSchema<TutorListSettingsSchema>;
}

interface TutorListSettingsSchema extends foundry.data.fields.DataSchema {
  list: CollectionField<
    foundry.data.fields.SchemaField<_TutorListSettingsSchema>,
    SourceFromSchema<_TutorListSettingsSchema>[],
    Collection<ModelPropsFromSchema<_TutorListSettingsSchema>>,
    true,
    false,
    true
  >;
  _migration: foundry.data.fields.SchemaField<
    _MigrationSchema,
    SourceFromSchema<_MigrationSchema>,
    ModelPropsFromSchema<_MigrationSchema>,
    true,
    false,
    false
  >;
}

interface _TutorListSettingsSchema extends foundry.data.fields.DataSchema {
  slug: SlugField<string, string, true, false, false>,
  type: foundry.data.fields.StringField<"trait" | "ability" | "universal", "trait" | "ability" | "universal", true, false, true>,
  moves: CollectionField<
    foundry.data.fields.SchemaField<_MoveSchema>,
    SourceFromSchema<_MoveSchema>[],
    Collection<ModelPropsFromSchema<_MoveSchema>>,
    true,
    false,
    true
  >;
}

interface _MoveSchema extends foundry.data.fields.DataSchema {
  slug: SlugField<string, string, true, false, false>,
  uuid: foundry.data.fields.StringField<string, string, true, true, true>,
}

interface _MigrationSchema extends foundry.data.fields.DataSchema {
  version: foundry.data.fields.NumberField<number, number, true, true, true>;
  previous: foundry.data.fields.SchemaField<_PreviousMigrationSchema, SourceFromSchema<_PreviousMigrationSchema>, ModelPropsFromSchema<_PreviousMigrationSchema>, false, true, true>;
}

interface _PreviousMigrationSchema extends foundry.data.fields.DataSchema {
  schema: foundry.data.fields.NumberField<number, number, true, true, true>;
  system: foundry.data.fields.StringField<string, string, false, false>;
  foundry: foundry.data.fields.StringField<string, string, false, false>;
}