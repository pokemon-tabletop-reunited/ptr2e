import { AuraRenderers } from "./aura/map.ts";
import * as R from "remeda";

class TokenPTR2e extends Token {
  /** Visual representation and proximity-detection facilities for auras */
  readonly auras: AuraRenderers;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(document: TokenDocument.ConfiguredInstance) {
    super(document);

    this.auras = new AuraRenderers(this);
    Object.defineProperty(this, "auras", { configurable: false, writable: false }); // It's ours, Kim!
  }

  /** A reference to an animation that is currently in progress for this Token, if any */
  get animation(): Promise<boolean> | null {
    return this.animationContexts.get(this.animationName)?.promise ?? null;
  }

  /** Is this token currently animating? */
  get isAnimating(): boolean {
    return !!this.animation;
  }

  get isTiny(): boolean {
    if(!this.document.height || !this.document.width) return false;
    return this.document.height < 1 || this.document.width < 1;
  }

  /** The ID of the highlight layer for this token */
  get highlightId(): string {
    return `Token.${this.id}`;
  }

  /** Bounds used for mechanics, such as flanking and drawing auras */
  get mechanicalBounds(): PIXI.Rectangle {
    const bounds = super.bounds;
    if (this.isTiny && canvas?.grid) {
      const position = canvas.grid.getTopLeftPoint(bounds);
      return new PIXI.Rectangle(
        position.x,
        position.y,
        Math.max(canvas.grid.size, bounds.width),
        Math.max(canvas.grid.size, bounds.height),
      );
    }

    return bounds;
  }

  /** Publicly expose `Token#_canControl` for use in `TokenLayerPF2e`. */
  canControl(user: User, event: PIXI.FederatedPointerEvent): boolean {
    return this._canControl(user, event);
  }

  /** Reposition aura textures after this token has moved. */
  protected override _applyRenderFlags(flags: Token.RenderFlags): void {
    super._applyRenderFlags(flags);
    if (flags.refreshPosition) this.auras.refreshPositions();
  }

  /** Draw auras and flanking highlight lines if certain conditions are met */
  protected override _refreshVisibility(): void {
    super._refreshVisibility();
    this.auras.draw();
  }

  /** Draw auras along with effect icons */
  override async _drawEffects(): Promise<void> {
    await super._drawEffects();
    await this.animation;

    if (this.auras.size === 0) {
      return this.auras.reset();
    }

    // Determine whether a redraw is warranted by comparing current and updated radius/appearance data
    const changedAndDeletedAuraSlugs = Array.from(this.auras.entries())
      .filter(([slug, aura]) => {
        const properties = ["radius", "appearance"] as const;
        const sceneData = R.pick(
          this.document.auras.get(slug) ?? { radius: null, appearance: null },
          properties,
        );
        if (sceneData.radius === null) return true;
        const canvasData = R.pick(aura, properties);

        return !R.isDeepEqual(sceneData, canvasData);
      })
      .map(([slug]) => slug);
    const newAuraSlugs = Array.from(this.document.auras.keys()).filter((s) => !this.auras.has(s));

    return this.auras.reset([changedAndDeletedAuraSlugs, newAuraSlugs].flat());
  }

  /** Emulate a pointer hover ("pointerover") event */
  emitHoverIn(nativeEvent: MouseEvent | PointerEvent): void {
    const event = new PIXI.FederatedPointerEvent(new PIXI.EventBoundary(this));
    event.type = "pointerover";
    event.nativeEvent = nativeEvent;
    this._onHoverIn(event, { hoverOutOthers: true });
  }

  /** Emulate a pointer hover ("pointerout") event */
  emitHoverOut(nativeEvent: MouseEvent | PointerEvent): void {
    const event = new PIXI.FederatedPointerEvent(new PIXI.EventBoundary(this));
    event.type = "pointerout";
    event.nativeEvent = nativeEvent;
    this._onHoverOut(event);
  }

  /** Include actor overrides in the clone if it is a preview */
  override clone(): this {
    const clone = super.clone() as this;

    if (clone.isPreview) {
      clone.document.height = this.document.height;
      clone.document.width = this.document.width;
      clone.document.texture.scaleX = this.document.texture.scaleX;
      clone.document.texture.scaleY = this.document.texture.scaleY;
      clone.document.texture.src = this.document.texture.src;
    }

    return clone;
  }

  protected override _destroy(): void {
    super._destroy();
    this.auras.destroy();
  }

  /** Reset aura renders when token size changes. */
  override _onUpdate(
    changed: PTR.Token.Source,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.OnUpdateOptions<any>,
    userId: string
  ): void {
    super._onUpdate(changed, options, userId);

    if (changed?.width) {
      if (this.animation) {
        this.animation.then(() => {
          this.auras.reset();
        });
      } else {
        this.auras.reset();
      }
    }
  }

  distanceTo(target: TokenPTR2e): number {
    if (!canvas || !canvas.ready) return NaN;
    if (this === target) return 0;

    if (canvas.grid?.type === CONST.GRID_TYPES.SQUARE) {
      return (canvas.grid as unknown as PTR.Grid.Square).getDistanceBetweenTokens(this, target);
    }
    //@ts-expect-error - Foundry types are incomplete
    return canvas.grid.measureDistance(this.position, target.position);
  }

  override _onControl(options: { releaseOthers?: boolean; pan?: boolean } = {}) {
    super._onControl(options);

    if (game.ready) game.ptr.tokenPanel.token = this;
  }

  override _onRelease(options: PlaceableObject.ReleaseOptions) {
    const result = super._onRelease(options);

    if (game.ready) {
      game.ptr.tokenPanel.token = (game.user!.character?.getActiveTokens().at(0) as this) ?? null;
    }
    return result;
  }
}

interface TokenPTR2e {

}

export { TokenPTR2e }