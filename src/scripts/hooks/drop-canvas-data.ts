import { ActorPTR2e } from "@actor";
import { ItemPTR2e, SpeciesPTR2e } from "@item";

export const DropCanvasData = {
    listen() {
        Hooks.on("dropCanvasData", async (_canvas, drop) => {
            if(drop.type === "Item") {
                const item = await fromUuid<ItemPTR2e>(drop.uuid);
                if(item?.type === "species") {
                    const folder = await (async () => {
                        const folder = game.actors.folders.getName(game.scenes.current!.name);
                        if(folder) return folder;
                        return await Folder.create({
                            name: game.scenes.current!.name,
                            type: "Actor"
                        });
                    })()
                    
                    const actor = await ActorPTR2e.create({
                        name: item.name,
                        type: item.traits?.has("humanoid") ? "humanoid" : "pokemon",
                        folder: folder?.id,
                        system: {
                            species: (item as SpeciesPTR2e).toObject().system
                        }
                    })
                    if(!actor || !canvas.scene) return;

                    const x = Math.floor(drop.x / canvas.scene.grid.size) * canvas.scene.grid.size
                    const y = Math.floor(drop.y / canvas.scene.grid.size) * canvas.scene.grid.size

                    const tokenData = await actor.getTokenDocument({x,y});
                    //@ts-expect-error
                    await canvas.scene.createEmbeddedDocuments("Token", [tokenData]);
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
            if (actor && data.type === "Item") {
                actor.sheet.emulateItemDrop(data);
                return false; // Prevent modules from doing anything further
            }

            return true;
        });
    }
}