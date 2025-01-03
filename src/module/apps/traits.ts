import type { Trait } from "@data";
import type { Tab } from "@item/sheets/document.ts";
import { sluggify } from "@utils";
import type { AnyObject } from "fvtt-types/utils";

class TraitsSettingsMenu extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)<AnyObject> {
  newCounter = 0;

  static override DEFAULT_OPTIONS = {
    id: "traits-settings",
    classes: ["sheet"],
    tag: "form",
    window: {
      title: "PTR2E.Settings.Traits.Title",
    },
    position: {
      width: 600,
      height: 700
    },
    form: {
      closeOnSubmit: true,
      submitOnChange: false,
      handler: TraitsSettingsMenu.#onSubmit
    }
  }

  static override PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    header: {
      id: "header",
      template: "systems/ptr2e/templates/apps/settings/traits-settings-header.hbs"
    },
    systemTraits: {
      id: "system-traits",
      template: "systems/ptr2e/templates/apps/settings/traits-settings.hbs",
      scrollable: [".scroll"]
    },
    userTraits: {
      id: "user-traits",
      template: "systems/ptr2e/templates/apps/settings/traits-settings.hbs",
      scrollable: [".scroll"]
    },
    moduleTraits: {
      id: "module-traits",
      template: "systems/ptr2e/templates/apps/settings/traits-settings.hbs",
      scrollable: [".scroll"]
    },
    footer: {
      id: "footer",
      template: "systems/ptr2e/templates/apps/settings/traits-settings-footer.hbs",
    },
  }

  override tabGroups: Record<string, string> = {
    type: "userTraits",
  };

  tabs: Record<string, Tab & { hint: string }> = {
    systemTraits: {
      id: "systemTraits",
      group: "type",
      icon: "fa-solid fa-cogs",
      label: "PTR2E.Settings.Traits.systemTraits.Label",
      hint: "PTR2E.Settings.Traits.systemTraits.Hint",
    },
    userTraits: {
      id: "userTraits",
      group: "type",
      icon: "fa-solid fa-user",
      label: "PTR2E.Settings.Traits.userTraits.Label",
      hint: "PTR2E.Settings.Traits.userTraits.Hint",
    },
    moduleTraits: {
      id: "moduleTraits",
      group: "type",
      icon: "fa-solid fa-cogs",
      label: "PTR2E.Settings.Traits.moduleTraits.Label",
      hint: "PTR2E.Settings.Traits.moduleTraits.Hint",
    }
  };

  _getTabs(parts: string[]) {
    for (const v of Object.values(this.tabs)) {
      v.active = this.tabGroups[v.group] === v.id;
      v.cssClass = v.active ? "active" : "";
    }
    return Object.fromEntries(Object.entries(this.tabs).filter(([k]) => parts.includes(k)));
  }

  override async _prepareContext(options: foundry.applications.api.HandlebarsApplicationMixin.HandlebarsRenderOptions) {
    const systemTraits = CONFIG.PTR.data.traits;
    const userTraits = game.settings.get("ptr2e", "traits")
    const moduleTraits = game.ptr.data.traits.rawModuleTraits;
    return {
      options,
      traits: {
        systemTraits,
        userTraits,
        moduleTraits
      },
      tabs: this._getTabs(options.parts)
    }
  }

  override async _preparePartContext(
    partId: string,
    context: AnyObject,
    options: foundry.applications.api.HandlebarsApplicationMixin.HandlebarsRenderOptions
  ): Promise<AnyObject> {
    const preparedContext = await super._preparePartContext(partId, context, options) as AnyObject & { partId: string }
    preparedContext.partId = partId;
    return preparedContext;
  }

  override _configureRenderOptions(options: foundry.applications.api.HandlebarsApplicationMixin.HandlebarsRenderOptions): void {
    super._configureRenderOptions(options);
    if (game.ptr.data.traits.rawModuleTraits.length === 0) {
      options.parts = options.parts?.filter(part => part !== "moduleTraits");
    }
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: foundry.applications.api.HandlebarsApplicationMixin.HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);

    if (!["header", "footer"].includes(partId)) {
      for (const create of htmlElement.querySelectorAll<HTMLElement>(".trait-controls .trait-control.trait-create")) {
        create.addEventListener("click", TraitsSettingsMenu.#createTrait.bind(this));
      }
      for (const del of htmlElement.querySelectorAll<HTMLElement>(".trait-controls .trait-control.trait-delete")) {
        del.addEventListener("click", TraitsSettingsMenu.#deleteTrait.bind(this));
      }
    }
  }

  static async #onSubmit(this: TraitsSettingsMenu, _event: SubmitEvent | Event, _form: HTMLFormElement, formData: FormDataExtended) {
    const traitsData = (foundry.utils.expandObject(formData.object) as { trait?: Record<string, Partial<Trait>> }).trait ?? {};

    const traits = new Map<string, Trait>();

    for (const [key, trait] of Object.entries(traitsData)) {
      if (key.startsWith("new-")) {
        if (!trait.label) continue;
        const newTrait: Trait = {
          label: trait.label,
          slug: sluggify(trait.label),
          description: trait.description || "",
          related: [],
          changes: []
        };
        traits.set(newTrait.slug, newTrait);
        continue;
      }
      if (trait.slug) {
        const existingTrait = game.ptr.data.traits.get(trait.slug);
        if (!existingTrait) continue;
        const update = foundry.utils.deepClone(existingTrait);
        update.label = trait.label ?? existingTrait.label;
        update.slug = sluggify(existingTrait.label);
        update.description = trait.description ?? existingTrait.description;
        traits.set(update.slug, update);
      }
    }

    game.settings.set("ptr2e", "traits", Array.from(traits.values()));
  }

  static async #createTrait(this: TraitsSettingsMenu) {
    const element = this.element.querySelector<HTMLElement>("article.traits.editable");
    if (!element) {
      return;
    }

    $(element).find(".form-group.empty").remove();

    const count = this.newCounter++;
    $(element).append(`
            <div class="form-group" data-index="${count}">
                <label class="center"><input type="text" data-dType="String" name="trait.new-${count}.label" value="New Trait"/></label>
                <div class="form-fields">
                    <textarea name="trait.new-${count}.description" class="form-control" data-dtype="String" placeholder="Trait description..."></textarea>
                </div>
                <div class="trait-controls">
                    <a class="trait-control trait-delete" data-index="${count}" data-tooltip="Delete Trait" data-action="delete" >
                        <i class="fas fa-trash"></i>
                    </a>
                </div>
            </div>
        `)

    $(element).find(`.form-group[data-index="${count}"] .trait-delete`).on("click", TraitsSettingsMenu.#deleteTrait.bind(this));
  }

  static async #deleteTrait(this: TraitsSettingsMenu, event: Event) {
    if (!event.currentTarget) {
      return;
    }

    const { slug, index } = (event.currentTarget as HTMLElement).dataset;
    if (!slug && !index) {
      return;
    }

    if (slug) {
      $(this.element).find(`.editable [data-slug="${slug}"]`).remove();
    }
    else {
      $(this.element).find(`.editable [data-index="${index}"]`).remove();
      if ($(this.element).find(".editable .form-group").length === 1) {
        $(this.element).find(".editable").append(`<div class="form-group center empty"><p><small>No traits of this type exist</small></p></div>`);
      }
    }
  }
}

export { TraitsSettingsMenu }