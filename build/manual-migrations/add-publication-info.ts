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

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
}