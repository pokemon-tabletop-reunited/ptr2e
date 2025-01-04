import { MigrationBase } from "../base.ts"
import type { AbilitySchema } from "@item/data/ability.ts";

export class Migration103AbilitySlots extends MigrationBase {
  static override version = 0.103;

  _map: Map<string, number> | null = null;

  isAbilityItem(item: PTR.Item.Source): item is Omit<PTR.Item.Source, 'system'> & { system: foundry.data.fields.SchemaField.PersistedType<AbilitySchema> } {
    return item.type === "ability";
  }

  override async updateItem(source: PTR.Item.Source, actorSource?: PTR.Actor.SourceWithSystem): Promise<void> {
    // Only update items on actors
    if (!actorSource || !actorSource?.system?.advancement?.experience?.current) return;

    // Only update abilities
    if (!this.isAbilityItem(source)) return;

    // Skip free abilities and abilities that are already slotted
    if (source.system.free || source.system.slot !== null) return;

    // Calculate level for knowledge on how many slots the actor has
    const experience = Number(actorSource.system.advancement.experience.current);
    if (isNaN(experience) || experience < 0) return;

    const level = actorSource.type === "humanoid"
      ? Math.max(1, Math.floor(Math.cbrt(((experience || 1) * 1) / 1)))
      : Math.max(1, Math.floor(Math.cbrt(((experience || 1) * 1) / 1)));

    // Initialize map if necessary
    if (!this._map) {
      this._map = new Map<string, number>();
    }

    const maxSlot = level >= 80 ? 4 : level >= 50 ? 3 : level >= 20 ? 2 : 1;
    const lastSlot = this._map.get(actorSource._id!) ?? 0;
    if (lastSlot >= maxSlot) return;

    // Update slot count
    this._map.set(actorSource._id!, lastSlot + 1);

    // Update item
    source.system.slot = lastSlot;
    source.system.free = false;
  }
}