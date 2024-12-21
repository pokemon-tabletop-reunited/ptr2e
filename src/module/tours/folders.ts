import { ActorPTR2e } from "@actor";
import FolderPTR2e from "@module/folder/document.ts";
import FolderConfigPTR2e from "@module/folder/sheet.ts";
import { htmlQuery } from "@utils";
import { PTRTour } from "./base.ts";

export class FoldersTour extends PTRTour {
    protected override async _preStep(): Promise<void> {
      return;
      // switch (this.currentStep?.id) {
      //     case "welcome":
      //         ui.sidebar.activateTab("actors");
      //         break;
      //     case "create-dialog": {
      //         ui.sidebar.activateTab("actors");
      //         await this.createDialog();
      //         break;
      //     }
      //     case "create-party": {
      //         ui.sidebar.activateTab("actors");

      //         const { folder, tourSan, tourSanVoltorb } = await this.getDocuments();

      //         const dialog = await this.openTourSanDialog(folder);

      //         await FolderConfigPTR2e._updateFolder(dialog.document, { "flags.ptr2e.owner": tourSan.uuid, "flags.ptr2e.party": [tourSanVoltorb.uuid], "flags.ptr2e.team": [] });
      //         await dialog.render({parts: ["members"]})
      //         await this.delay(250);
      //         htmlQuery(document.body, "li.folder[data-folder-id='toursantmpfolder']")?.classList.remove("collapsed");
      //         break;
      //     }
      //     case "open-party-sheet": {
      //         ui.sidebar.activateTab("actors");

      //         const {folder, tourSan, tourSanVoltorb } = await this.getDocuments();
      //         await FolderConfigPTR2e._updateFolder(folder, { "flags.ptr2e.owner": tourSan.uuid, "flags.ptr2e.party": [tourSanVoltorb.uuid], "flags.ptr2e.team": [] });
      //         await this.delay(250);
      //         break;
      //     }
      //     case "opened-party-sheet": {
      //         ui.sidebar.activateTab("actors");

      //         const {folder, tourSan, tourSanVoltorb } = await this.getDocuments();
      //         await FolderConfigPTR2e._updateFolder(folder, { "flags.ptr2e.owner": tourSan.uuid, "flags.ptr2e.party": [tourSanVoltorb.uuid], "flags.ptr2e.team": [] });
      //         await folder.renderPartySheet();
      //         await this.delay(250);
      //         break;
      //     }
      //     case "create-team": {
      //         ui.sidebar.activateTab("actors");
              
      //         const { folder, tourSan, tourSanVoltorb } = await this.getDocuments();

      //         const dialog = await this.openTourSanDialog(folder);

      //         await FolderConfigPTR2e._updateFolder(dialog.document, { "flags.ptr2e.owner": null, "flags.ptr2e.party": [], "flags.ptr2e.team": [tourSan.uuid, tourSanVoltorb.uuid] });
      //         await dialog.render({parts: ["members"]})
      //         await this.delay(250);
      //         htmlQuery(document.body, "li.folder[data-folder-id='toursantmpfolder']")?.classList.remove("collapsed");
      //         break;
      //     }
      //     case "open-team-sheet": {
      //         ui.sidebar.activateTab("actors");

      //         const {folder, tourSan, tourSanVoltorb } = await this.getDocuments();
      //         await FolderConfigPTR2e._updateFolder(folder, { "flags.ptr2e.owner": null, "flags.ptr2e.party": [], "flags.ptr2e.team": [tourSan.uuid, tourSanVoltorb.uuid] });
      //         await this.delay(250);
      //         break;
      //     }
      //     case "opened-team-sheet": {
      //         ui.sidebar.activateTab("actors");

      //         const {folder, tourSan, tourSanVoltorb } = await this.getDocuments();
      //         await FolderConfigPTR2e._updateFolder(folder, { "flags.ptr2e.owner": null, "flags.ptr2e.party": [], "flags.ptr2e.team": [tourSan.uuid, tourSanVoltorb.uuid] });
      //         await folder.renderTeamSheet();
      //         await this.delay(250);
      //         break;
      //     }
      // }
    }

    protected override async _postStep(): Promise<void> {
        if(this.currentStep?.id === "create-dialog") {
            this.closeDialog();
        }
        if(this.currentStep?.id === "create-party" || this.currentStep?.id === "create-team") {
            this.closeDialog(true);
        }
        if(this.currentStep?.id === "opened-party-sheet") {
            const dialog = foundry.applications.instances.get(`PartySheetPTR2e-Folder.toursantmpfolder`) as FolderConfigPTR2e | undefined;
            if(dialog) dialog.close();
        }
        if(this.currentStep?.id === "opened-team-sheet") {
            const dialog = foundry.applications.instances.get(`TeamSheetPTR2e-Folder.toursantmpfolder`) as FolderConfigPTR2e | undefined;
            if(dialog) dialog.close();
        }

        return await super._postStep();
    }

    override async complete(): Promise<void> {
        await this.cleanUp();
        return await super.complete();
    }

    override exit() {
        this.cleanUp();
        
        super.exit();
    }

    async cleanUp() {
        this.closeDialog();

        const actorsToDelete = [];

        const tourSan = game.actors.get("toursantempactor") as ActorPTR2e;
        if(tourSan) actorsToDelete.push('toursantempactor')

        const tourSanVoltorb = game.actors.get("toursanstvoltorb") as ActorPTR2e;
        if(tourSanVoltorb) actorsToDelete.push('toursanstvoltorb')

        const folder = game.folders.get("toursantmpfolder") as FolderPTR2e;
        if(folder) await folder.delete();

        await Actor.deleteDocuments(actorsToDelete);
    }

    async getDocuments(): Promise<FolderTourDocuments> {
        const data = {
            folder: await (async () => {
                return game.folders.get("toursantmpfolder") as FolderPTR2e ?? CONFIG.PTR.Folder.documentClass.create({
                    name: "Tour-san's Folder",
                    type: "Actor",
                    _id: "toursantmpfolder",
                    color: '#784a4a',
                    sort: 999999999
                },  { keepId: true });
            })(),
            tourSan: await (async () => {
                return game.actors.get("toursantempactor") as ActorPTR2e ?? CONFIG.PTR.Actor.documentClass.create({
                    name: "Tour-san",
                    type: "humanoid",
                    img: "systems/ptr2e/img/tour-san.png",
                    _id: "toursantempactor",
                    folder: "toursantmpfolder",
                },  { keepId: true });
            })(),
            tourSanVoltorb: await (async () => {
                return game.actors.get("toursanstvoltorb") as ActorPTR2e ?? CONFIG.PTR.Actor.documentClass.create({
                    name: "Tour-san's Voltorb",
                    type: "humanoid",
                    img: "systems/ptr2e/img/tour-san-voltorb.webp",
                    _id: "toursanstvoltorb",
                    folder: "toursantmpfolder",
                },  { keepId: true });
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
        if(dialog) dialog.close();
    }

    protected openTourSanDialog(folder: FolderPTR2e = game.folders.get("toursantmpfolder") as FolderPTR2e){
        const li = htmlQuery(document.body, "li.folder[data-folder-id='toursantmpfolder']");
        const r = li?.getBoundingClientRect();
        const context = r ? {document: folder, position: {top: r.top, left: r.left - FolderConfigPTR2e.DEFAULT_OPTIONS.position.width - 10}} : {document: folder};
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