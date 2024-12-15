import fs from "fs";
import path from "path";
import url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const packsDataPath = path.resolve(__dirname, "../../packs/core-perks");

for(const file of fs.readdirSync(packsDataPath)) {
  if(file.startsWith("_")) continue;
  const filePath = path.resolve(packsDataPath, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if(!data.system) throw new Error(`Missing system data in ${filePath}`);
  if(!data.system.node) continue;
 
  delete data.system.design;
  
  const node = {
    ...data.system.node,
  }
  delete node.i;
  delete node.j;
  delete data.system.node;
  data.system.nodes = [node];

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}