import { ItemPTR2e } from "@item";
import { MigrationBase } from "../base.ts"
import { ActorPTR2e } from "@actor";
import AbilitySystem from "@item/data/ability.ts";

export class Migration103AbilitySlots extends MigrationBase {
    static override version = 0.103;

    _map: Map<string, number> | null = null;

    isAbilityItem(item: ItemPTR2e['_source']): item is ItemPTR2e<AbilitySystem>['_source'] {
        return item.type === "ability";
    }

    override async updateItem(source: ItemPTR2e["_source"], actorSource?: ActorPTR2e["_source"]): Promise<void> {
        // Only update items on actors
        if(!actorSource || !actorSource?.system?.advancement?.experience?.current) return;

        // Only update abilities
        if(!this.isAbilityItem(source)) return;

        // Skip free abilities
        if(source.system.free) return;

        // Calculate level for knowledge on how many slots the actor has
        const experience = Number(actorSource.system.advancement.experience.current);
        if(isNaN(experience) || experience < 0) return;

        const level = actorSource.type === "humanoid" 
            ? Math.max(1, Math.floor(Math.cbrt(((experience || 1) * 4) / 5)))
            : Math.max(1, Math.floor(Math.cbrt(((experience || 1) * 6) / 3)));

        // Initialize map if necessary
        if(!this._map) {
            this._map = new Map<string, number>();
        }

        const maxSlot = level >= 80 ? 4 : level >= 50 ? 3 : level >= 20 ? 2 : 1;
        const lastSlot = this._map.get(actorSource._id!) ?? 0;
        if(lastSlot >= maxSlot) return;

        // Update slot count
        this._map.set(actorSource._id!, lastSlot + 1);

        // Update item
        source.system.slot = lastSlot;
        source.system.free = false;
    }
}