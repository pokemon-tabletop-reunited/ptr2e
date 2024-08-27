import FolderPTR2e from "@module/folder/document.ts";
import { PTRHook } from "./data.ts";

export const Sockets: PTRHook = {
  listen: () => {
    Hooks.once("ready", () => {
      game.socket.on("system.ptr2e", handleSocketRequest);
    });
  }
}

export interface SocketRequestData {
  request: "folderCreateOrUpdate" | "acknowledge" | "acknowledgeFailure";
  data: Record<string, unknown>;
  message?: string;
  id: string;
  documentId?: string;
  documentType?: string;
}

async function handleSocketRequest(data: SocketRequestData): Promise<void> {
  if (typeof data !== 'object' || !('request' in data)) return;
  console.log(data);
  if (game.user !== game.users.activeGM) return;

  switch (data.request) {
    case "folderCreateOrUpdate": {
      if(!game.settings.get("ptr2e", "player-folder-create-permission")) return void game.socket.emit("system.ptr2e", { id: data.id, request: "acknowledgeFailure", message: "Player folder creation is disabled. Please ask your GM to enable it in settings." });
      const folderData = data.data as { name?: string, _id?: string, source?: Folder['_source'], pack?: string } & Record<string, unknown>;

      if (!folderData.name?.trim()) folderData.name = Folder.defaultName();
      if (folderData._id) {
        const folder = game.folders.get(folderData._id)
        if (folder) {
          delete folderData._id;
          await folder.update(folderData);
          return void game.socket.emit("system.ptr2e", { id: data.id, request: "acknowledge", message: `Folder ${folder.name} updated!`, documentId: folder.id, documentType: "Folder" });
        }
      }
      else {
        if (folderData.source) {
          const folder = await FolderPTR2e.create(folderData.source, { pack: folderData.pack });
          return void game.socket.emit("system.ptr2e", { id: data.id, request: "acknowledge", message: `Folder ${folderData.source.name} created!`, documentId: folder?.id, documentType: "Folder" });
        }
      }
      return void game.socket.emit("system.ptr2e", { id: data.id, request: "acknowledgeFailure", message: "An issue occured while trying to create your folder." });
    }
  }
}