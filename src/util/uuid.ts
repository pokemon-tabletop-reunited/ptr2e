import * as R from "remeda";

class UUIDUtils {
  static async fromUUIDs(
    uuids: string[]
  ): Promise<foundry.abstract.Document.Any[]> {

    // For any UUIDs which are embedded within a compendium pack, batch retrieve all such documents.
    const packs = new Map();
    for (const uuid of uuids) {
      const { collection, documentId } = foundry.utils.parseUuid(uuid);
      if (!collection || !(collection instanceof CompendiumCollection)) continue;
      if (collection.has(documentId!)) continue;
      if (!packs.has(collection)) packs.set(collection, []);
      packs.get(collection).push(documentId);
    }
    for (const [pack, ids] of packs.entries()) {
      await pack.getDocuments({ _id__in: ids });
    }

    // Retrieve all remaining documents
    return R.filter(await Promise.all(uuids.map(uuid => fromUuid(uuid))), R.isTruthy);
  }

  static isItemUUID(uuid: unknown): uuid is ItemUUID {
    try {
      return typeof uuid === "string" && foundry.utils.parseUuid(uuid).type === "Item";
    } catch {
      return false;
    }
  }

  static isActionUUID(uuid: unknown): uuid is ActionUUID {
    try { //@ts-expect-error - Actions is a custom added type.
      return typeof uuid === "string" && foundry.utils.parseUuid(uuid).type === "Actions";
    } catch {
      return false;
    }
  }

  static isCompendiumUUID(uuid: unknown): uuid is CompendiumUUID {
    try {
      return typeof uuid === "string" && foundry.utils.parseUuid(uuid).collection instanceof CompendiumCollection;
    }
    catch {
      return false;
    }
  }

  static isTokenUUID(uuid: unknown): uuid is TokenDocumentUUID {
    try {
      if (typeof uuid !== "string") return false;
      const parsed = foundry.utils.parseUuid(uuid);
      return parsed.documentType === "Scene" && parsed.embedded[0] === "Token";
    } catch {
      return false;
    }
  }
}

type EmbeddedActionUUID = `Actions.${string}`;
type ActionUUID = `${EmbeddedItemUUID}.${EmbeddedActionUUID}` | `Item.${string}.${EmbeddedActionUUID}` | `${CompendiumItemUUID}.${EmbeddedActionUUID}`;

export { UUIDUtils, type ActionUUID };