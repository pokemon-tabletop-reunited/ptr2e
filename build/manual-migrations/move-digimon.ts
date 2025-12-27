import fs from "fs";
import path from "path";
import url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const speciesPacksDataPath = path.resolve(__dirname, "../../packs/core-species");
const newPath = path.resolve(__dirname, "../../packs/species");
for (const file of fs.readdirSync(speciesPacksDataPath)) {
  if (file.startsWith("_")) continue;
  const filePath = path.resolve(speciesPacksDataPath, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if(data.folder !== "rS3iGnYQKzTIxvUN") continue; // Only modify Digimon species
  if (!data.system) throw new Error(`Missing system data in ${filePath}`);

  delete data.folder;
  const newFilePath = path.resolve(newPath, file);
  fs.writeFileSync(newFilePath, JSON.stringify(data, null, 2));
  fs.rmSync(filePath);
}