import fs from "fs";
import path from "path";
import url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const movePacksDataPath = path.resolve(__dirname, "../../packs/core-moves");
for (const file of fs.readdirSync(movePacksDataPath)) {
  if (file.startsWith("_")) continue;
  const filePath = path.resolve(movePacksDataPath, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if (!data.system) throw new Error(`Missing system data in ${filePath}`);
  for (const action of data.system.actions ?? []) {
    if(action.traits && action.traits.length > 0 && (action.traits.includes("zenith") || action.traits.includes("max"))) {
      data.system.grade = "S";
      break;
    }
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}