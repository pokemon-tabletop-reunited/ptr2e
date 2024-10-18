import { ActorSheetPTR2e } from "@actor";
import { ItemPTR2e } from "@item";
import { BlueprintSystemModel } from "@item/data/index.ts";
import { BlueprintSheetPTR2e } from "@item/sheets/index.ts";

export const DropCanvasData = {
  listen() {
    Hooks.on("dropCanvasData", async (canvas, drop) => {
      if (drop.type === "Item") {
        const item = await fromUuid<ItemPTR2e>(drop.uuid);
        if (item?.type === "species") {
          const folder = await (async () => {
            const folder = game.actors.folders.getName(game.scenes.current!.name);
            if (folder) return folder;
            return await Folder.create({
              name: game.scenes.current!.name,
              type: "Actor"
            });
          })()

          const blueprint = await ItemPTR2e.create<ItemPTR2e<BlueprintSystemModel, null>>(
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

          //@ts-expect-error - This is a valid document.
          return void new BlueprintSheetPTR2e({ document: blueprint, generation: {
            x, y, canvas, temporary: true
          } }).render(true);
        }
        if(item?.type === "blueprint") {
          const blueprint = item as ItemPTR2e<BlueprintSystemModel, null>;
          if(!blueprint || !canvas.scene) return;

          const x = Math.floor(drop.x / canvas.scene.grid.size) * canvas.scene.grid.size
          const y = Math.floor(drop.y / canvas.scene.grid.size) * canvas.scene.grid.size

          //@ts-expect-error - This is a valid document.
          return void new BlueprintSheetPTR2e({ document: blueprint, generation: {
            x, y, canvas, temporary: false
          } }).render(true);
        }
      }
    });

    // Handle dropping items onto tokens
    Hooks.on("dropCanvasData", (_canvas, data) => {
      const dropTarget = [...canvas.tokens.placeables]
        .sort((a, b) => b.document.sort - a.document.sort)
        .find((token) => {
          const maximumX = token.x + (token.hitArea?.right ?? 0);
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