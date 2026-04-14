import fs from "fs";
import path from "path";
import url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const newEffectsPack = path.resolve(__dirname, "../../packs/core-effects-new");
const packs = [
  path.resolve(__dirname, "../../packs/core-effects"),
  newEffectsPack,
  path.resolve(__dirname, "../../packs/core-abilities"),
  path.resolve(__dirname, "../../packs/core-gear"),
  path.resolve(__dirname, "../../packs/core-moves"),
  path.resolve(__dirname, "../../packs/core-perks"),
]
for (const pack of packs) {
  for (const file of fs.readdirSync(pack)) {
    if (file.startsWith("_")) continue;
    const filePath = path.resolve(pack, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (!data.effects) {
      if (pack !== newEffectsPack) continue;
      if (data.flags?.ptr2e?.displayOnToken) {
        data.showIcon = data.flags.ptr2e.displayOnToken === "always"
          ? 2
          : data.flags.ptr2e.displayOnToken === "never"
            ? 0
            : 1;
      }
      delete data.flags?.ptr2e?.displayOnToken;
      if(data.flags?.ptr2e && Object.keys(data.flags.ptr2e).length === 0) {
        delete data.flags.ptr2e;
        if(data.flags && Object.keys(data.flags).length === 0) {
          delete data.flags;
        }
      }
    } else {
      for (const effect of data.effects) {
        if (effect.flags?.ptr2e?.displayOnToken) {
          effect.showIcon = effect.flags.ptr2e.displayOnToken === "always"
            ? 2
            : effect.flags.ptr2e.displayOnToken === "never"
              ? 0
              : 1;
        }
        delete effect.flags?.ptr2e?.displayOnToken;
        if(effect.flags?.ptr2e && Object.keys(effect.flags.ptr2e).length === 0) {
          delete effect.flags.ptr2e; 
          if(effect.flags && Object.keys(effect.flags).length === 0) {
            delete effect.flags;
          }
        }
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
}