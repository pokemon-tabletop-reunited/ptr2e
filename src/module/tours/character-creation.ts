import { ActorPTR2e, ActorSheetPTR2e } from "@actor";
import { PTRTour } from "./base.ts";
import StatsForm from "@actor/sheets/stats-form.ts";

export class CharacterCreationTour extends PTRTour {
  private actor: ActorPTR2e | undefined;
  override get app(): ActorSheetPTR2e {
    return this.actor?.sheet as unknown as ActorSheetPTR2e;
  }

  _statsEditor: foundry.applications.api.ApplicationV2 | undefined;
  _skillsEditor: foundry.applications.api.ApplicationV2 | undefined;
  _actionsEditor: foundry.applications.api.ApplicationV2 | undefined;

  protected override async _preStep(): Promise<void> {
    if (!this.actor) {
      this.actor = await ActorPTR2e.create({
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
        effects: []
      }, { temporary: true });
    }

    await super._preStep();

    switch (this.currentStep?.id) {
      case "stats-editor": {
        if(!this.app?.rendered) await this.app.render(true);
        this._statsEditor = await new StatsForm({ document: this.actor }).render(true)
        break;
      }
      case "known-attacks": {
        if(!this.app?.rendered) await this.app.render(true);
        //@ts-expect-error - Params are unnecessary
        this._actionsEditor = await this.app.options.actions["edit-movelist"].call(this.app);
        break;
      }
      case "edit-skills": {
        if(!this.app?.rendered) await this.app.render(true);
        //@ts-expect-error - Params are unnecessary
        this._skillsEditor = await this.app.options.actions["edit-skills"].call(this.app);
        break;
      }
    }
  }

  protected override async _postStep(): Promise<void> {
    switch(this.currentStep?.id) {
      case "stats-editor": {
        if (this._statsEditor) this._statsEditor.close();
        break;
      }
      case "known-attacks": {
        if (this._actionsEditor) this._actionsEditor.close();
        break;
      }
      case "edit-skills": {
        if (this._skillsEditor) this._skillsEditor.close();
        break;
      }
    }

    return await super._postStep();
  }
}