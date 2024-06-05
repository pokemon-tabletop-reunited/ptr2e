import { ItemPTR2e, PerkPTR2e } from "@item";
import { PerkSystemModel } from "@item/data/index.ts";

class PerkManager {

    private packs: string[] = ["ptr2e.core-perks"];
    readonly perks: Map<string, PerkPTR2e> = new Map();

    get(key: string) {
        if(!this.initialized) return null;
        return this.perks.get(key);
    }

    get initialized() {
        return this.perks.size > 0;
    }

    async initialize() {
        if(this.initialized) return this;

        for await (const perkSet of this.loadPerks()) {
            for (const perk of perkSet) {
                if (this.isValidPerk(perk)) {
                    this.perks.set(perk.slug!, perk);
                }
            }
        }
        return this;
    }

    async reset() {
        this.perks.clear();
        await this.initialize();
        return this;
    }

    isValidPerk(perk: unknown): perk is ItemPTR2e<PerkSystemModel, null> {
        return (
            typeof perk === "object"
            && perk !== null
            && "type" in perk
            && perk.type === "perk"
        )
    }

    async *loadPerks() {
        for (const packId of this.packs) {
            const pack = game.packs.get(packId);
            if (pack) {
                yield await pack.getDocuments();
            }
        }
        const items = [];
        for (const item of game.items) {
            if (this.isValidPerk(item)) {
                items.push(item);
            }
        }
        yield items;
    }
}

export { PerkManager }