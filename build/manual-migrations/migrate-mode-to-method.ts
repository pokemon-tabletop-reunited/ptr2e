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
  path.resolve(__dirname, "../../packs/core-species"),
]
for (const pack of packs) {
  for (const file of fs.readdirSync(pack)) {
    if (file.startsWith("_")) continue;
    const filePath = path.resolve(pack, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (!data.effects) {
      if (pack !== newEffectsPack) continue;
      for (const change of data.system?.changes ?? []) {
        if (change.type === "apply-tick") {
          change.target = change.method;
          delete change.method;
          delete change.mode;
        }
        else if (change.mode !== undefined) {
          change.method = change.mode;
          delete change.mode;
        }
        if(change.alterations && change.alterations?.length > 0) {
          for(const alteration of change.alterations) {
            if("mode" in alteration && !("method" in alteration)) {
              alteration.method = alteration.mode;
              delete alteration.mode;
            }
          }
        }
      }
    } else {
      for (const effect of data.effects) {
        for (const change of effect.system?.changes ?? []) {
          if (change.type === "apply-tick") {
            change.target = change.method;
            delete change.method;
            delete change.mode;
          }
          else if (change.mode !== undefined) {
            change.method = change.mode;
            delete change.mode;
          }
          if(change.alterations && change.alterations?.length > 0) {
          for(const alteration of change.alterations) {
            if("mode" in alteration && !("method" in alteration)) {
              alteration.method = alteration.mode;
              delete alteration.mode;
            }
          }
        }
        }
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
}