import { ApplicationConfigurationExpanded, ApplicationV2Expanded } from "../appv2-expanded.ts";
import { ActorPTR2e } from "@actor";
import { Trait } from "@data";
import { ItemPTR2e, PerkPTR2e } from "@item";
import Tagify from "@yaireo/tagify";
import Sortable from "sortablejs";

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
          this.currentPerk = null;
          this.connectionPerk = null;
          this.render(true);
        },
        "refresh": PerkWebApp.refresh,
        "close-hud": function (this: PerkWebApp) { this.close(); }
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
    searchHeader: {
      id: "searchHeader",
      template: "systems/ptr2e/templates/perk-tree/search/header.hbs",
      classes: ["search"]
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
  currentPerk: PerkPTR2e | null = null;
  connectionPerk: PerkPTR2e | null = null;
  editMode = false;
  zoomLevels = [0.2, 0.4, 0.65, 1, 1.3, 1.65] as const;

  _perkStore = new Map<string, PerkPTR2e>();
  _onScroll: () => void | null;
  _lineCache = new Map<string, SVGLineElement>();
  _zoomAmount: this['zoomLevels'][number] = 1;

  constructor(actor: ActorPTR2e, options?: Partial<ApplicationConfigurationExpanded>) {
    super(options);
    this.actor = actor;
  }

  override async _prepareContext(options?: foundry.applications.api.HandlebarsRenderOptions | undefined) {
    const maxRow = 250;
    const maxCol = 250;

    interface GridEntry {
      name?: string;
      img?: string;
      x: number;
      y: number;
      classes: string[]
    }

    if (this._perkStore.size === 0) {
      const perks = await game.ptr.perks.initialize();
      for (const perk of perks.perks.values()) {
        this._perkStore.set(`${perk.system.node.x}-${perk.system.node.y}`, perk);
      }
    }

    const grid: GridEntry[] = [];
    for (let x = 1; x < maxRow; x++) {
      for (let y = 1; y < maxCol; y++) {
        const perk = this._perkStore.get(`${x}-${y}`);
        if (perk) {
          grid.push({ name: perk.name, img: perk.system.node.config?.texture ?? perk.img, x, y, classes: perk === this.connectionPerk ? ["selected"] : [] });
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

    return {
      ...super._prepareContext(options),
      grid,
      actor: this.actor,
      perk: {
        document: this.currentPerk,
        fields: this.currentPerk?.system.schema.fields,
        traits: this.currentPerk?.system.traits.map((trait) => ({ value: trait.slug, label: trait.label, type: trait.type })),
        actions: this.currentPerk?.system?.actions?.map(action => ({
          action,
          traits: action.traits.map(trait => ({ value: trait.slug, label: trait.label })),
          fields: action.schema.fields,
        }))
      },
      filterData: null,
      zoom: this._zoomAmount,
      editMode: this.editMode,
    }
  }

  #allTraits: { value: string; label: string, type?: Trait["type"] }[] | undefined;
  private isSortableDragging = false;

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);

    if (partId === "web") {
      const perks = htmlElement.querySelectorAll<HTMLElement>(".perk")
      for (const perk of perks) {
        perk.addEventListener("click", async (event) => {
          event.preventDefault();
          const { x, y } = perk.dataset;
          if (!x || !y) return;
          const perkKey = `${Number(x)}-${Number(y)}`;

          if (this.editMode && this.connectionPerk) {
            const perkDocument = this._perkStore.get(perkKey) ?? null;
            if (!perkDocument || perkDocument === this.connectionPerk) return;

            const getUpdatedConnections = (a: PerkPTR2e, b: PerkPTR2e, operation?: "add" | "remove") => {
              const connected = a.system.toObject().node.connected;
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

            const { connected: updateCurrent, operation } = getUpdatedConnections(this.connectionPerk, perkDocument);
            const { connected: updateTarget } = getUpdatedConnections(perkDocument, this.connectionPerk, operation);

            if (this.connectionPerk.pack === perkDocument.pack) {
              await ItemPTR2e.updateDocuments([
                {
                  _id: this.connectionPerk._id,
                  "system.node.connected": new Set(updateCurrent)
                },
                {
                  _id: perkDocument._id,
                  "system.node.connected": new Set(updateTarget)
                }
              ], this.connectionPerk.pack ? { pack: this.connectionPerk.pack } : {});
            }
            else {
              await this.connectionPerk.update({ "system.node.connected": updateCurrent }, this.connectionPerk.pack ? { pack: this.connectionPerk.pack } : {});
              await perkDocument.update({ "system.node.connected": updateTarget }), perkDocument.pack ? { pack: perkDocument.pack } : {};
            }

            PerkWebApp.refresh.call(this);
            return;
          }

          this.currentPerk = this._perkStore.get(perkKey) ?? null;
          this.render({ parts: ["hudPerk"] });
        });
        perk.addEventListener("dblclick", (event) => {
          event.preventDefault();
          event.stopPropagation();
          const { x, y } = perk.dataset;
          if (!x || !y) return;
          const perkKey = `${Number(x)}-${Number(y)}`;
          const perkDocument = this._perkStore.get(perkKey) ?? null;
          perkDocument?.sheet?.render(true);
        });
        perk.addEventListener("contextmenu", (event) => {
          if (!this.editMode) return;
          event.preventDefault();
          event.stopPropagation();
          const { x, y } = perk.dataset;
          if (!x || !y) return;
          const perkKey = `${Number(x)}-${Number(y)}`;
          const perkDocument = this._perkStore.get(perkKey) ?? null;
          this.connectionPerk = perkDocument === this.connectionPerk ? null : perkDocument;
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
            const perk = this._perkStore.get(`${x}-${y}`) ?? null;
            if (!perk) return;

            dataTransfer!.setData("text/plain", JSON.stringify(perk.toDragData()));
          }
        },
        onChoose: (event) => {
          this.isSortableDragging = true;
          console.log('start', event)
        },
        onEnd: (event) => {

          // Grab all items, and make sure that the item at `.item` is sorted as index 0
          const items = event.items.length ? (() => {
            const items = event.items;
            if(items.length > 1) {
              items.splice(items.indexOf(event.item), 1);
              items.unshift(event.item);
              return items;
            }
            return items;
          })() : [event.item];

          const data = items.flatMap(el => {
            const x = Number(el.dataset.x)
            const y = Number(el.dataset.y);
            const perk = this._perkStore.get(`${x}-${y}`) ?? null;
            return perk ? perk.toDragData() : []
          })

          //@ts-expect-error - originalEvent exists
          this._onDrop(event.originalEvent, data);

          event.items.map(el => Sortable.utils.deselect(el));

          console.log('end', event)
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
  }

  override _onRender(context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._onRender(context, options);

    this.renderSVG();
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
      const perk = this._perkStore.get(perkKey);
      if (!perk) continue;

      const perkRect = el.getBoundingClientRect();
      const connected = perk.system.node.connected;

      for (const connection of connected) {
        const connectedPerk = game.ptr.perks.get(connection);
        if (!connectedPerk) continue;

        const connectedKey = `${connectedPerk.system.node.x}-${connectedPerk.system.node.y}`;
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

        line.setAttribute("x1", x1.toString());
        line.setAttribute("y1", y1.toString());
        line.setAttribute("x2", x2.toString());
        line.setAttribute("y2", y2.toString());
        line.setAttribute("stroke", "white");
        line.setAttribute("stroke-width", (2.5 * zoom * zoom).toString());
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
      setTimeout(() => { isMoving = false }, 50);
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

      const nextZoomLevel = Math.max(0, currentZoomLevel - 1);
      if (nextZoomLevel === currentZoomLevel) return;

      this.zoom(this.zoomLevels[nextZoomLevel]);
    });
  }

  zoom(zoom = this._zoomAmount) {
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
    grid!.style.zoom = `${zoom}`;
    this.renderSVG()
    zoomElement.scrollTo(newCenter);
  }

  override async _onDrop(event: DragEvent, itemData?: DropCanvasData[]) {
    if (!this.editMode) return;
    if (this.isSortableDragging && !itemData?.length) return;
    const element = this.element;
    const grid = element.querySelector<HTMLElement>(".perk-grid");
    if (!grid) return;

    const items = (itemData?.length ? await Promise.all(itemData.map(data => ItemPTR2e.fromDropData(data))) : await (async () => {
      const data = TextEditor.getDragEventData(event) as DropCanvasData
      return data ? [await ItemPTR2e.fromDropData(data)] : [];
    })()) as PerkPTR2e[];

    const primaryItem = items[0]
    if (!(primaryItem instanceof ItemPTR2e && primaryItem.type === "perk")) return;

    const bounding = grid.getBoundingClientRect();
    const zoom = this._zoomAmount
    const x = event.clientX - bounding.x;
    const y = event.clientY - bounding.y;

    const getGridSpace = (number: number) => {
      for (let i = 0; i <= 250; i++) {
        const r = i * (48 * zoom) + ((i - 1) * (16 * zoom * 1.5))
        if (r > number) {
          return i;
        }
      }
      return 0;
    }

    const i = getGridSpace(x);
    const j = getGridSpace(y);

    const perk = this._perkStore.get(`${i}-${j}`) ?? this._perkStore.get(`${j}-${i}`);
    if (perk) return void ui.notifications.error(`Can't move ${primaryItem.name} to ${i}-${j}, as it's already occupied by ${perk.name}`);

    const currentlyOnWeb = this._perkStore.get(`${primaryItem.system.node.x}-${primaryItem.system.node.y}`);

    const toDelete = new Set<string>(currentlyOnWeb === primaryItem ? [`${primaryItem.system.node.x}-${primaryItem.system.node.y}`] : []);
    const toSet: [string, PerkPTR2e][] = [[`${i}-${j}`, primaryItem]];
    const updates: Record<string, Record<string,unknown>[]> = {
      world: [],
    };

    const pack = primaryItem.pack || "world";
    updates[pack] ??= [];
    updates[pack].push({_id: primaryItem._id, "system.node": { x: i, y: j }});

    const delta = items.length > 1 ? { x: i - primaryItem.system.node.x!, y: j - primaryItem.system.node.y! } : null;

    for(const item of items) {
      if(item === primaryItem) continue;
      if(!delta) return;
      if(!(item instanceof ItemPTR2e && item.type === "perk")) continue;

      const i = item.system.node.x! + delta.x;
      const j = item.system.node.y! + delta.y;

      if(i < 1 || j < 1 || i >= 250 || j >= 250) {
        return void ui.notifications.error("Perk placement out of bounds");
      };

      const perk = this._perkStore.get(`${i}-${j}`) ?? this._perkStore.get(`${j}-${i}`);
      if (perk) return void ui.notifications.error(`Can't move ${item.name} to ${i}-${j}, as it's already occupied by ${perk.name}`);

      const currentlyOnWeb = this._perkStore.get(`${item.system.node.x}-${item.system.node.y}`);
      if (currentlyOnWeb === item) {
        toDelete.add(`${item.system.node.x}-${item.system.node.y}`);
      }
      const pack = item.pack || "world";
      updates[pack] ??= [];
      updates[pack].push({_id: item._id, "system.node": { x: i, y: j }});

      toSet.push([`${i}-${j}`, item]);
    }

    for (const key of toDelete) {
      this._perkStore.delete(key);
    }

    for(const key in updates) {
      if(key === "world") {
        await ItemPTR2e.updateDocuments(updates[key]);
      }
      else {
        await ItemPTR2e.updateDocuments(updates[key], { pack: key });
      }
    }

    for (const [key, value] of toSet) {
      this._perkStore.set(key, value);
    }

    return;
  }

  override _onFirstRender(context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._onFirstRender(context, options);

    if (this.actor) {
      this.actor.sheet.setPosition({ left: 270, top: 20 });
      this.actor.sheet.minimize();
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
    this._perkStore.clear();
    this._lineCache.clear();
    this.currentPerk = null;
    this.render(true);
  }
}

export interface PerkWebApp {
  constructor: typeof PerkWebApp;
}