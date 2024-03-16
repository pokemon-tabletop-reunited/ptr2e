import { ItemSheetOptions, MovePTR2e } from "@item";
import { ItemSheetPTR2e } from "@item";
import { ActionPTR2e } from "@data";
import { sluggify } from "@utils";
import { DocumentSheetConfiguration, DocumentSheetV2 } from "./document.ts";

type Tab = {
    id: string,
    group: string,
    icon: string,
    label: string,
    active?: boolean,
    cssClass?: string
}

export class MoveSheetPTR2eV2 extends foundry.applications.api.HandlebarsApplicationMixin(DocumentSheetV2<MovePTR2e>) {
    static override DEFAULT_OPTIONS = fu.mergeObject(super.DEFAULT_OPTIONS, {
        classes: ["move-sheet"],
        position: {
            height: 500,
            width: 700,
        },
        form: {
            submitOnChange: true,
            closeOnSubmit: false,
        }
    }, { inplace: false });

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        header: {
            id: "header",
            template: "/systems/ptr2e/templates/items/parts/item-header.hbs"
        },
        tabs: {
            id: "tabs",
            template: "/systems/ptr2e/templates/items/parts/item-tabs.hbs"
        },
        traits: {
            id: "traits",
            template: "/systems/ptr2e/templates/items/parts/item-traits.hbs"
        },
        overview: {
            id: "overview",
            template: "/systems/ptr2e/templates/items/move/move-overview.hbs"
        },
        details: {
            id: "details",
            template: "/systems/ptr2e/templates/items/move/move-details.hbs"
        },
        actions: {
            id: "actions",
            template: "/systems/ptr2e/templates/items/move/move-actions.hbs"
        },
        effects: {
            id: "effects",
            template: "/systems/ptr2e/templates/items/move/move-effects.hbs"
        },
        
    }

    tabGroups: Record<string, string> = {
        sheet: "overview"
    }

    tabs: Record<string, Tab> = {
        overview: {
            id: "overview",
            group: "sheet",
            icon: "fa-solid fa-house",
            label: "PTR2E.MoveSheet.Tabs.overview.label"
        }, 
        details: {
            id: "details",
            group: "sheet",
            icon: "fa-solid fa-cogs",
            label: "PTR2E.MoveSheet.Tabs.details.label"
        }, 
        actions: {
            id: "actions",
            group: "sheet",
            icon: "fa-solid fa-bullseye",
            label: "PTR2E.MoveSheet.Tabs.actions.label"
        }, 
        effects: {
            id: "effects",
            group: "sheet",
            icon: "fa-solid fa-star",
            label: "PTR2E.MoveSheet.Tabs.effects.label"
        }
    }

    _getTabs() {
        for(const v of Object.values(this.tabs)) {
            v.active = this.tabGroups[v.group] === v.id;
            v.cssClass = v.active ? "active" : "";
        }
        console.debug(this.tabs)
        return this.tabs;
    }

    override async _prepareContext() {
        return {
            ...(await super._prepareContext() as Record<string, unknown>),
            item: this.document,
            source: this.document.toObject(),
            fields: this.document.system.schema.fields,
            tabs: this._getTabs(),
            traits: this.document.system.traits
        }
    }

    override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: DocumentSheetConfiguration<MovePTR2e>): void {
        super._attachPartListeners(partId, htmlElement, options);
    }
}

export default class MoveSheetPTR2e extends ItemSheetPTR2e<MovePTR2e> {
    static override get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["move", "ptr2e"],
            template: "/systems/ptr2e/templates/items/move.hbs",
            width: 365,
            height: 550,
            tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "description" }],
        }, { inplace: false });
    }

    override async getData(option?: Partial<ItemSheetOptions> | undefined): Promise<ItemSheetData<MovePTR2e>> {
        const data = await super.getData(option);
        if (this.actor) {
            data.owned = true;
        }
        return data;
    }

    override activateListeners(html: JQuery) {
        super.activateListeners(html);

        html.find(".item-control").on("click", (event) => {
            event.preventDefault();
            const control = event.currentTarget;
            const { type, action } = control.dataset;
            switch (action) {
                case "create":
                    switch (type) {
                        case "attack": {
                            const actions = fu.duplicate(this.item.system._source.actions);
                            const lastAction = actions.at(-1);
                            const newIndex = (Number(lastAction?.slug.split("-").at(-1) ?? 0) || 0) + 1;
                            actions.push(new ActionPTR2e({
                                slug: `${this.item.slug}-attack-${newIndex}`,
                                name: `${this.item.name} Attack ${newIndex}`,
                                type: "attack",
                            }));
                            return this.item.update({ "system.actions": actions });
                        }
                    }
                    break;
                case "delete": {
                    switch (type) {
                        case "attack": {
                            const parent = control.closest(".attack-action[data-target]") as HTMLElement;
                            const slug = parent?.dataset.target;
                            if (!slug) return;
                            const actions = fu.duplicate(this.item.system._source.actions).filter((action: ActionPTR2e) => action.slug !== slug);
                            return this.item.update({ "system.actions": actions });
                        }
                        case "move": {
                            return Dialog.confirm({
                                title: `Delete ${this.item.name}`,
                                content: `Are you sure you want to delete ${this.item.name} from ${this.actor!.name}?`,
                                yes: () => this.item.delete(),
                            });
                        }
                    }
                    break;
                }
                default:
                    break;
            }
            return;
        });

        html.find(".form-fields select[name]").on("change", this._onSubmit.bind(this));
    }

    protected override _updateObject(event: Event, formData: MoveUpdateData): Promise<void> {
        const expanded = fu.expandObject<ExpandedMoveUpdateData>(formData);
        if (expanded.system?.actions) {
            const actions = fu.duplicate(this.item.system._source.actions);
            for (const [index, action] of Object.entries(expanded.system.actions)) {
                const currentAction = actions[Number(index)];
                if (currentAction.name !== action.name) {
                    action.slug = sluggify(action.name);
                }
                if ('power' in action && 'category' in action) {
                    if (action.category === "status") {
                        action.power = null;
                    }
                }
                actions[Number(index)] = fu.mergeObject(currentAction, action, { inplace: false });
            }
            expanded.system.actions = actions;
            formData = fu.flattenObject(expanded) as MoveUpdateData;
        }
        return super._updateObject(event, formData);
    }
}

type MoveUpdateData = {
    "system.actions": ActionPTR2e[];
    [key: string]: unknown;
}
type ExpandedMoveUpdateData = {
    system: {
        actions: Record<number, ActionPTR2e>;
    }
    [key: string]: unknown;
}