import { ItemSheetOptions, MovePTR2e } from "@item";
import { ItemSheetPTR2e } from "@item";
import { ActionPTR2e, AttackPTR2e } from "@data";
import { sluggify } from "@utils";
import { DocumentSheetConfiguration, DocumentSheetV2 } from "./document.ts";
import Tagify from "@yaireo/tagify";

type Tab = {
    id: string;
    group: string;
    icon: string;
    label: string;
    active?: boolean;
    cssClass?: string;
};

export class MoveSheetPTR2eV2 extends foundry.applications.api.HandlebarsApplicationMixin(
    DocumentSheetV2<MovePTR2e>
) {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["move-sheet"],
            position: {
                height: 450,
                width: 550,
            },
            form: {
                submitOnChange: true,
                closeOnSubmit: false,
            },
        },
        { inplace: false }
    );

    #allTraits: {value: string, label: string}[] | undefined;

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        header: {
            id: "header",
            template: "/systems/ptr2e/templates/items/parts/item-header.hbs",
        },
        tabs: {
            id: "tabs",
            template: "/systems/ptr2e/templates/items/parts/item-tabs.hbs",
        },
        traits: {
            id: "traits",
            template: "/systems/ptr2e/templates/items/parts/item-traits.hbs",
        },
        overview: {
            id: "overview",
            template: "/systems/ptr2e/templates/items/move/move-overview.hbs",
        },
        details: {
            id: "details",
            template: "/systems/ptr2e/templates/items/move/move-details.hbs",
        },
        attack: {
            id: "attack",
            template: "/systems/ptr2e/templates/items/move/move-attack.hbs",
            scrollable: [".scroll"],
            forms: {
                "#attack": {
                    handler: this._submitAttack,
                    closeOnSubmit: false,
                    submitOnChange: true,
                },
            },
        },
        effects: {
            id: "effects",
            template: "/systems/ptr2e/templates/items/move/move-effects.hbs",
        },
    };

    tabGroups: Record<string, string> = {
        sheet: "overview",
    };

    tabs: Record<string, Tab> = {
        overview: {
            id: "overview",
            group: "sheet",
            icon: "fa-solid fa-house",
            label: "PTR2E.MoveSheet.Tabs.overview.label",
        },
        details: {
            id: "details",
            group: "sheet",
            icon: "fa-solid fa-cogs",
            label: "PTR2E.MoveSheet.Tabs.details.label",
        },
        attack: {
            id: "attack",
            group: "sheet",
            icon: "fa-solid fa-bullseye",
            label: "PTR2E.MoveSheet.Tabs.attack.label",
        },
        effects: {
            id: "effects",
            group: "sheet",
            icon: "fa-solid fa-star",
            label: "PTR2E.MoveSheet.Tabs.effects.label",
        },
    };

    _getTabs() {
        for (const v of Object.values(this.tabs)) {
            v.active = this.tabGroups[v.group] === v.id;
            v.cssClass = v.active ? "active" : "";
        }
        return this.tabs;
    }

    override changeTab(
        tab: string,
        group: string,
        {
            event,
            navElement,
            force = false,
            updatePosition = true,
        }: { event?: Event; navElement?: HTMLElement; force: boolean; updatePosition: boolean } = {
            force: false,
            updatePosition: true,
        }
    ): void {
        super.changeTab(tab, group, { event, navElement, force, updatePosition });
        if (!updatePosition) return;

        if (tab === "attack") {
            this.setPosition({ height: 700 });
        } else {
            this.setPosition({ height: 450 });
        }
    }

    override async _prepareContext() {
        const attack = this.document.actions.attack.values().next().value as
            | AttackPTR2e
            | undefined;

        const traits = await (async () => {
            const traits = [];
            for (const trait of this.document.system.traits.values()) {
                traits.push({
                    value: trait.slug,
                    label: trait.label
                });
            }
            return traits;
        })();

        if(!this.#allTraits) {
            this.#allTraits = [];
            for (const trait of game.ptr.data.traits.values()) {
                this.#allTraits.push({
                    value: trait.slug,
                    label: trait.label
                });
            }
        }

        return {
            ...((await super._prepareContext()) as Record<string, unknown>),
            item: this.document,
            source: this.document.toObject(),
            fields: this.document.system.schema.fields,
            tabs: this._getTabs(),
            traits,
            attack: {
                attack: attack,
                source: attack?._source,
                fields: attack?.schema.fields,
            },
        };
    }

    override _attachPartListeners(
        partId: string,
        htmlElement: HTMLElement,
        options: DocumentSheetConfiguration<MovePTR2e>
    ): void {
        super._attachPartListeners(partId, htmlElement, options);

        if (partId === "traits") {
            for (const input of htmlElement.querySelectorAll<HTMLInputElement>(
                "input.ptr2e-tagify"
            )) {
                new Tagify(input, {
                    enforceWhitelist: true,
                    keepInvalidTags: false,
                    editTags: false,
                    tagTextProp: "label",
                    dropdown: {
                        enabled: 0,
                        mapValueTo: "label",
                    },
                    templates: {
                        tag: function(tagData) {
                            return `
                            <tag contenteditable="false" spellcheck="false" tabindex="-1" class="tagify__tag" ${this.getAttributes(tagData)}>
                            <x title="" class="tagify__tag__removeBtn" role="button" aria-label="remove tag"></x>
                            <div>
                                <span class='tagify__tag-text'>
                                    <span class="trait" data-tooltip-direction="UP" data-trait="${tagData.value}" data-tooltip="${tagData.label}"><span>[</span><span class="tag">${tagData.label}</span><span>]</span></span>
                                </span>
                            </div>
                            `;
                        },
                    },
                    whitelist: this.#allTraits
                });
            }
        }
    }

    override _prepareSubmitData(formData: FormDataExtended): Record<string, unknown> {
        const data = fu.expandObject(formData.object);
        if('system' in data && data.system && typeof data.system === 'object') {
            if('traits' in data.system && data.system.traits && Array.isArray(data.system.traits) && data.system.traits.length) {
                data.system.traits = data.system.traits.map((trait: {value: string}) => trait.value);
            }
        }
        return data;
    }

    static async _submitAttack(
        this: MoveSheetPTR2eV2,
        _event: SubmitEvent | Event,
        _form: HTMLFormElement,
        formData: FormDataExtended
    ) {
        const actions = fu.duplicate(this.document.system._source.actions);
        const attackIndex = actions.findIndex((action) => action.type === "attack");
        if (attackIndex === -1) return;

        const expanded = fu.expandObject(formData.object).attack as AttackPTR2e["_source"];
        actions[attackIndex] = fu.mergeObject(actions[attackIndex], expanded, { inplace: false });
        actions[attackIndex].slug = sluggify(actions[attackIndex].name);
        actions[attackIndex].description = this.document.system._source.description;
        //@ts-expect-error
        actions[attackIndex].traits = this.document.system._source.traits;
        await this.document.update({ "system.actions": actions });
    }
}

