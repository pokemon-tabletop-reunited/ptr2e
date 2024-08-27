import { AbilityPTR2e, ItemPTR2e } from "@item";
import { MigrationBase } from "../base.ts"
import SpeciesSystem, { AbilityReference } from "@item/data/species.ts";

export class Migration106AbilityUUIDs extends MigrationBase {
    static override version = 0.106;

    abilitiesMap: Map<string, AbilityReference> | null = null;

    isSpeciesItem(item: ItemPTR2e['_source']): item is ItemPTR2e<SpeciesSystem>['_source'] {
        return item.type === "species";
    }

    override async updateItem(source: ItemPTR2e["_source"]): Promise<void> {
        // Only update species
        if(!this.isSpeciesItem(source)) return;

        if (this.abilitiesMap === null) {
            const coreAbilities = (await game.packs
                .get("ptr2e.core-abilities")!
                .getDocuments()) as AbilityPTR2e[];
            this.abilitiesMap = new Map(
                coreAbilities.map((ability) => [ability.system.slug, { slug: ability.system.slug, uuid: ability.uuid }])
            );
        }

        // convert slugs to {slug,uuid}
        const abilities = source.system.abilities;
        for (const category of Object.keys(abilities)) {
            abilities[category] = Object.values(abilities[category] as []).map(({slug, uuid})=>{
                if (uuid) {
                    return { slug, uuid }
                };
                if (!(this.abilitiesMap?.has(slug) ?? false)) {
                    return { slug, uuid };
                }
                return foundry.utils.deepClone(this.abilitiesMap!.get(slug));
            });
        }

        // Update item
        source.system.abilities = abilities
    }
}