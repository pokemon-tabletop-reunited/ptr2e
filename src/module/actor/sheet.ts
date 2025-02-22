import { AbilityPTR2e, ConsumablePTR2e, ItemPTR2e, ItemSystemPTR, MovePTR2e, SpeciesPTR2e } from "@item";
import ActorPTR2e from "./base.ts";
import { createHTMLElement, htmlClosest, htmlQuery, htmlQueryAll, sluggify } from "@utils";
import { Tab } from "@item/sheets/document.ts";
import { ActorComponentKey, ActorComponents, ComponentPopout } from "./components/sheet.ts";
import { EffectComponent } from "./components/effect-component.ts";
import GearSystem from "@item/data/gear.ts";
import WeaponSystem from "@item/data/weapon.ts";
import ConsumableSystem from "@item/data/consumable.ts";
import Tagify from "@yaireo/tagify";
import EquipmentSystem from "@item/data/equipment.ts";
import ContainerSystem from "@item/data/container.ts";
import { KnownActionsApp } from "@module/apps/known-attacks.ts";
import { RestApp } from "@module/apps/rest.ts";
import {
  ActorSheetV2Expanded,
  DocumentSheetConfigurationExpanded,
} from "@module/apps/appv2-expanded.ts";
import { ActionEditor } from "@module/apps/action-editor.ts";
import SkillPTR2e from "@module/data/models/skill.ts";
import { SkillsComponent } from "./components/skills-component.ts";
import { SkillsEditor } from "@module/apps/skills-editor.ts";
import { AttackPTR2e, PTRCONSTS, Trait } from "@data";
import { PerksComponent } from "./components/perks-component.ts";
import { AbilitiesComponent } from "./components/abilities-component.ts";
import { StatsChart } from "./sheets/stats-chart.ts";
import StatsForm from "./sheets/stats-form.ts";
import { ActiveEffectPTR2e } from "@effects";
import { natures } from "@scripts/config/natures.ts";
import { AvailableAbilitiesApp } from "@module/apps/available-abilities.ts";
import { DataInspector } from "@module/apps/data-inspector/data-inspector.ts";
import Clock from "@module/data/models/clock.ts";
import ClockEditor from "@module/apps/clocks/clock-editor.ts";
import Sortable from "sortablejs";
import PartySheetPTR2e from "@module/apps/party-sheet.ts";
import { ToggleComponent } from "./components/toggle-component.ts";
import { PerkWebApp } from "@module/apps/perk-web/perk-web-v2.ts";
import { DexApp } from "@module/apps/dex.ts";
import MoveSystem from "@item/data/move.ts";

