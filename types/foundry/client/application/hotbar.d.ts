import type ApplicationV2 from "../../common/applications/api/application.js";
import type { ApplicationConfiguration, ApplicationRenderOptions } from "../../common/applications/_types.d.ts";
import type HandlebarsApplicationMixin from "../../common/applications/api/handlebars-application.d.ts";
import type { HandlebarsTemplatePart } from "../../common/applications/api/handlebars-application.d.ts";

export { };

declare global {
  
  abstract class BaseHotbar<SlotsData extends Hotbar.HotbarSlotData> extends ApplicationV2<
    ApplicationConfiguration,
    ApplicationRenderOptions,
    Hotbar.HotbarContext<SlotsData>
  > { }

  namespace Hotbar {
    interface HotbarContext<SlotsData extends HotbarSlotData = HotbarSlotData> { 
      /** The current hotbar page number. */
      page: number;
  
      /** The currently rendered macro data. */
      slots: SlotsData[];
    }

    interface HotbarSlotData {
      slot: number;
      macro: Macro | null;
      key: number;
      tooltip: string;
      ariaLabel?: string;
      style?: string;
    }
  }

  /**
   * The global action bar displayed at the bottom of the game view.
   * The Hotbar is a UI element at the bottom of the screen which contains Macros as interactive buttons.
   * The Hotbar supports 5 pages of global macros which can be dragged and dropped to organize as you wish.
   *
   * Left clicking a Macro button triggers its effect.
   * Right clicking the button displays a context menu of Macro options.
   * The number keys 1 through 0 activate numbered hotbar slots.
   * Pressing the delete key while hovering over a Macro will remove it from the bar.
   *
   * @extends {Application}
   *
   * @see {@link Macros}
   * @see {@link Macro}
   */
  class Hotbar<TMacro extends Macro = Macro, SlotData extends Hotbar.HotbarSlotData = Hotbar.HotbarSlotData> extends HandlebarsApplicationMixin(BaseHotbar)<SlotData> {
    static override DEFAULT_OPTIONS: DeepPartial<ApplicationConfiguration>;

    static override PARTS: Record<string, HandlebarsTemplatePart>;

    /** * The current hotbar page number. */
    get page(): number;

    /** The currently rendered macro data. */
    get slots(): SlotData[];

    /** Whether the hotbar is locked. */
    get locked(): boolean;

    override _prepareContext(options: Partial<ApplicationRenderOptions>): Promise<Hotbar.HotbarContext<SlotData>>;

    protected override _onFirstRender(context: object, options: ApplicationRenderOptions): Promise<void>;

    protected override _onRender(context: object, options: ApplicationRenderOptions): Promise<void>;

    protected _getContextMenuOptions(): ContextMenuEntry[];

    /* -------------------------------------------- */
    /*  Public API                                 */
    /* -------------------------------------------- */

    /** Change to a specific numbered page from 1 to 5 */
    changePage(page: number): Promise<void>;

    /** Change the page of the hotbar by cycling up (positive) or down (negative). */
    cyclePage(direction: number): Promise<void>;

    /** A reusable helper that can be used for toggling display of a document sheet. */
    static toggleDocumentSheet(uuid: string): Promise<void>;

    /** Update hotbar display based on viewport size. */
    protected _onResize(): void;

    /** Create a Macro which rolls a RollTable when executed */
    protected _createRollTableRollMacro(table: RollTable): Promise<TMacro>;

    /** Create a Macro document which can be used to toggle display of a Journal Entry. */
    protected _createDocumentSheetToggle(document: foundry.abstract.Document): Promise<TMacro>;
  }
}
