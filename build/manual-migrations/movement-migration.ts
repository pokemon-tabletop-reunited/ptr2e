import fs from "fs";
import path from "path";
import url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const packsDataPath = path.resolve(__dirname, "../../packs/core-species");

for(const file of fs.readdirSync(packsDataPath)) {
  if(file.startsWith("_")) continue;
  const filePath = path.resolve(packsDataPath, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if(!data.system) throw new Error(`Missing system data in ${filePath}`);
  
  if (!Array.isArray(data.system.movement) && (data.system.movement.primary?.length || data.system.movement.secondary?.length)) {
    data.system.movement = [...Array.from(data.system.movement.primary ?? []), ...Array.from(data.system.movement.secondary ?? [])].filter(m => !!m)
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}