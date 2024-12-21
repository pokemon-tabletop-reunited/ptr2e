/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { htmlQueryAll } from "@utils";

export type DocumentSheetConfiguration<TDocument extends foundry.abstract.Document> =
  foundry.applications.api.HandlebarsDocumentSheetConfiguration<TDocument>;
export class DocumentSheetV2<TDocument extends foundry.abstract.Document> extends foundry
  .applications.api.DocumentSheetV2<
    TDocument,
    foundry.applications.api.HandlebarsDocumentSheetConfiguration
  > {
  declare options: DocumentSheetConfiguration<TDocument> & {dragDrop?: DragDropConfiguration[]};

  protected override async _onSubmitForm(config: foundry.applications.api.ApplicationFormConfiguration, event: Event | SubmitEvent): Promise<void> {
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

  override get isEditable(): boolean {
    if (this.document instanceof ActiveEffect && !this.document.parent) return false;
    return super.isEditable;
  }

  protected _dragDropHandlers: DragDrop[];

  constructor(options: Partial<foundry.applications.api.DocumentSheetConfiguration> = {}) {
    super(options);

    this._dragDropHandlers = this._createDragDropHandlers()
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

  override _onRender(context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.HandlebarsDocumentSheetConfiguration): void {
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
        if(element.classList.contains("effect-edit") || element.dataset.action == "edit-action") continue;
        (element as HTMLButtonElement).disabled = true;
        element.attributes.setNamedItem(document.createAttribute("disabled"));
      }
      for(const element of htmlQueryAll(content, "tags.tagify")) {
        (element as HTMLInputElement).readOnly = true;
        element.attributes.setNamedItem(document.createAttribute("readOnly"));
      }
    }
    // Attach drag-and-drop handlers
    this._dragDropHandlers.forEach((handler) => handler.bind(this.element));
  }

  /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector
   * @param {string} selector       The candidate HTML selector for dragging
   * @returns {boolean}             Can the current user drag this selector?
   * @protected
   */
  _canDragStart(_selector: string) {
    return game.user.isGM;
  }

  /* -------------------------------------------- */

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   * @param {string} selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(_selector: string) {
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

export interface Tab {
  id: string;
  group: string;
  icon: string;
  label: string;
  active?: boolean;
  cssClass?: string;
}