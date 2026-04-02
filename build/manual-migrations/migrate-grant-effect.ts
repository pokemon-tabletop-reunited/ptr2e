import fs from "fs";
import path from "path";
import url from "url";

const changedIdMap = new Map([
  [
    "advancecondiitem",
    "advancecondition"
  ],
  [
    "argutecondititem",
    "argutecondition0"
  ],
  [
    "bleedconditiitem",
    "bleedcondition00"
  ],
  [
    "blightcondititem",
    "blightcondition0"
  ],
  [
    "blindedcondiitem",
    "blindedcondition"
  ],
  [
    "boostedcondiitem",
    "boostedcondition"
  ],
  [
    "boundconditiitem",
    "boundcondition00"
  ],
  [
    "bracedcondititem",
    "bracedcondition0"
  ],
  [
    "burnconditioitem",
    "burncondition000"
  ],
  [
    "chantedcondiitem",
    "chantedcondition"
  ],
  [
    "charmedcondiitem",
    "charmedcondition"
  ],
  [
    "choicelockeditem",
    "choicelockedcond"
  ],
  [
    "confusedconditem",
    "confusedconditio"
  ],
  [
    "curledcondititem",
    "curledcondition0"
  ],
  [
    "cursedcondititem",
    "cursedcondition0"
  ],
  [
    "delayconditiitem",
    "delaycondition00"
  ],
  [
    "destinedconditem",
    "destinedconditio"
  ],
  [
    "desynccondititem",
    "desynccondition0"
  ],
  [
    "disabledconditem",
    "disabledconditio"
  ],
  [
    "drowningconditem",
    "drowningconditio"
  ],
  [
    "drowsycondititem",
    "drowsycondition0"
  ],
  [
    "duelconditioitem",
    "duelcondition000"
  ],
  [
    "enragedcondiitem",
    "enragedcondition"
  ],
  [
    "exposedcondiitem",
    "exposedcondition"
  ],
  [
    "faintedcondiitem",
    "faintedcondition"
  ],
  [
    "fearconditioitem",
    "fearcondition000"
  ],
  [
    "frostbiteconitem",
    "frostbiteconditi"
  ],
  [
    "frozencondititem",
    "frozencondition0"
  ],
  [
    "grapplecondiitem",
    "grapplecondition"
  ],
  [
    "groundedconditem",
    "groundedconditio"
  ],
  [
    "haleconditioitem",
    "halecondition000"
  ],
  [
    "hinderedconditem",
    "hinderedconditio"
  ],
  [
    "hypermodeconitem",
    "hypermodeconditi"
  ],
  [
    "infestedconditem",
    "infestedconditio"
  ],
  [
    "invisibleconitem",
    "invisibleconditi"
  ],
  [
    "leechconditiitem",
    "leechcondition00"
  ],
  [
    "liftedcondititem",
    "liftedcondition0"
  ],
  [
    "loafingcondiitem",
    "loafingcondition"
  ],
  [
    "markedcondititem",
    "markedcondition0"
  ],
  [
    "nightmarescoitem",
    "nightmarescondit"
  ],
  [
    "nullifiedconitem",
    "nullifiedconditi"
  ],
  [
    "paralysisconitem",
    "paralysisconditi"
  ],
  [
    "perishcondititem",
    "perishcondition0"
  ],
  [
    "poisoncondititem",
    "poisoncondition0"
  ],
  [
    "raisedcondititem",
    "raisedcondition0"
  ],
  [
    "reboundcondiitem",
    "reboundcondition"
  ],
  [
    "regenconditiitem",
    "regencondition00"
  ],
  [
    "resolvedconditem",
    "resolvedconditio"
  ],
  [
    "slowedcondititem",
    "slowedcondition0"
  ],
  [
    "splinterconditem",
    "splinterconditio"
  ],
  [
    "stuckconditiitem",
    "stuckcondition00"
  ],
  [
    "stuntedcondiitem",
    "stuntedcondition"
  ],
  [
    "suppressedcoitem",
    "suppressedcondit"
  ],
  [
    "tasedconditiitem",
    "tasedcondition00"
  ],
  [
    "tauntedcondiitem",
    "tauntedcondition"
  ],
  [
    "transientconitem",
    "transientconditi"
  ],
  [
    "truesightconitem",
    "truesightconditi"
  ],
  [
    "unluckycondiitem",
    "unluckycondition"
  ],
  [
    "wearyconditiitem",
    "wearycondition00"
  ],
  [
    "windshearconitem",
    "windshearconditi"
  ],
  [
    "wrackedcondiitem",
    "wrackedcondition"
  ]
])

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const packs = [
  path.resolve(__dirname, "../../packs/core-abilities"),
  path.resolve(__dirname, "../../packs/core-gear"),
  path.resolve(__dirname, "../../packs/core-moves"),
  path.resolve(__dirname, "../../packs/core-perks"),
]

const map = new Map();
for (const file of fs.readdirSync(path.resolve(__dirname, "../../packs/core-effects"))) {
  if (file.startsWith("_")) continue;
  const filePath = path.resolve(__dirname, "../../packs/core-effects", file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  map.set(data._id, data);
}

for (const pack of packs) {
  for (const file of fs.readdirSync(pack)) {
    if (file.startsWith("_")) continue;
    const filePath = path.resolve(pack, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    for (const effect of data.effects) {
      for (const change of effect.system?.changes ?? []) {
        if (change.type !== "roll-effect") continue;
        if(!change.value) {console.log("No value for change", effect.name); continue;}
        if(!change.value.startsWith("Compendium.ptr2e.core-effects.Item.")) continue;

        const itemId = change.value.split(".").at(-1);
        if (map.has(itemId) || changedIdMap.has(itemId)) {
          const newId = changedIdMap.get(itemId) ?? itemId
          change.value = `Compendium.ptr2e.core-effects-new.ActiveEffect.${newId}`
        }
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
}