import fs from "fs";
import path from "path";
import url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const packs = ["core-abilities", "core-gear", "core-moves", "core-effects", "core-perks", "core-species", "core-summons"];

for(const pack of packs) {
  const packsDataPath = path.resolve(__dirname, "../../packs/"+pack);

  for(const file of fs.readdirSync(packsDataPath)) {
    if(file.startsWith("_")) continue;
    const filePath = path.resolve(packsDataPath, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if(!data.system) throw new Error(`Missing system data in ${filePath}`);
    data.system.publication = {
      source: "PTR 2e Core",
      authors: ["PTR 2e Team"]
    }

    if(data.system.number) {
      const number = parseInt(data.system.number);
      switch(true) {
        case number > 0 && number <= 151: {
          data.system.publication.source = "PTR 2e Core - Kanto Dex";
          break;
        }
        case number > 151 && number <= 251: {
          data.system.publication.source = "PTR 2e Core - Johto Dex";
          break;
        }
        case number > 251 && number <= 386: {
          data.system.publication.source = "PTR 2e Core - Hoenn Dex";
          break;
        }
        case number > 386 && number <= 493: {
          data.system.publication.source = "PTR 2e Core - Sinnoh Dex";
          break;
        }
        case number > 493 && number <= 649: {
          data.system.publication.source = "PTR 2e Core - Unova Dex";
          break;
        }
        case number > 649 && number <= 721: {
          data.system.publication.source = "PTR 2e Core - Kalos Dex";
          break;
        }
        case number > 721 && number <= 809: {
          data.system.publication.source = "PTR 2e Core - Alola Dex";
          break;
        }
        case number > 809 && number <= 898: {
          data.system.publication.source = "PTR 2e Core - Galar Dex";
          break;
        }
        case number > 899 && number <= 905: {
          data.system.publication.source = "PTR 2e Core - Hisui Dex";
          break;
        }
        case number > 905 && number <= 1025: {
          data.system.publication.source = "PTR 2e Core - Paldea Dex";
          break;
        }
      }
      switch(data.system.form) {
        case "paldean": {
          data.system.publication.source = "PTR 2e Core - Paldea Dex";
          break;
        }
        case "galarian": {
          data.system.publication.source = "PTR 2e Core - Galar Dex";
          break;
        }
        case "alolan": {
          data.system.publication.source = "PTR 2e Core - Alola Dex";
          break;
        }
        case "hisuian": {
          data.system.publication.source = "PTR 2e Core - Hisui Dex";
          break
        }
        default: break;
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
}