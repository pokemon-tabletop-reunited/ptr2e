import fs from "fs";
import path from "path";
import url from "url";

function randomID(length=16) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const cutoff = 0x100000000 - (0x100000000 % chars.length);
  const random = new Uint32Array(length);
  do {
    crypto.getRandomValues(random);
  } while ( random.some(x => x >= cutoff) );
  let id = "";
  for ( let i = 0; i < length; i++ ) id += chars[random[i] % chars.length];
  return id;
}

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const speciesPacksDataPath = path.resolve(__dirname, "../../packs/core-species");
for (const file of fs.readdirSync(speciesPacksDataPath)) {
  if (file.startsWith("_")) continue;
  const filePath = path.resolve(speciesPacksDataPath, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if (!data.system) throw new Error(`Missing system data in ${filePath}`);
  
  if(!data._id) {
    data._id = randomID();
  }
  for(const effect of data.effects ?? []) {
    if(!effect._id) {
      effect._id = randomID();
    }
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}