export default class MoveSheetPTR2e extends ItemSheetPTR2e<MovePTR2e> {
    static override get defaultOptions() {
        return foundry.utils.mergeObject(
            super.defaultOptions,
            {
                classes: ["move", "ptr2e"],
                template: "/systems/ptr2e/templates/items/move.hbs",
                width: 365,
                height: 550,
                tabs: [
                    {
                        navSelector: ".tabs",
                        contentSelector: ".sheet-body",
                        initial: "description",
                    },
                ],
            },
            { inplace: false }
        );
    }

    override async getData(
        option?: Partial<ItemSheetOptions> | undefined
    ): Promise<ItemSheetData<MovePTR2e>> {
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
                            const newIndex =
                                (Number(lastAction?.slug.split("-").at(-1) ?? 0) || 0) + 1;
                            actions.push(
                                new ActionPTR2e({
                                    slug: `${this.item.slug}-attack-${newIndex}`,
                                    name: `${this.item.name} Attack ${newIndex}`,
                                    type: "attack",
                                })
                            );
                            return this.item.update({ "system.actions": actions });
                        }
                    }
                    break;
                case "delete": {
                    switch (type) {
                        case "attack": {
                            const parent = control.closest(
                                ".attack-action[data-target]"
                            ) as HTMLElement;
                            const slug = parent?.dataset.target;
                            if (!slug) return;
                            const actions = fu
                                .duplicate(this.item.system._source.actions)
                                .filter((action: ActionPTR2e) => action.slug !== slug);
                            return this.item.update({ "system.actions": actions });
                        }
                        case "move": {
                            return Dialog.confirm({
                                title: `Delete ${this.item.name}`,
                                content: `Are you sure you want to delete ${this.item.name} from ${
                                    this.actor!.name
                                }?`,
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
                if ("power" in action && "category" in action) {
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
};
type ExpandedMoveUpdateData = {
    system: {
        actions: Record<number, ActionPTR2e>;
    };
    [key: string]: unknown;
};
