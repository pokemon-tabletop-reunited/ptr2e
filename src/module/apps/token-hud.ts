//@ts-nocheck
import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";

export class TokenHUDPTR2e extends foundry.applications.hud.TokenHUD {
  static override DEFAULT_OPTIONS = {
    actions: {
      changeMovement: this.#changeMovement,
      toggleMovementTray: { handler: this.#toggleMovementTray, buttons: [0, 2] },
    }
  }

  /**
   * Track whether the movement tray is currently expanded or hidden
   */
  #movementTrayActive = false;
  #lastToken: Token | null = null;

  override async _onRender(context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.ApplicationRenderOptions) {
    await super._onRender(context, options);

    const tokenDocument = this.document;

    const movementType = tokenDocument.movementType;

    const movement = CONFIG.PTR.movementTypes;

    const movementModes = Object.entries(movement).reduce((acc, [type, { label, icon }]) => {
      if(!["overland"].includes(type) && !tokenDocument.actor?.hasMovementType(type)) return acc;
      const active = movementType === type ? "active" : "";
      acc.push({ type, label, icon, active });
      return acc;
    }, []);

    const tokenMovement = await foundry.applications.handlebars.renderTemplate("systems/ptr2e/templates/hud/token-movement.hbs", {
      movementModes,
      movementTray: this.#movementTrayActive ? "active" : "",
      currentMovement: movement[movementType as keyof typeof movement],
    });

    const colLeft = this.element.querySelector<HTMLElement>(".col.left");
    colLeft?.insertAdjacentHTML("afterbegin", tokenMovement);
  }

  /* -------------------------------------------- */
  /*  Public API                                  */
  /* -------------------------------------------- */

  /** @inheritdoc */
  override bind(object: Token) {
    // Movement tray should always be closed when switching between tokens
    if (!this.#lastToken || this.#lastToken.id !== object.id) this.#movementTrayActive = false;
    this.#lastToken = object;
    return super.bind(object);
  }

  /* -------------------------------------------------- */
  /*   Actions                                          */
  /* -------------------------------------------------- */

  /**
   * Change the currently active movement mode
   * @param {PointerEvent} _event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   */
  static async #changeMovement(this: TokenHUDPTR2e, _event: PointerEvent, target: HTMLElement) {
    const newType = target.dataset.type;
    const tokenDocument = this.document;
    if(tokenDocument.actor) tokenDocument.actor.update({"system.movementType": newType});
    else tokenDocument.setFlag("ptr2e", "movementType", newType);
  }

  /**
   * Open the movement tray on left click, reset to walk on right
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   */
  static async #toggleMovementTray(this: TokenHUDPTR2e, event: PointerEvent, target: HTMLElement) {
    if (event.button === 0) {
      const active = !this.#movementTrayActive;
      this.#movementTrayActive = active;
      target.classList.toggle("active", active);
      const palette = this.element.querySelector<HTMLElement>(".movement-modes");
      palette?.classList.toggle("active", active);
      //@ts-expect-error - Outdated Types
      canvas.app.view.focus(); // Return focus to the canvas so keyboard movement is honored
    }
    else {
      if(this.document.actor) this.document.actor.update({"system.movementType": CONFIG.Token.movement.defaultAction});
      else this.document.setFlag("ptr2e", "movementType", CONFIG.Token.movement.defaultAction);
    }
  }
}

export interface TokenHUDPTR2e extends foundry.applications.hud.TokenHUD {
  get document(): TokenDocumentPTR2e;
}