class ActorSheetPTRV2 extends foundry.applications.api.HandlebarsApplicationMixin(
  ActorSheetV2Expanded
) {
  constructor(options: Partial<DocumentSheetConfigurationExpanded> = {}) {
    super(options);

    this.statsChart = new StatsChart(this);
  }

  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["ptr2e", "sheet", "actor", "v2"],
      position: {
        width: 900,
        height: 720,
      },
      window: {
        resizable: true,
        controls: [
          ...(super.DEFAULT_OPTIONS?.window?.controls ?? []),
          {
            icon: "fas fa-atom",
            label: "PTR2E.ActorSheet.Inspector",
            action: "open-inspector",
            visible: true
          }
        ],
      },
      form: {
        submitOnChange: true,
      },
      dragDrop: [
        {
          dropSelector: ".window-content",
          dragSelector:
            "fieldset .item, fieldset .effect, fieldset .action, ul.items > li",
        },
      ],
      actions: {
        "toggle-temporary": async function (this: ActorSheetPTRV2, event: Event) {
          const itemId = htmlClosest(event.target, "[data-item-id]")?.dataset.itemId;
          const item = this.actor.items.get(itemId, { strict: true }) as ConsumablePTR2e;
          item.update({"system.temporary": !item.system.temporary});
        },
        "reset-ip": async function (this: ActorSheetPTRV2) {
          foundry.applications.api.DialogV2.confirm({
            window: {
              title: game.i18n.format("PTR2E.ActorSheet.ResetIP.title", {
                name: this.document.name,
              }),
            },
            content: game.i18n.format("PTR2E.ActorSheet.ResetIP.content", {
              name: this.document.name,
            }),
            yes: {
              callback: async () => {
                await this.document.update({
                  "system.inventoryPoints.current": this.document.system.inventoryPoints.max,
                });
                await this.document.deleteEmbeddedDocuments("Item", this.document.itemTypes.consumable.filter(i => i.system.temporary).map((i) => i.id));
                this.render({parts: ["inventory"]});
              },
            },
          });
        },
        "open-carry-type-menu": ActorSheetPTRV2.openCarryTypeMenu,
        "species-header": async function (this: ActorSheetPTRV2, event: Event) {
          event.preventDefault();
          const species = this.actor.items.get("actorspeciesitem") as SpeciesPTR2e;
          if (!species) return;
          species.sheet.render(true);
        },
        "open-inspector": async function (this: ActorSheetPTRV2, event: Event) {
          event.preventDefault();
          const inspector = new DataInspector(this.actor);
          inspector.render(true);
        },
        "open-perk-web": async function (this: ActorSheetPTRV2) {
          if ([true, undefined].includes(this.actor.flags.ptr2e?.sheet?.perkFlash))
            await this.actor.setFlag("ptr2e", "sheet.perkFlash", false);

          canvas.tokens.controlled.forEach(t => t.release());

          const app = new PerkWebApp(this.actor);
          app.render(true);
        },
        "open-party-sheet": async function (this: ActorSheetPTRV2) {
          if (!this.actor.party) return;
          new PartySheetPTR2e({ folder: this.actor.folder! }).render(true);
        },
        "edit-movelist": function (this: ActorSheetPTRV2) {
          return new KnownActionsApp(this.actor).render(true);
        },
        "edit-abilitylist": function (this: ActorSheetPTRV2) {
          return new AvailableAbilitiesApp(this.actor).render(true);
        },
        "roll-attack": async function (this: ActorSheetPTRV2, event: Event) {
          const actionDiv = (event.target as HTMLElement).closest(
            ".action"
          ) as HTMLElement;
          if (!actionDiv) return;

          const slug = actionDiv.dataset.slug;
          if (!slug) return;

          const action = this.actor.actions.get(slug);
          if (!action) return;
          if ("rollable" in action && action.rollable === true)
            await (action as AttackPTR2e).roll();
        },
        "action-to-chat": ActorSheetPTRV2._onToChatAction,
        "action-edit": ActorSheetPTRV2._onEditAction,
        "action-delete": ActorSheetPTRV2._onDeleteAction,
        "favourite-skill": ActorSheetPTRV2._onFavouriteSkill,
        "hide-skill": ActorSheetPTRV2._onHideSkill,
        "toggle-hidden-skills": async function (this: ActorSheetPTRV2) {
          const appSettings = fu.duplicate(
            game.user.getFlag("ptr2e", "appSettings") ?? {}
          ) as Record<string, Record<string, unknown>>;
          if (!appSettings[this.appId])
            appSettings[this.appId] = { hideHiddenSkills: true };
          appSettings[this.appId].hideHiddenSkills =
            !appSettings[this.appId].hideHiddenSkills;
          await game.user.setFlag("ptr2e", "appSettings", appSettings);

          for (const app of Object.values(this.actor.apps)) {
            if (app instanceof foundry.applications.api.ApplicationV2) {
              const parts = (app as unknown as { parts: Record<string, unknown> })
                .parts;
              if ("popout" in parts) app.render({ parts: ["popout"] });
              if ("skills" in parts) app.render({ parts: ["skills"] });
            } else app?.render();
          }
        },
        "edit-skills": async function (this: ActorSheetPTRV2) {
          return new SkillsEditor(this.actor).render(true);
        },
        "luck-roll": async function (this: ActorSheetPTRV2) {
          const skill = this.actor.system.skills.get("luck")!;
          await skill.endOfDayLuckRoll();
        },
        "rest": function (this: ActorSheetPTRV2) {
          const toHeal = this.actor?.party ? [this.actor.party.owner!, ...(this.actor.party.party ?? [])] : [this.actor];
          new RestApp(this.document.name, toHeal).render(true);
        },
        "open-dex": async function (this: ActorSheetPTRV2) {
          new DexApp(this.actor).render(true);
        },
        "add-clock": ActorSheetPTRV2.#onAddClock,
        "open-tutor-list": function (this: ActorSheetPTRV2) {
          game.ptr.tutorList.render({ force: true, actor: this.actor });
        },
        "open-stats-chart": function (this: ActorSheetPTRV2) {
          new StatsForm({ document: this.actor }).render(true);
        }
      },
    },
    { inplace: false }
  );

  get appId() {
    return this.id.replaceAll(".", "-");
  }

  #allTraits: { value: string; label: string, virtual: boolean, type?: Trait["type"] }[] | undefined;

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
      scrollable: [".scroll"]
    },
    actions: {
      id: "actions",
      template: "systems/ptr2e/templates/actor/actor-actions.hbs",
      scrollable: [".scroll"]
    },
    inventory: {
      id: "inventory",
      template: "systems/ptr2e/templates/actor/actor-inventory.hbs",
      scrollable: [".scroll"]
    },
    clocks: {
      id: "clocks",
      template: "systems/ptr2e/templates/actor/actor-clocks.hbs",
      scrollable: [".scroll"]
    },
    skills: {
      id: "skills",
      template: "systems/ptr2e/templates/actor/actor-skills.hbs",
      scrollable: [".scroll"]
    },
    perks: {
      id: "perks",
      template: "systems/ptr2e/templates/actor/actor-perks.hbs",
      scrollable: [".scroll"]
    },
    biography: {
      id: "biography",
      template: "systems/ptr2e/templates/actor/actor-biography.hbs",
      scrollable: [".scroll"]
    },
    effects: {
      id: "effects",
      template: "systems/ptr2e/templates/actor/actor-effects.hbs",
      scrollable: [".scroll"]
    },
  };

  protected statsChart: StatsChart;

  tabGroups: Record<string, string> = {
    sheet: "overview",
    actions: "slots",
  };

  subtabs: Record<string, Tab> = {
    slots: {
      id: "slots",
      group: "actions",
      icon: "fa-solid fa-burst",
      label: "Attacks",
    },
    generic: {
      id: "generic",
      group: "actions",
      icon: "fa-solid fa-dice-d20",
      label: "Generic Actions",
    },
    passives: {
      id: "passives",
      group: "actions",
      icon: "fa-solid fa-star",
      label: "Passives",
    },
    camping: {
      id: "camping",
      group: "actions",
      icon: "fa-solid fa-campfire",
      label: "Camping Activities",
    },
    downtime: {
      id: "downtime",
      group: "actions",
      icon: "fa-solid fa-clock",
      label: "Downtime Activities",
    },
    exploration: {
      id: "exploration",
      group: "actions",
      icon: "fa-solid fa-magnifying-glass",
      label: "Exploration Activities",
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
    const { skills, hideHiddenSkills } = SkillsComponent.prepareSkillsData(this.actor);
    const shouldPerkFlash =
      this.actor.flags.ptr2e?.sheet?.perkFlash === false
        ? false
        : this.actor.system.advancement.advancementPoints.available > 0;

    const alliance =
      this.actor._source.system.details?.alliance === null ? "neutral" : (this.actor._source.system.details?.alliance || "default");
    const defaultValue = game.i18n.localize(
      this.actor.hasPlayerOwner
        ? "PTR2E.ActorSheet.Alliance.Party"
        : "PTR2E.ActorSheet.Alliance.Opposition",
    );

    const allianceOptions = {
      default: game.i18n.format("PTR2E.ActorSheet.Alliance.Default", { alliance: defaultValue }),
      opposition: "PTR2E.ActorSheet.Alliance.Opposition",
      party: "PTR2E.ActorSheet.Alliance.Party",
      neutral: "PTR2E.ActorSheet.Alliance.Neutral",
    };

    return {
      ...(await super._prepareContext(options)),
      actor: this.actor,
      source: this.actor._source,
      fields: this.actor.system.schema.fields,
      baseFields: this.actor.schema.fields,
      tabs: this._getTabs(),
      skills,
      hideHiddenSkills,
      shouldPerkFlash,
      natures: natures,
      enrichedBiography: await TextEditor.enrichHTML(this.actor.system.details.biography),
      allianceOptions,
      alliance
    };
  }

  _prepareEffectiveness(): Record<string, { value: number, name: string }[]> {
    const effectiveness = { effective: [], ineffective: [], immune: [] } as Record<string, { value: number, name: string }[]>;
    for (const [type, value] of Object.entries(this.actor.system.type.effectiveness)) {
      //TODO: Make this a setting
      if (type === "nuclear") continue;
      if (type === "shadow") continue;

      if (value === 1) continue;
      if (value === 0) {
        effectiveness.immune.push({
          value,
          name: type
        });
        continue;
      }
      if (value > 1) {
        effectiveness.effective.push({
          value,
          name: type
        });
        continue;
      }
      effectiveness.ineffective.push({
        value,
        name: type
      });
    }
    return effectiveness;
  }

  override async _preparePartContext(
    partId: string,
    context: foundry.applications.api.ApplicationRenderContext
  ) {
    if (partId === "overview") {
      context.movement = Object.values(this.actor.system.movement);

      context.effectiveness = this._prepareEffectiveness();
    }

    if (partId === "sidebar") {
      context.species = this.actor.items.get("actorspeciesitem") as SpeciesPTR2e;
    }

    if (partId === "clocks") {
      context.clocks = game.user.isGM ? this.document.system.clocks.contents : this.document.system.clocks.contents.filter(c => !c.private);
    }

    if (partId === "inventory") {
      const inventory = (() => {
        const inventory: Record<string, ItemPTR2e<ItemSystemPTR, ActorPTR2e>[]> = {};
        for (const item of this.actor.items) {
          const physicalItems = [
            "weapon",
            "equipment",
            "consumable",
            "gear",
            "container",
          ];
          for (const type of physicalItems) {
            if (!inventory[type]) inventory[type] = [];
          }
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
            inventory[category].push(item);
          }
        }
        for (const key of Object.keys(inventory)) {
          inventory[key].sort((a, b) => a.sort - b.sort);
        }
        return inventory;
      })();
      context.inventory = inventory;
    }

    if (partId === "actions") {
      context.subtabs = this._getSubTabs();
    }

    if (partId === "effects") {
      context.effects = this.actor.effects.contents;
      context.toggles = this.actor.synthetics.toggles;
    }

    if (partId === "perks") {
      const traits = (() => {
        if ("traits" in this.document.system) {
          const traits = [];
          for (const trait of this.document.system.traits) {
            traits.push({
              value: trait.slug,
              label: trait.label,
              virtual: trait.virtual,
              type: trait.type,
            });
          }
          return traits;
        }
        return [];
      })();

      this.#allTraits = game.ptr.data.traits.map((trait) => ({
        value: trait.slug,
        label: trait.label,
        virtual: false,
        type: trait.type,
      }));

      context.traits = traits;

      const { perk: perks, ability: abilities } = this.actor.itemTypes;
      context.perks = perks.sort((a, b) => a.sort - b.sort);
      context.abilities = abilities.sort((a, b) => a.sort - b.sort);
    }

    return context;
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

    for (const element of htmlQueryAll(htmlElement, ".can-add")) {
      const div = document.createElement("div");
      div.classList.add("add-control");
      div.dataset.type = element.dataset.type;
      div.dataset.tooltip = game.i18n.localize("Add");
      div.innerHTML = `<i class="fas fa-plus"></i>`;
      div.addEventListener("click", this._onCreate.bind(this));
      element.appendChild(div);
    }

    if (partId === "header" && this.isEditable) {
      htmlQuery(htmlElement, "img[data-edit]")?.addEventListener("click", (event) => {
        const imgElement = event.currentTarget as HTMLImageElement;
        const attr = imgElement.dataset.edit;
        const current = foundry.utils.getProperty<string | undefined>(this.actor, attr!);
        const { img } = ActorPTR2e.getDefaultArtwork(this.actor.toObject()) ?? {};
        const fp = new FilePicker({
          current,
          type: "image",
          redirectToRoot: img ? [img] : [],
          callback: (path: string) => {
            imgElement.src = path;
            if (this.options.form?.submitOnChange)
              this.element.dispatchEvent(new Event("submit", { cancelable: true }));
          },
          top: this.position.top + 40,
          left: this.position.left + 10,
        });
        fp.browse();
      });
    }

    if (partId === "overview") {
      this.statsChart.render();
      htmlQuery(htmlElement, ".stats-chart")?.addEventListener("dblclick", () =>
        new StatsForm({ document: this.actor }).render(true)
      );
    }

    if (partId === "effects") {
      EffectComponent.attachListeners(htmlElement, this.actor);
      ToggleComponent.attachListeners(htmlElement, this.actor);
    }

    if (partId === "skills" || partId === "overview") {
      SkillsComponent.attachListeners(htmlElement, this.actor);
    }

    if (partId === "actions") {
      for (const element of htmlQueryAll(htmlElement, ".tab[data-tab='actions'] .sub-tabs [data-scroll-anchor]")) {
        element.addEventListener("click", (event) => {
          const anchor = (event.currentTarget as HTMLElement).dataset.scrollAnchor;
          const scrollElement = htmlQuery(htmlElement, `.tab[data-tab='actions'] .active .${anchor}`);
          if (scrollElement) scrollElement.scrollIntoView({ behavior: "smooth", inline: "center" });
        });
      }
    }

    if (partId === "clocks") {
      for (const clock of htmlElement.querySelectorAll(".clock")) {
        clock.addEventListener("click", (event) => {
          event.preventDefault();
          const id = (event.target as HTMLElement)
            .closest("[data-id]")
            ?.getAttribute("data-id");
          const clock = this.document.system.clocks.get(id as string);
          if (!clock) return;

          const clocks = fu.duplicate(this.document.system._source.clocks);
          const index = clocks.findIndex((c) => c.id === clock.id);
          if (index === -1) return;
          clocks[index].value = clock.value >= clock.max ? 0 : clock.value + 1;

          return this.document.update({ "system.clocks": clocks });
        });
        clock.addEventListener("contextmenu", (event) => {
          event.preventDefault();
          const id = (event.target as HTMLElement)
            .closest("[data-id]")
            ?.getAttribute("data-id");
          const clock = this.document.system.clocks.get(id as string);
          if (!clock) return;

          const clocks = fu.duplicate(this.document.system._source.clocks);
          const index = clocks.findIndex((c) => c.id === clock.id);
          if (index === -1) return;
          clocks[index].value = clock.value <= 0 ? clock.max : clock.value - 1;

          return this.document.update({ "system.clocks": clocks });
        });
      }
      for (const editButton of htmlElement.querySelectorAll("[data-action=edit-clock]")) {
        editButton.addEventListener("click", async (event) => {
          event.preventDefault();
          const id = (event.target as HTMLElement)
            .closest("[data-id]")
            ?.getAttribute("data-id");
          const clock = this.document.system.clocks.get(id as string);
          if (!clock) return;

          return ActorSheetPTRV2.#onAddClock.bind(this)(event, clock);
        });
      }
      for (const deleteButton of htmlElement.querySelectorAll("[data-action=delete-clock]")) {
        deleteButton.addEventListener("click", async (event) => {
          event.preventDefault();
          const id = (event.target as HTMLElement)
            .closest("[data-id]")
            ?.getAttribute("data-id");
          const clock = this.document.system.clocks.get(id as string);
          if (!clock) return;

          return await foundry.applications.api.DialogV2.prompt({
            buttons: [
              {
                action: "ok",
                label: game.i18n.localize("PTR2E.Clocks.Global.Delete.Confirm"),
                icon: "fas fa-trash",
                callback: async () => {
                  const clocks = fu.duplicate(this.document.system._source.clocks);
                  const index = clocks.findIndex((c) => c.id === clock.id);
                  if (index === -1) return;
                  clocks.splice(index, 1);

                  return this.document.update({ "system.clocks": clocks });
                },
              },
              {
                action: "cancel",
                label: game.i18n.localize("PTR2E.Clocks.Global.Delete.Cancel"),
                icon: "fas fa-times",
              },
            ],
            content: `<p>${game.i18n.format("PTR2E.Clocks.Global.Delete.Message", {
              label: clock.label,
            })}</p>`,
            window: {
              title: game.i18n.localize("PTR2E.Clocks.Global.Delete.Title"),
            },
          });
        });
      }

      const element = htmlElement.querySelector(".clock-list");
      if (element)
        new Sortable(element as HTMLElement, {
          animation: 200,
          direction: "vertical",
          draggable: ".clock-entry",
          dragClass: "drag-preview",
          ghostClass: "drag-gap",
          onEnd: (event) => {
            const id = event.item.dataset.id!;
            const clock = this.document.system.clocks.get(id);
            if (!clock) return;
            const newIndex = event.newDraggableIndex;
            if (newIndex === undefined) return;
            const clocks = this.document.system.clocks.contents;
            const targetClock = clocks[newIndex];
            if (!targetClock) return;

            // Don't sort on self
            if (clock.sort === targetClock.sort) return;
            const sortUpdates = SortingHelpers.performIntegerSort(clock, {
              target: targetClock,
              siblings: clocks,
            });

            const clocksData = fu.duplicate(this.document.system._source.clocks);
            for (const update of sortUpdates) {
              const index = clocksData.findIndex((c) => c.id === update.target.id);
              if (index === -1) continue;
              clocksData[index].sort = update.update.sort;
            }

            return this.document.update({ "system.clocks": clocksData });
          },
        });
    }

    if (partId === "inventory") {
      for (const element of htmlQueryAll(htmlElement, ".tab[data-tab='inventory'] .item-controls a[data-action=edit-item]")) {
        element.addEventListener("click", async (event) => {
          const itemId = (
            (event.currentTarget as HTMLElement)?.closest(
              "[data-item-id]"
            ) as HTMLElement
          )?.dataset.itemId;
          if (!itemId) return;
          return (this.document.items.get(itemId) as ItemPTR2e)?.sheet?.render(true);
        });
      }

      for (const element of htmlQueryAll(
        htmlElement,
        ".tab[data-tab='inventory'] .item-controls a[data-action=delete-item]"
      )) {
        element.addEventListener("click", async (event) => {
          const itemId = (
            (event.currentTarget as HTMLElement)?.closest(
              "[data-item-id]"
            ) as HTMLElement
          )?.dataset.itemId;
          const item = this.document.items.get(itemId!);
          if (!item) return;

          // Confirm the deletion unless the user is holding Shift
          return event.shiftKey
            ? item.delete()
            : foundry.applications.api.DialogV2.confirm({
              yes: {
                callback: () => item.delete(),
              },
              content: game.i18n.format("PTR2E.Dialog.DeleteDocumentContent", {
                name: item.name,
              }),
              window: {
                title: game.i18n.format("PTR2E.Dialog.DeleteDocumentTitle", {
                  name: item.name,
                }),
              },
            });
        });
      }

      for (const element of htmlQueryAll(
        htmlElement,
        ".tab[data-tab='inventory'] .quantity a[data-action]"
      )) {
        element.addEventListener("click", async (event) => {
          const itemId = (
            (event.currentTarget as HTMLElement)?.closest(
              "[data-item-id]"
            ) as HTMLElement
          )?.dataset.itemId;
          const item = this.document.items.get(itemId!) as ItemPTR2e;
          if (!item || !("quantity" in item.system)) return;

          const action = (event.currentTarget as HTMLElement)?.dataset.action;
          const isShift = event.shiftKey;
          const isCtrl = event.ctrlKey;
          const amount = isCtrl ? 10 : isShift ? 5 : 1;
          switch (action) {
            case "increase-quantity": {
              item.update({ "system.quantity": item.system.quantity as number + amount });
              break;
            }
            case "decrease-quantity": {
              item.update({
                "system.quantity": Math.max(0, Math.min(item.system.quantity as number - amount, item.system.stack as number ?? Number.MAX_SAFE_INTEGER)),
              });
              break;
            }
          }
        });
      }
    }

    if (partId === "perks") {
      PerksComponent.attachListeners(htmlElement, this.actor);
      AbilitiesComponent.attachListeners(htmlElement, this.actor);

      for (const input of htmlElement.querySelectorAll<HTMLInputElement>(
        "input.ptr2e-tagify"
      )) {
        new Tagify(input, {
          enforceWhitelist: false,
          keepInvalidTags: false,
          editTags: false,
          tagTextProp: "label",
          dropdown: {
            enabled: 0,
            mapValueTo: "label",
          },
          templates: {
            tag: function (tagData): string {
              return `
                            <tag contenteditable="false" spellcheck="false" tabindex="-1" class="tagify__tag" ${this.getAttributes(
                tagData
              )} style="${Trait.bgColors[tagData.type || "default"] ? `--tag-bg: ${Trait.bgColors[tagData.type || "default"]!["bg"]}; --tag-hover: ${Trait.bgColors[tagData.type || "default"]!["hover"]}; --tag-border-color: ${Trait.bgColors[tagData.type || "default"]!["border"]};` : ""}">
                            ${tagData.virtual ? "" : `<x title="" class="tagify__tag__removeBtn" role="button" aria-label="remove tag"></x>`}
                            <div>
                                <span class='tagify__tag-text'>
                                    <span class="trait" data-tooltip-direction="UP" data-trait="${tagData.value
                }" data-tooltip="${tagData.label
                }"><span>[</span><span class="tag">${tagData.label
                }</span><span>]</span></span>
                                </span>
                            </div>
                            `;
            },
          },
          whitelist: this.#allTraits,
        });
      }
    }
  }

  override _getHeaderControls(): foundry.applications.api.ApplicationHeaderControlsEntry[] {
    const controls = fu.duplicate(super._getHeaderControls());

    if (!this.actor.party) controls.findSplice(c => c.action === "open-party-sheet")

    return controls;
  }

  override _prepareSubmitData(
    event: SubmitEvent,
    form: HTMLFormElement,
    formData: FormDataExtended
  ): Record<string, unknown> {
    const submitData = formData.object;

    if (
      "system.traits" in submitData &&
      submitData["system.traits"] &&
      typeof submitData["system.traits"] === "object" &&
      Array.isArray(submitData["system.traits"])
    ) {
      // Traits are stored as an array of objects, but we only need the values
      submitData["system.traits"] = submitData["system.traits"].filter(t => !t.virtual).map(
        (trait: { value: string }) => sluggify(trait.value)
      );
    }

    if("system.details.alliance" in submitData) {
      const alliance = submitData["system.details.alliance"];
      if (alliance === "default") submitData["system.details.alliance"] = '';
      if (alliance === "neutral") submitData["system.details.alliance"] = null;
    }

    return super._prepareSubmitData(event, form, formData);
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
    // if (game.ptr.web.actor === this.actor) {
    //   this.minimize();
    //   return this;
    // }
    return super.close(options) as Promise<this>;
  }

  override _onDragStart(event: DragEvent) {
    const target = event.currentTarget as HTMLElement;
    if (!target.classList.contains("attack")) return super._onDragStart(event);

    const actionSlug = target.dataset.slug;
    if (!actionSlug) return;

    const action = this.document.actions.attack.get(actionSlug);
    if (!action) return;

    // Create drag data
    const dragData = action.toDragData();
    if (!dragData) return;

    // Set data transfer
    event.dataTransfer!.setData("text/plain", JSON.stringify(dragData));
  }

  override async _onDrop(event: DragEvent) {
    const data: {
      type: string;
      action?: {
        slug: string;
        type: string;
      };
      uuid?: string;
    } = TextEditor.getDragEventData(event);

    if (data.uuid) {
      const item = await fromUuid(data.uuid);
      if (
        item instanceof ItemPTR2e &&
        item.type == "ability" &&
        this.actor.items.get(item.id) === item
      ) {
        return void this._onDropAbility(event, item);
      }
      if(
        this.actor.isOwner &&
        item instanceof ItemPTR2e &&
        item.type == "move" &&
        this.actor.uuid !== item.parent?.uuid
      ) {
        const move = item.toObject() as MovePTR2e['_source'];
        const actionDiv = (event.target as HTMLElement).closest(".action[data-slot]") as HTMLElement;
        if(actionDiv) {
          const slot = Number(actionDiv.dataset.slot);
          if (isNaN(slot)) return;

          const primaryAction = (move.system as unknown as MoveSystem["_source"]).actions[0]
          const currentAction = this.actor.attacks.actions[slot];
          if(currentAction) await currentAction.update({ slot: null });
          primaryAction.slot = slot;

          return this.actor.createEmbeddedDocuments("Item", [move]);
        }
      }
    }

    if (!data.action?.slug) return super._onDrop(event, data);
    //@ts-expect-error - This is a custom method
    return void this._onDropAction(event, data);
  }

  _onDropAction(
    event: DragEvent,
    data: {
      type: string;
      action: {
        slug: string;
        type: string;
      };
    }
  ) {
    const actionDiv = (event.target as HTMLElement).closest(
      ".action[data-slot]"
    ) as HTMLElement;
    if (!actionDiv) return;

    const slug = data.action.slug;
    if (!slug) return;

    const slot = Number(actionDiv.dataset.slot);
    if (isNaN(slot)) return;

    const action = this.actor.actions.attack.get(slug);
    if (!action) return;

    const currentAction = this.actor.attacks.actions[slot];
    if (!currentAction) {
      action.update({ slot: slot });
      return;
    }
    if (currentAction.slug === slug) return;

    currentAction.update({ slot: null });
    action.update({ slot: slot });
  }

  _onDropAbility(event: DragEvent, ability: AbilityPTR2e) {
    const abilityDiv = (event.target as HTMLElement).closest(
      ".action[data-slot]"
    ) as HTMLElement;
    if (!abilityDiv) return;

    if (ability.system.isSuppressed) return void ui.notifications.warn("This ability is suppressed and cannot be re-assigned.");

    const slot = Number(abilityDiv.dataset.slot);
    if (isNaN(slot)) return;

    const currentAbility = this.actor.abilities.entries[slot];
    if (!currentAbility) {
      ability.update({ "system.slot": slot });
      return;
    }
    if (currentAbility === ability) return;

    if (currentAbility.system.isSuppressed) return void ui.notifications.warn("That slot is filled with a suppressed ability which cannot be re-assigned");

    this.actor.updateEmbeddedDocuments("Item", [
      { _id: currentAbility.id, "system.slot": ability.system.slot ?? null },
      { _id: ability.id, "system.slot": slot },
    ]);
  }

  static async _onToChatAction(this: ActorSheetPTRV2, event: Event) {
    const actionDiv = (event.target as HTMLElement).closest(".action") as HTMLElement;
    if (!actionDiv) return;

    const slug = actionDiv.dataset.slug;
    if (!slug) return;

    const action = this.actor.actions.get(slug);
    action?.toChat();
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

  static async _onFavouriteSkill(this: ActorSheetPTRV2, event: Event) {
    const skillDiv = (event.target as HTMLElement).closest(".skill") as HTMLElement;
    if (!skillDiv) return;

    const slug = skillDiv.dataset.slug;
    if (!slug) return;

    const skills = this.actor.system.toObject().skills as SkillPTR2e["_source"][];
    const index = skills.findIndex((s) => s.slug === slug);
    if (index === -1) return;

    skills[index].favourite = !skills[index].favourite;
    if (skills[index].favourite && skills[index].hidden) skills[index].hidden = false;
    this.actor.update({ "system.skills": skills });
  }

  static async _onHideSkill(this: ActorSheetPTRV2, event: Event) {
    const skillDiv = (event.target as HTMLElement).closest(".skill") as HTMLElement;
    if (!skillDiv) return;

    const slug = skillDiv.dataset.slug;
    if (!slug) return;

    const skills = this.actor.system.toObject().skills as SkillPTR2e["_source"][];
    const index = skills.findIndex((s) => s.slug === slug);
    if (index === -1) return;

    skills[index].hidden = !skills[index].hidden;
    if (skills[index].hidden && skills[index].favourite) skills[index].favourite = false;
    this.actor.update({ "system.skills": skills });
  }

  protected async _onCreate(event: Event) {
    const type = (event.currentTarget as HTMLElement).dataset.type;
    if (!type) return;

    switch (type) {
      case "effect": {
        return ActiveEffectPTR2e.createDialog({}, { parent: this.document, types: ActiveEffectPTR2e.TYPES.filter(s => s != "summon") });
      }
      default: {
        const itemType = Item.TYPES.includes(type) ? type : null;
        if (!itemType) return;

        return ItemPTR2e.createDialog({}, { parent: this.document, types: [itemType] });
      }
    }
  }

  emulateItemDrop(data: DropCanvasData) {
    switch (data.type) {
      case "Affliction":
        return this._onDropAffliction(new DragEvent("drop"), data);
      case "ActiveEffect":
        return this._onDropActiveEffect(new DragEvent("drop"), data);
      case "Item":
        return this._onDropItem(new DragEvent("drop"), data);
    }
    return;
  }

  static #onAddClock(this: ActorSheetPTRV2, event: Event, clock?: Clock) {
    event.preventDefault();
    return new ClockEditor({}, clock instanceof Clock ? clock : new Clock({}, { parent: this.document.system })).render(true);
  }

  private static async openCarryTypeMenu(this: ActorSheetPTRV2, event: PointerEvent): Promise<void> {
    // Close the menu and return early if any carry-type menu is already open
    const menuOpen = !!document.body.querySelector("aside.locked-tooltip.carry-type-menu");
    if (menuOpen) game.tooltip.dismissLockedTooltips();

    const itemId = htmlClosest(event.target, "[data-item-id]")?.dataset.itemId;
    const item = this.actor.items.get(itemId, { strict: true });
    const template = await renderTemplate("systems/ptr2e/templates/apps/carry-type-menu.hbs", { item });
    const content = createHTMLElement("ul", { innerHTML: template });
    content.addEventListener("click", (event) => {
      const menuOption = htmlClosest(event.target, "a[data-carry-type]");
      if (!menuOption) return;

      const carryType = menuOption.dataset.carryType;
      if (!PTRCONSTS.CarryTypes[carryType as keyof typeof PTRCONSTS.CarryTypes]) {
        throw Error("Unexpected error retrieving requested carry type");
      }

      const handsHeld = Number(menuOption.dataset.handsHeld) || 0;

      item.update({ "system.equipped": { carryType, handsHeld } });
      game.tooltip.dismissLockedTooltips();
    })
    game.tooltip.activate(event.target as HTMLElement, { cssClass: "ptr2e carry-type-menu", content, locked: true });
  }
}

export default ActorSheetPTRV2;
