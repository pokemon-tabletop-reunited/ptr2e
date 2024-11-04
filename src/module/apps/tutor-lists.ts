import { ActorPTR2e } from "@actor";
import { ApplicationV2Expanded } from "./appv2-expanded.ts";
import { ItemPTR2e } from "@item";
// import MoveSystem from "@item/data/move.ts";
import { MoveSystemModel } from "@item/data/index.ts";
// import { ActionEditor } from "./action-editor.ts";

export class TutorListsApp extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      tag: "aside",
      classes: ["sheet", "tutor-lists-sheet"],
      position: {
        height: 'auto',
        width: 230,
      },
      window: {
        minimizable: true,
        resizable: false,
      },
      dragDrop: [
        {
          dragSelector: ".move",
          dropSelector: ".window-content",
        }
      ],
      actions: {}
    },
    { inplace: false }
  );

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    actions: {
      id: "actions",
      template: "systems/ptr2e/templates/apps/tutor-lists.hbs",
      scrollable: [".scroll"],
    },
  };

  document: ActorPTR2e;
  _tutorMoves: Record<string, PartialItem>;

  override get title() {
    return `${this.document.name}'s Tutorable Moves`;
  }

  constructor(document: ActorPTR2e, options: Partial<foundry.applications.api.ApplicationConfiguration> = {}) {
    options.id = `tutor-list-${document.id}`;
    super(options);
    this.document = document;

    // populate _tutorMoves
    this.tutorMoves();
  }

  get isEditable() {
    if (this.document.pack) {
      const pack = game.packs.get(this.document.pack);
      if (pack?.locked) return false;
    }
    return this.document.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER);
  }

  override _canDragStart() {
    return this.isEditable;
  }

  override _canDragDrop() {
    return false;
  }

  override _onDragStart(event: DragEvent) {
    const moveDiv = event.currentTarget as HTMLElement;
    const moveSlug = moveDiv.dataset.slug;
    if (!moveSlug) return;

    const tutorMoves = this._tutorMoves;
    if (!tutorMoves || !(moveSlug in tutorMoves)) return;
    const move = tutorMoves[moveSlug];
    if (!move) return;

    // Create drag data
    const dragData = {
        type: "Item",
        uuid: move.uuid,
    }

    // Set data transfer
    event.dataTransfer!.setData("text/plain", JSON.stringify(dragData));
  }

//   override async _onDrop(event: DragEvent) {
//     const data = TextEditor.getDragEventData<DropCanvasData>(event);
//     const item = await ItemPTR2e.fromDropData(data);
//     if (!item || item.type !== "move" || item.parent?.uuid === this.document.uuid) return;

//     this.document.createEmbeddedDocuments("Item", [item.toObject()]);
//   }

  hasTutorList(tutorList: any): boolean {
    switch (tutorList!.sourceType) {
        case "universal": return true;
        case "trait": return this.document.system.traits.has(tutorList.slug);
        case "egg": return this.document.system.species?.eggGroups.has(tutorList.slug) ?? false;
        case "ability": return this.document.items.find(i=>i.type === "ability" && (i as ItemPTR2e).system.slug === tutorList.slug) != null;
    }
    return false;
  }

  canTutor(move: any): boolean {
    if (this.document.system.species?.moves.levelUp.find(m=>m.uuid === move.uuid)) return true;
    if (this.document.system.species?.moves.tutor.find(m=>m.uuid === move.uuid)) return true;
    return move?.system?.tutorLists?.some?.((t:any)=>this.hasTutorList(t));
  }

  async tutorMoves(): Promise<Record<string, PartialItem>>{
    return this._tutorMoves ??= await (async ()=>{
        const allMoves = await game.packs.get("ptr2e.core-moves")!.getIndex({ fields: ["name", "uuid", "system.slug", "system.grade", "system.tutorLists"] })
        const tutorableMoves = allMoves.filter(m=>this.canTutor(m));

        return tutorableMoves.reduce((tm, m)=>{
            if (!m) return tm;
            tm[(m as unknown as PartialItem).system.slug] = m as unknown as PartialItem;
            return tm;
        }, {} as Record<string, PartialItem>);
    })();
  }

  override async _prepareContext() {
    // const attacks = this.document.actions.attack.filter(action => !action.free);

    const tutorMoves = await this.tutorMoves();

    return {
      document: this.document,
      moves: tutorMoves,
    };
  }

  override async _renderFrame(options: foundry.applications.api.HandlebarsRenderOptions) {
    const frame = await super._renderFrame(options);

    // Add send to chat button
    const infoLabel = game.i18n.localize("PTR2E.ActorSheet.KnownAttacks.hint");
    const info = `<button type="button" class="header-control fa-solid fa-circle-question info-tooltip" 
                                data-tooltip="${infoLabel}" aria-label="${infoLabel}" data-tooltip-direction="UP"></button>`;
    this.window.controls.insertAdjacentHTML("afterend", info);


    return frame;
  }

//   protected static async _onEditAction(this: KnownActionsApp, event: Event) {
//     const actionDiv = (event.target as HTMLElement).closest(".action") as HTMLElement;
//     if (!actionDiv) return;

//     const slug = actionDiv.dataset.slug;
//     if (!slug) return;

//     const action = this.document.actions.get(slug);
//     if (!action) return;

//     new ActionEditor(action.item, action.slug).render(true);
//   }

//   protected static async _onDeleteAction(this: KnownActionsApp, event: Event) {
//     const actionDiv = (event.target as HTMLElement).closest(".action") as HTMLElement;
//     if (!actionDiv) return;

//     const slug = actionDiv.dataset.slug;
//     if (!slug) return;

//     const action = this.document.actions.get(slug);
//     if (!action) return;

//     const item = action.item;

//     foundry.applications.api.DialogV2.confirm({
//       window: {
//         title: game.i18n.localize("PTR2E.Dialog.DeleteAction.Title"),
//       },
//       content: game.i18n.format("PTR2E.Dialog.DeleteAction.Content", { name: item.name }),
//       yes: {
//         callback: async () => {
//           await item.delete();
//         },
//       },
//     });
//   }

  get actor() {
    return this.document;
  }

  /** @override */
  override _onFirstRender() {
    if (!this.actor) return;
    //@ts-expect-error - AppV1 Compatibility
    this.actor.apps[this.id] = this;
  }

  /* -------------------------------------------- */

  /** @override */
  override _onClose() {
    if (!this.actor) return;
    //@ts-expect-error - AppV1 Compatibility
    delete this.actor.apps[this.id];
  }
}


type PartialItem = { name: string; uuid: string, system: Pick<MoveSystemModel, 'slug' | 'grade' | 'tutorLists'> } 