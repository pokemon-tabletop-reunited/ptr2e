import { default as defaultEffectiveness, type TypeEffectiveness } from "@scripts/config/effectiveness.ts";
import { ApplicationV2Expanded } from "../appv2-expanded.ts";
import { TypeMatrix } from "./sheet.ts";
import { sluggify } from "@utils";

export class TypeMatrixDialog extends foundry.applications.api.HandlebarsApplicationMixin(ApplicationV2Expanded) {
  static override DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["sheet", "type-matrix", "default-sheet"],
    id: "type-matrix-dialog",
    position: {
      height: "auto" as const,
      width: "auto" as const,
    },
    window: {
      title: "PTR2E.TypeMatrix.Dialog.Title",
      minimizable: false,
      resizable: false,
    },
    form: {
      handler: TypeMatrixDialog.onSubmit,
      closeOnSubmit: true,
      submitOnChange: false
    },
    actions: {
      delete: function (this: TypeMatrixDialog) {
        const coreTypes = Object.keys(defaultEffectiveness);
        if (!["nuclear", "shadow"].includes(this.type!) && coreTypes.includes(this.type!)) {
          return void ui.notifications.error(game.i18n.localize("PTR2E.TypeMatrix.Delete.Error"));
        }

        foundry.applications.api.DialogV2.confirm({
          window: {
            title: "PTR2E.TypeMatrix.Delete.Title",
          },
          content: game.i18n.localize("PTR2E.TypeMatrix.Delete.Content"),
          yes: {
            callback: () => {
              if (this.type === "untyped") return;

              delete this.app.cache[this.type!]
              for(const key in this.app.cache) {
                delete this.app.cache[key as keyof TypeEffectiveness]!.effectiveness[this.type!];
              }

              this.app.render({ parts: ["content"] });
              this.close();
            }
          }
        })
      }
    }
  }

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    content: {
      id: "content",
      template: "systems/ptr2e/templates/apps/type-matrix-dialog.hbs",
    }
  };

  type: keyof TypeEffectiveness | null = null;
  data: TypeEffectiveness[keyof TypeEffectiveness] | null = null;
  app: TypeMatrix;

  promise: Promise<Maybe<Pick<TypeEffectiveness[keyof TypeEffectiveness], "images"> & { type: keyof TypeEffectiveness }>> | null = null;
  resolve?: (value: Maybe<Pick<TypeEffectiveness[keyof TypeEffectiveness], "images"> & { type: keyof TypeEffectiveness }>) => void;

  override async _prepareContext() {
    return {
      name: this.type || "",
      iconImg: this.data?.images.icon || "",
      barImg: this.data?.images.bar || "",
      exists: !!this.data,
    }
  }

  async wait() {
    return this.promise ??= new Promise((resolve) => {
      this.resolve = resolve;

      this.addEventListener("close", () => {
        resolve(null);
        this.promise = null;
        this.resolve = undefined;
      }, { once: true });
      this.render(true);
    })
  }

  static async onSubmit(
    this: TypeMatrixDialog,
    event: SubmitEvent | Event,
    _form: HTMLFormElement,
    formData: FormDataExtended
  ) {
    if (!this.resolve) return;
    if (!event) {
      this.resolve(null);
      this.promise = null;
      this.resolve = undefined;
      return;
    }

    const data = formData.object as {
      name: string;
      iconImg: string;
      barImg: string;
    }

    this.resolve({
      type: (data.name ? sluggify(data.name) : this.type) as keyof TypeEffectiveness,
      images: {
        icon: data.iconImg || this.data?.images.icon || "",
        bar: data.barImg || this.data?.images.bar || data.iconImg || this.data?.images.icon || "",
      }
    })
  }

  static async CreateType(app: TypeMatrix) {
    const dialog = new TypeMatrixDialog();
    dialog.app = app;

    const data = await dialog.wait();
    if (!data || !data.type || !data.images.icon || !data.images.bar) return;

    const typeData = {
      images: data.images,
      effectiveness: defaultEffectiveness.untyped.effectiveness
    }

    app.cache[data.type] = typeData;
    for (const key in app.cache) {
      app.cache[key as keyof TypeEffectiveness]!.effectiveness[data.type] = 1;
    }

    return void app.render({ parts: ["content"] });
  }

  static async EditType(app: TypeMatrix, type: keyof TypeEffectiveness) {
    const dialog = new TypeMatrixDialog();
    dialog.app = app;
    dialog.data = app.cache[type] ?? null;
    dialog.type = type;

    const data = await dialog.wait();
    if (!data || !data.type || !data.images.icon || !data.images.bar) return;

    const typeData = {
      images: data.images,
      effectiveness: defaultEffectiveness.untyped.effectiveness
    }

    app.cache[data.type] = typeData;
    for (const key in app.cache) {
      app.cache[key as keyof TypeEffectiveness]!.effectiveness[data.type] = 1;
    }

    return void app.render({ parts: ["content"] });
  }
}