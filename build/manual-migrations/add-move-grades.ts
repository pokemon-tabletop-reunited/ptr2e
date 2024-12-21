import fs from "fs";
import path from "path";
import url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const packsDataPath = path.resolve(__dirname, "../../packs/core-moves");

for(const file of fs.readdirSync(packsDataPath)) {
  if(file.startsWith("_")) continue;
  const filePath = path.resolve(packsDataPath, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if(!data.system) throw new Error(`Missing system data in ${filePath}`);
  data.system.grade ??= "E";
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}