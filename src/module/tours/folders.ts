import { ActorPTR2e } from "@actor";
import FolderPTR2e from "@module/folder/document.ts";
import FolderConfigPTR2e from "@module/folder/sheet.ts";
import { htmlQuery } from "@utils";
import { PTRTour } from "./base.ts";

export class FoldersTour extends PTRTour {
  protected override async _preStep(): Promise<void> {
    if (!game.user.isGM) {
      ui.notifications.error("You must be a GM to run this tour.");
      return;
    }

    await super._preStep();

    switch (this.currentStep?.id) {
      case "create-dialog": {
        await this.createDialog();
        //@ts-expect-error - Bypass protected property
        await ui.actors._render(true)
        await this.delay(250)
        break;
      }
      case "create-party": {
        const { folder, tourSan, tourSanVoltorb } = await this.getDocuments();

        const dialog = await this.openTourSanDialog(folder);

        await Actor.updateDocuments([
          {
            _id: tourSan.id,
            system: {
              party: {
                ownerOf: folder.id,
                partyMemberOf: null,
                teamMemberOf: []
              }
            }
          },
          {
            _id: tourSanVoltorb.id,
            system: {
              party: {
                ownerOf: null,
                partyMemberOf: folder.id,
                teamMemberOf: []
              }
            }
          }
        ])

        await dialog.render({ parts: ["members"] })
        //@ts-expect-error - Bypass protected property
        await ui.actors._render(true)
        await this.delay(250)
        htmlQuery(document.body, "li.folder[data-folder-id='toursantmpfolder']")?.classList.remove("collapsed");
        break;
      }
      case "open-party-sheet": {
        const { folder, tourSan, tourSanVoltorb } = await this.getDocuments();

        await Actor.updateDocuments([
          {
            _id: tourSan.id,
            system: {
              party: {
                ownerOf: folder.id,
                partyMemberOf: null,
                teamMemberOf: []
              }
            }
          },
          {
            _id: tourSanVoltorb.id,
            system: {
              party: {
                ownerOf: null,
                partyMemberOf: folder.id,
                teamMemberOf: []
              }
            }
          }
        ])
        //@ts-expect-error - Bypass protected property
        await ui.actors._render(true)
        await this.delay(250)
        break;
      }
      case "opened-party-sheet": {
        const { folder, tourSan, tourSanVoltorb } = await this.getDocuments();
        
        await Actor.updateDocuments([
          {
            _id: tourSan.id,
            system: {
              party: {
                ownerOf: folder.id,
                partyMemberOf: null,
                teamMemberOf: []
              }
            }
          },
          {
            _id: tourSanVoltorb.id,
            system: {
              party: {
                ownerOf: null,
                partyMemberOf: folder.id,
                teamMemberOf: []
              }
            }
          }
        ])

        await folder.renderPartySheet();
        //@ts-expect-error - Bypass protected property
        await ui.actors._render(true)
        break;
      }
      case "organize-party": {
        const { folder, tourSan, tourSanVoltorb } = await this.getDocuments();
        
        await Actor.updateDocuments([
          {
            _id: tourSan.id,
            system: {
              party: {
                ownerOf: folder.id,
                partyMemberOf: null,
                teamMemberOf: []
              }
            }
          },
          {
            _id: tourSanVoltorb.id,
            system: {
              party: {
                ownerOf: null,
                partyMemberOf: folder.id,
                teamMemberOf: []
              }
            }
          }
        ])

        const sheet = await folder.renderPartySheet();
        sheet?.changeTab("party", "sheet");
        //@ts-expect-error - Bypass protected property
        await ui.actors._render(true)
        break;
      }
      case "add-party-members": {
        const { folder, tourSan, tourSanVoltorb } = await this.getDocuments();

        await Actor.updateDocuments([
          {
            _id: tourSan.id,
            system: {
              party: {
                ownerOf: folder.id,
                partyMemberOf: null,
                teamMemberOf: []
              }
            }
          },
          {
            _id: tourSanVoltorb.id,
            system: {
              party: {
                ownerOf: null,
                partyMemberOf: folder.id,
                teamMemberOf: []
              }
            }
          }
        ])

        //@ts-expect-error - Bypass protected property
        await ui.actors._render(true)
        await this.delay(250)
        htmlQuery(document.body, "li.folder[data-folder-id='toursantmpfolder']")?.classList.remove("collapsed");
        break;
      }
      case "create-team": {
        const { folder, tourSan, tourSanVoltorb } = await this.getDocuments();
        const dialog = await this.openTourSanDialog(folder);

        await Actor.updateDocuments([
          {
            _id: tourSan.id,
            system: {
              party: {
                ownerOf: null,
                partyMemberOf: null,
                teamMemberOf: [folder.id]
              }
            }
          },
          {
            _id: tourSanVoltorb.id,
            system: {
              party: {
                ownerOf: null,
                partyMemberOf: null,
                teamMemberOf: [folder.id]
              }
            }
          }
        ])

        await dialog.render({ parts: ["members"] })
        //@ts-expect-error - Bypass protected property
        await ui.actors._render(true)
        await this.delay(250)
        htmlQuery(document.body, "li.folder[data-folder-id='toursantmpfolder']")?.classList.remove("collapsed");
        break;
      }
      case "open-team-sheet": {
        const { folder, tourSan, tourSanVoltorb } = await this.getDocuments();
        
        await Actor.updateDocuments([
          {
            _id: tourSan.id,
            system: {
              party: {
                ownerOf: null,
                partyMemberOf: null,
                teamMemberOf: [folder.id]
              }
            }
          },
          {
            _id: tourSanVoltorb.id,
            system: {
              party: {
                ownerOf: null,
                partyMemberOf: null,
                teamMemberOf: [folder.id]
              }
            }
          }
        ])

        //@ts-expect-error - Bypass protected property
        await ui.actors._render(true)
        await this.delay(250)
        break;
      }
      case "opened-team-sheet": {
        const { folder, tourSan, tourSanVoltorb } = await this.getDocuments();
        
        await Actor.updateDocuments([
          {
            _id: tourSan.id,
            system: {
              party: {
                ownerOf: null,
                partyMemberOf: null,
                teamMemberOf: [folder.id]
              }
            }
          },
          {
            _id: tourSanVoltorb.id,
            system: {
              party: {
                ownerOf: null,
                partyMemberOf: null,
                teamMemberOf: [folder.id]
              }
            }
          }
        ])

        await folder.renderTeamSheet();
        //@ts-expect-error - Bypass protected property
        await ui.actors._render(true)
        await this.delay(250)
        break;
      }
    }
  }

