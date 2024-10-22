import { sluggify } from "build/lib/helpers.ts";
import fs from "fs";
import path from "path";
import url from "url";

const map = new Map();

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const packsDataPath = path.resolve(__dirname, "../../packs/core-species");
const species = [];

for(const file of fs.readdirSync(packsDataPath)) {
  const filePath = path.resolve(packsDataPath, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const evolution = data.system?.evolutions;
  if(!evolution || !evolution.uuid) continue;

  map.set(sluggify(data.name), data._id)
  species.push({data, filePath});
}

for (const {data, filePath} of species) {
  const evoData = data.system.evolutions;
  const evolutionId = map.get(evoData.name);
  if(!evolutionId) {
    console.error(`Could not find evolution with name ${evoData.name} (${data.name})`);
    continue;
  }

  if(evoData.uuid.endsWith(evolutionId)) {
    continue;
  }

  evoData.uuid = `Compendium.ptr2e.core-species.Item.${evolutionId}`;

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}