import type { ActorSheetPTR2e } from "@actor";
import { PTRTour } from "./base.ts";
import { PerkWebApp } from "@module/apps/perk-web/perk-web-v2.ts";

export class PerkWebTour extends PTRTour {
  private actor: Actor.ConfiguredInstance | undefined;

  override get app() {
    return this.actor?.sheet as unknown as ActorSheetPTR2e;
  }

  get perkWeb(): PerkWebApp {
    return foundry.applications.instances.get("perk-web-app") as PerkWebApp;
  }

  protected override async _preStep(): Promise<void> {
    if (!this.actor) {
      this.actor = await CONFIG.Actor.documentClass.create({
        name: "Tour-san",
        type: "humanoid",
        img: "systems/ptr2e/img/tour-san.png",
        system: {
          skills: [
            {
              slug: "leadership",
              value: 25,
              favourite: true,
              hidden: false,
              rvs: 0
            }
          ]
        }
      }, { temporary: true });
    }

    await super._preStep();

    if (!["welcome", "rules", "open-web"].includes(this.currentStep?.id ?? "")) {
      if (!this.perkWeb) {
        const web = new PerkWebApp(this.actor!)
        web._zoomAmount = 1;
        await web.render(true);
      }
    }

    switch (this.currentStep?.id) {
      case "open-web": {
        if (!this.app?.rendered) await this.app.render(true);
        break;
      }
      case "actor-sheet": {
        if (!this.app?.rendered) await this.app.render(true);
        this.app?.setPosition({ left: 270, top: 20 });
        this.app?.minimize();
        break;
      }
      case "perk-overview": {
        this.perkWeb.currentNode = this.perkWeb._perkStore.nodeFromSlug("root-1")!;
        await this.perkWeb.render({ parts: ["hudPerk"] });
        break;
      }
      case "perk-example": {
        if(!this.actor?.perks.get("root-1")) {
          this.actor?.perks.set("root-1", new CONFIG.Item.documentClass({
            "type": "perk",
            "name": "Root 1",
            "img": "icons/svg/door-exit.svg",
            "system": {
              "description": "<p>This is an entry perk to the Web, it has no effect on its own.</p>",
              "cost": 0,
              "slug": "root-1",
              "nodes": [
                {
                  "connected": [
                    "berserker",
                    "tactician",
                    "mobilize",
                    "silk-swing"
                  ],
                  "config": {
                    "alpha": 1,
                    "backgroundColor": "#5eaf3c",
                    "borderColor": null,
                    "borderWidth": null,
                    "texture": "icons/svg/door-exit.svg",
                    "tint": null,
                    "scale": null
                  },
                  "hidden": false,
                  "type": "root",
                  "x": 35,
                  "y": 35,
                  "tier": null
                }
              ],
              "global": true,
              "originSlug": "root-1"
            }
          }));
          await this.perkWeb.constructor.refresh.call(this.perkWeb);
        }

        await new Promise(resolve => setTimeout(resolve, 150));
        const element = document.querySelector<HTMLElement>(`[data-uuid="Compendium.ptr2e.core-perks.Item.F4l5fiHA0sXoMbx6"]`);
        element?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        this.perkWeb.currentNode = this.perkWeb._perkStore.get(`${element?.dataset?.x}-${element?.dataset?.y}`)!;
        await this.perkWeb.render({ parts: ["hudPerk"] });
        break;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 250));
  }

  protected override async _tearDown(complete?: boolean): Promise<void> {
    if (this.perkWeb) await this.perkWeb.close();

    return super._tearDown(complete);
  }
}