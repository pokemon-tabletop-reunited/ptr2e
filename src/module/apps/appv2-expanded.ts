/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { htmlQueryAll, sluggify } from "@utils";
import type { AnyObject, DeepPartial, EmptyObject } from "fvtt-types/utils";

export type ApplicationConfigurationExpanded = foundry.applications.api.ApplicationV2.Configuration & ExpandedConfiguration

export interface ExpandedConfiguration {
  dragDrop?: DragDropConfiguration[];
}

export class ApplicationV2Expanded<
  RenderContext extends AnyObject = EmptyObject,
  Configuration extends ApplicationConfigurationExpanded = ApplicationConfigurationExpanded,
  RenderOptions extends foundry.applications.api.ApplicationV2.RenderOptions = foundry.applications.api.HandlebarsApplicationMixin.HandlebarsRenderOptions,
> extends foundry.applications.api.ApplicationV2<RenderContext, Configuration, RenderOptions> {

  constructor(options: DeepPartial<Configuration> = {}) {
    super(options);

    this._dragDropHandlers = this._createDragDropHandlers();
  }

  static override DEFAULT_OPTIONS = {
    dragDrop: []
  } as (DeepPartial<foundry.applications.api.ApplicationV2.Configuration> & ExpandedConfiguration)

  protected _dragDropHandlers: DragDrop[];


  override _onRender(context: DeepPartial<RenderContext>, options: DeepPartial<RenderOptions>): void {
    super._onRender(context, options);

    // Attach drag-and-drop handlers
    this._dragDropHandlers.forEach((handler) => handler.bind(this.element));
  }

  /**
   * Create drag-and-drop workflow handlers for this Application
   * @returns {DragDrop[]}     An array of DragDrop handlers
   * @private
   */
  _createDragDropHandlers() {
    return this.options.dragDrop!.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      };
      return new DragDrop(d);
    });
  }

  /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector
   * @param {string} selector       The candidate HTML selector for dragging
   * @returns {boolean}             Can the current user drag this selector?
   * @protected
   */
  _canDragStart(_selector: Maybe<string>) {
    return game.user.isGM;
  }

  /* -------------------------------------------- */

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   * @param {string} selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(_selector: Maybe<string>) {
    return game.user!.isGM;
  }

  /* -------------------------------------------- */

  /**
   * Callback actions which occur at the beginning of a drag start workflow.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragStart(_event: DragEvent) { }

  /* -------------------------------------------- */

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver(_event: DragEvent) { }

  /* -------------------------------------------- */

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDrop(_event: DragEvent) { }
}

export type DocumentSheetConfigurationExpanded<Document extends foundry.abstract.Document.Any> = foundry.applications.api.DocumentSheetV2.Configuration<Document> & ExpandedConfiguration;

export class DocumentSheetV2Expanded<
  Document extends foundry.abstract.Document.Any = foundry.abstract.Document.Any,
  RenderContext extends AnyObject = EmptyObject,
  Configuration extends DocumentSheetConfigurationExpanded<Document> = DocumentSheetConfigurationExpanded<Document>,
  RenderOptions extends foundry.applications.api.DocumentSheetV2.RenderOptions = foundry.applications.api.DocumentSheetV2.RenderOptions
