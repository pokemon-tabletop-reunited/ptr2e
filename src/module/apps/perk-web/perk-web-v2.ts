import { ApplicationRenderContext } from "types/foundry/common/applications/api.js";
import { HandlebarsRenderOptions } from "types/foundry/common/applications/handlebars-application.ts";
import { ApplicationConfigurationExpanded, ApplicationV2Expanded } from "../appv2-expanded.ts";
import { ActorPTR2e } from "@actor";
import { PerkPTR2e } from "@item";

export class PerkWebbApp extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      tag: "div",
      classes: ["sheet", "perk-web-app", "default-sheet"],
      position: {
        height: 720,
        width: 1280,
      },
      window: {
        title: "PTR2E.PerkWebApp",
        minimizable: true,
        resizable: true,
        controls: [{
          action: "toggle-edit-mode",
          label: "PTR2E.ToggleEditMode",
          icon: "fas fa-edit",
        }]
      },
      dragDrop: [{ dragSelector: null, dropSelector: '.window-content main' }],
      actions: {
        "toggle-edit-mode": function (this: PerkWebbApp) { this.editMode = !this.editMode; this.render({ parts: ['web'] }); }
      }
    },
    { inplace: false }
  );

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    web: {
      id: "web",
      template: "systems/ptr2e/templates/apps/perk-web/web.hbs",
    },
  };

  actor: ActorPTR2e | null = null;
  currentWeb = "";
  editMode = false;

  constructor(actor: ActorPTR2e, options?: Partial<ApplicationConfigurationExpanded>) {
    super(options);
    this.actor = actor;
  }

  _perkStore = new Map<string, PerkPTR2e>();

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
        const relativeI = i - 120;
        const relativeJ = j - 120;
        const perk = this._perkStore.get(`${relativeI}-${relativeJ}`);
        if (perk) {
          grid.push({ name: perk.name, img: perk.system.node.config?.texture ?? perk.img, i, j });
        }
        else {
          grid.push({ i, j });
        }
      }
    }

    return {
      ...super._prepareContext(options),
      grid,
      // editMode: this.editMode,
    }
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);
  }

  timer: number | null = null;

  override _preRender(context: ApplicationRenderContext, options: HandlebarsRenderOptions): Promise<void> {
    this.timer = performance.now();
    return super._preRender(context, options);
  }

  override _onRender(context: foundry.applications.api.ApplicationRenderContext, options: HandlebarsRenderOptions): void {
    super._onRender(context, options);
    const timer = performance.now();
    if (this.timer) ui.notifications.info(`Rendered in ${timer - this.timer}ms`);
    this.timer = null;

    this.renderSVG();

    ui.notifications.info(`Rendered edit-mode in ${performance.now() - timer}ms`);
    console.log(this);
  }

  _onScroll: () => void | null;

  get zoomLevel() {
    return this.zoomAmount;
  }

  renderSVG() {
    const element = this.element.querySelector<HTMLElement>(".window-content main");
    if (!element) return;

    const existing = element.querySelector<HTMLElement>("svg");
    if (existing) {
      // if (this._onScroll) element.removeEventListener("scroll", this._onScroll);
      const zoom = this.zoomLevel;
      const bounding = element.getBoundingClientRect();
      const elementRect = { x: bounding.x, y: bounding.y, width: bounding.width, height: bounding.height };
      const scroll = { x: element.scrollLeft, y: element.scrollTop };

      const elements = element.querySelectorAll<HTMLElement>(".perk-grid .perk:not(.empty)");
      const elementMap = new Map<string, HTMLElement>();
      for (const el of elements) {
        const { i, j } = el.dataset;
        if (!i || !j) continue;
        elementMap.set(`${Number(i) - 120}-${Number(j) - 120}`, el);
      }
      
      for(const el of elements) {
        const perkKey = `${Number(el.dataset.i) - 120}-${Number(el.dataset.j) - 120}`;
        const perk = this._perkStore.get(perkKey);
        if (!perk) continue;

        const perkRect = el.getBoundingClientRect();
        const connected = perk.system.node.connected;
        for(const connection of connected) {
          const connectedPerk = game.ptr.perks.get(connection);
          if (!connectedPerk) continue;

          const connectedKey = `${connectedPerk.system.node.i}-${connectedPerk.system.node.j}`;
          const connectedElement = elementMap.get(connectedKey);
          if (!connectedElement) continue;

          const line = this._cache.get(`${perkKey}-${connectedKey}`);
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
          line.setAttribute("stroke-width", (2.5 * zoom * zoom).toString());
        }
      }

      return void this._onScroll?.()
    }
    const zoom = this.zoomLevel;
    const svgCanvas = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgCanvas.setAttribute("width", "100%");
    svgCanvas.setAttribute("height", "100%");
    const bounding = element.getBoundingClientRect();
    const elementRect = { x: bounding.x, y: bounding.y, width: bounding.width, height: bounding.height };
    const scroll = { x: element.scrollLeft, y: element.scrollTop };
    

    svgCanvas.setAttribute("viewBox", `0 0 ${elementRect.width} ${elementRect.height}`);
    // if (existing) existing.replaceWith(svgCanvas)
    // else 
    element.appendChild(svgCanvas);
    this._cache.clear();

    const elements = element.querySelectorAll<HTMLElement>(".perk-grid .perk:not(.empty)");
    const elementMap = new Map<string, HTMLElement>();
    for (const el of elements) {
      const { i, j } = el.dataset;
      if (!i || !j) continue;
      elementMap.set(`${Number(i) - 120}-${Number(j) - 120}`, el);
    }
    const madeConnections = new Set<string>();
    for (const el of elements) {
      const perkKey = `${Number(el.dataset.i) - 120}-${Number(el.dataset.j) - 120}`;
      const perk = this._perkStore.get(perkKey);
      if (!perk) continue;

      const perkRect = el.getBoundingClientRect();

      const connected = perk.system.node.connected;
      for (const connection of connected) {
        const connectedPerk = game.ptr.perks.get(connection);
        if (!connectedPerk) continue;

        const connectedKey = `${connectedPerk.system.node.i}-${connectedPerk.system.node.j}`;
        if (madeConnections.has(`${perkKey}-${connectedKey}`)) continue;

        const connectedElement = elementMap.get(connectedKey);
        if (!connectedElement) continue;

        const connectedRect = connectedElement.getBoundingClientRect();

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
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
        svgCanvas.appendChild(line);
        this._cache.set(`${perkKey}-${connectedKey}`, line);
        this._cache.set(`${connectedKey}-${perkKey}`, line);
        madeConnections.add(`${perkKey}-${connectedKey}`);
        madeConnections.add(`${connectedKey}-${perkKey}`);
      }
    }

    const onScroll = () => {
      const bounding = element.getBoundingClientRect();

      // const inverseMod = 1 / zoom;
      const width = bounding.width * this.zoomLevel;
      const height = bounding.height * this.zoomLevel;
      const scrollY = element.scrollTop * this.zoomLevel;
      const scrollX = element.scrollLeft * this.zoomLevel;

      svgCanvas.setAttribute("viewBox", `${scrollX} ${scrollY} ${width} ${height}`);

    }

    this._onScroll = onScroll;
    element.addEventListener("scroll", onScroll);
    onScroll();

    this.attachElementListeners(element);
  }

  _cache = new Map<string, SVGLineElement>();

  attachElementListeners(element: HTMLElement) {
    let isDown = false;
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
    })

    element.addEventListener("mouseleave", () => {
      isDown = false;
    });

    element.addEventListener("mouseup", () => {
      isDown = false;
    });

    element.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - element.offsetLeft;
      const y = e.pageY - element.offsetTop;
      const walkX = (x - startX) * 2.5;
      const walkY = (y - startY) * 2.5;
      const left = scrollLeft - walkX;
      const top = scrollTop - walkY;
      element.scrollLeft = left;
      element.scrollTop = top;

      element.onscroll = () => {
        element.scrollTo(left, top);
      }
    });

    let currentZoom = this.zoomLevel;

    element.addEventListener("wheel", (ev) => {
      ev.preventDefault();
      // Max zoom out is 0.35
      // Max zoom in is 3.0
      const newZoom = Math.clamp(ev.deltaY > 0 ? currentZoom - 0.05 : currentZoom + 0.05, 0.35, 3.0);
      if (newZoom === currentZoom) return;
      this.zoomAmount = currentZoom = newZoom;
      this.debounce();
    });
  }

  debounce = fu.debounce(this.zoom.bind(this), 100);

  override _onDrop(event: DragEvent): void {
    console.log(event, event.currentTarget, event.target);

    const element = this.element;
    const grid = element.querySelector<HTMLElement>(".perk-grid");
    if (!grid) return;

    const bounding = grid.getBoundingClientRect();
    const zoom = this.zoomLevel
    const x = event.clientX - bounding.x;
    const y = event.clientY - bounding.y;

    const getGridSpace = (number: number) => {
      for (let i = 0; i <= 250; i++) {
        const r = i * (48 * zoom) + ((i - 1) * (16 * zoom * 1.5))
        if (r > number) {
          return i - 120;
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

  zoomAmount = 1;

  zoom(zoom = this.zoomAmount) {
    const grid = this.element.querySelector<HTMLElement>(".perk-grid");
    const main = this.element.querySelector<HTMLElement>(".window-content main");
    if (!grid || !main) return;
    this.zoomAmount = zoom;

    console.count("Zooming: " + zoom);

    grid.style.transform = `scale(${zoom})`;
    setTimeout(() => {
      this.renderSVG()
    }, 500);
  }
}

export interface PerkWebbApp {
  constructor: typeof PerkWebbApp;
}

//@ts-expect-error - Monkey patching the global window to add the PerkWebbApp class
window.PerkWebbApp = PerkWebbApp;