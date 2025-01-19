import { ApplicationConfigurationExpanded, ApplicationV2Expanded } from "../appv2-expanded.ts";
import { ActorPTR2e } from "@actor";
import { ChoiceSetChangeSystem, GrantEffectChangeSystem, GrantItemChangeSystem, Trait } from "@data";
import { ItemPTR2e, MovePTR2e, PerkPTR2e, SpeciesPTR2e } from "@item";
import Tagify from "@yaireo/tagify";
import Sortable from "sortablejs";
import PerkStore, { PerkNode, PerkPurchaseState, PerkState } from "./perk-store.ts";
import { ActiveEffectPTR2e } from "@effects";
import { LevelUpMoveSchema } from "@item/data/species.ts";
import { createHTMLElement, fontAwesomeIcon, htmlClosest, htmlQuery, htmlQueryAll, ImageResolver, isObject, objectHasKey, sluggify } from "@utils";
import { ApplicationRenderContext } from "types/foundry/common/applications/api.js";
import { CompendiumBrowserPerkTab } from "../compendium-browser/tabs/perk.ts";
import { CheckboxData, RangesInputData, RenderResultListOptions, SelectData, SliderData } from "../compendium-browser/tabs/data.ts";
import noUiSlider from "nouislider";

export class PerkWebApp extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      id: "perk-web-app",
      tag: "article",
      classes: ["sheet", "perk-web-app", "perk-hud", "default-sheet", "application"],
      window: {
        title: "PTR2E.PerkWebApp.Title",
        frame: false,
        positioned: false,
        minimizable: false,
        resizable: false,
      },
      dragDrop: [{ dropSelector: `[data-application-part="web"]` }],
      actions: {
        "toggle-edit-mode": function (this: PerkWebApp) {
          this.editMode = !this.editMode;
          if (this.editMode) {
            if (!ui.perksTab.popout || ui.perksTab.popout._minimized) ui.perksTab.renderPopout();

            if (game.settings.get("ptr2e", "dev-mode")) {
              const pack = game.packs.get("ptr2e.core-perks");
              if (pack) {
                pack.configure({ locked: false });
                pack.render(true, { top: 0, left: window.innerWidth - 310 - 360 });
              }
            }
          }
          else {
            ui.perksTab.popout?.close();

            if (game.settings.get("ptr2e", "dev-mode")) {
              const pack = game.packs.get("ptr2e.core-perks");
              if (pack) {
                pack.configure({ locked: true });
                pack.apps.forEach((app) => app.close());
              }
            }
          }
          this.currentNode = null;
          this.connectionNode = null;
          this.render(true);
        },
        "refresh": PerkWebApp.refresh,
        "close-hud": function (this: PerkWebApp) { this.close(); },
        "purchase": async function (this: PerkWebApp) {
          if (!this.currentNode || !this.actor) return;
          if (this.currentNode.state !== PerkState.available) return;

          const perk = this.currentNode.tierInfo?.perk ?? this.currentNode.perk;
          if (this.currentNode.perk.system.variant === "tiered" && this.currentNode.perk.system.mode === "replace") {
            const current = this.actor.perks.get(this.currentNode.perk.slug);
            const oldChoiceSets = new Map<string, ChoiceSetChangeSystem>(current?.effects.contents.flatMap(effect =>
              (effect as ActiveEffectPTR2e).changes.flatMap(change => change.type === ChoiceSetChangeSystem.TYPE ? change : []).flat() as ChoiceSetChangeSystem[]
            ).map(change => [change.rollOption ?? change.flag, change]));

            const newPerk = perk.clone({
              system: {
                cost: perk.system.cost,
                originSlug: this.currentNode.tierInfo?.perk.slug ?? this.currentNode.slug
              }
            }).toObject()

            for (const effect of newPerk.effects as ActiveEffectPTR2e["_source"][]) {
              for (const csChange of effect.system.changes.flatMap(change => change.type === ChoiceSetChangeSystem.TYPE ? change : []) as ChoiceSetChangeSystem[]) {
                const old = oldChoiceSets.get(csChange.rollOption ?? csChange.flag);
                if (!old || !old.selection) continue;

                csChange.selection = old.selection;
              }
            }

            const hasEffectGrants = newPerk.effects.some(effect =>
              (effect as ActiveEffectPTR2e['_source']).system.changes.some(change => [GrantItemChangeSystem.TYPE, GrantEffectChangeSystem.TYPE].includes(change.type))
            );

            if (current) {
              newPerk.flags ??= {};
              newPerk.flags.ptr2e ??= {};
              newPerk.flags.ptr2e = fu.mergeObject(newPerk.flags.ptr2e, current.toObject().flags.ptr2e, { inplace: false });
              newPerk.flags.ptr2e.tierSlug = this.currentNode.tierInfo?.perk.slug ?? this.currentNode.slug;
              newPerk.system.originSlug = current.system.originSlug;
            }

            if (hasEffectGrants) {
              current?.delete();
              await ItemPTR2e.create(newPerk, {
                parent: this.actor
              });
              return void PerkWebApp.refresh.call(this);
            }
            else {
              if (current) {
                if (current.effects.size) await current.deleteEmbeddedDocuments("ActiveEffect", current.effects.map(effect => effect.id));
                await current.update({
                  name: newPerk.name,
                  img: newPerk.img,
                  effects: newPerk.effects,
                  system: newPerk.system,
                  "flags.ptr2e": newPerk.flags.ptr2e
                })
                return void PerkWebApp.refresh.call(this);
              }
            }
          }

          await ItemPTR2e.create(perk.clone({
            system: {
              cost: perk.system.cost,
              originSlug: this.currentNode.tierInfo?.perk.slug ?? this.currentNode.slug
            }
          }).toObject(), {
            parent: this.actor,
          });

          PerkWebApp.refresh.call(this);
        },
        "refund": async function (this: PerkWebApp) {
          if (!this.currentNode || !this.actor) return;
          if (this.currentNode.state !== PerkState.purchased && !this.currentNode.tierInfo) return;

          if (this.currentNode.tierInfo && this.currentNode.perk.system.mode === "replace") {
            const perk = this.currentNode.tierInfo.previousTier;
            const current = this.actor.perks.get(this.currentNode.perk.slug);
            if (!current) return;
            // This is the minimum tier, so delete the perk instead of replace.
            if (!perk) {
              await current.delete();
              return void PerkWebApp.refresh.call(this);
            }

            const oldChoiceSets = new Map<string, ChoiceSetChangeSystem>(current?.effects.contents.flatMap(effect =>
              (effect as ActiveEffectPTR2e).changes.flatMap(change => change.type === ChoiceSetChangeSystem.TYPE ? change : []).flat() as ChoiceSetChangeSystem[]
            ).map(change => [change.rollOption ?? change.flag, change]));

            const newPerk = perk.clone({
              system: {
                cost: perk.system.cost,
                originSlug: this.currentNode.tierInfo?.perk.slug ?? this.currentNode.slug
              }
            }).toObject()

            for (const effect of newPerk.effects as ActiveEffectPTR2e["_source"][]) {
              for (const csChange of effect.system.changes.flatMap(change => change.type === ChoiceSetChangeSystem.TYPE ? change : []) as ChoiceSetChangeSystem[]) {
                const old = oldChoiceSets.get(csChange.rollOption ?? csChange.flag);
                if (!old || !old.selection) continue;

                csChange.selection = old.selection;
              }
            }

            const hasEffectGrants = newPerk.effects.some(effect =>
              (effect as ActiveEffectPTR2e['_source']).system.changes.some(change => [GrantItemChangeSystem.TYPE, GrantEffectChangeSystem.TYPE].includes(change.type))
            );

            newPerk.flags ??= {};
            newPerk.flags.ptr2e ??= {};
            newPerk.flags.ptr2e = fu.mergeObject(newPerk.flags.ptr2e, current.toObject().flags.ptr2e, { inplace: false });
            newPerk.flags.ptr2e.tierSlug = perk.slug;
            newPerk.system.originSlug = current.system.originSlug;

            if (hasEffectGrants) {
              current?.delete();
              await ItemPTR2e.create(newPerk, {
                parent: this.actor
              });
              return void PerkWebApp.refresh.call(this);
            }
            else {
              if (current.effects.size) await current.deleteEmbeddedDocuments("ActiveEffect", current.effects.map(effect => effect.id));
              await current.update({
                name: newPerk.name,
                img: newPerk.img,
                effects: newPerk.effects,
                system: newPerk.system,
                "flags.ptr2e": newPerk.flags.ptr2e
              })
              return void PerkWebApp.refresh.call(this);
            }
          }

          await this.actor.perks.get(
            this.currentNode.perk.system.variant === "multi"
              ? this.currentNode.perk.system.mode === "shared"
                ? this.currentNode.perk.slug
                : this.currentNode.slug
              : this.currentNode.tierInfo?.lastTier.slug ?? this.currentNode.tierInfo?.perk.slug ?? this.currentNode.slug
          )?.delete();
          PerkWebApp.refresh.call(this);
        },
        "evolve": async function (this: PerkWebApp) {
          if (!this.currentNode || !this.actor) return;
          if (!this.currentNode.perk.flags.ptr2e?.evolution) return;

          const perk = this.currentNode.perk;
          const species = await fromUuid<SpeciesPTR2e>((perk.flags.ptr2e.evolution as { uuid: string }).uuid);
          if (!species) return;

          const current = this.actor.species;
          if (!current) return;

          const level = this.actor.system.advancement.level;
          const currentMoveSlugs = new Set(this.actor.itemTypes.move.map(move => move.slug));
          const newMoves = await (async () => {
            const levelUpMoves = (species.system.moves.levelUp as ModelPropsFromSchema<LevelUpMoveSchema>[]).filter((move) => move.level <= level && !currentMoveSlugs.has(sluggify(move.name)));

            return (await Promise.all(
              levelUpMoves.map(async (move) => fromUuid<MovePTR2e>(move.uuid))
            )).flatMap((move) => move ? [move] : []);
          })();

          const { portrait: img, token: tokenImage } = await (async () => {
            const config = game.ptr.data.artMap.get(species.system.slug || sluggify(species.name));
            if (!config) return { portrait: "icons/svg/mystery-man.svg", token: "icons/svg/mystery-man.svg" };
            const resolver = await ImageResolver.createFromSpeciesData(
              {
                dexId: species.system.number,
                shiny: this.actor!.system.shiny,
                forms: species.system.form ? [species.system.form] : [],
              },
              config
            );
            if (!resolver?.result) return { portrait: "icons/svg/mystery-man.svg", token: "icons/svg/mystery-man.svg" };

            const tokenResolver = await ImageResolver.createFromSpeciesData(
              {
                dexId: species.system.number,
                shiny: this.actor!.system.shiny,
                forms: species.system.form ? [species.system.form, "token"] : ["token"],
              },
              config
            );
            return {
              portrait: resolver.result,
              token: tokenResolver?.result ?? resolver.result
            }
          })();

          const flags = species.flags;
          flags.core ??= {};
          flags.core.sourceId = species.uuid;

          await this.actor.update({
            name: this.actor.name == current.name ? species.name : this.actor.name,
            img: img,
            prototypeToken: {
              img: tokenImage,
              texture: {
                src: tokenImage,
              }
            }
          });

          this.actor.updateEmbeddedDocuments("Item", [
            {
              flags,
              name: species.system.slug ? Handlebars.helpers.formatSlug(species.system.slug) : species.name,
              type: 'species',
              img: img,
              system: species.system.toObject(),
              _id: "actorspeciesitem",
              effects: species.effects.map(e => e.toObject())
            }
          ]);

          await this.actor.createEmbeddedDocuments("Item", newMoves.map(move => move.toObject()));

          return void PerkWebApp.refresh.call(this);
        },
        "load-search": async function (this: PerkWebApp) {
          if (!this.perkTab) return;
          if (this.perkTab.isInitialized) return;

          await this.perkTab.init();
          this.render({ parts: ["search"] });
        }
      }
    },
    { inplace: false }
  );

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    hudHeader: {
      id: "hudHeader",
      template: "systems/ptr2e/templates/perk-tree/hud/header.hbs",
      classes: ["hud"]
    },
    hudActor: {
      id: "hudActor",
      template: "systems/ptr2e/templates/perk-tree/hud/actor.hbs",
      classes: ["hud"]
    },
    hudZoom: {
      id: "hudZoom",
      template: "systems/ptr2e/templates/perk-tree/hud/zoom.hbs",
      classes: ["hud"]
    },
    hudPerk: {
      id: "hudPerk",
      template: "systems/ptr2e/templates/perk-tree/hud/perk.hbs",
      classes: ["hud"]
    },
    hudControls: {
      id: "hudControls",
      template: "systems/ptr2e/templates/perk-tree/hud/controls.hbs",
      classes: ["hud"]
    },
    web: {
      id: "web",
      template: "systems/ptr2e/templates/apps/perk-web/web.hbs",
      scrollable: [".scroll"]
    },
    search: {
      id: "search",
      template: "systems/ptr2e/templates/perk-tree/search/search.hbs",
      classes: ["search"]
    },
    searchResults: {
      id: "searchResults",
      template: "systems/ptr2e/templates/perk-tree/search/results.hbs",
      classes: ["search"]
    }
  };

  static STOP_WORDS = new Set([
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "has",
    "he",
    "in",
    "is",
    "it",
    "its",
    "of",
    "on",
    "that",
    "the",
    "to",
    "was",
    "were",
    "will",
    "with",
    "th",
  ]);

  actor: ActorPTR2e | null = null;
  currentNode: PerkNode | null = null;
  connectionNode: PerkNode | null = null;
  editMode = false;
  zoomLevels = [0.05, 0.1, 0.2, 0.4, 0.65, 1, 1.3, 1.65] as const;

  _onScroll: () => void | null;
  _lineCache = new Map<string, SVGLineElement>();
  _zoomAmount: this['zoomLevels'][number] = 0.4;

  web: "global" | ItemUUID = "global";
  private speciesEvolutions: PerkPTR2e[] = [];
  private underdogPerks: PerkPTR2e[] = [];
  private perkTab: CompendiumBrowserPerkTab | null = null;

  constructor(actor: ActorPTR2e, options?: Partial<ApplicationConfigurationExpanded>) {
    super(options);
    this.actor = actor;
  }

  override async _prepareContext(options?: foundry.applications.api.HandlebarsRenderOptions | undefined) {
    const maxRow = 250;
    const maxCol = 250;

    if (!this.perkTab?.isInitialized) {
      this.perkTab = new CompendiumBrowserPerkTab(game.ptr.compendiumBrowser);
      this.perkTab.filterData.sliders.apCost.isExpanded = true;
    }

    interface GridEntry {
      name?: string;
      img?: string;
      x: number;
      y: number;
      classes: string[],
      state?: PerkPurchaseState;
      uuid?: string;
    }

    const webOptions = [
      {
        value: "global",
        label: this.actor?.name ? `${this.actor.name}'s Global Perk Web` : "Global Perk Web"
      }
    ]
    const uuid = this.actor?.species?.evolutions?.uuid ?? this.actor?.species?.parent?.flags?.core?.sourceId ?? this.actor?.species?.parent?.uuid;
    if (uuid) webOptions.push({
      value: uuid,
      label: this.actor?.name ? `${this.actor.name}'s Species Perk Web` : "Species Perk Web"
    });

    if (!this._perkStore) {
      const perks = Array.from((await game.ptr.perks.initialize()).perks.values());
      perks.push(...this.speciesEvolutions, ...this.underdogPerks);
      this._perkStore = new PerkStore({ perks, web: this.web });
    }
    if (!this._perkStore.initialized) {
      this._perkStore.updateState(this.actor);
    }

    const grid: GridEntry[] = [];
    for (let x = 1; x < maxRow; x++) {
      for (let y = 1; y < maxCol; y++) {
        const node = this._perkStore.get(`${x}-${y}`);
        const perk = node?.perk;
        if (perk) {
          const classFromState = {
            [PerkState.unavailable]: "unavailable",
            [PerkState.connected]: "connected",
            [PerkState.available]: "available",
            [PerkState.purchased]: "purchased",
            [PerkState.invalid]: "invalid",
            [PerkState.autoUnlocked]: "auto-unlocked",
          }[node.state];
          const classes: string[] = [];
          if (node === this.connectionNode) classes.push("selected");
          if (!this.editMode) classes.push(classFromState);
          if (node.node.type === "root") classes.push("root");
          if (node.node.type === "entry") classes.push("entry");
          if (node.perk.flags.ptr2e?.evolution) classes.push("evolution");

          if (node.tierInfo) {
            if (!node.tierInfo.maxTierPurchased) classes.push("tiered");
            classes.push(`tier-${node.tierInfo.tier}`);

            const tierNode = node.perk.system.nodes.find(n => {
              if (node.tierInfo!.tier === 1 && !n.tier) return true;
              if (!n.tier) return false;
              return n.tier.rank === node.tierInfo!.tier;
            })
            const img = node.tierInfo.perk.system.primaryNode?.config?.texture ?? tierNode?.config?.texture ?? node.tierInfo.perk.img ?? node.node.config?.texture ?? perk.img;

            grid.push({
              name: node.tierInfo.perk.name,
              img,
              x,
              y,
              classes,
              state: node.state,
              uuid: node.tierInfo.perk.uuid
            });
          }
          else {
            grid.push({
              name: perk.name,
              img: node.node.config?.texture ?? perk.img,
              x,
              y,
              classes,
              state: node.state,
              uuid: perk.uuid
            });
          }
        }
        else {
          grid.push({ x, y, classes: [] });
        }
      }
    }

    this.#allTraits = game.ptr.data.traits.map((trait) => ({
      value: trait.slug,
      label: trait.label,
      type: trait.type,
    }));

    const perk = this.currentNode?.tierInfo?.perk ?? this.currentNode?.perk;

    return {
      ...super._prepareContext(options),
      grid,
      actor: this.actor,
      perk: {
        document: perk,
        fields: perk?.system.schema.fields,
        traits: perk?.system.traits.map((trait) => ({ value: trait.slug, label: trait.label, type: trait.type })),
        actions: perk?.system?.actions?.map(action => ({
          action,
          traits: action.traits.map(trait => ({ value: trait.slug, label: trait.label })),
          fields: action.schema.fields,
        })),
        state: {
          available: [PerkState.connected, PerkState.available].includes(this.currentNode?.state as unknown as 1 | 2),
          purchasable: this.currentNode?.state === PerkState.available,
          refundable: this.currentNode?.tierInfo ? true : this.currentNode?.state === PerkState.purchased,
          evolution: !!perk?.flags.ptr2e?.evolution,
        },
        cost: {
          purchase: this.currentNode?.tierInfo
            ? `${game.i18n.localize("PTR2E.PerkWebApp.PurchaseTier")} ${this.currentNode.tierInfo.tier} (${perk?.system.cost} AP)`
            : `${game.i18n.localize("PTR2E.PerkWebApp.PurchasePerk")} (${perk?.system.cost} AP)`,
          refund: this.currentNode?.tierInfo
            ? `${game.i18n.localize("PTR2E.PerkWebApp.RefundTier")} ${this.currentNode.tierInfo.maxTierPurchased ? this.currentNode.tierInfo.maxTier : (this.currentNode.tierInfo.tier - 1)} (${this.currentNode?.tierInfo.lastTier.system.cost} AP)`
            : `${game.i18n.localize("PTR2E.PerkWebApp.RefundPerk")} (${perk?.system.cost} AP)`,
          evolution: perk?.flags.ptr2e?.evolution ? game.i18n.format("PTR2E.PerkWebApp.Evolve", { name: Handlebars.helpers.capitalizeFirst(perk?.name?.replace("Evolution: ", '')) || "" }) : null
        }
      },
      zoom: this._zoomAmount,
      editMode: this.editMode,
      global: this.web === "global",
      webOptions,
      web: this.web,
      filterData: this.perkTab.filterData,
      noZoom: navigator.userAgent.includes("FoundryVirtualTabletop")
    }
  }

  override _preparePartContext(partId: string, context: ApplicationRenderContext): Promise<ApplicationRenderContext> {
    if (partId === "hudZoom") {
      context.zoomLevels = this.zoomLevels;
      context.zoomLevel = this._zoomAmount;
    }

    if (partId === "hudPerk" && 'perk' in context && context.perk && typeof context.perk === "object" && 'document' in context.perk && context.perk.document) {
      const perk = context.perk.document as PerkPTR2e;
      (context.perk as Record<string, unknown>).prerequisites = perk.system.getPredicateStrings();
    }

    return super._preparePartContext(partId, context);
  }

  #allTraits: { value: string; label: string, type?: Trait["type"] }[] | undefined;
  private isSortableDragging = false;

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);

    if (partId === "hudHeader") {
      const select = htmlElement.querySelector<HTMLSelectElement>("select[name='web']");
      if (!select) return;

      select.addEventListener("change", async (event) => {
        event.preventDefault();
        const value = select.value as "global" | ItemUUID;

        if (value === this.web) return;
        if (value === "global") {
          return this.setWeb(null);
        }
        const species = await fromUuid<SpeciesPTR2e>(value);
        this.setWeb(species ?? null);
      });
    }

    if (partId === "hudZoom") {
      const zoomValueSelect = htmlElement.querySelector<HTMLSelectElement>("select[name='zoom-value']");
      zoomValueSelect?.addEventListener("change", (event) => {
        event.preventDefault();
        this.zoom(Number(zoomValueSelect.value) as this['zoomLevels'][number], false);
      });
    }

    if (partId === "web") {
      const perks = htmlElement.querySelectorAll<HTMLElement>(".perk")
      for (const perk of perks) {
        perk.addEventListener("click", async (event) => {
          event.preventDefault();
          const { x, y } = perk.dataset;
          if (!x || !y) return;
          const perkKey = `${Number(x)}-${Number(y)}`;

          if (this.editMode && this.connectionNode) {
            const node = this._perkStore.get(perkKey) ?? null;
            if (!node || node === this.connectionNode) return;

            const getUpdatedConnections = (a: PerkNode, b: PerkNode, operation?: "add" | "remove") => {
              const connected = Array.from(a.connected ?? []);
              const index = connected.indexOf(b.slug);
              if (index === -1) {
                if (operation === "remove") return { connected, operation };
                connected.push(b.slug);
                operation = "add";
              } else {
                if (operation === "add") return { connected, operation };
                connected.splice(index, 1);
                operation = "remove";
              }
              return { connected, operation };
            };

            const { connected: updateCurrent, operation } = getUpdatedConnections(this.connectionNode, node);
            const { connected: updateTarget } = getUpdatedConnections(node, this.connectionNode, operation);

            if (this.connectionNode.perk === node.perk) {
              if (this.connectionNode.perk.id) await this.connectionNode.perk.update({
                "system.nodes": (() => {
                  const nodes = this.connectionNode.perk.system.toObject().nodes;
                  const indexCurrent = this.connectionNode.perk.system.nodes.indexOf(this.connectionNode.node);
                  const indexTarget = this.connectionNode.perk.system.nodes.indexOf(node.node);
                  if (indexCurrent === -1 || indexTarget === -1) return nodes;
                  nodes[indexCurrent].connected = Array.from(new Set(updateCurrent));
                  nodes[indexTarget].connected = Array.from(new Set(updateTarget));
                  return nodes;
                })()
              })
            }

            if (this.connectionNode.perk.pack === node.perk.pack) {
              await ItemPTR2e.updateDocuments([
                ...(
                  this.connectionNode.perk.id
                    ? [{
                      _id: this.connectionNode.perk._id,
                      "system.nodes": (() => {
                        const nodes = this.connectionNode.perk.system.toObject().nodes;
                        const index = this.connectionNode.perk.system.nodes.indexOf(this.connectionNode.node);
                        if (index === -1) return nodes;
                        nodes[index].connected = Array.from(new Set(updateCurrent));
                        return nodes;
                      })()
                    }]
                    : []
                ),
                ...(
                  node.perk.id
                    ? [{
                      _id: node.perk._id,
                      "system.nodes": (() => {
                        const nodes = node.perk.system.toObject().nodes;
                        const index = node.perk.system.nodes.indexOf(node.node);
                        if (index === -1) return nodes;
                        nodes[index].connected = Array.from(new Set(updateTarget));
                        return nodes;
                      })()
                    }]
                    : []
                )
              ], this.connectionNode.perk.pack ? { pack: this.connectionNode.perk.pack } : {});
            }
            else {
              if (this.connectionNode.perk.id) await this.connectionNode.perk.update({
                "system.nodes": (() => {
                  const nodes = this.connectionNode.perk.system.toObject().nodes;
                  const index = this.connectionNode.perk.system.nodes.indexOf(this.connectionNode.node);
                  if (index === -1) return nodes;
                  nodes[index].connected = Array.from(new Set(updateCurrent));
                  return nodes;
                })()
              }, this.connectionNode.perk.pack ? { pack: this.connectionNode.perk.pack } : {});
              if (node.perk.id) await node.perk.update({
                "system.nodes": (() => {
                  const nodes = node.perk.system.toObject().nodes;
                  const index = node.perk.system.nodes.indexOf(node.node);
                  if (index === -1) return nodes;
                  nodes[index].connected = Array.from(new Set(updateTarget));
                  return nodes;
                })()
              }), node.perk.pack ? { pack: node.perk.pack } : {};
            }

            PerkWebApp.refresh.call(this);
            return;
          }

          this.currentNode = this._perkStore.get(perkKey) ?? null;
          this.render({ parts: ["hudPerk"] });
        });
        perk.addEventListener("dblclick", (event) => {
          event.preventDefault();
          event.stopPropagation();
          const { x, y } = perk.dataset;
          if (!x || !y) return;
          const perkKey = `${Number(x)}-${Number(y)}`;
          const node = this._perkStore.get(perkKey) ?? null;
          node?.perk?.sheet?.render(true);
        });
        perk.addEventListener("contextmenu", (event) => {
          if (!this.editMode) return;
          event.preventDefault();
          event.stopPropagation();
          const { x, y } = perk.dataset;
          if (!x || !y) return;
          const perkKey = `${Number(x)}-${Number(y)}`;
          const node = this._perkStore.get(perkKey) ?? null;
          this.connectionNode = node === this.connectionNode ? null : (node ?? null);
          this.render({ parts: ["web"] });
        });
      }

      const main = htmlElement.querySelector<HTMLElement>("section.perk-grid");
      if (!main) return;

      new Sortable(main, {
        multiDrag: true,
        draggable: ".perk",
        setData: (dataTransfer, dragEl) => {
          if ('x' in dragEl.dataset && 'y' in dragEl.dataset) {
            const x = Number(dragEl.dataset.x);
            const y = Number(dragEl.dataset.y);
            const node = this._perkStore.get(`${x}-${y}`) ?? null;
            if (!node) return;

            dataTransfer!.setData("text/plain", JSON.stringify({
              ...node.perk.toDragData(),
              x,
              y
            }));
          }
        },
        onChoose: () => {
          this.isSortableDragging = true;
        },
        onEnd: (event) => {
          // Grab all items, and make sure that the item at `.item` is sorted as index 0
          const items = event.items.length ? (() => {
            const items = event.items;
            if (items.length > 1) {
              items.splice(items.indexOf(event.item), 1);
              items.unshift(event.item);
              return items;
            }
            return items;
          })() : [event.item];

          const data = items.flatMap(el => {
            const x = Number(el.dataset.x)
            const y = Number(el.dataset.y);
            const node = this._perkStore.get(`${x}-${y}`) ?? null;
            return node ? {
              ...node.perk.toDragData(),
              x,
              y
            } : []
          })

          //@ts-expect-error - originalEvent exists
          this._onDrop(event.originalEvent, data);

          event.items.map(el => Sortable.utils.deselect(el));

          this.isSortableDragging = false;
        },
        selectedClass: "highlighted",
      })
    }

    if (partId === 'hudPerk') {
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
              )}style="${Trait.bgColors[tagData.type || "default"] ? `--tag-bg: ${Trait.bgColors[tagData.type || "default"]!["bg"]}; --tag-hover: ${Trait.bgColors[tagData.type || "default"]!["hover"]}; --tag-border-color: ${Trait.bgColors[tagData.type || "default"]!["border"]};` : ""}">
                            <x title="" class="tagify__tag__removeBtn" role="button" aria-label="remove tag"></x>
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

    if (partId === "search") {
      const currentTab = this.perkTab;
      if (!currentTab) return;

      const search = htmlElement.querySelector<HTMLInputElement>("input[name=textFilter]");
      if (search) {
        search.addEventListener("input", () => {
          if (search.value?.length === 1) return;
          currentTab.filterData.search.text = search.value;
          this.#clearScrollLimit();
          this.#renderResultList({ replace: true });
        });
      }

      // Sort item list
      const sortContainer = htmlElement.querySelector<HTMLDivElement>("div.sortcontainer");
      if (sortContainer) {
        const order = sortContainer.querySelector<HTMLSelectElement>("select.order");
        if (order) {
          order.addEventListener("change", () => {
            currentTab.filterData.order.by = order.value ?? "name";
            this.#clearScrollLimit(true);
          });
        }
        const directionAnchor = sortContainer.querySelector<HTMLAnchorElement>("a.direction");
        if (directionAnchor) {
          directionAnchor.addEventListener("click", () => {
            const direction = directionAnchor.dataset.direction ?? "asc";
            currentTab.filterData.order.direction = direction === "asc" ? "desc" : "asc";
            this.#clearScrollLimit(true);
          });
        }

        if (currentTab.isOfType("species", "move")) {
          const selects = currentTab.filterData.selects;
          if (selects) {
            const selectElements = sortContainer.querySelectorAll<HTMLSelectElement>("select[name]");
            for (const select of selectElements) {
              const filterName = select.getAttribute("name");
              if (objectHasKey(selects, filterName)) {
                const data = selects[filterName] as SelectData;
                select.addEventListener("change", () => {
                  data.selected = select.value;
                  this.render({ parts: ["search"] });
                });
              }
            }
          }
        }
      }

      // Clear all filters button
      htmlElement.querySelector<HTMLButtonElement>("button.clear-filters")?.addEventListener("click", () => {
        this.#resetFilters();
        this.#clearScrollLimit(true);
      });

      // Filters
      const filterContainers = htmlElement.querySelectorAll<HTMLDivElement>("div.filtercontainer");
      for (const container of Array.from(filterContainers)) {
        const { filterType, filterName } = container.dataset;
        // Clear this filter button
        container
          .querySelector<HTMLButtonElement>("button[data-action=clear-filter]")
          ?.addEventListener("click", (event) => {
            event.stopImmediatePropagation();
            switch (filterType) {
              case "checkboxes": {
                if (!('checkboxes' in currentTab.filterData)) return;

                const checkboxes = currentTab.filterData.checkboxes as Record<string, CheckboxData>
                if (objectHasKey(checkboxes, filterName)) {
                  for (const option of Object.values((checkboxes[filterName] as CheckboxData).options)) {
                    option.selected = false;
                  }
                  (checkboxes[filterName] as CheckboxData).selected = [];
                  this.render(true);
                }
                break;
              }
            }
          });

        // Toggle visibility of filter container
        const title = container.querySelector<HTMLDivElement>("div.title");
        title?.addEventListener("click", () => {
          const toggleFilter = (filter: CheckboxData | RangesInputData | SliderData) => {
            filter.isExpanded = !filter.isExpanded;
            const contentElement = title.nextElementSibling;
            if (contentElement instanceof HTMLElement) {
              contentElement.style.display = filter.isExpanded ? "" : "none";
            }
          };
          switch (filterType) {
            case "checkboxes": {
              if (!currentTab.isOfType("species", "gear", "move")) return;
              if (objectHasKey(currentTab.filterData.checkboxes, filterName)) {
                toggleFilter(currentTab.filterData.checkboxes[filterName]);
              }
              break;
            }
            case "sliders": {
              if (!currentTab.isOfType("gear", "move", "perk")) return;
              if (objectHasKey(currentTab.filterData.sliders, filterName)) {
                toggleFilter(currentTab.filterData.sliders[filterName]);
              }
              break;
            }
          }
        });

        if (filterType === "checkboxes") {
          container.querySelectorAll<HTMLInputElement>("input[type=checkbox]").forEach((checkboxElement) => {
            checkboxElement.addEventListener("click", () => {
              if (!currentTab.isOfType("species", "gear", "move")) return;
              if (objectHasKey(currentTab.filterData.checkboxes, filterName)) {
                const optionName = checkboxElement.name;
                const checkbox = currentTab.filterData.checkboxes[filterName] as CheckboxData;
                const option = checkbox.options[optionName];
                option.selected = !option.selected;
                if (option.selected) {
                  checkbox.selected.push(optionName);
                } else {
                  checkbox.selected = checkbox.selected.filter((name) => name !== optionName);
                }
                this.#clearScrollLimit(true);
              }
            });
          });
        }

        // if (filterType === "ranges") {
        //   container.querySelectorAll<HTMLInputElement>("input[name*=Bound]").forEach((range) => {
        //     range.addEventListener("keyup", (event) => {
        //       if (!currentTab.isOfType("species")) return;
        //       if (event.key !== "Enter") return;
        //       const ranges = currentTab.filterData.ranges;
        //       if (ranges && objectHasKey(ranges, filterName)) {
        //         const range = ranges[filterName];
        //         const lowerBound =
        //           container.querySelector<HTMLInputElement>("input[name*=lowerBound]")?.value ?? "";
        //         const upperBound =
        //           container.querySelector<HTMLInputElement>("input[name*=upperBound]")?.value ?? "";
        //         const values = currentTab.parseRangeFilterInput(filterName, lowerBound, upperBound);
        //         range.values = values;
        //         range.changed = true;
        //         this.#clearScrollLimit(true);
        //       }
        //     });
        //   });
        // }

        if (filterType === "multiselects") {
          // Multiselects using tagify
          const multiselects = currentTab.filterData.multiselects;
          if (!multiselects) continue;
          if (objectHasKey(multiselects, filterName)) {
            const multiselect = container.querySelector<HTMLInputElement>(
              `input[name=${filterName}][data-tagify-select]`,
            );
            if (!multiselect) continue;
            const data = multiselects[filterName];

            const tagify = new Tagify(multiselect, {
              enforceWhitelist: true,
              keepInvalidTags: false,
              editTags: false,
              tagTextProp: "label",
              dropdown: {
                enabled: 0,
                fuzzySearch: false,
                mapValueTo: "label",
                maxItems: data.options.length,
                searchKeys: ["label"],
              },
              whitelist: data.options,
              transformTag(tagData) {
                const selected = data.selected.find((s) => s.value === tagData.value);
                if (selected?.not) {
                  (tagData as unknown as { class: string }).class = "conjunction-not";
                }
              },
            });

            tagify.on("click", (event) => {
              const target = event.detail.event.target as HTMLElement;
              if (!target) return;
              const action = htmlClosest(target, "[data-action]")?.dataset?.action;
              if (action === "toggle-not") {
                const value = event.detail.data.value;
                const selected = data.selected.find((s) => s.value === value);
                if (selected) {
                  selected.not = !selected.not;
                  this.render({ parts: ["search"] });
                }
              }
            });
            tagify.on("change", (event) => {
              const selections: unknown = JSON.parse(event.detail.value || "[]");
              const isValid =
                Array.isArray(selections) &&
                selections.every(
                  (s: unknown): s is { value: string; label: string } =>
                    isObject<{ value: unknown }>(s) && typeof s["value"] === "string",
                );

              if (isValid) {
                data.selected = selections;
                this.render({ parts: ["search"] });
              }
            });

            for (const element of htmlQueryAll<HTMLInputElement>(
              container,
              `input[name=${filterName}-filter-conjunction]`,
            )) {
              element.addEventListener("change", () => {
                const value = element.value;
                if (value === "and" || value === "or") {
                  data.conjunction = value;
                  this.render({ parts: ["search"] });
                }
              });
            }

            for (const tag of htmlQueryAll(container, "tag")) {
              const icon = fontAwesomeIcon("ban", { style: "solid" });
              const notButton = createHTMLElement("a", {
                classes: ["conjunction-not-button", ...(tag.getAttribute("not") == "true" ? ["active"] : [])],
                children: [icon],
                dataset: { action: "toggle-not" },
              });
              tag.appendChild(notButton);
            }
          }
        }

        if (filterType === "sliders") {
          // Slider filters
          if (!currentTab.isOfType("perk", "gear", "move")) return;
          const sliders = currentTab.filterData.sliders;
          if (!sliders) continue;

          if (objectHasKey(sliders, filterName)) {
            const sliderElement = container.querySelector<HTMLDivElement>(`div.slider-${filterName}`);
            if (!sliderElement) continue;
            const sliderData = sliders[filterName] as SliderData;

            const slider = noUiSlider.create(sliderElement, {
              range: {
                min: sliderData.values.lowerLimit,
                max: sliderData.values.upperLimit,
              },
              start: [sliderData.values.min, sliderData.values.max],
              tooltips: {
                to(value: number) {
                  return Math.floor(value).toString();
                },
              },
              connect: [false, true, false],
              behaviour: "snap",
              step: sliderData.values.step,
            });

            slider.on("change", (values) => {
              const [min, max] = values.map((value) => Number(value));
              sliderData.values.min = min;
              sliderData.values.max = max;

              const $minLabel = $(htmlElement).find(`label.${name}-min-label`);
              const $maxLabel = $(htmlElement).find(`label.${name}-max-label`);
              $minLabel.text(min);
              $maxLabel.text(max);

              this.#clearScrollLimit(true);
            });

            // Set styling
            sliderElement.querySelectorAll<HTMLDivElement>(".noUi-handle").forEach((element) => {
              element.classList.add("handle");
            });
            sliderElement.querySelectorAll<HTMLDivElement>(".noUi-connect").forEach((element) => {
              element.classList.add("range_selected");
            });
          }
        }
      }

    }
  }

  /**
   * Append new results to the result list
   * @param options Render options
   * @param options.list The result list HTML element
   * @param options.start The index position to start from
   * @param options.replace Replace the current list with the new results?
   */
  async #renderResultList({ list, start = 0, replace = false }: RenderResultListOptions): Promise<void> {
    if (!this.perkTab?.isInitialized) return;
    const html = this.element;

    if (!list) {
      const listElement = html.querySelector<HTMLUListElement>("ul.item-list.result-list");
      if (!listElement) return;
      list = listElement;
    }

    // Get new results from index
    const newResults = await this.perkTab.renderResults(start);
    // Add listeners to new results only
    this.#activateResultListeners(newResults);
    // Add the results to the DOM
    const fragment = document.createDocumentFragment();
    fragment.append(...newResults);
    if (replace) {
      list.replaceChildren(fragment);
    } else {
      list.append(fragment);
    }

    // Re-apply drag drop handler
    for (const dragDropHandler of this._dragDropHandlers) {
      dragDropHandler.bind(html);
    }
  }

  private multiPerkCycle: Record<ItemUUID, number> = {};

  /** Activate click listeners on loaded actors and items */
  #activateResultListeners(liElements: HTMLLIElement[] = []): void {
    for (const liElement of liElements) {
      const { entryUuid } = liElement.dataset;
      if (!entryUuid) continue;

      const nameAnchor = liElement.querySelector<HTMLAnchorElement>("div.name > a");
      if (nameAnchor) {
        nameAnchor.addEventListener("click", async () => {
          const document = await fromUuid<PerkPTR2e>(entryUuid);
          let node = this._perkStore.nodeFromSlug(document?.slug ?? "");
          if (!node) return;

          if (node.perk.system.variant === "multi") {
            const current = this.multiPerkCycle[entryUuid as ItemUUID] ?? -1;
            const cycle = this.multiPerkCycle[entryUuid as ItemUUID] = (current + 1);

            const nodeData = node.perk.system.nodes.at(cycle);
            const newNode = this._perkStore.get(`${nodeData?.x}-${nodeData?.y}`);
            if (newNode) node = newNode;
          }

          const perkElement = this.element.querySelector(`div.perk[data-x="${node.position.x}"][data-y="${node.position.y}"]`)
          this.currentNode = node;
          perkElement?.scrollIntoView({ inline: 'center', block: 'center', behavior: 'smooth' });
          this.render({ parts: ["hudPerk"] });
        });
      }
    }
  }

  #resetFilters(): void {
    if (this.perkTab) {
      this.perkTab.resetFilters();
    }
  }

  #clearScrollLimit(render = false): void {
    if (!this.perkTab) return;

    const list = htmlQuery(this.element, "ul.item-list.result-list");
    if (!list) return;
    list.scrollTop = 0;
    this.perkTab.scrollLimit = 100;

    if (render) {
      this.render({ parts: ["search"] });
    }
  }

  override _onRender(context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._onRender(context, options);

    this.renderSVG();

    if (options?.parts?.some(p => ["search", "searchResults"].includes(p))) {
      this.#renderResultList({ replace: true });
    }
  }

  renderSVG() {
    const element = this.element.querySelector<HTMLElement>(`[data-application-part="web"] .scroll`);
    if (!element) return;

    const existing = element.querySelector<SVGSVGElement>("svg");
    const svg = existing ?? document.createElementNS("http://www.w3.org/2000/svg", "svg");

    const zoom = this._zoomAmount;
    const bounding = element.getBoundingClientRect();
    const elementRect = { x: bounding.x, y: bounding.y, width: bounding.width, height: bounding.height };
    const scroll = { x: element.scrollLeft, y: element.scrollTop };

    if (!existing) {
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "100%");
      svg.setAttribute("viewBox", `0 0 ${elementRect.width} ${elementRect.height}`);
      element.appendChild(svg);
      this._lineCache.clear();
    }

    const elements = element.querySelectorAll<HTMLElement>(".perk-grid .perk");
    const elementMap = new Map<string, HTMLElement>();
    for (const el of elements) {
      const { x, y } = el.dataset;
      if (!x || !y) continue;
      elementMap.set(`${Number(x)}-${Number(y)}`, el);
    }

    const madeConnections = new Set<string>();

    for (const el of elements) {
      const perkKey = `${Number(el.dataset.x)}-${Number(el.dataset.y)}`;
      const node = this._perkStore.get(perkKey);
      if (!node) continue;

      const perkRect = el.getBoundingClientRect();
      const connected = node.node.connected ?? [];

      for (const connection of connected) {
        const connectedNode = this._perkStore.nodeFromSlug(connection);
        if (!connectedNode) continue;

        const connectedKey = `${connectedNode.position.x}-${connectedNode.position.y}`;
        if (!existing) {
          if (madeConnections.has(`${perkKey}-${connectedKey}`)) continue;
        }

        const connectedElement = elementMap.get(connectedKey);
        if (!connectedElement) continue;

        const line = existing ? this._lineCache.get(`${perkKey}-${connectedKey}`) : document.createElementNS("http://www.w3.org/2000/svg", "line");
        if (!line) continue;

        const connectedRect = connectedElement.getBoundingClientRect();
        const x1 = (((perkRect.x + scroll.x) * zoom) + ((perkRect.width * zoom) / 2) - (elementRect.x * zoom));
        const y1 = (((perkRect.y + scroll.y) * zoom) + ((perkRect.height * zoom) / 2) - (elementRect.y * zoom));
        const x2 = (((connectedRect.x + scroll.x) * zoom) + ((connectedRect.width * zoom) / 2) - (elementRect.x * zoom));
        const y2 = (((connectedRect.y + scroll.y) * zoom) + ((connectedRect.height * zoom) / 2) - (elementRect.y * zoom));

        const color = (() => {
          if (this.editMode) return "#ffffff";
          if (node.state === PerkState.purchased || !!node.tierInfo || connectedNode.state === PerkState.purchased || !!connectedNode.tierInfo) return "#ffffff";
          return "#898989";
        })();

        line.setAttribute("x1", x1.toString());
        line.setAttribute("y1", y1.toString());
        line.setAttribute("x2", x2.toString());
        line.setAttribute("y2", y2.toString());
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", (2.5 * zoom * zoom * (color === '#ffffff' ? 1 : 0.85)).toString());
        if (existing) continue;

        svg.appendChild(line);
        this._lineCache.set(`${perkKey}-${connectedKey}`, line);
        this._lineCache.set(`${connectedKey}-${perkKey}`, line);
        madeConnections.add(`${perkKey}-${connectedKey}`);
        madeConnections.add(`${connectedKey}-${perkKey}`);
      }
    }

    if (existing) return void this._onScroll?.();

    const onScroll = () => {
      const bounding = element.getBoundingClientRect();

      // const inverseMod = 1 / zoom;
      const width = bounding.width * this._zoomAmount;
      const height = bounding.height * this._zoomAmount;
      const scrollY = element.scrollTop * this._zoomAmount;
      const scrollX = element.scrollLeft * this._zoomAmount;

      svg.setAttribute("viewBox", `${scrollX} ${scrollY} ${width} ${height}`);
    }

    this._onScroll = onScroll;
    element.addEventListener("scroll", onScroll);
    onScroll();

    this.attachElementListeners(element);
  }

  attachElementListeners(element: HTMLElement) {
    let isDown = false;
    let isMoving = false;
    let startX: number;
    let startY: number;
    let scrollLeft: number = element.scrollLeft;
    let scrollTop: number = element.scrollTop;

    element.addEventListener("mousedown", (e) => {
      // If right mouse button is clicked
      if (e.button !== 2) return;

      isDown = true;
      startX = e.pageX - element.offsetLeft;
      startY = e.pageY - element.offsetTop;
      scrollLeft = element.scrollLeft;
      scrollTop = element.scrollTop;

      // element.style.cursor = this._zoomAmount === this.zoomLevels.at(-1) ? "unset" : "zoom-out";
    })

    element.addEventListener("mouseleave", () => {
      isDown = false;
      isMoving = false;
      // element.style.cursor = this._zoomAmount === this.zoomLevels[0] ? "unset" : "zoom-in";
    });

    element.addEventListener("mouseup", () => {
      isDown = false;
      // element.style.cursor = this._zoomAmount === this.zoomLevels[0] ? "unset" : "zoom-in";
      element.style.cursor = "unset";
      setTimeout(() => { isMoving = false });
    });

    element.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      isMoving = true;
      e.preventDefault();
      const x = e.pageX - element.offsetLeft;
      const y = e.pageY - element.offsetTop;
      const walkX = (x - startX) * 2.5;
      const walkY = (y - startY) * 2.5;
      const left = scrollLeft - walkX;
      const top = scrollTop - walkY;
      element.scrollLeft = left;
      element.scrollTop = top;

      element.style.cursor = "move";

      element.scrollTo(left, top);
    });

    const web = element.firstElementChild as HTMLElement;

    element.addEventListener("click", (e) => {
      if (!([element, web] as unknown as Maybe<EventTarget>[]).includes(e.target)) return;
      e.preventDefault();

      const currentZoomLevel = this.zoomLevels.indexOf(this._zoomAmount);
      if (currentZoomLevel === -1) return this.zoom(1);

      const nextZoomLevel = Math.max(0, currentZoomLevel + 1);
      if (nextZoomLevel === currentZoomLevel) return;

      this.zoom(this.zoomLevels[nextZoomLevel]);
    })

    element.addEventListener("contextmenu", (e) => {
      if (isMoving) return;
      if (!([element, web] as unknown as Maybe<EventTarget>[]).includes(e.target)) return;
      e.preventDefault();

      const currentZoomLevel = this.zoomLevels.indexOf(this._zoomAmount);
      if (currentZoomLevel === -1) return this.zoom(1);

      const nextZoomLevel = Math.max(0, currentZoomLevel - 1, this.web === "global" ? 0 : 0.65);
      if (nextZoomLevel === currentZoomLevel) return;

      this.zoom(this.zoomLevels[nextZoomLevel]);
    });
  }

  zoom(zoom = this._zoomAmount, reRenderSelect = true) {
    const grid = this.element.querySelector<HTMLElement>(".perk-grid");
    const zoomElement = this.element.querySelector<HTMLElement>(`[data-application-part="web"] .scroll`);
    if (!grid || !zoomElement) return;
    const oldZoom = this._zoomAmount;

    const rect = zoomElement.getBoundingClientRect();
    const current = { top: zoomElement.scrollTop, left: zoomElement.scrollLeft };
    const center = {
      top: (current.top + rect.height / 2) / oldZoom,
      left: (current.left + rect.width / 2) / oldZoom
    }
    const newCenter = {
      top: center.top * zoom - rect.height / 2,
      left: center.left * zoom - rect.width / 2
    }

    this._zoomAmount = zoom;
    const isElectron = navigator.userAgent.includes("FoundryVirtualTabletop");
    if (!isElectron) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - Zoom is a valid property
      grid!.style.zoom = `${zoom}`;
    }
    else {
      grid!.style.transform = `scale(${zoom})`;
    }

    this.renderSVG()

    if (!isElectron) zoomElement.scrollTo(newCenter);
    else zoomElement.scrollTo({ top: (zoomElement.scrollWidth / 2) - (zoomElement.clientWidth / 2), left: (zoomElement.scrollHeight / 2) - (zoomElement.clientHeight / 2) });

    if (reRenderSelect) this.render({ parts: ["hudZoom"] });
  }

  async setWeb(species: SpeciesPTR2e | null) {
    if (species === null) {
      this.web = "global";
      this.speciesEvolutions = [];
      return await PerkWebApp.refresh.call(this);
    }

    this.web = species.uuid;
    this.speciesEvolutions = await species.system.getEvolutionPerks(!!this.actor?.system.shiny);
    this.underdogPerks = this.actor ? await this.actor.getUnderdogPerks() : [];
    await PerkWebApp.refresh.call(this);

    setTimeout(() => {
      const root = this._perkStore.rootNodes.at(0);
      if (!root) return;

      this.element.querySelector(`div[data-x='${root.position.x}'][data-y='${root.position.y}']`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center"
      });
    }, 150);
  }

  override async _onDrop(event: DragEvent, itemData?: DropCanvasData[]) {
    if (!this.editMode) return;
    const element = this.element;
    const grid = element.querySelector<HTMLElement>(".perk-grid");
    if (!grid) return;

    const items = (
      itemData?.length
        ? await Promise.all(
          itemData.map(async data => {
            const item = await fromUuid(data.uuid);
            return { perk: item as PerkPTR2e, x: data.x, y: data.y };
          })
        )
        : await (async () => {
          const data = TextEditor.getDragEventData(event) as DropCanvasData
          if (!data) return [];
          const perk = await fromUuid(data.uuid) as PerkPTR2e;
          if (!(perk instanceof ItemPTR2e && perk.type === "perk")) return [];
          if (perk.system.variant === "multi") return [{ perk: perk, x: data.x, y: data.y }];
          return [{ perk: perk, x: perk.system.primaryNode?.x, y: perk.system.primaryNode?.y }];
        })()) as { perk: PerkPTR2e, x: number, y: number }[];

    const primaryEntry = items[0]
    if (!(primaryEntry.perk instanceof ItemPTR2e && primaryEntry.perk.type === "perk")) return;

    if (this.isSortableDragging && !itemData?.length) {
      const currentlyOnWeb = this._perkStore.get(`${primaryEntry.x}-${primaryEntry.y}`);
      if (currentlyOnWeb?.perk === primaryEntry.perk) return;
    }

    const bounding = grid.getBoundingClientRect();
    const zoom = this._zoomAmount
    const x = event.clientX - bounding.x;
    const y = event.clientY - bounding.y;

    const getGridSpace = (number: number) => {
      for (let i = 0; i <= 250; i++) {
        const r = i * (48 * zoom) + ((i - 1) * (16 * zoom * 1))
        if (r > number) {
          return i;
        }
      }
      return 0;
    }

    const i = getGridSpace(x);
    const j = getGridSpace(y);

    const node = this._perkStore.get(`${i}-${j}`);
    if (node) return void ui.notifications.error(`Can't move ${primaryEntry.perk.name} to ${i}-${j}, as it's already occupied by ${node.perk.name}`);

    const currentlyOnWeb = this._perkStore.get(`${primaryEntry.x}-${primaryEntry.y}`);

    const toDelete = new Set<string>(currentlyOnWeb?.perk === primaryEntry.perk ? [`${primaryEntry.x}-${primaryEntry.y}`] : []);
    const toSet: [string, PerkPTR2e, PerkPTR2e['system']['nodes'][0] | null][] = [[`${i}-${j}`, primaryEntry.perk, currentlyOnWeb?.node ?? primaryEntry.perk.system.primaryNode]];
    const updates: Record<string, Record<string, unknown>[]> = {
      world: [],
    };

    const pack = primaryEntry.perk.pack || "world";
    updates[pack] ??= [];
    updates[pack].push({
      _id: primaryEntry.perk._id,
      "system.global": this.web === "global",
      "system.nodes": (() => {
        const nodes = primaryEntry.perk.system.toObject().nodes as Required<DeepPartial<PerkPTR2e['system']['nodes']>>;
        if (!currentlyOnWeb) {
          if (primaryEntry.perk.system.variant === "multi" || !nodes[0]) {
            nodes.push({
              x: i,
              y: j,
            })
          }
          else {
            nodes[0].x = i;
            nodes[0].y = j;
          }
          return nodes;
        }
        const index = primaryEntry.perk.system.nodes.indexOf(currentlyOnWeb.node);
        if (index === -1) {
          if (primaryEntry.perk.system.variant === "multi" || !nodes.length) {
            nodes.push({
              x: i,
              y: j,
            })
          }
          return nodes;
        };
        nodes[index].x = i;
        nodes[index].y = j;
        return nodes;
      })(),
      "system.webs": (() => {
        if (this.web === "global") return primaryEntry.perk.system.webs;
        const web = new Set((primaryEntry.perk as PerkPTR2e).system.toObject().webs)
        web.add(this.web);
        return web;
      })()
    });

    const delta = items.length > 1 ? { x: i - primaryEntry.x, y: j - primaryEntry.y } : null;

    for (const entry of items) {
      if (entry.x === primaryEntry.x && entry.y === primaryEntry.y) continue;
      if (!delta) return;
      if (!(entry.perk instanceof ItemPTR2e && entry.perk.type === "perk")) continue;

      const i = entry.x + delta.x;
      const j = entry.y + delta.y;

      if (i < 1 || j < 1 || i >= 250 || j >= 250) {
        return void ui.notifications.error("Perk placement out of bounds");
      };

      const node = this._perkStore.get(`${i}-${j}`) ?? this._perkStore.get(`${j}-${i}`);
      if (node) return void ui.notifications.error(`Can't move ${entry.perk.name} to ${i}-${j}, as it's already occupied by ${node.perk.name}`);

      const currentlyOnWeb = this._perkStore.get(`${entry.x}-${entry.y}`);
      if (currentlyOnWeb?.perk === entry.perk) {
        toDelete.add(`${entry.x}-${entry.y}`);
      }
      const pack = entry.perk.pack || "world";
      updates[pack] ??= [];
      if (entry.perk.system.variant === "multi") {
        const update = updates[pack].find(u => u._id === entry.perk._id);
        if (update) {
          update["system.nodes"] = (() => {
            const nodes = update["system.nodes"] as Required<DeepPartial<PerkPTR2e['system']['nodes']>>;
            if (!currentlyOnWeb) {
              if (entry.perk.system.variant === "multi" || !nodes[0]) {
                nodes.push({
                  x: i,
                  y: j,
                })
              }
              else {
                nodes[0].x = i;
                nodes[0].y = j;
              }
              return nodes;
            }
            const index = entry.perk.system.nodes.indexOf(currentlyOnWeb.node);
            if (index === -1) {
              if (entry.perk.system.variant === "multi" || !nodes.length) {
                nodes.push({
                  x: i,
                  y: j,
                })
              }
              return nodes;
            };
            nodes[index].x = i;
            nodes[index].y = j;
            return nodes;
          })()

          toSet.push([`${i}-${j}`, entry.perk, currentlyOnWeb?.node ?? entry.perk.system.primaryNode]);
          continue;
        }
      }
      updates[pack].push({
        _id: entry.perk._id,
        "system.nodes": (() => {
          const nodes = entry.perk.system.toObject().nodes as Required<DeepPartial<PerkPTR2e['system']['nodes']>>;
          if (!currentlyOnWeb) {
            if (entry.perk.system.variant === "multi" || !nodes[0]) {
              nodes.push({
                x: i,
                y: j,
              })
            }
            else {
              nodes[0].x = i;
              nodes[0].y = j;
            }
            return nodes;
          }
          const index = entry.perk.system.nodes.indexOf(currentlyOnWeb.node);
          if (index === -1) {
            if (entry.perk.system.variant === "multi" || !nodes.length) {
              nodes.push({
                x: i,
                y: j,
              })
            }
            return nodes;
          };
          nodes[index].x = i;
          nodes[index].y = j;
          return nodes;
        })()
      });

      toSet.push([`${i}-${j}`, entry.perk, currentlyOnWeb?.node ?? entry.perk.system.primaryNode]);
    }

    for (const key of toDelete) {
      this._perkStore.delete(key);
    }

    for (const key in updates) {
      if (key === "world") {
        await ItemPTR2e.updateDocuments(updates[key]);
      }
      else {
        await ItemPTR2e.updateDocuments(updates[key], { pack: key });
      }
    }

    for (const [key, perk, setNode] of toSet) {
      const node = setNode ?? perk.system.primaryNode!;
      const index = perk.system.variant === "multi" ? perk.system.nodes.indexOf(node) : -1;
      this._perkStore.set(key, {
        perk: perk,
        connected: node.connected,
        position: { x: node.x!, y: node.y! },
        state: 0,
        web: "global",
        node: node,
        slug: index > 0 ? `${perk.slug}-${index}` : perk.slug
      });
    }
    PerkWebApp.refresh.call(this);

    return;
  }

  override _onFirstRender(context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._onFirstRender(context, options);

    if (this.actor) {
      this.actor.sheet.setPosition({ left: 270, top: 20 });
      this.actor.sheet.minimize();
    }

    if (navigator.userAgent.includes("FoundryVirtualTabletop")) {
      ui.notifications.warn("We've detected you're using the Foundry VTT Electron Client as your web browser. Please see chat for the full message...")
      ChatMessage.create({
        content: "<p>We've detected you're using the Foundry VTT Electron Client as your web browser.</p><p>Due to a problem in the older version of the Electron Client that Foundry V12 uses, the Perk Web's zoom feature is broken.</p><p>Since this is a browser issue, we cannot fix this at a system level, luckily, with Foundry V13, the Electron Version has been updated and this issue is fixed.</p><p>For now, you can still use the Perk Web, but the zoom feature will not work as intended.</p><p>As thus, we recommend using a different browser for the best experience.</p>",
        speaker: ChatMessage.getSpeaker({ alias: "PTR2e" }),
        whisper: [game.user.id]
      }).then(message => ui.chat.renderPopout(message!));
    }
  }

  override _onClose(options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._onClose(options);
    if (this.actor) {
      this.actor.sheet?.render(false)
      this.actor.sheet?.maximize();
      this.actor = null;
    }
  }

  static async refresh(this: PerkWebApp) {
    this.multiPerkCycle = {};
    this._lineCache.clear();
    await game.ptr.perks.reset();
    this.isSortableDragging = false;
    const perks = [
      ...Array.from(game.ptr.perks.perks.values()),
      ...this.speciesEvolutions,
      ...this.underdogPerks
    ]
    this._perkStore.reinitialize({ perks, actor: this.actor ?? undefined, web: this.web });

    this.currentNode = this._perkStore.getUpdatedNode(this.currentNode);
    this.connectionNode = this._perkStore.getUpdatedNode(this.connectionNode);
    this.render(true);
  }
}

export interface PerkWebApp {
  constructor: typeof PerkWebApp;

  _perkStore: PerkStore;
}