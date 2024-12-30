import type { ActorSheetPTR2e } from "@actor";
import { ItemPTR2e, type BlueprintPTR2e } from "@item";
import { BlueprintSheetPTR2e } from "@item/sheets/index.ts";
import type { DropData } from "node_modules/fvtt-types/src/foundry/client/data/abstract/client-document.d.mts";

export const DropCanvasData = {
  listen() {
    Hooks.on("dropCanvasData", async (canvas, drop: DropData<Item.ConfiguredClass>) => {
      if (drop.type === "Item") {
        const item = await fromUuid(drop.uuid) as ItemPTR2e | null;
        if (item?.type === "species") {
          const folder = await (async () => {
            const folder = game.actors.folders.getName(game.scenes.current!.name);
            if (folder) return folder;
            return await Folder.create({
              name: game.scenes.current!.name,
              type: "Actor"
            });
          })()

          const blueprint = await ItemPTR2e.create(
            {
              name: item.name,
              type: "blueprint",
              folder: folder?.id,
              system: {
                blueprints: [{
                  species: item.uuid,
                }]
              }
            },
            {
              temporary: true
            }
          );
          if(!blueprint || !canvas.scene) return;

          const x = Math.floor(drop.x / canvas.scene.grid.size) * canvas.scene.grid.size
          const y = Math.floor(drop.y / canvas.scene.grid.size) * canvas.scene.grid.size

          return void new BlueprintSheetPTR2e({ document: blueprint, generation: {
            x, y, canvas, temporary: true
          } }).render(true);
        }
        if(item?.type === "blueprint") {
          const blueprint = item as BlueprintPTR2e;
          if(!blueprint || !canvas.scene) return;

          const x = Math.floor(drop.x / canvas.scene.grid.size) * canvas.scene.grid.size
          const y = Math.floor(drop.y / canvas.scene.grid.size) * canvas.scene.grid.size

          return void new BlueprintSheetPTR2e({ document: blueprint, generation: {
            x, y, canvas, temporary: false
          } }).render(true);
        }
      }
    });

    // Handle dropping items onto tokens
    Hooks.on("dropCanvasData", (canvas, data) => {
      const dropTarget = [...canvas.tokens!.placeables]
        .sort((a, b) => b.document.sort - a.document.sort)
        .find((token) => {
          //@ts-expect-error - Error in PIXI typings
          const maximumX = token.x + (token.hitArea?.right ?? 0);
          //@ts-expect-error - Error in PIXI typings
          const maximumY = token.y + (token.hitArea?.bottom ?? 0);
          return data.x >= token.x && data.y >= token.y && data.x <= maximumX && data.y <= maximumY;
        });

      const actor = dropTarget?.actor;
      if (actor && ["Affliction", "Item", "ActiveEffect"].includes(data.type!)) {
        (actor.sheet as unknown as ActorSheetPTR2e).emulateItemDrop(data);
        return false; // Prevent modules from doing anything further
      }

      return true;
    });
  }
}