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
  const actions = data.system.actions;
  if(!actions?.length) continue;
  delete data.system.description;
  delete data.system.traits;
  for(const action of actions) {
    if(!action.cost) continue;
    if(action.cost.delay === null) delete action.cost.delay;
    if(action.cost.priority === null) delete action.cost.priority
    if(action.cost.trigger === null) delete action.cost.trigger;
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}