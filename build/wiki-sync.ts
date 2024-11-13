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
  weaponToMarkdown,
  getMarkdownPath,
  getCategory,
  tutorListToMarkdown
} from "./lib/convert-item.ts";

export function WikiFilesToJournalEntry() {
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
    for (const subDir of subDirs) {
      mdFiles.push(...getMdFilesFromDir(path.join(dirPath, subDir)));
    }
    return mdFiles;
  }

  for (const path of wikiDirPaths) {
    if (path.includes(".git") || path.includes("README.MD")) continue;
    if (fs.statSync(path).isDirectory()) {
      allFilePaths.push(...getMdFilesFromDir(path));
    } else if (path.endsWith(".md")) {
      allFilePaths.push(path);
    }
  }

  const journalEntries = [];
  for (const journalData of JournalConverter.pathsToJournalRoots(allFilePaths)) {
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

  for (const journalEntry of pack.data) {
    //@ts-expect-error - Correct Type
    const journalData = JournalConverter.fromEntry(journalEntry);

    function writePage(page: Page) {
      const filePath = path.resolve(__dirname, `../ptr2e-wiki/${page.path}`);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, page.wikiContent);

      for (const subPage of page.pages.values()) {
        writePage(subPage);
      }
    }

    // Create files at their path location
    for (const page of journalData.pages.values()) {
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

  for (const pack of packs) {
    for (const itemJson of pack.data as SourceFromSchema<foundry.documents.ItemSchema>[]) {
      const item = (() => {
        switch (itemJson.type) {
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
      if (!item) continue;

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

function foundryTraitsJsonToWikiPages() {
  const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
  const traitsDataPath = path.resolve(__dirname, `../static/traits.json`);
  const traitsData = JSON.parse(fs.readFileSync(traitsDataPath, "utf-8"));

  for (const traitData of traitsData) {
    const related = traitData.related.map((t: string) => `- [[${t}]](/${getMarkdownPath({
      type: "traits",
      category: getCategory(t),
      title: t,
      extension: false,
    })})`).join(", ");
    const page = `---\ntitle: ${traitData.label}\ndescription: An auto-generated markdown file for the ${traitData.label} trait.\npublished: true\neditor: markdown\ntags: trait\n---\n\n# ${traitData.label}\n${traitData.description}${related ? `\n\n## Related Traits\n${related}` : ""}`;

    const filePath = path.resolve(__dirname, `../ptr2e-wiki/${getMarkdownPath({
      type: "traits",
      category: getCategory(traitData.slug),
      title: traitData.label,
    })}`);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, page);
  }
}

function foundryTutorListJsonToWikiPages() {
  const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
  const tutorListDataPath = path.resolve(__dirname, `../src/scripts/config/tutor-list.json`);
  const tutorListData = JSON.parse(fs.readFileSync(tutorListDataPath, "utf-8")) as {
    slug: string;
    type: string;
    moves: string[];
  }[]

  for (const tutorData of tutorListData) {
    const tutorMarkdownData = tutorListToMarkdown(tutorData);

    const page = `---\n${Object.entries(tutorMarkdownData.metadata)
      .filter(([key]) => key !== "slug" && key !== "parent")
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n")}\n---\n\n# ${tutorMarkdownData.metadata.title}\n${tutorMarkdownData.markdown}`;

    const filePath = path.resolve(__dirname, `../ptr2e-wiki/${tutorMarkdownData.path}`);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, page);
  }
}

foundryTraitsJsonToWikiPages();
foundryItemJsonToWikiPages();
foundryRulesJsonToWikiPages();
foundryTutorListJsonToWikiPages();