import { ItemPTR2e, ItemSystemPTR, SpeciesPTR2e } from "@item";
import ActorPTR2e from "./base.ts";
import { SpeciesDropSheet } from "./sheets/species-drop-sheet.ts";
import { SpeciesSystemModel } from "@item/data/index.ts";
import { htmlQueryAll, sluggify } from "@utils";
import { Tab } from "@item/sheets/document.ts";
import { ActorComponentKey, ActorComponents, ComponentPopout } from "./components/sheet.ts";
import { EffectComponent } from "./components/effect-component.ts";
import GearSystem from "@item/data/gear.ts";
import WeaponSystem from "@item/data/weapon.ts";
import ConsumableSystem from "@item/data/consumable.ts";
import EquipmentSystem from "@item/data/equipment.ts";
import ContainerSystem from "@item/data/container.ts";
import { KnownActionsApp } from "@module/apps/known-attacks.ts";
import { ActorSheetV2Expanded } from "@module/apps/appv2-expanded.ts";
import { ActionEditor } from "@module/apps/action-editor.ts";

class ActorSheetPTRV2 extends foundry.applications.api.HandlebarsApplicationMixin(
    ActorSheetV2Expanded
) {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["ptr2e", "sheet", "actor", "v2"],
            position: {
                width: 900,
                height: 660,
            },
            window: {
                resizable: true,
            },
            form: {
                submitOnChange: true,
            },
            dragDrop: [
                {
                    dropSelector: ".window-content",
                }
            ],
            actions: {
                "species-header": async function (this: ActorSheetPTRV2, event: Event) {
                    event.preventDefault();
                    const species = this.actor.system.species!;
                    const sheet = new SpeciesDropSheet((item) => {
                        if (!item) return;
                        if (
                            !(
                                item instanceof CONFIG.Item.documentClass &&
                                item.system instanceof SpeciesSystemModel
                            )
                        )
                            return;
                        if (item.slug !== species.slug) {
                            const species = item.toObject().system;
                            species.slug ||= sluggify(item.name);
                            this.actor.update({ "system.species": species });
                        }
                    });
                    sheet.species = new CONFIG.Item.documentClass({
                        name: this.document.hasEmbeddedSpecies()
                            ? Handlebars.helpers.formatSlug(species.slug)
                            : this.actor.name,
                        type: "species",
                        img: this.actor.img,
                        flags: { ptr2e: { disabled: !this.actor.system._source.species } },
                        system: species.toObject(),
                    }) as SpeciesPTR2e;
                    sheet.render(true);
                },
                "open-perk-web": function (this: ActorSheetPTRV2, _event: Event) {
                    game.ptr.web.open(this.actor);
                },
                "edit-movelist": function (this: ActorSheetPTRV2, _event: Event) {
                    new KnownActionsApp(this.actor).render(true);
                },
                "action-to-chat": ActorSheetPTRV2._onToChatAction,
                "action-edit": ActorSheetPTRV2._onEditAction,
                "action-delete": ActorSheetPTRV2._onDeleteAction,
            },
        },
        { inplace: false }
    );

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        header: {
            id: "header",
            template: "systems/ptr2e/templates/actor/actor-header.hbs",
        },
        nav: {
            id: "nav",
            template: "systems/ptr2e/templates/actor/actor-nav.hbs",
        },
        sidebar: {
            id: "sidebar",
            template: "systems/ptr2e/templates/actor/actor-sidebar.hbs",
        },
        overview: {
            id: "overview",
            template: "systems/ptr2e/templates/actor/actor-overview.hbs",
        },
        actions: {
            id: "actions",
            template: "systems/ptr2e/templates/actor/actor-actions.hbs",
        },
        inventory: {
            id: "inventory",
            template: "systems/ptr2e/templates/actor/actor-inventory.hbs",
        },
        clocks: {
            id: "clocks",
            template: "systems/ptr2e/templates/actor/actor-clocks.hbs",
        },
        skills: {
            id: "skills",
            template: "systems/ptr2e/templates/actor/actor-skills.hbs",
        },
        perks: {
            id: "perks",
            template: "systems/ptr2e/templates/actor/actor-perks.hbs",
        },
        biography: {
            id: "biography",
            template: "systems/ptr2e/templates/actor/actor-biography.hbs",
        },
        effects: {
            id: "effects",
            template: "systems/ptr2e/templates/actor/actor-effects.hbs",
        },
    };

    tabGroups: Record<string, string> = {
        sheet: "overview",
        actions: "actionsCombat",
    };

    subtabs: Record<string, Tab> = {
        actionsCombat: {
            id: "actionsCombat",
            group: "actions",
            icon: "fa-solid fa-burst",
            label: "PTR2E.ActorSheet.Tabs.actions.combat.label",
        },
        actionsDowntime: {
            id: "actionsDowntime",
            group: "actions",
            icon: "fa-solid fa-clock",
            label: "PTR2E.ActorSheet.Tabs.actions.downtime.label",
        },
        actionsOther: {
            id: "actionsOther",
            group: "actions",
            icon: "fa-solid fa-dice-d20",
            label: "PTR2E.ActorSheet.Tabs.actions.other.label",
        },
    };

    tabs: Record<string, Tab> = {
        overview: {
            id: "overview",
            group: "sheet",
            icon: "fa-solid fa-house",
            label: "PTR2E.ActorSheet.Tabs.overview.label",
        },
        actions: {
            id: "actions",
            group: "sheet",
            icon: "fa-solid fa-burst",
            label: "PTR2E.ActorSheet.Tabs.actions.label",
        },
        inventory: {
            id: "inventory",
            group: "sheet",
            icon: "fa-solid fa-suitcase",
            label: "PTR2E.ActorSheet.Tabs.inventory.label",
        },
        skills: {
            id: "skills",
            group: "sheet",
            icon: "fa-solid fa-dice-d20",
            label: "PTR2E.ActorSheet.Tabs.skills.label",
        },
        clocks: {
            id: "clocks",
            group: "sheet",
            icon: "fa-solid fa-clock",
            label: "PTR2E.ActorSheet.Tabs.clocks.label",
        },
        perks: {
            id: "perks",
            group: "sheet",
            icon: "fa-solid fa-crown",
            label: "PTR2E.ActorSheet.Tabs.perks.label",
        },
        biography: {
            id: "biography",
            group: "sheet",
            icon: "fa-solid fa-book-open",
            label: "PTR2E.ActorSheet.Tabs.biography.label",
        },
        effects: {
            id: "effects",
            group: "sheet",
            icon: "fa-solid fa-star",
            label: "PTR2E.ActorSheet.Tabs.effects.label",
        },
    };

    _getTabs() {
        for (const v of Object.values(this.tabs)) {
            v.active = this.tabGroups[v.group] === v.id;
            v.cssClass = v.active ? "active" : "";
        }
        return this.tabs;
    }

    _getSubTabs() {
        for (const v of Object.values(this.subtabs)) {
            v.active = this.tabGroups[v.group] === v.id;
            v.cssClass = v.active ? "active" : "";
        }
        return this.subtabs;
    }

    override async _prepareContext(
        options?: foundry.applications.api.HandlebarsDocumentSheetConfiguration<ActorPTR2e>
    ) {
        const inventory = (() => {
            const inventory: Record<string, ItemPTR2e<ItemSystemPTR, ActorPTR2e>[]> = {};
            for (const item of this.actor.items) {
                const physicalItems = ["weapon", "gear", "consumable", "equipment", "container"];
                function isTypeOfPhysicalItem(
                    item: Item
                ): item is ItemPTR2e<
                    | GearSystem
                    | WeaponSystem
                    | ConsumableSystem
                    | EquipmentSystem
                    | ContainerSystem,
                    ActorPTR2e
                > {
                    return physicalItems.includes(item.type);
                }
                if (isTypeOfPhysicalItem(item)) {
                    const category = item.type;
                    if (!inventory[category]) inventory[category] = [];
                    inventory[category].push(item);
                }
            }
            return inventory;
        })();

        return {
            ...(await super._prepareContext(options)),
            actor: this.actor,
            source: this.actor._source,
            fields: this.actor.system.schema.fields,
            baseFields: this.actor.schema.fields,
            effects: this.actor.effects.contents,
            inventory,
            tabs: this._getTabs(),
            subtabs: this._getSubTabs(),
        };
    }

    override _attachPartListeners(
        partId: string,
        htmlElement: HTMLElement,
        options: foundry.applications.api.HandlebarsRenderOptions
    ): void {
        super._attachPartListeners(partId, htmlElement, options);

        for (const element of htmlQueryAll(htmlElement, ".can-popout")) {
            const div = document.createElement("div");
            div.classList.add("popout-control");
            const component = element.dataset.component;
            div.dataset.component = component;
            div.dataset.tooltip = ActorComponents[component as ActorComponentKey].TOOLTIP;
            div.innerHTML = `<i class="fas fa-external-link-alt"></i>`;
            div.addEventListener("click", this._onPopout.bind(this));
            element.appendChild(div);
        }

        if (partId === "effects") {
            EffectComponent.attachListeners(htmlElement, this.actor);
        }
    }

    async _onPopout(event: Event) {
        event.preventDefault();
        const target = event.currentTarget as HTMLElement;
        const component = target.dataset.component as ActorComponentKey;
        const sheet = new ComponentPopout({ actor: this.actor, component });
        sheet.render(true);
    }

    override async close(
        options: Partial<foundry.applications.api.ApplicationClosingOptions> = {}
    ): Promise<this> {
        if (game.ptr.web.actor === this.actor) {
            this.minimize();
            return this;
        }
        return super.close(options) as Promise<this>;
    }

    override async _renderFrame(
        options: foundry.applications.api.HandlebarsDocumentSheetConfiguration<ActorPTR2e>
    ): Promise<HTMLElement> {
        const frame = await super._renderFrame(options);

        // Add Species button to the header
        const speciesLabel = game.i18n.localize("PTR2E.ActorSheet.Species");
        const speciesButton = `<button type="button" class="header-control fa-solid fa-paw" data-action="species-header"
                                    data-tooltip="${speciesLabel}" aria-label="${speciesLabel}"></button>`;
        this.window.close.insertAdjacentHTML("beforebegin", speciesButton);

        return frame;
    }

    override _onDrop(event: DragEvent) {
        const data: {
            type: string;
            action?: {
                slug: string;
                type: string;
            };
        } = TextEditor.getDragEventData(event);
        if(!data.action?.slug) return super._onDrop(event);

        const actionDiv = (event.target as HTMLElement).closest(".action[data-slot]") as HTMLElement;
        if (!actionDiv) return;

        const slug = data.action.slug;
        if(!slug) return;

        const slot = Number(actionDiv.dataset.slot);
        if (isNaN(slot)) return;

        const action = this.actor.actions.attack.get(slug);
        if (!action) return;

        const currentAction = this.actor.attacks.actions[slot]
        if(!currentAction) {
            action.update({"slot": slot});
            return;
        }
        if(currentAction.slug === slug) return;

        currentAction.update({"slot": null});
        action.update({"slot": slot});

        return;
    }

    static async _onToChatAction(this: ActorSheetPTRV2, event: Event) {
        const actionDiv = (event.target as HTMLElement).closest(".action") as HTMLElement;
        if (!actionDiv) return;

        const slug = actionDiv.dataset.slug;
        if (!slug) return;

        const action = this.actor.actions.get(slug);
        //TODO: Support sending individual attacks to chat
        action?.item.toChat();
    }

    static async _onEditAction(this: ActorSheetPTRV2, event: Event) {
        const actionDiv = (event.target as HTMLElement).closest(".action") as HTMLElement;
        if (!actionDiv) return;

        const slug = actionDiv.dataset.slug;
        if (!slug) return;

        const action = this.actor.actions.get(slug);
        if (!action) return;

        new ActionEditor(action.item, action.slug).render(true);
    }

    static async _onDeleteAction(this: ActorSheetPTRV2, event: Event) {
        const actionDiv = (event.target as HTMLElement).closest(".action") as HTMLElement;
        if (!actionDiv) return;

        const slug = actionDiv.dataset.slug;
        if (!slug) return;

        const action = this.actor.actions.get(slug);
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
}

export default ActorSheetPTRV2;
