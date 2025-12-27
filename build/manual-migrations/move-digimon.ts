import fs from "fs";
import path from "path";
import url from "url";

{
  const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
  const speciesPacksDataPath = path.resolve(__dirname, "../../packs/core-species");
  const newPath = path.resolve(__dirname, "../../packs/species");
  for (const file of fs.readdirSync(speciesPacksDataPath)) {
    if (file.startsWith("_")) continue;
    const filePath = path.resolve(speciesPacksDataPath, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (data.folder !== "rS3iGnYQKzTIxvUN") continue; // Only modify Digimon species
    if (!data.system) throw new Error(`Missing system data in ${filePath}`);

    delete data.folder;
    const newFilePath = path.resolve(newPath, file);
    fs.writeFileSync(newFilePath, JSON.stringify(data, null, 2));
    if(fs.existsSync(filePath))
      fs.rmSync(filePath);
  }
}

{
  const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
  for(const key of ["abilities", "moves", "perks", "effects"]) {
    const packsDataPath = path.resolve(__dirname, `../../packs/core-${key}`);
    const newPath = path.resolve(__dirname, `../../packs/${key}`);
    for (const file of fs.readdirSync(packsDataPath)) {
      if (file.startsWith("_")) continue;
      const filePath = path.resolve(packsDataPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      if(data?.system?.publication?.source !== "Digidex") continue; // Only modify Digimon species
  
      delete data.folder;
      const newFilePath = path.resolve(newPath, file);
      fs.writeFileSync(newFilePath, JSON.stringify(data, null, 2),);
      if(fs.existsSync(filePath))
        fs.rmSync(filePath);
    }
  }
}