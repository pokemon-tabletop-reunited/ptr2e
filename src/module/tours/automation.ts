import type { EffectPTR2e } from "@item";
import { PTRTour } from "./base.ts";
import { ActiveEffectPTR2e } from "@effects";
import type ActiveEffectConfig from "@module/effects/sheet.ts";
import { DataInspector } from "@module/apps/data-inspector/data-inspector.ts";
import { ActorPTR2e } from "@actor";
import { ChatMessagePTR2e } from "@chat";

export class AutomationTour extends PTRTour {
  private item: EffectPTR2e | undefined;

  private effectSheet: foundry.applications.api.ApplicationV2 | undefined;
  private activeEffectSheet: foundry.applications.api.ApplicationV2 | undefined;
  private dataInspector: foundry.applications.api.ApplicationV2 | undefined;

  override get app() {
    if (["effect-overview", "effect-details", "effect-changes-1", "effect-changes-2", "effect-changes-3"].includes(this.currentStep?.id ?? "")) {
      return this.activeEffectSheet;
    } else if (["data-inspector-actor", "data-inspector-chat"].includes(this.currentStep?.id ?? "")) {
      return this.dataInspector;
    }
    return this.effectSheet;
  }

  protected override async _preStep(): Promise<void> {
    if (!this.item) {
      this.item = (await fromUuid<EffectPTR2e>("Compendium.ptr2e.core-effects.Item.ZGwaMlzUwkSuCPyH"))!;
    }

    if (["effect-overview", "effect-details", "effect-changes-1", "effect-changes-2", "effect-changes-3"].includes(this.currentStep?.id ?? "")) {
      if (this.dataInspector) {
        await this.dataInspector.close();
        this.dataInspector = undefined;
      }
      if (this.effectSheet) {
        await this.effectSheet.close();
        this.effectSheet = undefined;
      }
      if (!this.activeEffectSheet) {
        this.activeEffectSheet = (this.item.effects.contents[0] as ActiveEffectPTR2e).sheet as unknown as ActiveEffectConfig
      }
    } else if (["data-inspector-actor", "data-inspector-chat"].includes(this.currentStep?.id ?? "")) {
      if (this.activeEffectSheet) {
        await this.activeEffectSheet.close();
        this.activeEffectSheet = undefined;
      }
      if (this.effectSheet) {
        await this.effectSheet.close();
        this.effectSheet = undefined;
      }
      if(this.dataInspector) {
        await this.dataInspector.close();
      }
      if (this.currentStep!.id === "data-inspector-actor") {
        this.dataInspector = new DataInspector(new ActorPTR2e({
          name: "Tour-san",
          type: "humanoid",
          img: "systems/ptr2e/img/tour-san.png",
          items: [
            {
              "name": "Tackle",
              "type": "move",
              "img": "systems/ptr2e/img/svg/normal_icon.svg",
              "system": {
                "slug": "tackle",
                "traits": [
                  "push-1",
                  "dash",
                  "basic",
                  "contact"
                ],
                "actions": [
                  {
                    "slug": "tackle",
                    "name": "Tackle",
                    "type": "attack",
                    "traits": [
                      "push-1",
                      "dash",
                      "basic",
                      "contact",
                      "pp-updated"
                    ],
                    "range": {
                      "target": "creature",
                      "distance": 1,
                      "unit": "m"
                    },
                    "cost": {
                      "activation": "complex",
                      "powerPoints": 1
                    },
                    "category": "physical",
                    "power": 40,
                    "accuracy": 100,
                    "types": [
                      "normal"
                    ]
                  }
                ],
                "grade": "E",
                "description": ""
              },
              "_id": "fWOSmnI68Lct2LUn",
              "effects": []
            },
            {
              "name": "Basic Ball",
              "img": "systems/ptr2e/img/item-icons/basic ball.webp",
              "type": "consumable",
              "system": {
                "cost": 1,
                "crafting": {
                  "skill": "electronics",
                  "spans": 2,
                  "materials": [
                    "2x-tumblestone",
                    "1x-basic-apricorn"
                  ]
                },
                "equipped": {
                  "slot": "belt",
                  "carryType": "stowed",
                  "handsHeld": null
                },
                "grade": "E",
                "fling": {
                  "type": "untyped",
                  "power": 0,
                  "accuracy": 95
                },
                "rarity": "common",
                "consumableType": "pokeball",
                "traits": [
                  "stack-5",
                  "belt",
                  "fling"
                ],
                "description": "A basic PokeBall for capturing Pokemon. Gives no bonuses on capture checks.",
                "modifier": 1,
                "quantity": 1,
                "container": null,
                "slug": null,
                "stack": 5
              },
              "_id": "RmxpPT0msnrx1mv4",
              "effects": []
            }
          ],
          effects: [
            this.item.effects.contents[0].toObject()
          ]
        }));
      }
      else {
        //@ts-expect-error - Incorrect typing
        this.dataInspector = new DataInspector(new ChatMessagePTR2e({
          "type": "attack",
          "flavor": "Tackle",
          "system": {
            "pp": {
              "spent": true,
              "cost": 1
            },
            "attack": "{\"slug\":\"tackle\",\"name\":\"Tackle\",\"type\":\"attack\",\"traits\":[\"push-1\",\"dash\",\"basic\",\"contact\",\"pp-updated\"],\"range\":{\"target\":\"creature\",\"distance\":1,\"unit\":\"m\"},\"cost\":{\"activation\":\"complex\",\"powerPoints\":1},\"category\":\"physical\",\"power\":40,\"accuracy\":100,\"types\":[\"normal\"]}],\"grade\":\"E\",\"description\":\"\"",
            "attackSlug": "tackle",
            "origin": "{\"name\":\"Tour-san\",\"type\":\"humanoid\",\"img\":\"systems/ptr2e/img/tour-san.png\",\"items\":[{\"name\":\"Tackle\",\"type\":\"move\",\"img\":\"systems/ptr2e/img/svg/normal_icon.svg\",\"system\":{\"slug\":\"tackle\",\"traits\":[\"push-1\",\"dash\",\"basic\",\"contact\"],\"actions\":[{\"slug\":\"tackle\",\"name\":\"Tackle\",\"type\":\"attack\",\"traits\":[\"push-1\",\"dash\",\"basic\",\"contact\",\"pp-updated\"],\"range\":{\"target\":\"creature\",\"distance\":1,\"unit\":\"m\"},\"cost\":{\"activation\":\"complex\",\"powerPoints\":1},\"category\":\"physical\",\"power\":40,\"accuracy\":100,\"types\":[\"normal\"]}],\"grade\":\"E\",\"description\":\"\"},\"_id\":\"fWOSmnI68Lct2LUn\",\"effects\":[]},{\"name\":\"Basic Ball\",\"img\":\"systems/ptr2e/img/item-icons/basic ball.webp\",\"type\":\"consumable\",\"system\":{\"cost\":1,\"crafting\":{\"skill\":\"electronics\",\"spans\":2,\"materials\":[\"2x-tumblestone\",\"1x-basic-apricorn\"]},\"equipped\":{\"slot\":\"belt\",\"carryType\":\"stowed\",\"handsHeld\":null},\"grade\":\"E\",\"fling\":{\"type\":\"untyped\",\"power\":0,\"accuracy\":95},\"rarity\":\"common\",\"consumableType\":\"pokeball\",\"traits\":[\"stack-5\",\"belt\",\"fling\"],\"description\":\"A basic PokeBall for capturing Pokemon. Gives no bonuses on capture checks.\",\"modifier\":1,\"quantity\":1,\"container\":null,\"slug\":null,\"stack\":5},\"_id\":\"RmxpPT0msnrx1mv4\",\"effects\":[]}],\"effects\":[]}",
            "results": [
              {
                "target": "{\"name\":\"Tour-san\",\"type\":\"humanoid\",\"img\":\"systems/ptr2e/img/tour-san.png\",\"items\":[{\"name\":\"Tackle\",\"type\":\"move\",\"img\":\"systems/ptr2e/img/svg/normal_icon.svg\",\"system\":{\"slug\":\"tackle\",\"traits\":[\"push-1\",\"dash\",\"basic\",\"contact\"],\"actions\":[{\"slug\":\"tackle\",\"name\":\"Tackle\",\"type\":\"attack\",\"traits\":[\"push-1\",\"dash\",\"basic\",\"contact\",\"pp-updated\"],\"range\":{\"target\":\"creature\",\"distance\":1,\"unit\":\"m\"},\"cost\":{\"activation\":\"complex\",\"powerPoints\":1},\"category\":\"physical\",\"power\":40,\"accuracy\":100,\"types\":[\"normal\"]}],\"grade\":\"E\",\"description\":\"\"},\"_id\":\"fWOSmnI68Lct2LUn\",\"effects\":[]},{\"name\":\"Basic Ball\",\"img\":\"systems/ptr2e/img/item-icons/basic ball.webp\",\"type\":\"consumable\",\"system\":{\"cost\":1,\"crafting\":{\"skill\":\"electronics\",\"spans\":2,\"materials\":[\"2x-tumblestone\",\"1x-basic-apricorn\"]},\"equipped\":{\"slot\":\"belt\",\"carryType\":\"stowed\",\"handsHeld\":null},\"grade\":\"E\",\"fling\":{\"type\":\"untyped\",\"power\":0,\"accuracy\":95},\"rarity\":\"common\",\"consumableType\":\"pokeball\",\"traits\":[\"stack-5\",\"belt\",\"fling\"],\"description\":\"A basic PokeBall for capturing Pokemon. Gives no bonuses on capture checks.\",\"modifier\":1,\"quantity\":1,\"container\":null,\"slug\":null,\"stack\":5},\"_id\":\"RmxpPT0msnrx1mv4\",\"effects\":[]}],\"effects\":[]}",
                "accuracy": "{\"class\":\"AttackRoll\",\"options\":{\"type\":\"attack-roll\",\"identifier\":\"tackle.tackle\",\"action\":\"tackle\",\"domains\":[\"all\",\"check\",\"attack\",\"ranged-attack\",\"physical-attack\",\"push-1-trait-attack\",\"dash-trait-attack\",\"basic-trait-attack\",\"contact-trait-attack\",\"pp-updated-trait-attack\",\"normal-attack\",\"tackle-attack\",\"fWOSmnI68Lct2LUn-attack\",\"damaging-attack\"],\"isReroll\":false,\"totalModifier\":0,\"damaging\":false,\"rollerId\":\"tXAZ3QUgjuwX4gdV\",\"showBreakdown\":false,\"breakdown\":\"\",\"attack\":{\"slug\":\"tackle\",\"name\":\"Tackle\",\"type\":\"attack\",\"traits\":[\"push-1\",\"dash\",\"basic\",\"contact\",\"pp-updated\"],\"range\":{\"target\":\"creature\",\"distance\":1,\"unit\":\"m\"},\"cost\":{\"activation\":\"complex\",\"powerPoints\":1,\"delay\":null,\"priority\":null},\"category\":\"physical\",\"power\":40,\"accuracy\":100,\"types\":[\"normal\"],\"img\":\"icons/svg/explosion.svg\",\"variant\":null,\"contestType\":\"\",\"contestEffect\":\"\",\"free\":false,\"slot\":1,\"summon\":null,\"defaultVariant\":null,\"flingItemId\":null,\"offensiveStat\":null,\"defensiveStat\":null},\"rip\":false,\"outOfRange\":false,\"flatDamage\":0,\"statMod\":0,\"effectivenessStage\":0,\"ignoreImmune\":false,\"attackType\":\"damage\",\"moveAccuracy\":100,\"adjustedStages\":0,\"otherModifiers\":0,\"stageModifier\":1,\"percentileModifier\":1,\"accuracyDC\":100,\"critStages\":0,\"critDC\":4,\"power\":40,\"damageMod\":1,\"degreeOfSuccess\":-1},\"dice\":[],\"formula\":\"1d100ms100\",\"terms\":[{\"class\":\"Die\",\"options\":{\"flavor\":null,\"marginSuccess\":100},\"evaluated\":true,\"number\":1,\"faces\":100,\"modifiers\":[\"ms100\"],\"results\":[{\"result\":62,\"active\":true}]}],\"total\":-38,\"evaluated\":true}",
                "crit": "{\"class\":\"AttackRoll\",\"options\":{\"type\":\"attack-roll\",\"identifier\":\"tackle.tackle\",\"action\":\"tackle\",\"domains\":[\"all\",\"check\",\"attack\",\"ranged-attack\",\"physical-attack\",\"push-1-trait-attack\",\"dash-trait-attack\",\"basic-trait-attack\",\"contact-trait-attack\",\"pp-updated-trait-attack\",\"normal-attack\",\"tackle-attack\",\"fWOSmnI68Lct2LUn-attack\",\"damaging-attack\"],\"isReroll\":false,\"totalModifier\":0,\"damaging\":false,\"rollerId\":\"tXAZ3QUgjuwX4gdV\",\"showBreakdown\":false,\"breakdown\":\"\",\"attack\":{\"slug\":\"tackle\",\"name\":\"Tackle\",\"type\":\"attack\",\"traits\":[\"push-1\",\"dash\",\"basic\",\"contact\",\"pp-updated\"],\"range\":{\"target\":\"creature\",\"distance\":1,\"unit\":\"m\"},\"cost\":{\"activation\":\"complex\",\"powerPoints\":1,\"delay\":null,\"priority\":null},\"category\":\"physical\",\"power\":40,\"accuracy\":100,\"types\":[\"normal\"],\"img\":\"icons/svg/explosion.svg\",\"variant\":null,\"contestType\":\"\",\"contestEffect\":\"\",\"free\":false,\"slot\":1,\"summon\":null,\"defaultVariant\":null,\"flingItemId\":null,\"offensiveStat\":null,\"defensiveStat\":null},\"rip\":false,\"outOfRange\":false,\"flatDamage\":0,\"statMod\":0,\"effectivenessStage\":0,\"ignoreImmune\":false,\"attackType\":\"damage\",\"moveAccuracy\":100,\"adjustedStages\":0,\"otherModifiers\":0,\"stageModifier\":1,\"percentileModifier\":1,\"accuracyDC\":100,\"critStages\":0,\"critDC\":4,\"power\":40,\"damageMod\":1,\"degreeOfSuccess\":-1},\"dice\":[],\"formula\":\"1d100ms4\",\"terms\":[{\"class\":\"Die\",\"options\":{\"flavor\":null,\"marginSuccess\":4},\"evaluated\":true,\"number\":1,\"faces\":100,\"modifiers\":[\"ms4\"],\"results\":[{\"result\":55,\"active\":true}]}],\"total\":51,\"evaluated\":true}",
                "damage": "{\"class\":\"AttackRoll\",\"options\":{\"type\":\"attack-roll\",\"identifier\":\"tackle.tackle\",\"action\":\"tackle\",\"domains\":[\"all\",\"check\",\"attack\",\"ranged-attack\",\"physical-attack\",\"push-1-trait-attack\",\"dash-trait-attack\",\"basic-trait-attack\",\"contact-trait-attack\",\"pp-updated-trait-attack\",\"normal-attack\",\"tackle-attack\",\"fWOSmnI68Lct2LUn-attack\",\"damaging-attack\"],\"isReroll\":false,\"totalModifier\":0,\"damaging\":false,\"rollerId\":\"tXAZ3QUgjuwX4gdV\",\"showBreakdown\":false,\"breakdown\":\"\",\"attack\":{\"slug\":\"tackle\",\"name\":\"Tackle\",\"type\":\"attack\",\"traits\":[\"push-1\",\"dash\",\"basic\",\"contact\",\"pp-updated\"],\"range\":{\"target\":\"creature\",\"distance\":1,\"unit\":\"m\"},\"cost\":{\"activation\":\"complex\",\"powerPoints\":1,\"delay\":null,\"priority\":null},\"category\":\"physical\",\"power\":40,\"accuracy\":100,\"types\":[\"normal\"],\"img\":\"icons/svg/explosion.svg\",\"variant\":null,\"contestType\":\"\",\"contestEffect\":\"\",\"free\":false,\"slot\":1,\"summon\":null,\"defaultVariant\":null,\"flingItemId\":null,\"offensiveStat\":null,\"defensiveStat\":null},\"rip\":false,\"outOfRange\":false,\"flatDamage\":0,\"statMod\":0,\"effectivenessStage\":0,\"ignoreImmune\":false,\"attackType\":\"damage\",\"moveAccuracy\":100,\"adjustedStages\":0,\"otherModifiers\":0,\"stageModifier\":1,\"percentileModifier\":1,\"accuracyDC\":100,\"critStages\":0,\"critDC\":4,\"power\":40,\"damageMod\":1,\"degreeOfSuccess\":-1},\"dice\":[],\"formula\":\"2d8\",\"terms\":[{\"class\":\"Die\",\"options\":{\"flavor\":null},\"evaluated\":true,\"number\":2,\"faces\":8,\"modifiers\":[],\"results\":[{\"result\":3,\"active\":true},{\"result\":1,\"active\":true}]}],\"total\":4,\"evaluated\":true}",
                "context": {
                  "check": {
                    "slug": "tackle-scene-qp-okcffc-ck0xqvfj-token-e-goizmmw-q1qm-btql-actor-ln7qltuzi0b-tsoqy",
                    "_modifiers": [
                      {
                        "slug": "power",
                        "label": "Attack Power",
                        "domains": [],
                        "modifier": 40,
                        "adjustments": [],
                        "alterations": [],
                        "ignored": false,
                        "predicate": [],
                        "critical": null,
                        "traits": [],
                        "hideIfDisabled": false,
                        "hidden": true,
                        "appliesTo": {},
                        "method": "base",
                        "type": "power",
                        "kind": "bonus"
                      }
                    ],
                    "breakdown": "",
                    "totalModifiers": {
                      "power": {
                        "base": 40,
                        "flat": 0,
                        "stage": 0,
                        "percentile": 1
                      }
                    },
                    "totalModifier": 0
                  },
                  "action": "tackle",
                  "domains": [
                    "all",
                    "check",
                    "attack",
                    "ranged-attack",
                    "physical-attack",
                    "push-1-trait-attack",
                    "dash-trait-attack",
                    "basic-trait-attack",
                    "contact-trait-attack",
                    "pp-updated-trait-attack",
                    "normal-attack",
                    "tackle-attack",
                    "f-wosmn-i68lct2lun-attack",
                    "damaging-attack"
                  ],
                  "notes": [],
                  "title": "Tackle",
                  "type": "attack-roll",
                  "options": [
                    "self:type:humanoid",
                    "item:move:tackle",
                    "item:consumable:basic-ball",
                    "self:state:desperation-1-4",
                    "self:state:desperation-1-3",
                    "self:state:desperation-1-2",
                    "self:state:desperation-3-4",
                    "item:move:fling"
                  ]
                }
              }
            ]
          }
        }));
      }
    } else if (["effects-tab", "create-effect", "data-inspector"].includes(this.currentStep?.id ?? "")) {
      if (this.dataInspector) {
        await this.dataInspector.close();
        this.dataInspector = undefined;
      }
      if (this.activeEffectSheet) {
        await this.activeEffectSheet.close();
        this.activeEffectSheet = undefined;
      }
      if (!this.effectSheet) {
        this.effectSheet = this.item.sheet as unknown as foundry.applications.api.ApplicationV2;
      }
    }

    await super._preStep();

    if(this.currentStep?.id === "create-effect") {
      ActiveEffectPTR2e.createDialog({}, { parent: this.item})
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    if(this.currentStep?.id === "data-inspector") {
      const menu = this.effectSheet!.element.querySelector<HTMLMenuElement>("menu");
      menu?.classList.add("expanded");
    }
  }

  protected override async _postStep(): Promise<void> {
    if(this.currentStep?.id === "create-effect") {
      for(const app of Object.values(ui.windows).filter(w => w.element[0].classList.contains("app") && w.element[0].classList.contains("dialog"))) {
        await app.close();
      }
    }
    return super._postStep();
  }

  protected override async _tearDown(complete?: boolean): Promise<void> {
    if (this.dataInspector) {
      await this.dataInspector.close();
      this.dataInspector = undefined;
    }
    if (this.effectSheet) {
      await this.effectSheet.close();
      this.effectSheet = undefined;
    }
    if (this.activeEffectSheet) {
      await this.activeEffectSheet.close();
      this.activeEffectSheet = undefined;
    }
    return super._tearDown(complete);
  }
}