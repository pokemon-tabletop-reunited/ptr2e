import { MigrationBase } from "../base.ts"
import { HumanoidActorSystem } from "@actor";

export class Migration109SpeciesItems extends MigrationBase {
  static override version = 0.109;

  override requiresFlush = true;

  override async updateActor(source: PTR.Actor.SourceWithSystem): Promise<void> {
    if (source.items?.find(i => i._id === "actorspeciesitem")) return void console.log("PTR2E | Migration 109: Actor already has a species item.");
    if (!source?.system?.species) {
      if (source.type !== "humanoid") return void console.error(`PTR2E | Migration 109: Actor '${source.name}' (${source._id}) does not have a species system.`, source);

      // Create a base species system for humanoid actors
      const speciesItem = {
        name: source.name,
        type: 'species',
        img: source.img,
        _id: "actorspeciesitem",
        system: HumanoidActorSystem.constructSpecies(source.system, source.name).toObject()
      }

      // Add the species item to the actor
      source.items ??= []
      // @ts-expect-error - This is valid species item data
      source.items.push(speciesItem);
      // @ts-expect-error - This property is optional
      delete source.system.species;
      return;
    }

    // Migrate Actor species to Species Items
    const speciesSystem = source.system.species;

    // Create a new species item
    const speciesItem = {
      name: speciesSystem.slug ? Handlebars.helpers.formatSlug(speciesSystem.slug) : source.name,
      type: 'species',
      img: source.img,
      system: speciesSystem,
      _id: "actorspeciesitem"
    }

    // Add the species item to the actor
    source.items ??= []
    // @ts-expect-error - This is valid species item data
    source.items.push(speciesItem);
    // @ts-expect-error - This property is optional
    delete source.system.species;
  }
}