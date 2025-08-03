import fs from "fs";
import path from "path";
import url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const movePacksDataPath = path.resolve(__dirname, "../../packs/core-moves");
const abilitiesPacksDataPath = path.resolve(__dirname, "../../packs/core-abilities");

// Replace all instances of the `priority-x` trait with `priority-x0`, e.g. priority-1 becomes priority-10
const priorityTraitRegex = /priority-(\d)$/;
const flinchTraitRegex = /flinch-(\d)$/;

for (const file of fs.readdirSync(movePacksDataPath)) {
  if (file.startsWith("_")) continue;
  const filePath = path.resolve(movePacksDataPath, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if (!data.system) throw new Error(`Missing system data in ${filePath}`);
  const flinchTrait: { value: number, action: Record<string, unknown> }[] = [];
  for (const action of data.system.actions ?? []) {
    if (action.traits?.length) {
      action.traits = action.traits.flatMap((t: string) => {
        const match = t.match(priorityTraitRegex);
        if (match) {
          return `priority-${parseInt(match[1]) * 10}`;
        }
        const flinchMatch = t.match(flinchTraitRegex);
        if (flinchMatch) {
          flinchTrait.push({ value: Math.max(0, parseInt(flinchMatch[1])), action: action });
          return [];
        }
        if(t.startsWith("flinch-chance-")) return [];
        return t;
      });
    }
  }

  if (flinchTrait.length) {
    const effect = {
      "name": data.name,
      "type": "passive",
      "_id": "z7y1zzA2z4Rf7Nwm",
      "img": "systems/ptr2e/img/icons/effect_icon.webp",
      "system": {
        "changes": [] as unknown[],
        "slug": null,
        "traits": [],
        "removeAfterCombat": true,
        "removeOnRecall": false,
        "stacks": 0
      }
    }

    for (const { value, action } of flinchTrait) {
      effect.system.changes.push({
        "type": "roll-effect",
        "key": `${action.slug}-attack`,
        "value": "Compendium.ptr2e.core-effects.Item.advanceffectitem",
        "predicate": [],
        "chance": 100,
        "dontMerge": true,
        "affects": "target",
        "mode": 2,
        "priority": null,
        "ignored": false,
        "alterations": [
          {
            "mode": 5,
            "property": "system.amount",
            "value": value * -10
          },
          {
            "mode": 5,
            "property": "name",
            "value": `Delay ${value * 10}%`
          }
        ]
      })
    }

    data.effects ||= [];
    data.effects.push(effect);
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

for (const file of fs.readdirSync(abilitiesPacksDataPath)) {
  if (file.startsWith("_")) continue;
  const filePath = path.resolve(abilitiesPacksDataPath, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if (!data.system) throw new Error(`Missing system data in ${filePath}`);
  for (const action of data.system.actions ?? []) {
    if (action.traits?.length) {
      action.traits = action.traits.flatMap((t: string) => {
        const match = t.match(priorityTraitRegex);
        if (match) {
          return `priority-${parseInt(match[1]) * 10}`;
        }
        const flinchMatch = t.match(flinchTraitRegex);
        if (flinchMatch) { return []; }
        if(t.startsWith("flinch-chance-")) return [];
        return t;
      });
    }
  }
  if (data.system.traits?.length) {
    data.system.traits = data.system.traits.flatMap((t: string) => {
      const match = t.match(priorityTraitRegex);
      if (match) {
        return `priority-${parseInt(match[1]) * 10}`;
      }
      const flinchMatch = t.match(flinchTraitRegex);
      if (flinchMatch) { return []; }
      if(t.startsWith("flinch-chance-")) return [];
      return t;
    });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}