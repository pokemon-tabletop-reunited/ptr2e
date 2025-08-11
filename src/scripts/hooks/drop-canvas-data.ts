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

          const blueprint = new ItemPTR2e(
            {
              name: item.name,
              type: "blueprint",
              folder: folder?.id,
              system: {
                blueprints: [{
                  species: item.uuid,
                }]
              },
              ownership: {default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER}
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
      const rect = new PIXI.Rectangle(data.x, data.y, 0, 0);
      const dropTarget = Array.from(canvas.tokens.quadtree.getObjects(rect, {collisionTest: o => o.t.hitArea.contains(data.x - o.t.x, data.y - o.t.y)})).at(0);

      const actor = dropTarget?.actor;
      if (actor && ["Affliction", "Item", "ActiveEffect"].includes(data.type!)) {
        (actor.sheet as unknown as ActorSheetPTR2e).emulateItemDrop(data);
        return false; // Prevent modules from doing anything further
      }

      return true;
    });
  }
}