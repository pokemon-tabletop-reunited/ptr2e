import type { DocumentSheetConfiguration, Tab } from "@item/sheets/document.ts";
import ActiveEffectConfig from "./sheet.ts";
import type ActiveEffectPTR2e from "./document.ts";
import type FormActiveEffectSystem from "./data/form.ts";
import type { ActorPTR2e } from "@actor";
import type { ItemPTR2e } from "@item";
import { sluggify } from "@utils";
// import * as R from "remeda";

export class FormConfigSheet extends ActiveEffectConfig {

  static override DEFAULT_OPTIONS = foundry.utils.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["form-sheet"],
      actions: {},
      form: {
        handler: FormConfigSheet.#onSubmit
      }
    },
    { inplace: false }
  );

  static override PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    header: {
      id: "header",
      template: "systems/ptr2e/templates/items/parts/item-header.hbs",
    },
    tabs: {
      id: "tabs",
      template: "systems/ptr2e/templates/items/parts/item-tabs.hbs",
    },
    overview: {
      id: "overview",
      template: "systems/ptr2e/templates/effects/form/overview.hbs",
      scrollable: [".scroll"],
    },
    changes: {
      id: "changes",
      template: "systems/ptr2e/templates/effects/form/changes.hbs",
      scrollable: [".scroll"],
    },
  };

  override tabGroups: Record<string, string> = {
    sheet: "overview",
  };

  override tabs: Record<string, Tab> = {
    overview: {
      id: "overview",
      group: "sheet",
      icon: "fa-solid fa-house",
      label: "PTR2E.EffectSheet.Tabs.overview.label",
    },
    changes: {
      id: "changes",
      group: "sheet",
      icon: "fa-solid fa-star",
      label: "PTR2E.EffectSheet.Tabs.changes.label",
    },
  };

  override async _prepareContext(options?: DocumentSheetConfiguration<ActiveEffectPTR2e>) {
    const conditionDisplays = this.prepareConditionDisplays();

    return {
      ...(await super._prepareContext(options)),
      conditionDisplays,
    }
  }

  prepareConditionDisplays() {
    const conditions = this.document.system.conditions;
    if(!conditions.length) return [];

    interface ConditionDisplay {
      type: "weather" | "item" | "ability";
      value: string;
      label: string;
      idx: number;
      itemType?: "consumable" | "gear" | "equipment" | "weapon";
    }

    const displays: ConditionDisplay[] = [];
    for(let i = 0; i < conditions.length; i++) {
      const condition = conditions[i];
      if(typeof condition !== "string") continue;
      switch(true) {
        case /^weather:[a-z-]+$/.test(condition): {
          displays.push({
            type: "weather",
            value: condition.split(":")[1],
            label: "PTR2E.EffectSheet.Conditions.weather",
            idx: i
          })
          break;
        }
        case /^item:[a-z]+:[a-z-]+:(held|worn|equipped)$/.test(condition): {
          const [,itemType, itemName,] = condition.split(":");
          displays.push({
            type: "item",
            value: itemName,
            itemType: itemType as "consumable" | "gear" | "equipment" | "weapon",
            label: "PTR2E.EffectSheet.Conditions.item",
            idx: i
          });
          break;
        }
        case /^item:ability:[a-z-]+:active$/.test(condition): {
          const [,, abilityname,] = condition.split(":");
          displays.push({
            type: "ability",
            value: abilityname,
            label: "PTR2E.EffectSheet.Conditions.ability",
            idx: i
          });
          break;
        }
      }
    }
    return displays;
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: foundry.applications.api.HandlebarsApplicationMixin.HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);

    if (partId === "overview") {
      const richConditionInputs = htmlElement.querySelectorAll<HTMLInputElement | HTMLSelectElement>(".conditions input, .conditions select");
      const conditionPredicateInput = htmlElement.querySelector<HTMLInputElement>("input[name='system.conditions']");
      for(const conditionInput of richConditionInputs) {
        if(!conditionPredicateInput) continue;
        conditionInput.addEventListener("change", () => {
          const conditions = this.document.clone().system.conditions;

          const {idx, type} = conditionInput.dataset;
          if(!idx || !type) return;
          const index = parseInt(idx);
          if(isNaN(index)) return;

          const value = sluggify(conditionInput.value);
          switch(type) {
            case "weather": {
              conditions[index] = `weather:${value}`;
              break;
            }
            case "item": {
              if(conditionInput instanceof HTMLSelectElement) {
                const input = conditionInput.nextElementSibling as HTMLInputElement | null;
                if(!input) return;
                const itemValue = sluggify(input.value);
                conditions[index] = `item:${value}:${itemValue}:held`;
                break;
              }

              const select = conditionInput.previousElementSibling as HTMLSelectElement | null;
              if(!select) return;
              const itemType = select.value;
              conditions[index] = `item:${itemType}:${value}:equipped`;
              break;
            }
            case "ability": {
              conditions[index] = `item:ability:${value}:active`;
              break;
            }
          }

          conditionPredicateInput.value = JSON.stringify(conditions, null, 0);
        });
      }

      const conditionTypeSelects = htmlElement.querySelectorAll<HTMLSelectElement>(".conditions select.condition-type");
      for(const select of conditionTypeSelects) {
        if(!conditionPredicateInput) continue;
        select.addEventListener("change", () => {
          const conditions = this.document.clone().system.conditions;
          const index = parseInt(select.dataset.idx || "");
          if(isNaN(index)) return;

          switch(select.value) {
            case "weather": {
              conditions[index] = `weather:clear`;
              break;
            }
            case "item": {
              conditions[index] = `item:equipment:item-name:equipped`;
              break;
            }
            case "ability": {
              conditions[index] = `item:ability:ability-name:active`;
              break;
            }
          }

          conditionPredicateInput.value = JSON.stringify(conditions, null, 0);
        });
      }

      const conditionAddButton = htmlElement.querySelector<HTMLButtonElement>("button[data-action='add-condition']");
      conditionAddButton?.addEventListener("click", () => {
        if(!conditionPredicateInput) return;
        const conditions = this.document.clone().system.conditions;
        conditions.push("weather:clear");
        conditionPredicateInput.value = JSON.stringify(conditions, null, 0);
        // conditionPredicateInput.dispatchEvent(new Event("change"));
      });

      const conditionRemoveButtons = htmlElement.querySelectorAll<HTMLButtonElement>("button[data-action='remove-condition']");
      for(const button of conditionRemoveButtons) {
        button.addEventListener("click", () => {
          if(!conditionPredicateInput) return;
          const conditions = this.document.clone().system.conditions;
          const index = parseInt(button.dataset.idx || "");
          if(isNaN(index)) return;
          conditions.splice(index, 1);
          conditionPredicateInput.value = JSON.stringify(conditions, null, 0);
        });
      }
    }
  }

  override _prepareSubmitData(
    _event: SubmitEvent,
    form: HTMLFormElement,
    formData: FormDataExtended
  ) {
    const data = super._prepareSubmitData(_event, form, formData);

    if (data.system?.conditions) {
      const conditions = data.system.conditions;
      if (typeof conditions === "string") {
        if (conditions.trim() === "") {
          delete data.system.conditions;
        } else {
          try {
            data.system.conditions = JSON.parse(conditions);
          } catch (error) {
            if (error instanceof Error) {
              ui.notifications.error(
                game.i18n.format("PTR2E.EffectSheet.ChangeEditor.Errors.ChangeSyntax", { message: error.message }),
              );
              throw error; // prevent update, to give the user a chance to correct, and prevent bad data
            }
          }
        }
      }
    }
    else {
      data.system ??= {};
      data.system.conditions = [];
    }

    return data;
  }

  static async #onSubmit(
    this: ActiveEffectConfig,
    event: SubmitEvent,
    form: HTMLFormElement,
    formData: FormDataExtended
  ) {
    event.preventDefault();
    event.stopPropagation();
    const submitData = this._prepareSubmitData(event, form, formData);
    if (foundry.utils.isEmpty(submitData)) return;


    await this.document.update(submitData);
  }
}

export interface FormConfigSheet {
  get document(): ActiveEffectPTR2e<ActorPTR2e | ItemPTR2e | null, FormActiveEffectSystem>;
}