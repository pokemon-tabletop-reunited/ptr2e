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
      data.duration = {
        units: "turns",
        value: data.duration.value ?? (Number.isFinite(data.duration?.turns) && data.duration?.turns > 0 ? data.duration.turns : data.type === "affliction" ? 5 : null), 
        ...(data.type === "affliction" ? {expiry: "turnEnd"} : {})
      }
    } else {
      for (const effect of data.effects) {
        effect.duration = {
          units: "turns",
          value: effect.duration.value ?? (Number.isFinite(effect.duration?.turns) && effect.duration?.turns > 0 ? effect.duration.turns : effect.type === "affliction" ? 5 : null), 
          ...(effect.type === "affliction" ? {expiry: "turnEnd"} : {}) 
        }
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
}