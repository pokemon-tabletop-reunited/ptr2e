import { ItemPTR2e } from "@item";
import { ApplicationV2Expanded } from "./appv2-expanded.ts";
import { Predicate } from "@system/predication/predication.ts";
import { htmlClosest, htmlQueryAll } from "@utils";
import Tagify from "@yaireo/tagify";

export abstract class PickAThingPrompt<TItem extends ItemPTR2e, TThing extends string | number | object> extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
  protected item: Maybe<TItem>;

  private resolve?: (value: PickableThing<TThing> | null) => void;

  protected selection: PickableThing<TThing> | null = null;

  protected choices: PickableThing<TThing>[];

  /** If the number of choices is beyond a certain length, a select menu is presented instead of a list of buttons */
  protected selectMenu?: Tagify<{ value: string; label: string }>;

  protected predicate: Predicate;

  protected allowNoSelection: boolean;

  constructor(data: PickAThingConstructorArgs<TItem, TThing>, options?: Partial<foundry.applications.api.ApplicationConfiguration>) {
    options ??= {};
    options.window ??= {};
    options.window.title = data.title ?? data.item?.name;

    super(options);

    this.item = data.item;
    this.choices = data.choices;
    this.predicate = data.predicate ?? new Predicate();
    this.allowNoSelection = data.allowNoSelection ?? false;
  }

  get actor(): Maybe<TItem["parent"]> {
    return this.item?.actor;
  }

  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      tag: "aside",
      classes: ["sheet pick-a-thing-prompt"],
      position: {
        height: 'auto',
        width: 'auto',
      },
      window: {
        minimizable: false,
        resizable: false,
      },
    },
    { inplace: false }
  );

  protected getSelection(event: MouseEvent): PickableThing<TThing> | null {
    const valueElement =
      htmlClosest(event.target, ".content")?.querySelector<HTMLElement>("tag") ??
      htmlClosest(event.target, "button[data-action=pick]") ??
      htmlClosest(event.target, ".choice")?.querySelector<HTMLButtonElement>("button[data-action=pick]");
    const selectedIndex = valueElement?.getAttribute("value");

    return !selectedIndex || !Number.isInteger(Number(selectedIndex))
      ? null
      : this.choices.at(Number(selectedIndex)) ?? null;
  }

  /** Return a promise containing the user's item selection, or `null` if no selection was made */
  async resolveSelection(): Promise<PickableThing<TThing> | null> {
    this.render(true);
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }

  override async _prepareContext(): Promise<PromptTemplateData> {
    return {
      item: this.item,
      choices: this.choices.map((c, i) => ({...c, value: i})),
      user: game.user
    }
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement): void {
    if(partId !== "choices") return;

    for(const element of htmlQueryAll(htmlElement, "a[data-choice], button[data-action=pick]")) {
      element.addEventListener("click", (event) => {
        this.selection = this.getSelection(event) ?? null;
        this.close();
      })
    }

    const select = htmlElement.querySelector<HTMLInputElement>("input[data-tagify-select]");
    if(!select) return;

    this.selectMenu = new Tagify(select, {
      enforceWhitelist: true,
      keepInvalidTags: false,
      mode: "select",
      tagTextProp: "label",
      dropdown: {
        closeOnSelect: true,
        enabled: 1,
        highlightFirst: true,
        mapValueTo: "label",
        maxItems: this.choices.length,
        searchKeys: ["label"],
      },
      whitelist: this.choices.map((c, i) => ({value: i.toString(), label: c.label})),
    });

    this.selectMenu.DOM.input.spellcheck = false;
  }

  override close(options?: Partial<foundry.applications.api.ApplicationClosingOptions>): Promise<foundry.applications.api.ApplicationV2> {
    for(const element of htmlQueryAll(this.element, "button, select")) {
      element.style.pointerEvents = "none";
    }
    this.resolve?.(this.selection);

    return super.close(options);
  }

};

interface PickAThingConstructorArgs<TItem extends ItemPTR2e, TThing extends string | number | object> {
  title?: string;
  prompt?: string;
  choices: PickableThing<TThing>[];
  item: Maybe<TItem>;
  predicate?: Predicate;
  allowNoSelection?: boolean;
}

interface PickableThing<T extends string | number | object = string | number | object> {
  value: T;
  label: string;
  img?: string;
  domain?: string[];
  predicate?: Predicate;
}

interface PromptTemplateData {
  choices: PickableThing[];
  /** An item pertinent to the selection being made */
  item: Maybe<ItemPTR2e>;
  user: User;
}

export type { PickAThingConstructorArgs, PickableThing, PromptTemplateData };