  protected override async _postStep(): Promise<void> {
    if (this.currentStep?.id === "create-dialog") {
      this.closeDialog();
    }
    if (this.currentStep?.id === "create-party" || this.currentStep?.id === "create-team") {
      this.closeDialog(true);
    }
    if (this.currentStep?.id === "opened-party-sheet" || this.currentStep?.id === "organize-party") {
      const dialog = foundry.applications.instances.get(`PartySheetPTR2e-Folder.toursantmpfolder`) as FolderConfigPTR2e | undefined;
      if (dialog) dialog.close();
    }
    if (this.currentStep?.id === "opened-team-sheet") {
      const dialog = foundry.applications.instances.get(`TeamSheetPTR2e-Folder.toursantmpfolder`) as FolderConfigPTR2e | undefined;
      if (dialog) dialog.close();
    }

    return await super._postStep();
  }

  protected override async _tearDown(complete?: boolean): Promise<void> {
    await super._tearDown(complete);
    this.closeDialog();

    const actorsToDelete = [];

    const tourSan = game.actors.get("toursantempactor") as ActorPTR2e;
    if (tourSan) actorsToDelete.push('toursantempactor')

    const tourSanVoltorb = game.actors.get("toursanstvoltorb") as ActorPTR2e;
    if (tourSanVoltorb) actorsToDelete.push('toursanstvoltorb')

    const folder = game.folders.get("toursantmpfolder") as FolderPTR2e;
    if (folder) await folder.delete();

    await Actor.deleteDocuments(actorsToDelete);
  }

  private async getDocuments(): Promise<FolderTourDocuments> {
    const data = {
      folder: await (async () => {
        return game.folders.get("toursantmpfolder") as FolderPTR2e ?? CONFIG.PTR.Folder.documentClass.create({
          name: "Tour-san's Folder",
          type: "Actor",
          _id: "toursantmpfolder",
          color: '#784a4a',
          sort: 999999999
        }, { keepId: true });
      })(),
      tourSan: await (async () => {
        return game.actors.get("toursantempactor") as ActorPTR2e ?? CONFIG.PTR.Actor.documentClass.create({
          name: "Tour-san",
          type: "humanoid",
          img: "systems/ptr2e/img/tour-san.png",
          _id: "toursantempactor",
          folder: "toursantmpfolder",
        }, { keepId: true });
      })(),
      tourSanVoltorb: await (async () => {
        return game.actors.get("toursanstvoltorb") as ActorPTR2e ?? CONFIG.PTR.Actor.documentClass.create({
          name: "Tour-san's Voltorb",
          type: "humanoid",
          img: "systems/ptr2e/img/tour-san-voltorb.webp",
          _id: "toursanstvoltorb",
          folder: "toursantmpfolder",
        }, { keepId: true });
      })()
    }
    await this.delay(150);
    return data;
  }

  protected createDialog() {
    CONFIG.PTR.Folder.documentClass.createDialog(
      { type: "Actor" },
      {
        top: $('[data-tab="actors"] button.create-folder')[0].offsetTop,
        left:
          window.innerWidth -
          310 -
          CONFIG.PTR.Folder.sheetClasses.folder.DEFAULT_OPTIONS.position.width,
      }
    );
    return this.delay(150);
  }

  private closeDialog(isTourSan = false) {
    const dialog = foundry.applications.instances.get(isTourSan ? `FolderConfigPTR2e-Folder.toursantmpfolder` : "FolderConfigPTR2e-Folder.") as FolderConfigPTR2e | undefined;
    if (dialog) dialog.close();
  }

  protected openTourSanDialog(folder: FolderPTR2e = game.folders.get("toursantmpfolder") as FolderPTR2e) {
    const li = htmlQuery(document.body, "li.folder[data-folder-id='toursantmpfolder']");
    const r = li?.getBoundingClientRect();
    const context = r ? { document: folder, position: { top: r.top, left: r.left - FolderConfigPTR2e.DEFAULT_OPTIONS.position.width - 10 } } : { document: folder };
    return new FolderConfigPTR2e(context).render(true);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

interface FolderTourDocuments {
  folder: FolderPTR2e;
  tourSan: ActorPTR2e;
  tourSanVoltorb: ActorPTR2e;
}