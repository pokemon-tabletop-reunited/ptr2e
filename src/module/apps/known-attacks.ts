import { ActorPTR2e } from "@actor";
import { ApplicationV2Expanded } from "./appv2-expanded.ts";
import { ItemPTR2e } from "@item";
import { ActionEditor } from "./action-editor.ts";

export class KnownActionsApp extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            tag: "aside",
            classes: ["sheet known-actions-sheet"],
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
                    dragSelector: ".action",
                    dropSelector: ".window-content",
                }
            ],
            actions: {
                "action-edit": KnownActionsApp._onEditAction,
                "action-delete": KnownActionsApp._onDeleteAction,
            }
        },
        { inplace: false }
    );

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        actions: {
            id: "actions",
            template: "/systems/ptr2e/templates/apps/known-attacks.hbs",
            scrollable: [".scroll"],
        },
    };

    document: ActorPTR2e;

    override get title() {
        return `${this.document.name}'s Known Attacks`; 
    }

    constructor(document: ActorPTR2e, options: Partial<foundry.applications.api.ApplicationConfiguration> = {}) {
        options.id = `known-attacks-${document.id}`;
        super(options);
        this.document = document;
    }

    get isEditable() {
        if ( this.document.pack ) {
            const pack = game.packs.get(this.document.pack);
            if ( pack?.locked ) return false;
          }
          return this.document.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER);
    }

    override _canDragStart() {
        return this.isEditable;
    }

    override _canDragDrop() {
        return this.isEditable;
    }

    override _onDragStart(event: DragEvent) {
        const actionDiv = event.currentTarget as HTMLElement;
        const actionSlug = actionDiv.dataset.slug;
        if(!actionSlug) return;

        const action = this.document.actions.attack.get(actionSlug);
        if(!action) return;

        // Create drag data
        const dragData = action.toDragData();
        if(!dragData) return;
    
        // Set data transfer
        event.dataTransfer!.setData("text/plain", JSON.stringify(dragData));
    }

    override async _onDrop(event: DragEvent) {
        const data = TextEditor.getDragEventData<DropCanvasData>(event);
        const item = await ItemPTR2e.fromDropData(data);
        if (!item || item.type !== "move" || item.parent?.uuid === this.document.uuid) return;

        this.document.createEmbeddedDocuments("Item", [item.toObject()]);
    }

    override async _prepareContext() {
        const attacks = this.document.actions.attack.filter(action => !action.free);
        return {
            document: this.document,
            attacks
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

    protected static async _onEditAction(this: KnownActionsApp, event: Event) {
        const actionDiv = (event.target as HTMLElement).closest(".action") as HTMLElement;
        if (!actionDiv) return;

        const slug = actionDiv.dataset.slug;
        if (!slug) return;

        const action = this.document.actions.get(slug);
        if (!action) return;

        new ActionEditor(action.item, action.slug).render(true);
    }

    protected static async _onDeleteAction(this: KnownActionsApp, event: Event) {
        const actionDiv = (event.target as HTMLElement).closest(".action") as HTMLElement;
        if (!actionDiv) return;

        const slug = actionDiv.dataset.slug;
        if (!slug) return;

        const action = this.document.actions.get(slug);
        if (!action) return;

        const item = action.item;

        foundry.applications.api.DialogV2.confirm({
            window: {
                title: game.i18n.localize("PTR2E.Dialog.DeleteAction.Title"),
            },
            content: game.i18n.format("PTR2E.Dialog.DeleteAction.Content", { name: item.name }),
            yes: {
                callback: async () => {
                    await item.delete();
                },
            },
        });
    }

    get actor() {
        return this.document;
    }

    /** @override */
    override _onFirstRender() {
        if(!this.actor) return;
        //@ts-expect-error
        this.actor.apps[this.id] = this;
    }

    /* -------------------------------------------- */

    /** @override */
    override _onClose() {
        if(!this.actor) return;
        //@ts-expect-error
        delete this.actor.apps[this.id];
    }
}