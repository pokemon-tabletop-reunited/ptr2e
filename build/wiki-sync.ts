import fs from "fs";
import path from "path";
import url from "url";
import { JournalConverter, Page, randomID } from "./lib/convert-journal.ts";
import { CompendiumPack } from "./lib/compendium-pack.ts";
import { 
    abilityToMarkdown,
    consumableToMarkdown,
    effectToMarkdown,
    gearToMarkdown,
    equipmentToMarkdown,
    moveToMarkdown,
    perkToMarkdown,
    speciesToMarkdown,
    weaponToMarkdown
 } from "./lib/convert-item.ts";

export function WikiFilesToJournalEntry(_asJson: boolean = false) {
    const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
    const wikiDataPath = path.resolve(__dirname, "./ptr2e-wiki");
    const wikiDirPaths = fs.readdirSync(wikiDataPath).map((dirName) => path.resolve(__dirname, wikiDataPath, dirName));

    const allFilePaths = [];

    function getMdFilesFromDir(dirPath: string): string[] {
        const files = fs.readdirSync(dirPath);
        const mdFiles = files
            .filter((f) => f.endsWith(".md"))
            .map((f) => path.join(dirPath, f)); // prepend the directory path
        const subDirs = files.filter((f) => fs.statSync(path.join(dirPath, f)).isDirectory());
        for(const subDir of subDirs) {
            mdFiles.push(...getMdFilesFromDir(path.join(dirPath, subDir)));
        }
        return mdFiles;
    }

    for(const path of wikiDirPaths) {
        if(path.includes(".git") || path.includes("README.MD")) continue;
        if(fs.statSync(path).isDirectory()) {
            allFilePaths.push(...getMdFilesFromDir(path));
        } else if(path.endsWith(".md")) {
            allFilePaths.push(path);
        }
    }

    const journalEntries = [];
    for(const journalData of JournalConverter.pathsToJournalRoots(allFilePaths)) {
        journalEntries.push({
            _id: randomID(),
            name: journalData.root.title,
            pages: journalData.entries
        });
    }

    // Save temp file
    fs.writeFileSync(path.resolve(__dirname, "journal-entries.json"), JSON.stringify(journalEntries, null, 2));

    // const pack = new CompendiumPack("core-rules", journalEntries, []);
    // return pack.save(_asJson);
}

function foundryRulesJsonToWikiPages() {
    const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
    const packDataPath = path.resolve(__dirname, `../packs/core-rules`);
    const pack = CompendiumPack.loadJSON(packDataPath);

    for(const journalEntry of pack.data) {
        const journalData = JournalConverter.fromEntry(journalEntry as any);

        function writePage(page: Page) {
            const filePath = path.resolve(__dirname, `../ptr2e-wiki/${page.path}`);
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, page.wikiContent);

            for(const subPage of page.pages.values()) {
                writePage(subPage);
            }
        }

        // Create files at their path location
        for(const page of journalData.pages.values()) {
            writePage(page);
        }
    }
}

function foundryItemJsonToWikiPages() {
    const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
    const packsDataPath = path.resolve(__dirname, "../packs");
    const packDirPaths = fs.readdirSync(packsDataPath).map((dirName) => path.resolve(__dirname, packsDataPath, dirName));

    // Loads all packs into memory for the sake of making all document name/id mappings available
    const packs = packDirPaths.map((p) => CompendiumPack.loadJSON(p));

    for(const pack of packs) {
        for(const itemJson of pack.data as SourceFromSchema<foundry.documents.ItemSchema>[]) {
            const item = (() => {
                switch(itemJson.type) {
                    case "ability":
                        return abilityToMarkdown(itemJson);
                    case "consumable":
                        return consumableToMarkdown(itemJson);
                    case "effect":
                        return effectToMarkdown(itemJson);
                    case "equipment":
                        return equipmentToMarkdown(itemJson);
                    case "gear":
                        return gearToMarkdown(itemJson);
                    case "move":
                        return moveToMarkdown(itemJson);
                    case "perk":
                        return perkToMarkdown(itemJson);
                    case "species":
                        return speciesToMarkdown(itemJson);
                    case "weapon":
                        return weaponToMarkdown(itemJson);
                }
                return null;
            })();
            if(!item) continue;

            const page = `---\n${Object.entries(item.metadata)
                .filter(([key]) => key !== "slug" && key !== "parent")
                .map(([key, value]) => `${key}: ${value}`)
                .join("\n")}\n---\n\n# ${item.metadata.title}\n${item.markdown}`;

            const filePath = path.resolve(__dirname, `../ptr2e-wiki/${item.path}`);
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, page);
        }
    }
}

foundryItemJsonToWikiPages();
foundryRulesJsonToWikiPages();