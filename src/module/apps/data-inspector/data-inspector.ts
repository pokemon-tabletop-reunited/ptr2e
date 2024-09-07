import { ActorPTR2e, ActorSystemPTR2e } from "@actor";
import { ApplicationV2Expanded } from "../appv2-expanded.ts";
import { DataStructure } from "./data-handler.ts";
import { ItemPTR2e, ItemSystemPTR } from "@item";
import { AttackMessageSystem, CaptureMessageSystem, ChatMessagePTR2e, DamageAppliedMessageSystem, SkillMessageSystem } from "@chat";
import { TreeTypes } from "./data.ts";
import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { htmlQuery, htmlQueryAll } from "@utils";
import { ActiveEffectPTR2e } from "@effects";
import MiniSearch from "minisearch";
import { Tab } from "@item/sheets/document.ts";

type AllowedDocumentTypes = ActorPTR2e | ActorPTR2e<ActorSystemPTR2e, TokenDocumentPTR2e> | ItemPTR2e<ItemSystemPTR> | ActiveEffectPTR2e | ChatMessagePTR2e<AttackMessageSystem> | ChatMessagePTR2e<SkillMessageSystem>;

class DataInspector extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {

  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      tag: "aside",
      classes: ["sheet", "data-inspector"],
      position: {
        height: 700,
        width: 685,
      },
      window: {
        minimizable: true,
        resizable: true,
      },
      dragDrop: [{ dragSelector: null, dropSelector: ".window-content" }],
      actions: {
        refresh: function (this: DataInspector) {
          this.resetCache()
          this.render(true);
        }
      }
    },
    { inplace: false }
  );

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    // header: {
    //   id: "header",
    //   template: "systems/ptr2e/templates/apps/data-inspector/header.hbs",
    //   scrollable: [],
    // },
    target: {
      id: "target",
      template: "systems/ptr2e/templates/apps/data-inspector/target.hbs",
      scrollable: [],
    },
    settings: {
      id: "settings",
      template: "systems/ptr2e/templates/apps/data-inspector/settings.hbs",
      scrollable: [".scroll"],
    },
    content: {
      id: "content",
      template: "systems/ptr2e/templates/apps/data-inspector/content.hbs",
      scrollable: ["section.content", "section.options", "section.modifiers", "section.tabs"],
    },
  };

  document: AllowedDocumentTypes;
  dataStructure: DataStructure;

  protected mode: TreeTypes = "derived";
  protected flagData: Record<string, unknown> | null = null;
  protected overrideData: Record<string, unknown> | null = null;
  protected rollData: Record<string, unknown> | null = null;
  protected sourceData: Record<string, unknown> | null = null;
  protected derivedData: Record<string, unknown> | null = null;
  protected temporaryData: AllowedDocumentTypes['_source'] | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected _currentData: any = null;
  protected _path: string;
  protected expandedItems = new Set<string>();
  protected cachedResults: Record<TreeTypes, null | { root: DataStructure; count: number; depth: number, all: Record<string, DataStructure> }> = {
    flags: null,
    derived: null,
    rolldata: null,
    source: null,
    override: null,
    roll: null
  };

  private scrollToPath: string | null = null;
  private searchTerm: string | null = null;
  private fuzzyiness = 0.15;
  private lastSearch: { term: string | null, fuzzy: number } = { term: '', fuzzy: 0.15 };
  private includeFunctions = false;

  private tabGroups: Record<string, string> = {
    targets: "",
  };
  private tabs: Record<string, Tab> = {};

  root: DataStructure;

  constructor(document: AllowedDocumentTypes, options: Partial<foundry.applications.api.ApplicationConfiguration> = {}) {
    if (!document.testUserPermission(game.user, 'OBSERVER')) {
      const msg = game.i18n.format("PTR2E.DataInspector.NoPermission", { name: 'name' in document ? document.name : '' });
      ui.notifications.error(msg, { console: false });
      throw new Error(msg);
    }

    options.id = `data-inspector-${document.uuid}`;
    super(options);
    this.document = document;
    if (this.document instanceof ChatMessagePTR2e) this.mode = "roll";
  }

  override get title() {
    const title = ["Data Inspector"]
    if ('actor' in this.document && this.document.actor) title.push(this.document.actor.name + "'s");
    if ('name' in this.document) title.push(this.document.name);
    else if (this.document instanceof ChatMessagePTR2e) {
      switch (true) {
        case this.document.system instanceof AttackMessageSystem: title.push("Attack Roll"); break;
        case this.document.system instanceof SkillMessageSystem: title.push("Skill Roll"); break;
        case this.document.system instanceof ChatMessagePTR2e: title.push("Chat Message"); break;
      }
    }

    return title.join(": ");
  }

  getDataVariant(document: AllowedDocumentTypes, mode: TreeTypes) {
    switch (mode ?? this.mode) {
      case "flags": {
        if (this.flagData == null) this.flagData = document.flags ?? {};
        return { data: this.flagData, path: 'flags' };
      }
      case "override": {
        if (this.overrideData == null) {
          if ('token' in document) this.overrideData = document.token?.delta?.toObject().system as Record<string, unknown> ?? {};
          else this.overrideData = {};
        }
        return { data: this.overrideData, path: 'system' };
      }
      case "rolldata": {
        if (!('getRollData' in document)) return { data: {}, path: '' };
        if (this.rollData == null) {
          this.rollData = document.getRollData() as Record<string, unknown>;
          if(this.rollData.actor) this.rollData = fu.duplicate(this.rollData.actor as Record<string, unknown>);
        }
        return { data: this.rollData, path: '' };
      }
      case "source": {
        if (this.sourceData == null) this.sourceData = document.toObject().system as Record<string, unknown>;
        return { data: this.sourceData, path: 'system' };
      }
      default:
      case "derived": {
        if (this.derivedData == null) this.derivedData = document.system as Record<string, unknown>;
        return { data: this.derivedData, path: 'system' };
      }
    }
  }

  getBaseData() {
    switch (this.mode) {
      case "flags": return this.document.flags ?? {};
      case "override": return 'token' in this.document ? this.document.token?.delta?.toObject() as Record<string, unknown> ?? {} : {};
      case "rolldata": return 'getRollData' in this.document ? this.document.getRollData() as Record<string, unknown> : {};
      case "source": return this.document.toObject();
      default:
      case "derived": return this.document;
    }
  }

  resetCache() {
    this.flagData = null;
    this.overrideData = null;
    this.rollData = null;
    this.sourceData = null;
    this.derivedData = null;
    this.temporaryData = null;
    this._currentData = null;
    this.cachedResults = {
      flags: null,
      derived: null,
      rolldata: null,
      source: null,
      override: null,
      roll: null
    };
  }

  override async _prepareContext(options?: foundry.applications.api.HandlebarsRenderOptions | undefined) {
    const context = await super._prepareContext(options) as Record<string, unknown>,
      doc = this.document,
      type = doc.type;

    // @ts-expect-error - Type labels are present
    context.typeLabel = game.i18n.localize(CONFIG[doc.documentName]?.typeLabels?.[type] ?? doc.type);
    context.docType = doc.constructor.name;
    context.dataType = this.mode;
    context.document = doc;
    context.type = type;
    context.isChatMessage = doc instanceof ChatMessagePTR2e;

    if (["derived", "rolldata", "source", "override", "flags"].includes(this.mode)) return this._prepareContextDataInspector(context);
    return this._prepareContextRollInspector(context);
  }

  _prepareContextDataInspector(context: Record<string, unknown>) {
    const doc = this.document,
      isActor = doc instanceof ActorPTR2e;

    if (this.mode === 'source') {
      this.temporaryData = doc.toObject();
    }

    const _rollData = context.rollData = this.getDataVariant(doc, 'rolldata').data;
    const _sourceData = context.sourceData = this.getDataVariant(doc, 'source').data;
    const _derivedData = context.derivedData = this.getDataVariant(doc, 'derived').data;
    const _overrideData = isActor ? (context.overrideData = this.getDataVariant(doc, 'override').data) : undefined
    context.flagData = this.getDataVariant(doc, 'flags').data;

    const { data: docData, path: basePath } = this.getDataVariant(doc, this.mode);

    context.isRollData = this.mode === 'rolldata';
    context.isSourceData = this.mode === 'source';
    context.isDerivedData = this.mode === 'derived';
    context.isOverrideData = this.mode === 'override';
    context.search = this.searchTerm;
    context.path = this._path;

    const { root, count, depth, all } = this.cachedResults[this.mode] ??= DataStructure.recurse(docData, basePath, basePath, this.mode, { includeFunctions: this.includeFunctions, document: doc }, { _sourceData, _rollData, _derivedData, _overides: _overrideData });
    context.data = this.root = (this._path ? (root.getAtPath(this._path) ?? root) : root);
    if (this.searchTerm && (this.searchTerm !== this.lastSearch.term || this.fuzzyiness !== this.lastSearch.fuzzy)) {
      this.root.filterChildren(this.searchTerm, all, this.fuzzyiness);
      this.lastSearch = { term: this.searchTerm, fuzzy: this.fuzzyiness };
    }
    else if ((this.searchTerm?.length ?? 0) < 3 && this.lastSearch.term !== this.searchTerm) {
      this.root.resetFilters(all);
      this.lastSearch = { term: this.searchTerm, fuzzy: this.fuzzyiness };
    }
    context.count = count;
    context.depth = depth;

    return context;
  }

  _prepareContextRollInspector(context: Record<string, unknown>) {
    const doc = this.document;

    if (doc.system instanceof AttackMessageSystem) {
      if (this.lastSearch.term !== this.searchTerm || this.fuzzyiness !== this.lastSearch.fuzzy) {
        this._currentData = null;
      }

      context.entries = this._currentData ??= (() => {
        this.tabs = {};
        const results = doc.system.results.map(r => {
          const context = fu.duplicate(r.context);
          const { name, uuid } = r.target ?? { uuid: context.action };
          const id = name ? r.target.token ? r.target.token.id : r.target.id : null;
          const filteredOptions = this.filterOptions(context.options);
          context.options = context.options.filter(o => filteredOptions.has(o)).sort((a, b) => a.localeCompare(b));
          context.action = `${context.action}-${uuid}`;
          context.modifiers = context.check._modifiers;
          this.tabs[context.action] = {
            group: "targets",
            icon: "",
            id: context.action,
            label: (name ? `${name}${id ? ` <small>(${id})</small>` : ''}` : null) ?? uuid ?? context.check.slug
          }
          return context;
        });
        if (!this.tabs[this.tabGroups["targets"]]) this.tabGroups["targets"] = results.at(0)?.action ?? "";
        return results;
      })()

      context.tabs = this._getTabs();
    }

    if (doc.system instanceof SkillMessageSystem || doc.system instanceof CaptureMessageSystem) {
      if (this.lastSearch.term !== this.searchTerm || this.fuzzyiness !== this.lastSearch.fuzzy) {
        this._currentData = null;
      }

      context.entry = this._currentData ??= (() => {
        this.tabs = {};
        const result = fu.duplicate(doc.system.result);
        const filteredOptions = this.filterOptions(result.options);
        result.options = result.options.filter(o => filteredOptions.has(o)).sort((a, b) => a.localeCompare(b));
        return result;
      })();
    }

    if (doc.system instanceof DamageAppliedMessageSystem && doc.system.result) {
      if (this.lastSearch.term !== this.searchTerm || this.fuzzyiness !== this.lastSearch.fuzzy) {
        this._currentData = null;
      }

      context.entry = this._currentData ??= (() => {
        this.tabs = {};
        const result = fu.duplicate(doc.system.result);
        const filteredOptions = this.filterOptions(result.options);
        result.options = result.options.filter(o => filteredOptions.has(o)).sort((a, b) => a.localeCompare(b));
        return result;
      })();
    }

    return context;
  }

  _getTabs() {
    for (const v of Object.values(this.tabs)) {
      v.active = this.tabGroups[v.group] === v.id;
      v.cssClass = v.active ? "active" : "";
    }
    return this.tabs;
  }

  filterOptions(options: string[]): Set<string> {
    if (!this.searchTerm || this.searchTerm.length <= 3) return new Set(options);

    const search = new MiniSearch({ fields: ["id"], searchOptions: { fuzzy: this.fuzzyiness } });
    search.addAll(options.map(o => ({ id: o })));

    this.lastSearch = { term: this.searchTerm, fuzzy: this.fuzzyiness };

    return search.search(this.searchTerm).reduce((acc, { id }) => acc.add(id), new Set<string>());
  }

  deferredPath(value: string) {
    this._path = value;
    this.render({ parts: ['content'] });
  }

  deferredSearch(value: string) {
    this.searchTerm = value;
    this.render({ parts: ['content'] });
  }

  deferredFuzzyChange(value: number) {
    if (isNaN(value)) return;
    this.fuzzyiness = Math.clamp(value, 0, .95);
    this.render({ parts: ['content'] });
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement): void {
    if (partId === "settings") {
      const pathInput = htmlQuery(htmlElement, "input[name='path']") as Maybe<HTMLInputElement>;
      const modeSelect = htmlQuery(htmlElement, "select[name='mode']") as HTMLSelectElement;
      const searchInput = htmlQuery(htmlElement, "input[name='search']") as Maybe<HTMLInputElement>;
      const fuzzyInput = htmlQuery(htmlElement, "input[name='fuzzyiness']") as Maybe<HTMLInputElement>;
      const functionsCheckbox = htmlQuery(htmlElement, "input[name='include-functions']") as Maybe<HTMLInputElement>;

      pathInput?.addEventListener("keyup", () => {
        fu.debounce(this.deferredPath.bind(this), 250)(pathInput.value);
      });

      modeSelect?.addEventListener("change", () => {
        this.mode = modeSelect.value as TreeTypes;
        this.render({ parts: ['content'] });
      });

      searchInput?.addEventListener("keyup", () => {
        fu.debounce(this.deferredSearch.bind(this), 250)(searchInput.value);
      });

      fuzzyInput?.addEventListener("change", () => {
        fu.debounce(this.deferredFuzzyChange.bind(this), 250)(Number(fuzzyInput.value));
      });

      functionsCheckbox?.addEventListener("change", () => {
        this.includeFunctions = functionsCheckbox.checked;
        this.resetCache();
        this.render({ parts: ['content'] });
      });
    }

    if (partId === "content") {
      const appEl = htmlElement.closest("[data-appid]") as HTMLElement;
      if (appEl) {
        if (this.document instanceof Item) {
          appEl.dataset.itemId = this.document.id;
          appEl.dataset.itemUuid = this.document.uuid;
        }

        const actor = this.document instanceof Actor ? this.document : this.document.parent;
        if (actor) {
          appEl.dataset.actorId = actor.id;
          appEl.dataset.actorUuid = actor.uuid;
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const app = this;

      function copyPath(this: HTMLElement, ev: Event) {
        ev.preventDefault();
        ev.stopPropagation();
        const path = this.dataset.path ?? (this.closest('[data-path]') as HTMLElement).dataset.path!;
        const properPath = app.mode === 'rolldata' ? `@${path}` : path;
        game.clipboard.copyPlainText(properPath)
          .then(() => ui.notifications.info(game.i18n.format('PTR2E.DataInspector.Info.CopyPath', { path })));
      }

      function copyValue(this: HTMLElement, ev: Event) {
        ev.preventDefault();
        ev.stopPropagation();
        const path = (this.closest('[data-path]') as HTMLElement).dataset.path!;
        const ds = app.root.getAtPath(path);
        if (!ds) return;
        const value = ds?.toCopy;
        game.clipboard.copyPlainText(value)
          .then(() => ui.notifications.info(game.i18n.format('PTR2E.DataInspector.Info.CopyValue', { path })));
      }

      function openLink(this: HTMLElement, ev: Event) {
        ev.preventDefault();
        ev.stopPropagation();
        const path = (this.closest('[data-path]') as HTMLElement).dataset.path!;
        const ds = app.root.getAtPath(path);
        const recursionDs = app.root.getAtPath(ds?.recursionPoint);
        if (!recursionDs) return;

        const rerender = ["content"];
        if (recursionDs.hidden) {
          app.searchTerm = "";
          app.lastSearch = { term: "", fuzzy: app.lastSearch.fuzzy };
          if (app.cachedResults[app.mode]?.all) recursionDs.resetFilters(app.cachedResults[app.mode]!.all);
          rerender.push("settings");
        }

        const recurExpand = (ds: DataStructure) => {
          ds.expanded = true;
          if (ds.parent) recurExpand(ds.parent);
        };

        recurExpand(recursionDs);
        app.scrollToPath = recursionDs.path;
        app.render({ parts: rerender });
      }

      for (const entry of htmlQueryAll(htmlElement, "[data-path]")) {
        // entry.addEventListener("click", expandPath);
        for (const subEntry of htmlQueryAll(entry, ".details .key")) {
          subEntry.addEventListener("contextmenu", copyPath);
        }
        for (const subEntry of htmlQueryAll(entry, ".details .value, .details.extended-value")) {
          subEntry.addEventListener("contextmenu", copyValue);
        }
        for (const subEntry of htmlQueryAll(entry, ".details .value.recursion")) {
          subEntry.addEventListener("click", openLink);
        }
        for (const subEntry of htmlQueryAll(entry, ".details .value.document")) {
          subEntry.addEventListener("dblclick", () => {
            const path = (subEntry.closest('[data-path]') as HTMLElement).dataset.path!;
            const ds = app.root.getAtPath(path);
            if (ds?.value instanceof foundry.abstract.Document) {
              const uuid = 'uuid' in ds.value ? ds.value.uuid as string : null
              if (!uuid) return void console.warn(ds.value);
              if (this.document.uuid === uuid) return void ui.notifications.notify(game.i18n.localize("PTR2E.DataInspector.Error.SameDocument"), "warning");

              const instance = foundry.applications.instances.get("data-inspector-" + uuid);
              if (instance) return void instance.bringToFront();

              if (!(ds.value instanceof ActorPTR2e || ds.value instanceof ItemPTR2e || document instanceof ActiveEffectPTR2e || ds.value instanceof ChatMessagePTR2e)) return void ui.notifications.error(game.i18n.localize("PTR2E.DataInspector.Error.InvalidDocument"));
              return void new DataInspector(ds.value as AllowedDocumentTypes).render(true)
            }
          });
        }

        const dataEntry = this.root.getAtPath(entry.dataset.path!);
        if (dataEntry && dataEntry.expandable) {
          const onClick = (ev: Event) => {
            ev.preventDefault();
            ev.stopPropagation();
            dataEntry.expanded = !dataEntry.expanded;
            this.render({ parts: ['content'] });
          };

          htmlQuery(entry, '.details')?.addEventListener("click", onClick);
        }
      }

      for (const entry of htmlQueryAll(htmlElement, "[data-option],[data-domain]")) {
        entry.addEventListener("contextmenu", () => {
          const value = entry.dataset.option || entry.dataset.domain;
          if (!value) return;

          game.clipboard.copyPlainText(value)
            .then(() => ui.notifications.info(game.i18n.format('PTR2E.DataInspector.Info.CopyRollInfo', { value, type: entry.dataset.option ? "Option" : "Selector" })));
        });
      }
    }
  }

  override async _onDrop(event: DragEvent) {
    event.preventDefault();

    const data: { type: string, uuid: string } = TextEditor.getDragEventData(event);
    if (!data?.uuid) return;

    const document = await fromUuid(data.uuid);
    if (!document) return;

    const instance = foundry.applications.instances.get("data-inspector-" + document.uuid);
    if (instance) return void instance.bringToFront();

    if (!(document instanceof ActorPTR2e || document instanceof ItemPTR2e || document instanceof ActiveEffectPTR2e || document instanceof ChatMessagePTR2e)) return void ui.notifications.error(game.i18n.localize("PTR2E.DataInspector.Error.InvalidDocument"));
    new DataInspector(document as AllowedDocumentTypes).render(true);
    return void this.close();
  }

  override _onRender(context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.HandlebarsRenderOptions): void {
    super._onRender(context, options);

    if (this.scrollToPath) {
      const entry = htmlQueryAll(this.element, `[data-path="${this.scrollToPath}"]`)[0];
      if (entry) entry.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      this.scrollToPath = null;
    }
  }

  override async _renderFrame(options: foundry.applications.api.HandlebarsRenderOptions) {
    const frame = await super._renderFrame(options);

    // Add info button
    const infoLabel = game.i18n.localize("PTR2E.DataInspector.Instructions");
    const info = `<button type="button" class="header-control fa-solid fa-circle-question info-tooltip" 
                            data-tooltip="${infoLabel}" aria-label="${infoLabel}" data-tooltip-direction="UP"></button>`;
    this.window.controls.insertAdjacentHTML("afterend", info);

    // Add refresh button
    const refreshLabel = game.i18n.localize("PTR2E.DataInspector.Refresh");
    const refresh = `<button type="button" data-action="refresh" class="header-control fa-solid fa-sync" 
                            data-tooltip="${refreshLabel}" aria-label="${refreshLabel}" data-tooltip-direction="UP"></button>`;
    this.window.controls.insertAdjacentHTML("afterend", refresh);

    return frame;
  }
}


export { DataInspector }