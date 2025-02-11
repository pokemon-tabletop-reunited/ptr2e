
import { TargetData } from "@module/chat/models/attack.ts";
import { htmlQueryAll } from "@utils";

export class TargetSelectorPopup extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["sheet target-selector-popup"],
      position: {
        height: "auto",
        width: 400,
      },
      form: {
        closeOnSubmit: false,
        submitOnChange: false,
      },
      tag: "form",
    },
    { inplace: false }
  );

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    modifiers: {
      id: "modifiers",
      template: "systems/ptr2e/templates/apps/target-selector-popup.hbs",
    },
  };

  targets: TargetData[];
  #title: string;
  #hint: string;

  constructor(
    targets: TargetData[],
    { title = "PTR2E.ChatContext.SpendLuckAttack.label", hint = "PTR2E.ChatContext.SpendLuckAttack.hint" }: { title?: string; hint?: string; } = {},
    options: Partial<foundry.applications.api.ApplicationConfiguration> = {}
  ) {
    super(options);
    this.targets = targets;
    this.#title = title;
    this.#hint = hint;
  }

  override get title() {
    return this.#title == "" ? "Choose Target" : game.i18n.localize(this.#title);
  }

  override async _prepareContext(): Promise<Record<string, unknown>> {
    return {
      targets: this.targets,
      hint: this.#hint,
    };
  }

  override _attachPartListeners(
    partId: string,
    htmlElement: HTMLElement,
    options: foundry.applications.api.HandlebarsRenderOptions
  ): void {
    super._attachPartListeners(partId, htmlElement, options);

    for (const element of htmlQueryAll(htmlElement, ".target[data-uuid]")) {
      const parent = element.closest<HTMLFieldSetElement>("fieldset[data-index]");
      const index = parseInt(element.dataset.index!);
      if (!parent || isNaN(index)) continue;

      const entry = this.targets[parseInt(parent.dataset.index!)];

      element?.addEventListener("click", () => {
        this.resolve?.({entry, choice: entry.results[index]});
        this.close();
      })
    }
  }

  promise: Promise<Maybe<{entry: TargetData, choice: TargetData["results"][number]}>> | null = null;
  resolve?: (value: Maybe<{entry: TargetData, choice: TargetData["results"][number]}>) => void;

  async wait() {
    return (this.promise ??= new Promise((resolve) => {
      this.resolve = resolve;

      this.addEventListener(
        "close",
        () => {
          resolve(null);
          this.promise = null;
          this.resolve = undefined;
        },
        { once: true }
      );
      this.render(true);
    }));
  }
}
