import { ItemPTR2e } from "@item";
import { PTRHook } from "./data.ts";

export const GearColor: PTRHook = {
  listen: () => {
    Hooks.on("renderSidebarTab", (_, html, context) => {
      const $html = $(html as HTMLElement);

      const getRarity = (item: ItemPTR2e) => {
        if (!["consumable", "container", "equipment", "gear", "weapon"].includes(item.type)) return null;
        return (item.system.rarity as "common" | "uncommon" | "rare" | "unique") || null;
      }

      const toIndex = new Set<string>();

      if (
        typeof context === 'object'
        && context
        && 'tree' in context
        && typeof context.tree === 'object'
        && context.tree
        && 'children' in context.tree
        && Array.isArray(context.tree.children)
        && 'entries' in context.tree
        && Array.isArray(context.tree.entries)
      ) {
        const entries = [
          ...context.tree.children.map(child => child.entries).flat(),
          ...context.tree.entries
        ] as (ClientDocument | CompendiumIndexData)[];

        for (const entry of entries) {
          if (entry instanceof ItemPTR2e) {
            const rarity = getRarity(entry);
            if (!rarity) continue;

            const $entry = $html.find(`[data-entry-id="${entry.id}"]`);
            if ($entry.length) {
              const $h4 = $entry.find('.entry-name');
              if ($h4.length) {
                $h4.addClass(`rarity-${rarity}`);
              }
            }
            continue;
          }
          if ('type' in entry) {
            if (!["consumable", "container", "equipment", "gear", "weapon"].includes(entry.type)) continue;
            // This compendium index entry was already loaded in memory
            if ('system' in entry) {
              const rarity = getRarity(entry as ItemPTR2e);
              if (!rarity) continue;

              const $entry = $html.find(`[data-entry-id="${entry.id}"]`);
              if ($entry.length) {
                const $h4 = $entry.find('.entry-name');
                if ($h4.length) {
                  $h4.addClass(`rarity-${rarity}`);
                }
              }
              continue;
            }

            // This compendium index entry was not loaded in memory, store it and grab the index of everything later.
            toIndex.add(entry._id);
          }
        }

        if (toIndex.size && 'collection' in context) {

          const collection = context.collection as CompendiumCollection;
          (async () => {
            const index = await collection.getIndex({ fields: ["system.rarity"] })

            for (const id of toIndex) {
              const entry = index.get(id);
              if (!entry) continue;

              const rarity = getRarity(entry as ItemPTR2e);
              if (!rarity) continue;

              const $entry = $html.find(`[data-entry-id="${entry._id}"]`);
              if ($entry.length) {
                const $h4 = $entry.find('.entry-name');
                if ($h4.length) {
                  $h4.addClass(`rarity-${rarity}`);
                }
              }
            }
          })();
        }
      }
    });
  }
}