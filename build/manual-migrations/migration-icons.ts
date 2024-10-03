import fs from "fs";
import path from "path";
import url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const packsDataPath = path.resolve(__dirname, "../../packs/core-gear");

const basePath = "systems/ptr2e/img/icons/";
const extension = "_icon.webp";
for(const file of fs.readdirSync(packsDataPath)) {
  const filePath = path.resolve(packsDataPath, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if(data.img == '/systems/ptr2e/img/icons/item_icon.webp' || data.img == 'systems/ptr2e/img/icons/item_icon.webp') {
    data.img = basePath+(() => {
      switch(data.type) {
        case "consumable": return "consumable";
        case "equipment": return "equipment";
        case "weapon": return "weapon";
        case "container": return "container";
        case "gear":
        default: return "gear";
      }
    })()+extension;
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}