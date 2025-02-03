import { HandlebarsRenderOptions } from "types/foundry/common/applications/handlebars-application.ts";
import { ApplicationConfigurationExpanded, ApplicationV2Expanded } from "../appv2-expanded.ts";
import { TypeMatrixDialog } from "./dialog.ts";
import { type TypeEffectiveness } from "@scripts/config/effectiveness.ts";

export class TypeMatrix extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded)<ApplicationConfigurationExpanded & { settings?: boolean }> {
  static override DEFAULT_OPTIONS = {
    tag: "div",
    classes: ["sheet", "type-matrix", "default-sheet"],
    id: "type-matrix",
    position: {
      height: "auto" as const,
      width: "auto" as const,
    },
    window: {
      title: "PTR2E.TypeMatrix.Title",
      minimizable: true,
      resizable: false
    },
    actions: {
      "save": async function (this: TypeMatrix) {
        if (!fu.objectsEqual(game.settings.get("ptr2e", "pokemonTypes"), this.cache)) {
          await game.settings.set("ptr2e", "pokemonTypes", this.cache);
          SettingsConfig.reloadConfirm({ world: true });
        }
        this.close();
      },
      "add": function (this: TypeMatrix) {
        TypeMatrixDialog.CreateType(this);
      },
      "reset": function (this: TypeMatrix) {
        foundry.applications.api.DialogV2.confirm({
          window: {
            title: "PTR2E.TypeMatrix.Reset.Title",
          },
          content: game.i18n.localize("PTR2E.TypeMatrix.Reset.Content"),
          yes: {
            callback: async () => {
              this.cache = fu.duplicate(game.settings.settings.get("ptr2e.pokemonTypes").default);
              this.render({ parts: ["content"] });
            }
          }
        })
      }
    }
  }

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    header: {
      id: "header",
      template: "systems/ptr2e/templates/apps/type-matrix-header.hbs",
    },
    content: {
      id: "content",
      template: "systems/ptr2e/templates/apps/type-matrix.hbs",
      scrollable: [".type-grid"],
    },
    footer: {
      id: "footer",
      template: "systems/ptr2e/templates/apps/type-matrix-footer.hbs",
    }
  };

  cache: Partial<TypeEffectiveness>;
  editable: boolean;

  constructor(options: Partial<ApplicationConfigurationExpanded & {settings?: boolean}> = {}) {
    const isEditable = (typeof options === "object" && options && 'settings' in options) ? !!options.settings : game.user.isGM;
    super(options);
    this.editable = isEditable;
    this.cache = fu.duplicate(game.settings.get("ptr2e", "pokemonTypes"));
  }

  override _configureRenderOptions(options: HandlebarsRenderOptions): void {
    super._configureRenderOptions(options);
    if (!this.editable) {
      options.parts = options.parts?.filter(part => part === "content");
    }
  }

  override async _prepareContext(options?: HandlebarsRenderOptions | undefined) {
    return {
      ...(await super._prepareContext(options)),
      types: this.cache,
      length: Object.keys(this.cache).length,
    }
  }

  override _attachPartListeners(partId: string, htmlElement: HTMLElement, options: HandlebarsRenderOptions): void {
    super._attachPartListeners(partId, htmlElement, options);
    if (partId === "content") {
      for (const element of htmlElement.querySelectorAll(".type")) {

        element.addEventListener("mouseover", (event) => {
          const { offensive, defensive } = (event.currentTarget as HTMLElement).dataset;
          if (!offensive || !defensive) return;

          htmlElement.querySelectorAll(`.type[data-offensive="${offensive}"]`).forEach(e => e.classList.add("highlight-x"))
          htmlElement.querySelectorAll(`.type[data-defensive="${defensive}"]`).forEach(e => e.classList.add("highlight-y"))
        })

        element.addEventListener("mouseout", (event) => {
          const { offensive, defensive } = (event.currentTarget as HTMLElement).dataset;
          if (!offensive || !defensive) return;

          htmlElement.querySelectorAll(`.type[data-offensive="${offensive}"]`).forEach(e => e.classList.remove("highlight-x"))
          htmlElement.querySelectorAll(`.type[data-defensive="${defensive}"]`).forEach(e => e.classList.remove("highlight-y"))
        });

        element.addEventListener("click", (event) => {
          if (!this.editable) return;
          event.preventDefault();
          const { offensive, defensive } = (event.currentTarget as HTMLElement).dataset;
          if (!offensive || !defensive) return;

          const newValue = this.cache[offensive as keyof TypeEffectiveness]!.effectiveness[defensive as keyof TypeEffectiveness] = (() => {
            switch (this.cache[offensive as keyof TypeEffectiveness]!.effectiveness[defensive as keyof TypeEffectiveness]) {
              case 0:
                return 0.5;
              case 0.5:
                return 1;
              case 1:
                return 2;
              case 2:
                return 2;
              default:
                return 1;
            }
          })();

          const span = element.querySelector("span");
          if (span) {
            span.textContent = newValue.toString();
            (event.currentTarget as HTMLElement).dataset.effectiveness = newValue.toString();
          }
        })

        element.addEventListener("contextmenu", (event) => {
          if (!this.editable) return;
          event.preventDefault();
          const { offensive, defensive } = (event.currentTarget as HTMLElement).dataset;
          if (!offensive || !defensive) return;

          const newValue = this.cache[offensive as keyof TypeEffectiveness]!.effectiveness[defensive as keyof TypeEffectiveness] = (() => {
            switch (this.cache[offensive as keyof TypeEffectiveness]!.effectiveness[defensive as keyof TypeEffectiveness]) {
              case 0:
                return 0;
              case 0.5:
                return 0;
              case 1:
                return 0.5;
              case 2:
                return 1;
              default:
                return 1;
            }
          })();

          const span = element.querySelector("span");
          if (span) {
            span.textContent = newValue.toString();
            (event.currentTarget as HTMLElement).dataset.effectiveness = newValue.toString();
          }
        })
      }

      for (const element of htmlElement.querySelectorAll(".type[data-type]")) {
        if (!this.editable) return;
        element.addEventListener("dblclick", (event) => {
          event.preventDefault();

          const type = (event.currentTarget as HTMLElement).dataset.type;
          if (!type || type === "untyped") return;
          TypeMatrixDialog.EditType(this, type as keyof TypeEffectiveness);
        });
      }
    }
  }
}