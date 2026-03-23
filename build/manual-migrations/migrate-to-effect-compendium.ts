import fs from "fs";
import path from "path";
import url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const effectsPackDataPath = path.resolve(__dirname, "../../packs/core-effects");
for (const file of fs.readdirSync(effectsPackDataPath)) {
  if (file.startsWith("_")) continue;
  const filePath = path.resolve(effectsPackDataPath, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if (!data.effects) throw new Error(`Missing effect data in ${filePath}`);
  if(data.effects.length !== 1) {
    console.warn(`Effect ${data.name} has ${data.effects.length} changes, skipping.`);
    continue;
  }
  const effect = data.effects[0];
  effect._id = data._id;
  effect.folder = data.folder;
  if(!effect.system?.description && data.system?.description) {
    effect.system ??= {};
    effect.system.description = data.system.description;
  }
  
  // Move to new effects folder
  const newFilePath = path.resolve(__dirname, "../../packs/core-effects-new", file);
  fs.writeFileSync(newFilePath, JSON.stringify(effect, null, 2));
}