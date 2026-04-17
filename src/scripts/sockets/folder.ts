/* eslint-disable @typescript-eslint/consistent-type-definitions */
import FolderPTR2e from "@module/folder/document.ts";
import { PTR2eSocketDeniedError, PTR2eSocketInternalError } from "./errors.ts";

export async function handleFolderCreateOrUpdateRequest(data: FolderCreateOrUpdateArgs): Promise<FolderCreateOrUpdateResult> {
  console.log(data);
  if (!game.settings.get("ptr2e", "player-folder-create-permission")) throw new PTR2eSocketDeniedError("Player folder creation is disabled. Please ask your GM to enable it in settings.");
  const folderData = data

  if (!folderData.name?.trim()) folderData.name = Folder.defaultName();
  if (folderData._id) {
    const folder = game.folders.get(folderData._id)
    if (folder) {
      delete folderData._id;
      await folder.update(folderData);
      return { message: `Folder ${folder.name} updated!`, documentId: folder.id, documentType: "Folder" };
    }
  }
  else {
    if (folderData.source) {
      const folder = await FolderPTR2e.create(folderData.source, { pack: folderData.pack });
      return { message: `Folder ${folderData.source.name} created!`, documentId: folder?.id, documentType: "Folder" };
    }
  }
  throw new PTR2eSocketInternalError("An unknown issue occured while trying to create your folder.");
}

export type FolderCreateOrUpdateArgs = { name?: string, _id?: string, source?: Folder['_source'], pack?: string | null } & Record<string, unknown>
export type FolderCreateOrUpdateResult = { message: string, documentId: Maybe<string>, documentType: string };