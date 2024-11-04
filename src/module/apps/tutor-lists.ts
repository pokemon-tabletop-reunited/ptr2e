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
        width: 460,
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
      actions: {
        "open-tutor-reference": ()=>{
            const tutoringLink = CONFIG.PTR.references.tutoring;
            fromUuid(tutoringLink.uuid).then(page=>{
                if (!page) return;
                // @ts-ignore
                page.parent!.sheet.render(true, {pageId: page.id, anchor: tutoringLink.hash});
            });
        }
      }
    },
    { inplace: false }
  );

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    list: {
      id: "list",
      template: "systems/ptr2e/templates/apps/tutor-lists.hbs",
      scrollable: [".scroll"],
    },
  };

  document: ActorPTR2e;
  _tutorMoves: Record<string, PartialItem>;
  _toggles: Record<string, TutorListButton>;

  override get title() {
    return `${this.document.name}'s Tutorable Moves`;
  }

  constructor(document: ActorPTR2e, options: Partial<foundry.applications.api.ApplicationConfiguration> = {}) {
    options.id = `tutor-list-${document.id}`;
    super(options);
    this.document = document;

    // populate _tutorMoves
    this.tutorMoves();
    this.toggles();
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

  hasTutorList(tutorList: TutorList): boolean {
    switch (tutorList!.sourceType) {
        case "universal": return true;
        case "trait": return this.document.system.traits.has(tutorList.slug);
        case "egg": return this.document.system.species?.eggGroups.has(tutorList.slug) ?? false;
        case "ability": return this.document.items.find(i=>i.type === "ability" && (i as ItemPTR2e).system.slug === tutorList.slug) != null;
    }
    return false;
  }

  tutorFromSpecies(move: any): boolean {
    if (this.document.system.species?.moves.levelUp.find(m=>m.uuid === move.uuid)) return true;
    if (this.document.system.species?.moves.tutor.find(m=>m.uuid === move.uuid)) return true;
    return false;
  }

  canTutor(move: any): boolean {
    return this.tutorFromSpecies(move) || move?.system?.tutorLists?.some?.((t:any)=>this.hasTutorList(t));
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

  async toggles(): Promise<Record<string, TutorListButton>> {
    return this._toggles ??= await (async ()=>{
        const speciesSlug = this.document.system.species?.slug ?? "unknown-species"
        const toggles = {
            [speciesSlug]: {
                slug: speciesSlug,
                label: this.document.system.species?.parent?.name ?? "Species",
                tutorList: { slug: "", sourceType: "species" },
                enabled: true
            },
        } as Record<string, TutorListButton>;
        const tutorMoves = await this.tutorMoves();
        for (const move of Object.values(tutorMoves)) {
            for (const tutorList of ((move?.system?.tutorLists ?? []) as TutorList[])) {
                if (!!tutorList && this.hasTutorList(tutorList)) {
                    const slug = `${tutorList.sourceType}:${tutorList.slug}`;
                    const label = (()=>{
                        if (tutorList.sourceType == "universal")
                            return "Universal";
                        if (tutorList.sourceType == "trait")
                            return `[${game.ptr.data.traits.get(tutorList.slug)?.label ?? tutorList.slug.titleCase()}]`;
                        return `${tutorList.sourceType?.titleCase?.()}: ${tutorList.slug?.titleCase?.()}`;
                    })();
                    toggles[slug] = {
                        slug,
                        label,
                        tutorList,
                        enabled: true
                    };
                }
            }
        }
        return toggles;
    })();
  }

  async filteredMoves(): Promise<Record<string, PartialItem>> {
    const tutorMoves = await this.tutorMoves();
    const toggles = await this.toggles();
    const moves = {} as Record<string, PartialItem>;
    for (const toggle of Object.values(toggles)) {
        if (!toggle.enabled) continue;
        if (toggle.tutorList.sourceType == "species") {
            Object.entries(tutorMoves).forEach(([moveSlug, tm])=>{
                if (!(moveSlug in moves) && this.tutorFromSpecies(tm)) moves[moveSlug] = tm;
            })
            continue;
        }
        Object.entries(tutorMoves).forEach(([moveSlug, tm])=>{
            if (moveSlug in moves) return;
            // @ts-ignore
            if (tm?.system?.tutorLists?.find?.(tl=>tl.slug === toggle.tutorList.slug && tl.sourceType === toggle.tutorList.sourceType)) moves[moveSlug] = tm;
        })
    }

    return moves;
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);
    if (partId === "list") {
        for (const toggle of htmlElement.querySelectorAll(".toggle")) {
            toggle.addEventListener("click", this._onToggle.bind(this));
        }
    }
  }

  override async _prepareContext() {
    // const attacks = this.document.actions.attack.filter(action => !action.free);

    const toggles = await this.toggles();
    const moves = await this.filteredMoves();

    return {
      document: this.document,
      toggles,
      moves,
    };
  }

  override async _renderFrame(options: foundry.applications.api.HandlebarsRenderOptions) {
    const frame = await super._renderFrame(options);

    // Add send to chat button
    const infoLabel = game.i18n.localize("PTR2E.ActorSheet.TutorLists.hint");
    const info = `<button class="header-control fa-solid fa-circle-question info-tooltip tutoring-reference"
                                data-action="open-tutor-reference" 
                                data-tooltip="${infoLabel}" aria-label="${infoLabel}" data-tooltip-direction="UP"></button>`;
    this.window.controls.insertAdjacentHTML("afterend", info);
    
    return frame;
  }

  protected _onToggle(event: Event) {
    const toggleSlug = (event.target as HTMLElement)?.dataset?.slug;
    if (!toggleSlug) return;
    const toggle = this._toggles[toggleSlug];
    if (!toggle) return;
    toggle.enabled = !toggle.enabled;
    this.render({});
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
type TutorList = { slug: string; sourceType: string };
type TutorListButton = { slug: string; label: string; tutorList: TutorList; enabled: boolean; };