> extends foundry.applications.api.DocumentSheetV2<Document, RenderContext, Configuration, RenderOptions> {

  static override DEFAULT_OPTIONS = {
    dragDrop: []
  } as (DeepPartial<DocumentSheetConfigurationExpanded<foundry.abstract.Document.Any>> & ExpandedConfiguration)

  protected _dragDropHandlers: DragDrop[];

  constructor(options: DeepPartial<Configuration> & { document: Document }) {
    super(options);

    this._dragDropHandlers = this._createDragDropHandlers()
  }

  override get isEditable(): boolean {
    if (this.document instanceof ActiveEffect && !this.document.parent) return false;
    return super.isEditable;
  }

  protected override async _onSubmitForm(config: foundry.applications.api.ApplicationV2.FormConfiguration, event: Event | SubmitEvent): Promise<void> {
    event.preventDefault();
    const { handler, closeOnSubmit } = config;
    const element = (event.currentTarget ?? this.element) as HTMLFormElement

    $(element).find("tags ~ input").each((_i, input) => {
      if ((input as HTMLInputElement).value === "") (input as HTMLInputElement).value = "[]";
    });

    const formData = new FormDataExtended(element);
    if (handler instanceof Function) await handler.call(this, event, element, formData);
    if (closeOnSubmit) await this.close();
  }

  override _onRender(context: DeepPartial<RenderContext>, options: DeepPartial<RenderOptions>): void {
    super._onRender(context, options);
    if (!this.isEditable) {
      const content = this.element.querySelector('.window-content');
      if (!content) return;

      for (const input of ["INPUT", "SELECT", "TEXTAREA", "BUTTON"]) {
        for (const element of content.getElementsByTagName(input)) {
          if (input === "TEXTAREA") (element as HTMLTextAreaElement).readOnly = true;
          else (element as HTMLInputElement).disabled = true;
        }
      }
      for (const element of htmlQueryAll(content, ".item-controls a")) {
        if (element.classList.contains("effect-edit") || element.dataset.action == "edit-action") continue;
        (element as HTMLButtonElement).disabled = true;
        element.attributes.setNamedItem(document.createAttribute("disabled"));
      }
      for (const element of htmlQueryAll(content, "tags.tagify")) {
        (element as HTMLInputElement).readOnly = true;
        element.attributes.setNamedItem(document.createAttribute("readOnly"));
      }
    }
    // Attach drag-and-drop handlers
    this._dragDropHandlers.forEach((handler) => handler.bind(this.element));
  }

  /**
   * Create drag-and-drop workflow handlers for this Application
   * @returns {DragDrop[]}     An array of DragDrop handlers
   * @private
   */
  _createDragDropHandlers() {
    return this.options.dragDrop?.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      };
      return new DragDrop(d);
    }) ?? [];
  }

  /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector
   * @param {string} selector       The candidate HTML selector for dragging
   * @returns {boolean}             Can the current user drag this selector?
   * @protected
   */
  _canDragStart(_selector: Maybe<string>) {
    return game.user.isGM;
  }

  /* -------------------------------------------- */

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   * @param {string} selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(_selector: Maybe<string>) {
    return game.user.isGM;
  }

  /* -------------------------------------------- */

  /**
   * Callback actions which occur at the beginning of a drag start workflow.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragStart(_event: DragEvent) { }

  /* -------------------------------------------- */

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver(_event: DragEvent) { }

  /* -------------------------------------------- */

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDrop(_event: DragEvent) { }
}

export class ActorSheetV2Expanded<
  RenderContext extends AnyObject = EmptyObject,
  Configuration extends DocumentSheetConfigurationExpanded<Actor.ConfiguredInstance> = DocumentSheetConfigurationExpanded<Actor.ConfiguredInstance>,
  RenderOptions extends foundry.applications.api.DocumentSheetV2.RenderOptions = foundry.applications.api.DocumentSheetV2.RenderOptions
