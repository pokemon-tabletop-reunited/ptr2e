import { htmlQuery } from "@utils";
import { ActorSizePTR2e } from "@actor/data/size.ts";

export class TokenConfigPTR2e extends TokenConfig {
  static override get defaultOptions(): DocumentSheetOptions {
    return {
      ...super.defaultOptions,
      template: "systems/ptr2e/templates/apps/token/sheet.hbs",
      sheetConfig: false,
    };
  }

  override async getData(options?: Partial<DocumentSheetOptions> | undefined) {
    const data = await super.getData(options);

    return {
      ...data,
      linkToActorSize: !!this.token.flags.ptr2e?.linkToActorSize,
      autoscale: !!this.token.flags.ptr2e?.autoscale,
      sizeLinkable: !!this.actor,
      linkToSizeTitle: this.token.flags.ptr2e?.linkToActorSize ? "Unlink" : "Link",
      autoscaleTitle: this.token.flags.ptr2e?.autoscale ? "Unlink" : "Link",
    }
  }

  override activateListeners($html: JQuery): void {
    super.activateListeners($html);
    const html = $html[0];

    if (this.token.flags.ptr2e?.linkToActorSize === true ? !!this.token.flags.ptr2e?.autoscale : false) {
      this.#disableScale(html)
    }

    const linkToSizeButton = htmlQuery(html, "a[data-action=toggle-link-to-size]");
    linkToSizeButton?.addEventListener("click", async () => {
      await this.token.update({ "flags.ptr2e.linkToActorSize": !this.token.flags.ptr2e?.linkToActorSize });
      this.#reestablishPrototype();
      this.render();
    });

    const autoscaleButton = htmlQuery(html, "a[data-action=toggle-autoscale]");
    autoscaleButton?.addEventListener("click", async () => {
      await this.token.update({ "flags.ptr2e.autoscale": !this.token.flags.ptr2e?.autoscale });
      this.#reestablishPrototype();
      this.render();
    });
  }

  /** Disable the range input for token scale and style to indicate as much */
  #disableScale(html: HTMLElement): void {
    // If autoscaling is globally disabled, keep form input enabled
    if (!game.settings.get("ptr2e", "tokens.autoscale")) return;

    const scale = html.querySelector(".form-group.scale");
    if (!scale) throw Error("Scale form group missing");
    scale.classList.add("children-disabled");

    const constrainedScale = String(["diminutive", "small"].includes(this.actor?.size.value ?? "") ? 0.8 : 1);
    const rangeInput = scale.querySelector<HTMLInputElement>("input[type=range]");
    if (rangeInput) {
      rangeInput.disabled = true;
      rangeInput.value = constrainedScale;
      const rangeDisplayValue = scale.querySelector(".range-value");
      if (rangeDisplayValue) rangeDisplayValue.innerHTML = constrainedScale;
    }
  }

  /**
   * A core bug present as of 10.291 will cause a `TokenConfig`'s `object`/`token` reference to become stale
   * following an update: reestablish it.
   */
  #reestablishPrototype(): void {
    if (this.isPrototype && this.actor) {
      const realPrototype = this.actor.prototypeToken;
      this.object = this.token = realPrototype;
      setTimeout(() => this.render(true), 100);
    }
  }

  /** Re-add scale property to form data if input is disabled: necessary for mirroring checkboxes to function */
  protected override _getSubmitData(updateData: Record<string, unknown> | null = {}){
    const changes = updateData ?? {};
    if (this.form!.querySelector<HTMLInputElement>("input[name=scale]")?.disabled) {
      changes["scale"] = Math.abs(this.token._source.texture.scaleX);
    }
    return super._getSubmitData(changes);
  }

  protected override async _updateObject(event: Event, formData: TokenConfig.FormData) {
    if (formData["flags.ptr2e.linkToActorSize" as keyof typeof formData] === true) {
      const size = this.actor?.size ?? new ActorSizePTR2e({ value: "medium" });
      formData["width"] = formData["height"] = Math.min(size.length, size.width);
    }
    return super._updateObject(event, formData);
  }
}