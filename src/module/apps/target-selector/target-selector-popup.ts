
import { htmlQueryAll } from "@utils";
import type { ApplicationConfigurationExpanded } from "../appv2-expanded.ts";
import type { DeepPartial } from "fvtt-types/utils";

interface TargetSelectorPopupContext {
  targets: { uuid: string; name: string; img: string; description?: string }[];
  hint: string;
  [key: string]: unknown;
}

export class TargetSelectorPopup extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
)<TargetSelectorPopupContext> {
  static override DEFAULT_OPTIONS = foundry.utils.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["sheet target-selector-popup"],
      position: {
        height: "auto" as const,
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

  static override PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    modifiers: {
      id: "modifiers",
      template: "systems/ptr2e/templates/apps/target-selector-popup.hbs",
    },
  };

  targets: { uuid: string; name: string; img: string; description?: string }[];
  #title: string;
  #hint: string;

  constructor(
    targets: { uuid: string; name: string; img: string; description?: string }[],
    { title = "PTR2E.ChatContext.SpendLuckAttack.label", hint = "PTR2E.ChatContext.SpendLuckAttack.hint" }: { title?: string; hint?: string; } = {},
    options: DeepPartial<ApplicationConfigurationExpanded> = {}
  ) {
    super(options);
    this.targets = targets;
    this.#title = title;
    this.#hint = hint;
  }

  override get title() {
    return this.#title == "" ? "Choose Target" : game.i18n.localize(this.#title);
  }

  override async _prepareContext(): Promise<TargetSelectorPopupContext> {
    return {
      targets: this.targets,
      hint: this.#hint,
    };
  }

  override _attachPartListeners(
    partId: string,
    htmlElement: HTMLElement,
    options: foundry.applications.api.HandlebarsApplicationMixin.HandlebarsRenderOptions
  ): void {
    super._attachPartListeners(partId, htmlElement, options);

    for (const element of htmlQueryAll(htmlElement, ".target[data-uuid]")) {
      const uuid = element.dataset.uuid;
      if (!uuid) continue;

      element?.addEventListener("click", () => {
        this.resolve?.(uuid);
        this.close();
      })
    }
  }

  promise: Promise<Maybe<string>> | null = null;
  resolve?: (value: Maybe<string>) => void;

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
