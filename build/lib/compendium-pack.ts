import fs from "fs";
import path from "path";
import { getFilesRecursively, isObject, PackError, sluggify } from "./helpers.ts";
import { DBFolder, LevelDatabase } from "./level-database.ts";
import { PackEntry } from "./types.ts";
import coreIconsJSON from "../core-icons.json" assert { type: "json" };
import { ItemSchema } from "types/foundry/common/documents/item.js";

type ActorSourcePTR2e = Actor["_source"];
type ItemSourcePTR2e = Item["_source"];

interface PackMetadata {
    system: string;
    name: string;
    path: string;
    type: CompendiumDocumentType;
}

function isActorSource(docSource: PackEntry): docSource is ActorSourcePTR2e {
    return (
        "system" in docSource && isObject(docSource.system) && "items" in docSource && Array.isArray(docSource.items)
    );
}

function isItemSource(docSource: PackEntry): docSource is ItemSourcePTR2e {
    return (
        "system" in docSource &&
        "type" in docSource &&
        isObject(docSource.system) &&
        !("text" in docSource) && // JournalEntryPage
        !isActorSource(docSource)
    );
}

/**
 * This is used to check paths to core icons to ensure correctness. The JSON file will need to be periodically refreshed
 *  as upstream adds more icons.
 */
const coreIcons = new Set(coreIconsJSON);

class CompendiumPack {
    packId: string;
    packDir: string;
    documentType: CompendiumDocumentType;
    systemId: string;
    data: PackEntry[];
    folders: DBFolder[];

