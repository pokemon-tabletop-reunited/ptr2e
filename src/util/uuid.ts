import * as R from "remeda";

class UUIDUtils {
    static async fromUUIDs(
        uuids: string[]
    ): Promise<ClientDocument[]> {
        
        // For any UUIDs which are embedded within a compendium pack, batch retrieve all such documents.
        const packs = new Map();
        for (const uuid of uuids) {
            const { collection, documentId } = fu.parseUuid(uuid);
            if(!collection || !(collection instanceof CompendiumCollection)) continue;
            if (collection.has(documentId!)) continue;
            if (!packs.has(collection)) packs.set(collection, []);
            packs.get(collection).push(documentId);
        }
        for(const [pack, ids] of packs.entries()) {
            await pack.getDocuments({ _id__in: ids });
        }

        // Retrieve all remaining documents
        return R.filter(await Promise.all(uuids.map(uuid => fromUuid(uuid))), R.isTruthy);
    }

    static isItemUUID(uuid: unknown): uuid is ItemUUID {
        return typeof uuid === "string" && fu.parseUuid(uuid).documentType === "Item";
    }

    static isCompendiumUUID(uuid: unknown): uuid is CompendiumUUID {
        return typeof uuid === "string" && fu.parseUuid(uuid).collection instanceof CompendiumCollection;
    }

    static isTokenUUID(uuid: unknown): uuid is TokenDocumentUUID {
        if (typeof uuid !== "string") return false;
        const parsed = fu.parseUuid(uuid);
        return parsed.documentType === "Scene" && parsed.embedded[0] === "Token";
    }
}

export { UUIDUtils };
