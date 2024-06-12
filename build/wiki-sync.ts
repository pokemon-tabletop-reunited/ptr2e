import fs from "fs";
import path from "path";
import url from "url";
import { JournalConverter, Page, randomID } from "./lib/convert-journal.ts";
import { CompendiumPack } from "./lib/compendium-pack.ts";

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

function foundryJsonToWikiPages() {
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

foundryJsonToWikiPages();