    static outDir = path.resolve(process.cwd(), "dist/packs");
    static #namesToIds: {
        [K in Extract<CompendiumDocumentType, "Actor" | "Item" | "JournalEntry" | "Macro" | "RollTable">]: Map<
            string,
            Map<string, string>
        >;
    } & Record<string, Map<string, Map<string, string>> | undefined> = {
            Actor: new Map(),
            Item: new Map(),
            JournalEntry: new Map(),
            Macro: new Map(),
            RollTable: new Map(),
        };

    static #packsMetadata = JSON.parse(fs.readFileSync("static/system.json", "utf-8")).packs as PackMetadata[];

    static LINK_PATTERNS = {
        world: /@(?:Item|JournalEntry|Actor)\[[^\]]+\]|@Compendium\[world\.[^\]]{16}\]|@UUID\[(?:Item|JournalEntry|Actor)/g,
        compendium:
            /@Compendium\[ptr2e\.(?<packName>[^.]+)\.(?<docType>Actor|JournalEntry|Item|Macro|RollTable)\.(?<docName>[^\]]+)\]\{?/g,
        uuid: /@UUID\[Compendium\.ptr2e\.(?<packName>[^.]+)\.(?<docType>Actor|JournalEntry|Item|Macro|RollTable)\.(?<docName>[^\]]+)\]\{?/g,
    };

    constructor(packDir: string, parsedData: unknown[], parsedFolders: unknown[]) {
        const metadata = CompendiumPack.#packsMetadata.find(
            (pack) => path.basename(pack.path) === path.basename(packDir),
        );
        if (metadata === undefined) {
            throw PackError(`Compendium at ${packDir} has no metadata in the local system.json file.`);
        }
        this.systemId = metadata.system;
        this.packId = metadata.name;
        this.documentType = metadata.type;

        if (!this.#isFoldersData(parsedFolders)) {
            throw PackError(`Folder data supplied for ${this.packId} does not resemble folder source data.`);
        }
        this.folders = parsedFolders;

        if (!this.#isPackData(parsedData)) {
            throw PackError(`Data supplied for ${this.packId} does not resemble Foundry document source data.`);
        }

        this.packDir = packDir;

        CompendiumPack.#namesToIds[this.documentType]?.set(this.packId, new Map());
        const packMap = CompendiumPack.#namesToIds[this.documentType]?.get(this.packId);
        if (!packMap) {
            throw PackError(`Compendium ${this.packId} (${packDir}) was not found.`);
        }

        parsedData.sort((a, b) => {
            if (a._id === b._id) {
                throw PackError(`_id collision in ${this.packId}: ${a._id}`);
            }
            return a._id?.localeCompare(b._id ?? "") ?? 0;
        });

        this.data = parsedData;

        for (const docSource of this.data) {
            // Populate CompendiumPack.namesToIds for later conversion of compendium links
            packMap.set(docSource.name, docSource._id ?? "");

            // Check img paths
            if ("img" in docSource && typeof docSource.img === "string") {
                const imgPaths = [
                    docSource.img,
                    isActorSource(docSource)
                        ? docSource.items.flatMap((i) => [i.img])
                        : [],
                ].flat();
                const documentName = docSource.name;
                for (const imgPath of imgPaths) {
                    if (imgPath.startsWith("data:image")) {
                        const imgData = imgPath.slice(0, 64);
                        const msg = `${documentName} (${this.packId}) has base64-encoded image data: ${imgData}...`;
                        throw PackError(msg);
                    }

                    const isCoreIconPath = coreIcons.has(imgPath) || imgPath.includes("systems/ptr2e/img/item-icons/")
                    const repoImgPath = path.resolve(
                        process.cwd(),
                        "static",
                        decodeURIComponent(imgPath).replace("systems/ptr2e/", ""),
                    );
                    if (!isCoreIconPath && !fs.existsSync(repoImgPath)) {
                        throw PackError(`${documentName} (${this.packId}) has an unknown image path: ${imgPath}`);
                    }
                    if (!((imgPath as string) === "" || imgPath.match(/\.(?:svg|webp|png)$/))) {
                        throw PackError(`${documentName} (${this.packId}) references a non-WEBP/SVG/PNG image: ${imgPath}`);
                    }
                }
            }

            if ("type" in docSource) {
                if (docSource.type === "script") {
                    // Default macro ownership to 1
                    docSource.ownership ??= { default: 1 };
                }
            }
        }
    }

    static loadJSON(dirPath: string): CompendiumPack {
        const filePaths = getFilesRecursively(dirPath);
        const parsedData = filePaths.flatMap((path) => this.loadJSONObjects(path, dirPath));

        const folders = ((): DBFolder[] => {
            const foldersFile = path.resolve(dirPath, "_folders.json");
            if (fs.existsSync(foldersFile)) {
                const jsonString = fs.readFileSync(foldersFile, "utf-8");
                const foldersSource: DBFolder[] = (() => {
                    try {
                        return JSON.parse(jsonString);
                    } catch (error) {
                        if (error instanceof Error) {
                            throw PackError(`File ${foldersFile} could not be parsed: ${error.message}`);
                        }
                    }
                })();

                return foldersSource;
            }
            return [];
        })();

        const dbFilename = path.basename(dirPath);
        return new CompendiumPack(dbFilename, parsedData, folders);
    }

    static loadJSONObjects(filePath: string, dirPath: string): PackEntry[] {
        const jsonString = fs.readFileSync(filePath, "utf-8");
        const packSource: PackEntry | PackEntry[] = (() => {
            try {
                return JSON.parse(jsonString);
            } catch (error) {
                if (error instanceof Error) {
                    throw PackError(`File ${filePath} could not be parsed: ${error.message}`);
                }
            }
        })();

        // If the json is an array, write all documents to individual files, delete the original file, and then parse the individual files.
        if (Array.isArray(packSource)) {
            for (const doc of packSource) {
                const documentName = doc?.name;
                if (documentName === undefined) {
                    throw PackError(`Document contained in ${filePath} has no name.`);
                }

                const filenameForm = sluggify(documentName).concat(".json");
                const outPath = path.resolve(dirPath, filenameForm);
                if (fs.existsSync(outPath)) {
                    console.warn(`File ${outPath} already exists and will be overwritten.`);
                }
                fs.writeFileSync(outPath, JSON.stringify(doc, null, '\t'));
            }
            fs.rmSync(filePath, { force: true });

            const filePaths = getFilesRecursively(dirPath);
            return filePaths.flatMap((path) => this.loadJSONObjects(path, dirPath));
        }

        const documentName = packSource?.name;
        if (documentName === undefined) {
            throw PackError(`Document contained in ${filePath} has no name.`);
        }

        const filenameForm = (documentName.startsWith("-") ? "-" : "") + sluggify(documentName).concat(".json");
        if (path.basename(filePath) !== filenameForm) {
            throw PackError(`Filename at ${filePath} does not reflect document name (should be ${filenameForm}).`);
        }


        return [packSource];
    }

    finalizeAll(): PackEntry[] {
        const results = this.data.map((d) => JSON.parse(this.#finalize(d)));
        if(this.packId !== "core-effects") return results;
        
        // Add core status afflictions
        const statusAfflictions = JSON.parse(fs.readFileSync("src/scripts/config/effects.json", "utf-8")) as StatusEffect[];
        const translations = JSON.parse(fs.readFileSync("static/lang/en.json", "utf-8"));
        const localize = (path: string, current: Record<string, unknown> = translations): string => { 
          const result = (() => {
            const parts = path.split(".");
            const key = parts.shift()!;

            const value = current[key];
            if(parts.length === 0) return value as string;
            else if (value) return localize(parts.join("."), value as Record<string, unknown>);
            return value as string;
          })();
          if(!result) throw PackError(`Failed to localize ${path}`);
          return result;
        }

        results.push(...statusAfflictions.map((d) => {
          const name = localize(d.name);
          const itemSource = {
            name: name || "Unnamed Effect",
            type: "effect",
            img: d.img,
            system: {},
            effects: [
              {
                ...d,
                name: name || "Unnamed Effect",
                ...(d.description ? {description: localize(d.description)} : {}),
              }
            ],
            folder: "V4skAU6G3OH5fXgD",
          } as Partial<SourceFromSchema<ItemSchema>>;
          if(d._id) itemSource._id = itemSource.effects![0]._id = d._id.substring(0, 12)+"item";
          if(!itemSource._id) {
            itemSource.effects![0]._id = (() => {
              if(!d.id) throw PackError("Effect has no id");
              let id = d.id.replace('-', '');
              id = id.length > 16 ? id.substring(0, 16) : id;
              let i = 0;
              while(id.length < 16) {
                id = id+"condition0000000"[i++];
              }
              return id;
            })();
            itemSource._id = itemSource.effects![0]._id.substring(0, 12)+"item";
          }
          itemSource.flags = {core: {sourceId: this.#sourceIdOf(itemSource._id ?? "", {docType: "Item"})}};
          if(!isItemSource(itemSource as SourceFromSchema<ItemSchema>)) throw PackError("Failed to create item source");
          return JSON.parse(this.#finalize(itemSource as SourceFromSchema<ItemSchema>));
        }));

        return results;
    }

    #finalize(docSource: PackEntry): string {
        // Replace all compendium documents linked by name to links by ID
        const stringified = JSON.stringify(docSource);
        const worldItemLink = CompendiumPack.LINK_PATTERNS.world.exec(stringified);
        if (worldItemLink !== null) {
            throw PackError(`${docSource.name} (${this.packId}) has a link to a world item: ${worldItemLink[0]}`);
        }

        docSource.flags ??= {};
        if (isActorSource(docSource)) {
            docSource.flags.core = { sourceId: this.#sourceIdOf(docSource._id ?? "", { docType: "Actor" }) };
        }

        if (isItemSource(docSource)) {
            docSource.flags.core = { sourceId: this.#sourceIdOf(docSource._id ?? "", { docType: "Item" }) };
            //@ts-expect-error - Slug exists on all documents
            docSource.system.slug ??= sluggify(docSource.name);
        }

        const replace = (match: string, packId: string, docType: string, docName: string): string => {
            if (match.includes("JournalEntryPage")) return match;

            const namesToIds = CompendiumPack.#namesToIds[docType]?.get(packId);
            const link = match.replace(/\{$/, "");
            if (namesToIds === undefined) {
                throw PackError(`${docSource.name} (${this.packId}) has a bad pack reference: ${link}`);
            }

            const documentId: string | undefined = namesToIds.get(docName);
            if (documentId === undefined) {
                throw PackError(`${docSource.name} (${this.packId}) has broken link to ${docName}: ${match}`);
            }
            const sourceId = this.#sourceIdOf(documentId, { packId, docType });
            const labelBraceOrFullLabel = match.endsWith("{") ? "{" : `{${docName}}`;

            return `@UUID[${sourceId}]${labelBraceOrFullLabel}`;
        };

        return JSON.stringify(docSource)
            .replace(CompendiumPack.LINK_PATTERNS.uuid, replace)
            .replace(CompendiumPack.LINK_PATTERNS.compendium, replace);
    }

    #sourceIdOf(documentId: string, { packId, docType }: { packId?: string; docType: "Actor" }): CompendiumActorUUID;
    #sourceIdOf(documentId: string, { packId, docType }: { packId?: string; docType: "Item" }): CompendiumItemUUID;
    #sourceIdOf(documentId: string, { packId, docType }: { packId?: string; docType: string }): string;
    #sourceIdOf(documentId: string, { packId = this.packId, docType }: { packId?: string; docType: string }): string {
        return `Compendium.${this.systemId}.${packId}.${docType}.${documentId}`;
    }

    async save(asJson?: boolean): Promise<number> {
        if (asJson) {
            return this.saveAsJSON();
        }
        if (!fs.lstatSync(CompendiumPack.outDir, { throwIfNoEntry: false })?.isDirectory()) {
            fs.mkdirSync(CompendiumPack.outDir);
        }
        const packDir = path.join(CompendiumPack.outDir, this.packDir);

        // If the old folder is not removed the new data will be inserted into the existing db
        const stats = fs.lstatSync(packDir, { throwIfNoEntry: false });
        if (stats?.isDirectory()) {
            fs.rmSync(packDir, { recursive: true });
        }

        const db = new LevelDatabase(packDir, { packName: path.basename(packDir) });
        await db.createPack(this.finalizeAll(), this.folders);
        console.log(`Pack "${this.packId}" with ${this.data.length} entries built successfully.`);

        return this.data.length;
    }

    static saveAsJSONMap = new Map<string, object>();

    async saveAsJSON(): Promise<number> {
        const outDir = path.resolve(process.cwd(), "json-assets/packs");
        if (!fs.lstatSync(outDir, { throwIfNoEntry: false })?.isDirectory()) {
            fs.mkdirSync(outDir, { recursive: true });
        }

        const filePath = path.resolve(outDir, this.packDir);
        const outFile = filePath.concat(".json");
        if (fs.existsSync(outFile)) {
            fs.rmSync(outFile, { force: true });
        }
        const data = this.finalizeAll();
        fs.writeFileSync(outFile, JSON.stringify(data));
        if(this.packId !== "core-rules") CompendiumPack.saveAsJSONMap.set(this.packId, data);

        // Save folders if available
        if (this.folders.length > 0) {
            const folderFile = filePath.concat("_folders.json");
            if (fs.existsSync(folderFile)) {
                fs.rmSync(folderFile, { force: true });
            }
            fs.writeFileSync(folderFile, JSON.stringify(this.folders));
        }
        console.log(`File "${this.packDir}.json" with ${this.data.length} entries created successfully.`);

        return this.data.length;
    }

    static saveAsJSON() {
      if(this.saveAsJSONMap.size === 0) return false;
      const outDir = path.resolve(process.cwd(), "json-assets/packs");
      if (!fs.lstatSync(outDir, { throwIfNoEntry: false })?.isDirectory()) {
          fs.mkdirSync(outDir, { recursive: true });
      }

      const filePath = path.resolve(outDir, "data.json");
      if (fs.existsSync(filePath)) {
          fs.rmSync(filePath, { force: true });
      }

      const data = Array.from(this.saveAsJSONMap.entries()).reduce((acc, [packId, packData]) => {
        acc[packId] = packData;
        return acc;
      }, {} as Record<string, object>);
      fs.writeFileSync(filePath, JSON.stringify(data));

      return true;
    }

    #isDocumentSource(maybeDocSource: unknown): maybeDocSource is PackEntry {
        if (!isObject(maybeDocSource)) return false;
        const checks = Object.entries({
            name: (data: { name?: unknown }) => typeof data.name === "string",
        });

        const failedChecks = checks
            .map(([key, check]) => (check(maybeDocSource as { name?: unknown }) ? null : key))
            .filter((key) => key !== null);

        if (failedChecks.length > 0) {
            throw PackError(
                `Document source in (${this.packId}) has invalid or missing keys: ${failedChecks.join(", ")}`,
            );
        }

        return true;
    }

    #isPackData(packData: unknown[]): packData is PackEntry[] {
        return packData.every((maybeDocSource: unknown) => this.#isDocumentSource(maybeDocSource));
    }

    #isFolderSource(maybeFolderSource: unknown): maybeFolderSource is DBFolder {
        return isObject(maybeFolderSource) && "_id" in maybeFolderSource && "folder" in maybeFolderSource;
    }

    #isFoldersData(folderData: unknown[]): folderData is DBFolder[] {
        return folderData.every((maybeFolderData) => this.#isFolderSource(maybeFolderData as DBFolder));
    }
}

export { CompendiumPack, isActorSource, isItemSource, PackError };
export type { PackMetadata, ItemSourcePTR2e };
