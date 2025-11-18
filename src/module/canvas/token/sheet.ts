import { ActorPTR2e } from "@actor";
import { TokenDocumentPTR2e } from "./document.ts";
import { htmlQuery } from "@utils";
import { ApplicationRenderOptions } from "types/foundry/common/applications/api.js";

export class PrototypeTokenConfigPTR2e<TDocument extends TokenDocumentPTR2e> extends foundry.applications.sheets.PrototypeTokenConfig {
  // Incorrect typing; but PrototypeToken ain't typed yet.
  prototype: TokenDocumentPTR2e;
  declare actor: ActorPTR2e;

  constructor(options: foundry.applications.api.DocumentSheetConfiguration<TDocument>) {
    super(options);
    // @ts-expect-error - This exists.
    this.prototype = this.options.prototype;
  }

  get token() {
    return this.prototype;
  }

  static override DEFAULT_OPTIONS = {
    actions: {
      "toggle-link-to-size": async function(this: PrototypeTokenConfigPTR2e<TokenDocumentPTR2e>, event: Event) {
        event.preventDefault();
        const token = this.token;
        const linkToActorSize = !token.flags.ptr2e?.linkToActorSize;
        const changes = {prototypeToken: {flags: {ptr2e: {linkToActorSize}}}};
        this.actor.validate({update: changes, clean: true, fallback: false});
        await this.actor.update(changes);
        //@ts-expect-error - Safety net.
        this.prototype.flags ??= {};
        this.prototype.flags.ptr2e ??= {};
        this.prototype.flags.ptr2e.linkToActorSize = linkToActorSize;
        this.render({parts: ["appearance"]});
      }
    }
  }

  override _configureRenderOptions(options: ApplicationRenderOptions): void {
    options.position ??= {};
    if(!options.position.left || options.position.left <= 10) {
      //@ts-expect-error - These exist.
      options.position.left = (window.innerWidth - this.position.width) / 2;
    }
    super._configureRenderOptions(options);
  }

  override async _renderHTML(context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.DocumentSheetRenderOptions): Promise<HTMLElement | HTMLCollection | Record<string, HTMLElement>> {
    const html = await super._renderHTML(context, options);
    
    if('identity' in html) {
      const disposition = htmlQuery(html.identity, ".form-group:has(label[for$='disposition'])");
      disposition?.remove();
    }
    if('appearance' in html) {
      const dimensions = htmlQuery(html.appearance, ".form-group.slim:has(label[for$='width'])");
      if(dimensions?.firstElementChild) {
        const anchor = document.createElement("a");
        anchor.dataset.action = "toggle-link-to-size";
        anchor.title = game.i18n.localize(`PTR2E.Token.Size.LinkToActorSize.${this.token.flags.ptr2e?.linkToActorSize ? "Unlink" : "Link"}`);
        const icon = document.createElement("i");
        icon.classList.add("fas","fa-fw", `fa-lock${this.token.flags.ptr2e?.linkToActorSize ? "" : "-open"}`);
        anchor.append(icon);
        dimensions.firstElementChild.append(anchor);

        if(this.token.flags.ptr2e?.linkToActorSize) {
          htmlQuery(html.appearance, "input[name=width]")?.setAttribute("disabled", "true");
          htmlQuery(html.appearance, "input[name=height]")?.setAttribute("disabled", "true");
        }
      }
    }

    return html;
  }
}

export class TokenConfigPTR2e<TDocument extends TokenDocumentPTR2e> extends foundry.applications.sheets.TokenConfig<TDocument> {
  declare token: TDocument;

  static override DEFAULT_OPTIONS = {
    actions: {
      "toggle-link-to-size": async function(this: TokenConfigPTR2e<TokenDocumentPTR2e>, event: Event) {
        event.preventDefault();
        const token = this.token;
        const linkToActorSize = !token.flags.ptr2e?.linkToActorSize;
        await token.update({ "flags.ptr2e.linkToActorSize": linkToActorSize });
        this.render({parts: ["appearance"]});
      }
    }
  }

  override async _renderHTML(context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.DocumentSheetRenderOptions): Promise<HTMLElement | HTMLCollection | Record<string, HTMLElement>> {
    const html = await super._renderHTML(context, options);
    
    if('identity' in html) {
      const disposition = htmlQuery(html.identity, ".form-group:has(label[for$='disposition'])");
      disposition?.remove();
    }
    if('appearance' in html) {
      const dimensions = htmlQuery(html.appearance, ".form-group.slim:has(label[for$='width'])");
      if(dimensions?.firstElementChild) {
        const anchor = document.createElement("a");
        anchor.dataset.action = "toggle-link-to-size";
        anchor.title = game.i18n.localize(`PTR2E.Token.Size.LinkToActorSize.${this.token.flags.ptr2e?.linkToActorSize ? "Unlink" : "Link"}`);
        const icon = document.createElement("i");
        icon.classList.add("fas","fa-fw", `fa-lock${this.token.flags.ptr2e?.linkToActorSize ? "" : "-open"}`);
        anchor.append(icon);
        dimensions.firstElementChild.append(anchor);

        if(this.token.flags.ptr2e?.linkToActorSize) {
          htmlQuery(html.appearance, "input[name=width]")?.setAttribute("disabled", "true");
          htmlQuery(html.appearance, "input[name=height]")?.setAttribute("disabled", "true");
        }
      }
    }

    return html;
  }
}