import { ActorPTR2e } from "@actor";
import { ApplicationV2Expanded } from "./appv2-expanded.ts";
import { AbilityPTR2e, ItemPTR2e } from "@item";

export class AvailableAbilitiesApp extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            tag: "aside",
            classes: ["sheet available-abilities-sheet"],
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
                    dragSelector: ".ability",
                    dropSelector: ".window-content",
                }
            ],
            actions: {
                "ability-edit": AvailableAbilitiesApp._onEditAction,
                "ability-delete": AvailableAbilitiesApp._onDeleteAction,
            }
        },
        { inplace: false }
    );

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        actions: {
            id: "actions",
            template: "/systems/ptr2e/templates/apps/available-abilities.hbs",
            scrollable: [".scroll"],
        },
    };

    document: ActorPTR2e;

    override get title() {
        return `${this.document.name}'s Available Abilities`; 
    }

    constructor(document: ActorPTR2e, options: Partial<foundry.applications.api.ApplicationConfiguration> = {}) {
        options.id = `available-abilities-${document.id}`;
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
        const abilityId = actionDiv.dataset.id;
        if(!abilityId) return;

        const ability = this.document.items.get(abilityId);
        if(!ability) return;

        // Create drag data
        const dragData = ability.toDragData();
        if(!dragData) return;
    
        // Set data transfer
        event.dataTransfer!.setData("text/plain", JSON.stringify(dragData));
    }

    override async _onDrop(event: DragEvent) {
        const data = TextEditor.getDragEventData<DropCanvasData>(event);
        const item = await ItemPTR2e.fromDropData(data);
        if (!item || item.type !== "ability" || item.parent?.uuid === this.document.uuid) return;

        this.document.createEmbeddedDocuments("Item", [item.toObject()]);
    }

    override async _prepareContext() {
        const abilities = (this.document.itemTypes.ability as AbilityPTR2e[]).filter(a => !a.system.free);
        return {
            document: this.document,
            abilities
        };
    }

    override async _renderFrame(options: foundry.applications.api.HandlebarsRenderOptions) {
        const frame = await super._renderFrame(options);

        // Add send to chat button
        const infoLabel = game.i18n.localize("PTR2E.ActorSheet.AvailableAbilities.hint");
        const info = `<button type="button" class="header-control fa-solid fa-circle-question info-tooltip" 
                                data-tooltip="${infoLabel}" aria-label="${infoLabel}" data-tooltip-direction="UP"></button>`;
        this.window.controls.insertAdjacentHTML("afterend", info);


        return frame;
    }

    protected static async _onEditAction(this: AvailableAbilitiesApp, event: Event) {
        const abilityDiv = (event.target as HTMLElement).closest(".ability") as HTMLElement;
        if (!abilityDiv) return;

        const id = abilityDiv.dataset.id;
        if (!id) return;

        const ability = this.document.items.get(id);
        if (!ability) return;

        ability.sheet.render(true);
    }

    protected static async _onDeleteAction(this: AvailableAbilitiesApp, event: MouseEvent) {
        const abilityDiv = (event.target as HTMLElement).closest(".ability") as HTMLElement;
        if (!abilityDiv) return;

        const id = abilityDiv.dataset.id;
        if (!id) return;

        const ability = this.document.items.get(id);
        if (!ability) return;

        // Confirm the deletion unless the user is holding Shift
        return event.shiftKey ? ability.delete() : foundry.applications.api.DialogV2.confirm({
            yes: {
                callback: () => ability.delete(),
            },
            content: game.i18n.format("PTR2E.Dialog.DeleteDocumentContent", {
                name: ability.name,
            }),
            window: {
                title: game.i18n.format("PTR2E.Dialog.DeleteDocumentTitle", {
                    name: ability.name,
                }),
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