> extends foundry.applications.sheets.ActorSheetV2<RenderContext, Configuration, RenderOptions> {
  static override DEFAULT_OPTIONS = {
    dragDrop: []
  } as {
    dragDrop: DragDropConfiguration[]
  }

  protected _dragDropHandlers: DragDrop[];

  constructor(options: DeepPartial<Configuration> & { document: Actor.ConfiguredInstance }) {
    super(options);

    this._dragDropHandlers = this._createDragDropHandlers();
  }

  override get title() {
    if (!this.actor.isToken) return this.actor.name;
    return `[${game.i18n.localize(TokenDocument.metadata.label)}] ${this.actor.name}`;
  }

  get object() {
    return this.document;
  }

  protected override async _onSubmitForm(config: foundry.applications.api.ApplicationV2.FormConfiguration, event: Event | SubmitEvent): Promise<void> {
    event.preventDefault();
    const { handler, closeOnSubmit } = config;
    const element = (event.currentTarget ?? this.element) as HTMLFormElement

    $(element).find("tags ~ input").each((_i, input) => {
      if ((input as HTMLInputElement).value === "") (input as HTMLInputElement).value = "[]";
    });

    const formData = new FormDataExtended(element);
    if (handler instanceof Function) await handler.call(this, event, element, formData);
    if (closeOnSubmit) await this.close();
  }

  override _onRender(context: DeepPartial<RenderContext>, options: DeepPartial<RenderOptions>): void {
    super._onRender(context, options);

    // Attach drag-and-drop handlers
    this._dragDropHandlers.forEach((handler) => handler.bind(this.element));
  }

  /**
   * Create drag-and-drop workflow handlers for this Application
   * @returns {DragDrop[]}     An array of DragDrop handlers
   * @private
   */
  _createDragDropHandlers() {
    return this.options.dragDrop!.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      };
      return new DragDrop(d);
    });
  }

  /**
   * Add compatability with modules that add buttons to the header of the sheet using the AppV1 method
   */
  override _getHeaderControls(): foundry.applications.api.ApplicationV2.HeaderControlsEntry[] {
    const controls = super._getHeaderControls();

    Hooks.callAll("getActorSheetHeaderButtons", this, controls);

    for (const control of controls) {
      if ('onclick' in control && !control.action) {
        const slug = sluggify(control.label + ' ' + control.icon);
        if (controls.filter(c => c.action == slug).length > 0) {
          controls.splice(controls.indexOf(control), 1);
          continue;
        }
        // @ts-expect-error - Add AppV1 support for modules that use the old method
        this.options.actions[slug] = control.onclick;
        control.action = slug;
      }
    }

    return controls;
  }

  /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector
   * @param {string} selector       The candidate HTML selector for dragging
   * @returns {boolean}             Can the current user drag this selector?
   * @protected
   */
  _canDragStart(_selector: Maybe<string>) {
    return this.isEditable;
  }

  /* -------------------------------------------- */

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   * @param {string} selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(_selector: Maybe<string>) {
    return this.isEditable;
  }

  /* -------------------------------------------- */

  /**
   * Callback actions which occur at the beginning of a drag start workflow.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragStart(event: DragEvent) {
    const li = event.currentTarget as HTMLElement;
    if ("link" in (event.target as HTMLElement).dataset) return;

    // Create drag data
    let dragData;

    // Owned Items
    if (li.dataset.itemId) {
      const item = this.actor.items.get(li.dataset.itemId);
      dragData = item?.toDragData();
    }

    // Active Effect
    if (li.dataset.effectId) {
      const effect = this.actor.effects.get(li.dataset.effectId);
      dragData = effect?.toDragData();
    }

    if (!dragData) return;

    // Set data transfer
    event.dataTransfer!.setData("text/plain", JSON.stringify(dragData));
  }

  /* -------------------------------------------- */

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver(_event: DragEvent) { }

  /* -------------------------------------------- */

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  async _onDrop(event: DragEvent, upstreamData?: { type: string }) {
    const data: { type: string } = upstreamData ?? TextEditor.getDragEventData(event) as unknown as { type: string };
    const actor = this.actor;
    const allowed = Hooks.call("dropActorSheetData", actor, this, data);
    if (allowed === false) return;

    // Handle different data types
    switch (data.type) {
      case "Affliction":
        return this._onDropAffliction(event, data);
      case "ActiveEffect":
        return this._onDropActiveEffect(event, data);
      case "Actor":
        return this._onDropActor(event, data);
      case "Item":
        return this._onDropItem(event, data);
      case "Folder":
        return this._onDropFolder(event, data);
    }
    return;
  }

  async _onDropAffliction(_event: DragEvent, data: object) {
    if (!('id' in data && typeof data.id === 'string')) return false;

    const affliction = game.ptr.data.afflictions.get(data.id);
    if (!affliction) return false;

    const effect = await CONFIG.ActiveEffect.documentClass.fromStatusEffect(affliction.id) as ActiveEffect.ConfiguredInstance;
    if (!effect) return false;

    return CONFIG.ActiveEffect.documentClass.create(effect.toObject(), { parent: this.actor });
  }

  /* -------------------------------------------- */

  /**
   * Handle the dropping of ActiveEffect data onto an Actor Sheet
   * @param {DragEvent} event                  The concluding DragEvent which contains drop data
   * @param {object} data                      The data transfer extracted from the event
   * @returns {Promise<ActiveEffect|boolean>}  The created ActiveEffect object or false if it couldn't be created.
   * @protected
   */
  async _onDropActiveEffect(_event: DragEvent, data: object) {
    const effect = await CONFIG.ActiveEffect.documentClass.fromDropData(data as foundry.abstract.Document.DropData<ActiveEffect.ConfiguredInstance>);
    if (!this.actor.isOwner || !effect) return false;
    if (effect.target === this.actor) return false;
    return CONFIG.ActiveEffect.documentClass.create(effect.toObject(), { parent: this.actor });
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of an Actor data onto another Actor sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
   *                                     not permitted.
   * @protected
   */
  async _onDropActor(_event: DragEvent, _data: object) {
    if (!this.actor.isOwner) return false;
    return;
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of an item reference or item data onto an Actor Sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
   * @protected
   */
  async _onDropItem(event: DragEvent, data: object) {
    if (!this.actor.isOwner) return false;
    const item = (await CONFIG.Item.documentClass.implementation.fromDropData(data as foundry.abstract.Document.DropData<Item.ConfiguredInstance>)) as Item.ConfiguredInstance;
    if (item.type === "effect") {
      const effects = item.effects.map(effect => effect.toObject());
      if (!effects.length) return;
      return CONFIG.ActiveEffect.documentClass.create(effects, { parent: this.actor });
    }

    const itemData = item.toObject();

    // Handle item sorting within the same Actor
    if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, itemData);

    // Create the owned item
    return this._onDropItemCreate(itemData, event);
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of a Folder on an Actor Sheet.
   * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {object} data         The data transfer extracted from the event
   * @returns {Promise<Item[]>}
   * @protected
   */
  async _onDropFolder(event: DragEvent, data: object) {
    if (!this.actor.isOwner) return [];
    const folder = (await Folder.fromDropData(data as foundry.abstract.Document.DropData<Folder>)) as Folder;
    if (folder.type !== "Item") return [];
    const droppedItemData = await Promise.all(
      folder.contents.map(async (item) => {
        if (!(document instanceof Item))
          item = await fromUuid<Actor.ConfiguredInstance | Item.ConfiguredInstance | Cards.ConfiguredInstance | Scene.ConfiguredInstance | Playlist.ConfiguredInstance | RollTable.ConfiguredInstance | Adventure.ConfiguredInstance | JournalEntry.ConfiguredInstance | Macro.ConfiguredInstance>(item.uuid as ValidUUID);
        return item.toObject();
      })
    );
    return this._onDropItemCreate(droppedItemData, event);
  }

  /* -------------------------------------------- */

  /**
   * Handle the final creation of dropped Item data on the Actor.
   * This method is factored out to allow downstream classes the opportunity to override item creation behavior.
   * @param {object[]|object} itemData      The item data requested for creation
   * @param {DragEvent} event               The concluding DragEvent which provided the drop data
   * @returns {Promise<Item[]>}
   * @private
   */
  async _onDropItemCreate(itemData: object | object[], _event: DragEvent) {
    return this.actor.createEmbeddedDocuments(
      "Item",
      itemData instanceof Array ? itemData : [itemData]
    );
  }

  /* -------------------------------------------- */

  /**
   * Handle a drop event for an existing embedded Item to sort that Item relative to its siblings
   * @param {Event} event
   * @param {Object} itemData
   * @private
   */
  _onSortItem(event: Event, itemData: Item.ConstructorData) {
    // Get the drag source and drop target
    const items = this.actor.items;
    const source = items.get(itemData._id as string)!;
    const dropTarget = (event.target as HTMLElement).closest("[data-item-id]") as HTMLElement;
    if (!dropTarget) return;
    const target = items.get(dropTarget.dataset.itemId!)!;

    // Don't sort on yourself
    if (source.id === target.id) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (const el of dropTarget.parentElement!.children) {
      const siblingId = (el as HTMLElement).dataset.itemId;
      if (siblingId && siblingId !== source.id)
        siblings.push(items.get((el as HTMLElement).dataset.itemId!));
    }

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(source, { target, siblings });
    const updateData = sortUpdates.map((u) => {
      const update = u.update as { sort: number, _id: string };
      update._id = u.target!._id!;
      return update;
    });

    // Perform the update
    return this.actor.updateEmbeddedDocuments(
      "Item",
      updateData
    );
  }
}

export class ItemSheetV2Expanded<
  RenderContext extends AnyObject = EmptyObject,
  Configuration extends DocumentSheetConfigurationExpanded<Item.ConfiguredInstance> = DocumentSheetConfigurationExpanded<Item.ConfiguredInstance>,
  RenderOptions extends foundry.applications.api.DocumentSheetV2.RenderOptions = foundry.applications.api.DocumentSheetV2.RenderOptions
> extends foundry.applications.sheets.ItemSheetV2<RenderContext, Configuration, RenderOptions> {

  static override DEFAULT_OPTIONS = {
    dragDrop: []
  } as {
    dragDrop: DragDropConfiguration[]
  } as (DeepPartial<DocumentSheetConfigurationExpanded<Item.ConfiguredInstance>> & ExpandedConfiguration)

  protected _dragDropHandlers: DragDrop[];

  get object() {
    return this.document;
  }

  constructor(options: DeepPartial<Configuration> & { document: Item.ConfiguredInstance }) {
    super(options);

    this._dragDropHandlers = this._createDragDropHandlers();
  }

  override _onRender(context: DeepPartial<RenderContext>, options: DeepPartial<RenderOptions>): void {
    super._onRender(context, options);

    // Attach drag-and-drop handlers
    this._dragDropHandlers.forEach((handler) => handler.bind(this.element));

    if (!this.isEditable) {
      const content = this.element.querySelector('.window-content');
      if (!content) return;

      for (const input of ["INPUT", "SELECT", "TEXTAREA", "BUTTON"]) {
        for (const element of content.getElementsByTagName(input)) {
          if (input === "TEXTAREA") (element as HTMLTextAreaElement).readOnly = true;
          else (element as HTMLInputElement).disabled = true;
        }
      }
      for (const element of htmlQueryAll(content, ".item-controls a")) {
        if (element.classList.contains("effect-edit") || element.dataset.action == "edit-action") continue;
        (element as HTMLButtonElement).disabled = true;
        element.attributes.setNamedItem(document.createAttribute("disabled"));
      }
      for (const element of htmlQueryAll(content, "tags.tagify")) {
        (element as HTMLInputElement).readOnly = true;
        element.attributes.setNamedItem(document.createAttribute("readOnly"));
      }
    }
  }

  /**
   * Create drag-and-drop workflow handlers for this Application
   * @returns {DragDrop[]}     An array of DragDrop handlers
   * @private
   */
  _createDragDropHandlers() {
    return this.options.dragDrop!.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      };
      return new DragDrop(d);
    });
  }

  /**
   * Add compatability with modules that add buttons to the header of the sheet using the AppV1 method
   */
  override _getHeaderControls(): foundry.applications.api.ApplicationV2.HeaderControlsEntry[] {
    const controls = super._getHeaderControls();

    Hooks.callAll("getActorSheetHeaderButtons", this, controls);

    for (const control of controls) {
      if ('onclick' in control && !control.action) {
        const slug = sluggify(control.label + ' ' + control.icon);
        if (controls.filter(c => c.action == slug).length > 0) {
          controls.splice(controls.indexOf(control), 1);
          continue;
        }
        // @ts-expect-error - Add AppV1 support for modules that use the old method
        this.options.actions[slug] = control.onclick;
        control.action = slug;
      }
    }

    return controls;
  }

  /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector
   * @param {string} selector       The candidate HTML selector for dragging
   * @returns {boolean}             Can the current user drag this selector?
   * @protected
   */
  _canDragStart(_selector: Maybe<string>) {
    return this.isEditable;
  }

  /* -------------------------------------------- */

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   * @param {string} selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(_selector: Maybe<string>) {
    return this.isEditable;
  }

  /* -------------------------------------------- */

  /**
   * Callback actions which occur at the beginning of a drag start workflow.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragStart(event: DragEvent) {
    const li = event.currentTarget as HTMLElement;
    if ("link" in (event.target as HTMLElement).dataset) return;

    // Create drag data
    let dragData;

    // Owned Items
    if (li.dataset.itemId) {
      dragData = this.document?.toDragData();
    }

    // Active Effect
    if (li.dataset.effectId) {
      const effect = this.document.effects.get(li.dataset.effectId) as ActiveEffect.ConfiguredInstance;
      dragData = effect?.toDragData();
    }

    // Action
    if (li.dataset.action) {
      const action = this.document.actions.get(li.dataset.action);
      dragData = action?.toDragData();
    }

    if (!dragData) return;

    // Set data transfer
    event.dataTransfer!.setData("text/plain", JSON.stringify(dragData));
  }

  /* -------------------------------------------- */

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver(_event: DragEvent) { }

  /* -------------------------------------------- */

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  async _onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    const data = TextEditor.getDragEventData(event);
    const item = this.document;
    const allowed = Hooks.call("dropItemSheetData", item, data, event);
    if (allowed === false) return;
    if (typeof data === "number") return;

    if ('action' in data && data.action) {
      if (!(this.document.system.actions instanceof Collection)) return;

      const actionData = data.action as { slug: string, type: string };

      const item = await CONFIG.Item.documentClass.fromDropData(data as unknown as TokenLayer.DropData);
      if (!item || !item?.actions?.size) return;

      const action = item.actions.get(actionData.slug);
      if (!action) return;

      const existing = this.document.actions.get(actionData.slug);
      if (existing) return void ui.notifications.warn(`An action with the slug ${actionData.slug} already exists on this item.`);

      const actions = foundry.utils.duplicate(this.document.system._source.actions as PTR.Models.Action.Source[]);
      actions.push(action.toObject());
      return void this.document.update({ "system.actions": actions });
    }
    if (!('type' in data)) return;

    // Handle different data types
    switch (data.type) {
      case "Affliction": {
        this._onDropAffliction(event, data);
        return;
      }
      case "ActiveEffect": {
        this._onDropActiveEffect(event, data);
        return;
      }
      case "Item": {
        this._onDropItem(event, data);
        return;
      }
    }
  }

  async _onDropItem(_event: DragEvent, data: object) {
    const item = await CONFIG.Item.documentClass.fromDropData(data as TokenLayer.DropData);
    if (!item || item.type !== "effect") return;
    const effects = item.effects.map((effect) => effect.toObject());
    if (effects.length === 0) return;
    return CONFIG.ActiveEffect.documentClass.createDocuments(effects, { parent: this.document });
  }

  async _onDropAffliction(_event: DragEvent, data: object) {
    if (!('id' in data && typeof data.id === 'string')) return false;

    const affliction = game.ptr.data.afflictions.get(data.id);
    if (!affliction) return false;

    const effect = await CONFIG.ActiveEffect.documentClass.fromStatusEffect(affliction.id) as ActiveEffect.ConfiguredInstance;
    if (!effect) return false;

    return CONFIG.ActiveEffect.documentClass.create(effect.toObject(), { parent: this.document });
  }

  async _onDropActiveEffect(_event: DragEvent, data: object) {
    const effect = await CONFIG.ActiveEffect.documentClass.fromDropData(data);
    if (!this.document.isOwner || !effect) return false;
    if (effect.parent === this.document) return false;

    // Change type away from 'Summon' if applicable, as this type is only available for 'Summon' items.
    const source = effect.toObject();
    if (source.type === "summon") {
      // Attempt a best-effor conversion.
      source.type = source.system.formula || source.duration.turns ? "affliction" : "passive";
    }
    return CONFIG.ActiveEffect.documentClass.create(source, { parent: this.document });
  }

  protected override async _onSubmitForm(config: foundry.applications.api.ApplicationV2.FormConfiguration, event: Event | SubmitEvent): Promise<void> {
    event.preventDefault();
    const { handler, closeOnSubmit } = config;
    const element = (event.currentTarget ?? this.element) as HTMLFormElement

    $(element).find("tags ~ input").each((_i, input) => {
      if ((input as HTMLInputElement).value === "") (input as HTMLInputElement).value = "[]";
    });

    const formData = new FormDataExtended(element);
    if (handler instanceof Function) await handler.call(this, event, element, formData);
    if (closeOnSubmit) await this.close();
  }
}
