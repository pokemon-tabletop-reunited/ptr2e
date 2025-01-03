import type { AbilityPTR2e} from "@item";
import { MigrationBase } from "../base.ts";
import type { SpeciesSchema } from "@item/data/species.ts";

export class Migration106AbilityUUIDs extends MigrationBase {
  static override version = 0.106;

  static abilitiesMap: Map<string, {slug: string, uuid: string}> | null = null;

  isSpeciesItem(item: PTR.Item.Source): item is PTR.Item.Source & { system: foundry.data.fields.SchemaField.PersistedType<SpeciesSchema> } {
    return item.type === "species";
  }

  override async updateItem(source: PTR.Item.Source): Promise<void> {
    // Only update species
    if (!this.isSpeciesItem(source)) return;

    if (Migration106AbilityUUIDs.abilitiesMap === null) {
      const coreAbilities = (await game.packs
        .get("ptr2e.core-abilities")!
        .getDocuments()) as AbilityPTR2e[];
        Migration106AbilityUUIDs.abilitiesMap = new Map(
        coreAbilities.map((ability) => [ability.system.slug, { slug: ability.system.slug, uuid: ability.uuid }])
      );
    }

    // convert slugs to {slug,uuid}
    const abilities = source.system.abilities;
    for (const category of Object.keys(abilities)) {
      abilities[category as keyof typeof abilities] = Object.values(abilities[category as keyof typeof abilities] as []).map(({ slug, uuid }): {slug: string, uuid: string} => {
        if (uuid) {
          return { slug, uuid }
        };
        if (!(Migration106AbilityUUIDs.abilitiesMap?.has(slug) ?? false)) {
          return { slug, uuid };
        }
        return foundry.utils.deepClone(Migration106AbilityUUIDs.abilitiesMap!.get(slug)!);
      });
    }

    // Update item
    source.system.abilities = abilities
  }

  // Actors can house virtual species items, so we need to update them as well
  override async updateActor(source: Actor.PTR.SourceWithSystem): Promise<void> {
    if(!source.system.species) return;

    if (Migration106AbilityUUIDs.abilitiesMap === null) {
      const coreAbilities = (await game.packs
        .get("ptr2e.core-abilities")!
        .getDocuments()) as AbilityPTR2e[];
        Migration106AbilityUUIDs.abilitiesMap = new Map(
        coreAbilities.map((ability) => [ability.system.slug, { slug: ability.system.slug, uuid: ability.uuid }])
      );
    }

    // convert slugs to {slug,uuid}
    const abilities = source.system.species.abilities;
    for (const category of Object.keys(abilities)) {
      abilities[category as keyof typeof abilities] = Object.values(abilities[category as keyof typeof abilities] as []).map(({ slug, uuid }): {slug: string, uuid: string} => {
        if (uuid) {
          return { slug, uuid }
        };
        if (!(Migration106AbilityUUIDs.abilitiesMap?.has(slug) ?? false)) {
          return { slug, uuid };
        }
        return foundry.utils.deepClone(Migration106AbilityUUIDs.abilitiesMap!.get(slug)!);
      });
    }

    // Update item
    source.system.species.abilities = abilities
  }
}