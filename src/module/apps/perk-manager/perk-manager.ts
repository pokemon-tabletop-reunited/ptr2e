import type { PerkPTR2e } from "@item";
//FIXME: Move this file elsewhere. It ain't an App.
class PerkManager {

  private packs: string[] = ["ptr2e.core-perks"];
  readonly perks = new Map<string, PerkPTR2e>();

  get(key: string) {
    if (!this.initialized) return null;
    return this.perks.get(key);
  }

  get initialized() {
    return this.perks.size > 0;
  }

  async initialize() {
    if (this.initialized) return this;

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

  isValidPerk(perk: unknown): perk is PerkPTR2e {
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
    yield items as PerkPTR2e[];
  }
}

export { PerkManager }