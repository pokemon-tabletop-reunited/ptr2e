import fs from "fs";
import path from "path";
import url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const movePacksDataPath = path.resolve(__dirname, "../../packs/core-moves");
const abilitiesPacksDataPath = path.resolve(__dirname, "../../packs/core-abilities");

for (const file of fs.readdirSync(movePacksDataPath)) {
  if (file.startsWith("_")) continue;
  const filePath = path.resolve(movePacksDataPath, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if (!data.system) throw new Error(`Missing system data in ${filePath}`);
  for (const action of data.system.actions ?? []) {
    if (action.traits?.length) action.traits = action.traits.filter((t: string) => t !== "pp-updated");
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

for (const file of fs.readdirSync(abilitiesPacksDataPath)) {
  if (file.startsWith("_")) continue;
  const filePath = path.resolve(abilitiesPacksDataPath, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if (!data.system) throw new Error(`Missing system data in ${filePath}`);
  for (const action of data.system.actions ?? []) {
    if (action.traits?.length) action.traits = action.traits.filter((t: string) => t !== "pp-updated");
  }
  if (data.system.traits?.length) data.system.traits = data.system.traits.filter((t: string) => t !== "pp-updated");
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}