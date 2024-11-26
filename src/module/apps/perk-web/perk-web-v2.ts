import { ApplicationConfigurationExpanded, ApplicationV2Expanded } from "../appv2-expanded.ts";
import { ActorPTR2e } from "@actor";
import { Trait } from "@data";
import { PerkPTR2e } from "@item";
import Tagify from "@yaireo/tagify";

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
        controls: [{
          action: "toggle-edit-mode",
          label: "PTR2E.ToggleEditMode",
          icon: "fas fa-edit",
        }]
      },
      dragDrop: [{ dragSelector: ".perk", dropSelector: `[data-application-part="web"]` }],
      actions: {
        "toggle-edit-mode": function (this: PerkWebApp) { this.editMode = !this.editMode; this.render({ parts: ['web'] }); },
        "close-hud": function (this: PerkWebApp) { this.close();}
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
  editMode = false;
  zoomLevels = [0.2, 0.4, 0.65, 1, 1.3, 1.65] as const;

  _perkStore = new Map<string, PerkPTR2e>();
  _onScroll: () => void | null;
  _lineCache = new Map<string, SVGLineElement>();
  _zoomAmount: this['zoomLevels'][number] = 0.2;

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
      i: number;
      j: number;
    }

    if (this._perkStore.size === 0) {
      const perks = await game.ptr.perks.initialize();
      for (const perk of perks.perks.values()) {
        this._perkStore.set(`${perk.system.node.i}-${perk.system.node.j}`, perk);
      }
    }

    const grid: GridEntry[] = [];
    for (let i = 1; i < maxRow; i++) {
      for (let j = 1; j < maxCol; j++) {
        const relativeI = i;
        const relativeJ = j;
        const perk = this._perkStore.get(`${relativeI}-${relativeJ}`);
        if (perk) {
          grid.push({ name: perk.name, img: perk.system.node.config?.texture ?? perk.img, i, j });
        }
        else {
          grid.push({ i, j });
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
      zoom: this._zoomAmount
    }
  }

  #allTraits: { value: string; label: string, type?: Trait["type"] }[] | undefined;

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);

    if(partId === "web") {
      const perks = htmlElement.querySelectorAll<HTMLElement>(".perk")
      for (const perk of perks) {
        perk.addEventListener("click", (event) => {
          event.preventDefault();
          const { i, j } = perk.dataset;
          if (!i || !j) return;
          const perkKey = `${Number(i)}-${Number(j)}`;
          this.currentPerk = this._perkStore.get(perkKey) ?? null;
          this.render({ parts: ["hudPerk"] });
        });
      }
    }
    if(partId === 'hudPerk') {
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
    const element = this.element.querySelector<HTMLElement>(`[data-application-part="web"]`);
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
      const { i, j } = el.dataset;
      if (!i || !j) continue;
      elementMap.set(`${Number(i)}-${Number(j)}`, el);
    }

    const madeConnections = new Set<string>();

    for (const el of elements) {
      const perkKey = `${Number(el.dataset.i)}-${Number(el.dataset.j)}`;
      const perk = this._perkStore.get(perkKey);
      if (!perk) continue;

      const perkRect = el.getBoundingClientRect();
      const connected = perk.system.node.connected;

      for (const connection of connected) {
        const connectedPerk = game.ptr.perks.get(connection);
        if (!connectedPerk) continue;

        const connectedKey = `${connectedPerk.system.node.i}-${connectedPerk.system.node.j}`;
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

    element.onscroll = () => {
      element.scrollTo(scrollLeft, scrollTop);
    }

    element.addEventListener("mousedown", (e) => {
      // If right mouse button is clicked
      if (e.button !== 2) return;

      isDown = true;
      startX = e.pageX - element.offsetLeft;
      startY = e.pageY - element.offsetTop;
      scrollLeft = element.scrollLeft;
      scrollTop = element.scrollTop;

      element.style.cursor = this._zoomAmount === this.zoomLevels.at(-1) ? "unset" : "zoom-out";
    })

    element.addEventListener("mouseleave", () => {
      isDown = false;
      isMoving = false;
      element.style.cursor = this._zoomAmount === this.zoomLevels[0] ? "unset" : "zoom-in";
    });

    element.addEventListener("mouseup", () => {
      isDown = false;
      element.style.cursor = this._zoomAmount === this.zoomLevels[0] ? "unset" : "zoom-in";
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

      element.onscroll = () => {
        element.scrollTo(left, top);
      }
    });

    element.addEventListener("click", (e) => {
      if (e.target != element) return;
      e.preventDefault();

      const currentZoomLevel = this.zoomLevels.indexOf(this._zoomAmount);
      if (currentZoomLevel === -1) return this.zoom(1);

      const nextZoomLevel = Math.max(0, currentZoomLevel + 1);
      if (nextZoomLevel === currentZoomLevel) return;

      this.zoom(this.zoomLevels[nextZoomLevel]);
    })

    element.addEventListener("contextmenu", (e) => {
      if (isMoving) return;
      if (e.target != element) return;
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
    const main = this.element.querySelector<HTMLElement>(`[data-application-part="web"]`);
    if (!grid || !main) return;
    this._zoomAmount = zoom;

    grid.style.transform = `scale(${zoom})`;
    this.renderSVG()
  }

  override _onDrop(event: DragEvent): void {
    const element = this.element;
    const grid = element.querySelector<HTMLElement>(".perk-grid");
    if (!grid) return;

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
    if (!perk) {
      console.log("No perk found at", i, j);
      return;
    }
    console.log("Perk found at", i, j, perk);
  }
}

export interface PerkWebApp {
  constructor: typeof PerkWebApp;
}