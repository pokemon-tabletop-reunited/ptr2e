import { ActorPTR2e } from "@actor";
import { ItemPTR2e, ItemSystemPTR } from "@item";
import { PickableThing, PickAThingConstructorArgs, PickAThingPrompt, PromptTemplateData } from "@module/apps/pick-a-thing-prompt.ts";
import { Predicate } from "@system/predication/predication.ts";
import { createHTMLElement, htmlQuery, htmlQueryAll, sluggify } from "@utils";
import { UUIDUtils } from "src/util/uuid.ts";

class ChoiceSetPrompt extends PickAThingPrompt<ItemPTR2e<ItemSystemPTR, ActorPTR2e>, string | number | object> {
  /** The prompt statement to present the user in this application's window */
  prompt: string;

  /** Does this choice set contain items? If true, an item-drop zone may be added */
  containsItems: boolean;

  /** A predicate validating a dragged & dropped item selection */
  allowedDrops: { label: string | null; predicate: Predicate } | null;

  constructor(data: ChoiceSetPromptData, options?: Partial<foundry.applications.api.ApplicationConfiguration>) {
    super(data, options);
    this.prompt = data.prompt;
    this.choices ??= [];
    this.containsItems = data.containsItems;
    this.allowedDrops = this.containsItems ? data.allowedDrops : null;
  }

  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["choice-set-prompt"],
      dragDrop: [{ dropSelector: ".drop-zone" }]
    },
    { inplace: false }
  );

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    choices: {
      id: "choices",
      template: "systems/ptr2e/templates/apps/choice-set-prompt.hbs",
    },
  };

  override async _prepareContext(): Promise<ChoiceSetTemplateData> {
    return {
      ...(await super._prepareContext()),
      choices: this.choices.map((c, i) => ({
        ...c,
        value: i,
        hasUUID: UUIDUtils.isItemUUID(c.value)
      })),
      prompt: this.prompt,
      includeDropZone: !!this.allowedDrops,
      allowNoSelection: this.allowNoSelection,
      selectMenu: this.choices.length > 9,
      containsItems: this.containsItems
    }
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement): void {
    super._attachPartListeners(partId, htmlElement);
    if (partId !== "choices") return;

    htmlQuery(htmlElement, "button[data-action=close]")?.addEventListener("click", () => this.close());

    if (!this.containsItems) return;

    const renderItemSheet = async (choice: ChoiceSetChoice | null): Promise<void> => {
      if (!choice || !UUIDUtils.isItemUUID(choice.value)) return;
      const item = await fromUuid(choice.value);
      item?.sheet.render(true);
    }

    if (this.selectMenu) {
      const itemInfoAnchor = htmlQuery(htmlElement, "a[data-action=view-item]");
      if (!itemInfoAnchor) return;

      const updateAnchor = (disable: boolean, value = ""): void => {
        itemInfoAnchor.dataset.value = value;
        itemInfoAnchor.classList.toggle("disabled", disable);
        itemInfoAnchor.dataset.tooltip = game.i18n.localize(disable ? "PTR2E.ChoiceSetPrompt.ViewItem.Disabled" : "PTR2E.ChoiceSetPrompt.ViewItem.Tooltip");
      }

      itemInfoAnchor.addEventListener("click", (event) => renderItemSheet(this.getSelection(event)))

      this.selectMenu.on("change", event => {
        const data = event.detail.tagify.value.at(0);
        if(!data) return updateAnchor(true);

        const index = Number(data.value)
        if(isNaN(index)) return;

        const choice = this.choices.at(index);
        if(UUIDUtils.isItemUUID(choice?.value)) return void updateAnchor(false, data.value);
        return void updateAnchor(true);
      })
    }
    else {
      for (const anchor of htmlQueryAll(htmlElement, "a[data-action=view-item]")) {
        anchor.addEventListener("click", (event) => {
          renderItemSheet(this.getSelection(event));
        });
      }
    }
  }

  override async resolveSelection(): Promise<PickableThing<string | number | object> | null> {
    // Return early if there is only one choice
    const firstChoice = this.choices.at(0);
    if(!this.allowedDrops && firstChoice && this.choices.length === 1) return (this.selection = firstChoice);

    // Exit early if there are no valid choices
    if(this.choices.length === 0 && !this.allowedDrops) {
      ui.notifications.warn(game.i18n.format("PTR2E.ChoiceSetPrompt.NoValidOptions", {actor: this.actor?.name ?? "", item: this.item?.name ?? ""}));
      this.close({animate: false});
      return null;
    }

    return super.resolveSelection();
  }

  override async close(options?: Partial<foundry.applications.api.ApplicationClosingOptions>): Promise<foundry.applications.api.ApplicationV2> {
    if(this.choices.length > 0 && !this.selection && !this.allowNoSelection) {
      ui.notifications.warn(game.i18n.format("PTR2E.ChoiceSetPrompt.NoSelectionMade", {item: this.item?.name ?? ""}));
    }
    return super.close(options);
  }

  override async _onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    const dataString = event.dataTransfer?.getData("text/plain");
    const dropData: DropCanvasData<"Item"> | undefined = JSON.parse(dataString ?? "");
    if(dropData?.type !== "Item") return void ui.notifications.error(game.i18n.localize("PTR2E.ChoiceSetPrompt.DropItemError"));

    const item = await ItemPTR2e.fromDropData(dropData);
    if(!item) throw Error("Unexpectedly failed to create an item from dropped data");

    const isAllowedDrop = !!this.allowedDrops?.predicate.test(item.getRollOptions("item"));
    if(this.allowedDrops && !isAllowedDrop) return void ui.notifications.error(game.i18n.format("PTR2E.ChoiceSetPrompt.DropItemNotAllowed", {
      badType: item.type,
      goodType: game.i18n.localize(this.allowedDrops.label ?? "")
    }));

    // Drop accepted, add to list/select menu
    const slugsAsValues = this.containsItems && this.choices.length > 0 && this.choices.every(c => !UUIDUtils.isItemUUID(c.value));
    const newChoice = {
      value: slugsAsValues ? item.slug ?? sluggify(item.id) : item.uuid,
      label: item.name,
    }
    const choicesLength = this.choices.push(newChoice);

    const dropZone = this.element.querySelector(".drop-zone");
    if(this.selectMenu) {
      const {whitelist} = this.selectMenu.settings;
      const menuChoice = { value: String(choicesLength - 1), label: newChoice.label };
      whitelist?.push(menuChoice.value as string & { label: string; value: string })

      this.selectMenu.setPersistedData(whitelist, "whitelist");
      this.selectMenu.addTags([menuChoice], true, true);
      this.selectMenu.setReadonly(true);

      dropZone?.remove();
    } else {
      const img = document.createElement("img");
      img.src = item.img;

      const newButton = createHTMLElement("button", {
        classes: ["with-image"],
        children: [img, createHTMLElement("span", { children: [item.name]})],
      })
      newButton.type = "button";
      newButton.value = String(choicesLength - 1);

      newButton.addEventListener("click", (event) => {
        this.selection = this.getSelection(event) ?? null;
        this.close();
      });

      dropZone?.replaceWith(newButton);
    }
  }

  override _canDragDrop(): boolean {
    return this.actor?.isOwner ?? false;
  }
}

interface ChoiceSetPrompt extends PickAThingPrompt<ItemPTR2e<ItemSystemPTR, ActorPTR2e>, string | number | object> {
  getSelection(event: MouseEvent): ChoiceSetChoice | null;
}

interface ChoiceSetPromptData extends PickAThingConstructorArgs<ItemPTR2e<ItemSystemPTR, ActorPTR2e>, string | number | object> {
  prompt: string;
  containsItems: boolean;
  allowedDrops: { label: string | null; predicate: Predicate } | null;
}

interface ChoiceSetChoice extends PickableThing {
  hasUUID: boolean;
}

interface ChoiceSetTemplateData extends PromptTemplateData {
  prompt: string;
  choices: ChoiceSetChoice[];
  /** Whether to use a select menu instead of a column of buttons */
  selectMenu: boolean;
  includeDropZone: boolean;
  allowNoSelection: boolean;
  containsItems: boolean;
}

export { ChoiceSetPrompt };