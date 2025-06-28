import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { SquareGridPTR2e } from "../grid.ts";
import { AuraRenderers } from "./aura/map.ts";
import * as R from "remeda";

class TokenPTR2e<TDocument extends TokenDocumentPTR2e = TokenDocumentPTR2e> extends foundry.canvas.placeables.Token<TDocument> {
  /** Visual representation and proximity-detection facilities for auras */
  readonly auras: AuraRenderers;

  constructor(document: TDocument) {
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
    return !!this.animation || !!this.movementAnimationPromise;
  }

  get isTiny(): boolean {
    return this.document.height < 1 || this.document.width < 1;
  }

  /** The ID of the highlight layer for this token */
  get highlightId(): string {
    return `Token.${this.id}`;
  }

  /** Bounds used for mechanics, such as flanking and drawing auras */
  get mechanicalBounds(): PIXI.Rectangle {
    const bounds = super.bounds;
    if (this.isTiny) {
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
  protected override _applyRenderFlags(flags: Record<string, boolean>): void {
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
    const clone = super.clone();
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
    changed: DeepPartial<TDocument["_source"]>,
    options: DocumentModificationContext<TDocument["parent"]>,
    userId: string
  ): void {
    super._onUpdate(changed, options, userId);

    if (changed.width) {
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
    if (!canvas.ready) return NaN;
    if (this === target) return 0;

    if (canvas.grid.type === CONST.GRID_TYPES.SQUARE) {
      return (canvas.grid as unknown as SquareGridPTR2e).getDistanceBetweenTokens(this, target);
    }
    //@ts-expect-error - Foundry types are incomplete
    return canvas.grid.measureDistance(this.position, target.position);
  }

  masks: PIXI.Graphics[] = [];
  //@ts-expect-error - Incomplete types
  deadFilter: PIXI.ColorMatrixFilter | null = null;

  override _refreshEffects() {
    const oldMasks = this.masks.slice();
    this.masks = [];

    const hasDeadEffect = this.document.hasStatusEffect("dead");
    if(hasDeadEffect && !this.deadFilter) {
      //@ts-expect-error - Incomplete types
      const filter = new PIXI.ColorMatrixFilter();
      this.mesh.filters = [filter];
      // this.filters = [filter];
      filter.desaturate(2);
      this.deadFilter = filter;
    } else if (this.deadFilter) {
      // Remove the dead filter if it exists
      this.mesh.filters = this.mesh.filters?.filter(f => f !== this.deadFilter) || null;
      // this.filters = this.filters?.filter(f => f !== this.deadFilter) || null
      this.deadFilter = null;
    }

    const userColor = hasDeadEffect ? 0x7C373B : this.actor?.hasPlayerOwner ? (() => {
      for (const user of game.users) {
        if (user.character?.id === this.actor?.id) {
          return user.color;
        }
      }
      return 0x343434;
    })() : 0x343434;

    const uiScale = canvas.dimensions.uiScale;
    let i = 0;
    const tokenSize = { width: this.document.width, height: this.document.height };

    const effectIcons = this.effects?.children.slice(1, 1 + (this.actor?.temporaryEffects?.length || 0));
    if (!effectIcons || effectIcons.length === 0) return;

    const background = this.effects?.children[0];
    if (!(background instanceof PIXI.Graphics)) {
      return;
    }
    background.clear();

    for (const effectIcon of effectIcons) {
      if (!(effectIcon instanceof PIXI.Sprite)) continue;

      //@ts-expect-error - Incomplete types
      if (effectIcon === this.effects?.overlay) {
        const { width, height } = this.document.getSize();
        const size = Math.min(width * 0.7 * this.document.texture.scaleX, height * 0.7 * this.document.texture.scaleY);
        effectIcon.width = effectIcon.height = size;
        //@ts-expect-error - Incomplete types
        effectIcon.position = this.document.getCenterPoint({ x: 0, y: 0 });
        effectIcon.anchor.set(0.5, 0.5);
        continue;
      }

      effectIcon.mask = null; // Remove any existing mask

      effectIcon.anchor.set(0.5);
      const actorSize = Math.max(tokenSize.width, tokenSize.height);
      const iconScale = (() => {
        if (actorSize <= 0.25) return 0.6;
        if (actorSize <= 0.5) return 1;
        if (actorSize > 0.5 && actorSize <= 1) return 1.4;
        if (actorSize > 1 && actorSize <= 2) return 1.8;
        if (actorSize > 2 && actorSize <= 3) return 2.2;
        if (actorSize > 3) return 2.6;
        return 1;
      })()

      const size = uiScale * iconScale * 12;
      effectIcon.width = size;
      effectIcon.height = size;

      // Update position
      const max = (() => {
        if (actorSize == 0.25) return 10;
        if (actorSize == 0.5) return 12;
        if (actorSize == 1) return 16;
        if (actorSize == 2) return 20;
        if (actorSize == 3) return 24;
        if (actorSize >= 4) return 28;
        return 20;
      })();
      const ratio = i / max;
      const ringOffset = (Math.floor(i / max) * 2) || 1

      const gridSize = canvas.grid.size;
      const sizeOffset = (() => {
        if (actorSize <= 0.25) return 1.25;
        if (actorSize <= 0.5) return 1.1;
        if (actorSize > 0.5 && actorSize <= 1) return 1.3;
        if (actorSize > 1) return 0.925;
        return 1;
      })()

      const offset = {
        x: sizeOffset * tokenSize.width * (gridSize * 1.1),
        y: sizeOffset * tokenSize.height * (gridSize * 1.1),
      };

      if (i >= max) {
        offset.x = offset.x + (size * 1.25 * ringOffset);
        offset.y = offset.y + (size * 1.25 * ringOffset);
      }

      const rotation = (0.5 + (1 / max) * Math.PI) * Math.PI;
      const { x, y } = ((r: { x: number, y: number }, theta: number) => {
        return {
          x: r.x * Math.cos(theta),
          y: r.y * Math.sin(theta),
        };
      })(
        offset,
        (ratio + 0) * 2 * Math.PI + rotation
      );

      effectIcon.position.set(
        x / 2 + (gridSize * tokenSize.width) / 2,
        (-1 * y) / 2 + (gridSize * tokenSize.height) / 2
      )

      // Draw BG
      const r = effectIcon.width / 2;
      const gridScale = (gridSize / 100);
      background.lineStyle((1 * gridScale) / 2, userColor, 1, 0);
      background.drawCircle(effectIcon.position.x, effectIcon.position.y, r + 1.1 * gridScale);
      background.beginFill(0x010101, 0.75);
      background.drawCircle(effectIcon.position.x, effectIcon.position.y, r + 1.1 * gridScale);
      background.endFill();

      // Create a circular mask for the icon
      const mask = new PIXI.Graphics();
      mask.beginFill(0xffffff);
      mask.drawCircle(0, 0, effectIcon.width / 2); // radius matches icon
      mask.endFill();

      // Position the mask at the same place as the icon
      mask.position.set(effectIcon.position.x, effectIcon.position.y);

      // Add the mask to the same container as the icon
      this.masks.push(mask);
      this.effects?.addChild(mask);

      // Apply the mask to the icon
      effectIcon.mask = mask;

      i++;
    }

    // Remove old masks
    for (const oldMask of oldMasks) {
      if (oldMask.parent) {
        oldMask.parent.removeChild(oldMask);
      }
      if (!oldMask.destroyed) oldMask.destroy();
    }
  }

  override _onControl(options: { releaseOthers?: boolean; pan?: boolean } = {}) {
    super._onControl(options);

    //@ts-expect-error - Incomplete types
    if (game.ready && ui.hotbar.rendered) ui.hotbar.token = this;
  }

  override _onRelease(options: Record<string, unknown> = {}) {
    super._onRelease(options);

    //@ts-expect-error - Incomplete types
    if (game.ready && ui.hotbar.rendered) {
      //@ts-expect-error - Incomplete types
      ui.hotbar.token = (game.user.character?.getActiveTokens().at(0) as this) ?? null;
    }
  }

  /** @inheritdoc */
  _getKeyboardMovementAction() {
    return this.document.movementType;
  }

  /** @inheritdoc */
  _getHUDMovementAction() {
    return this.document.movementType;
  }

  /** @inheritdoc */
  _getDragWaypointProperties() {
    const action = this.document.movementType;
    return {
      action,
      teleport: action === "teleport",
    };
  }

  //@ts-expect-error - Incomplete types
  override _prepareDragLeftDropUpdates(event: PIXI.FederatedPointerEvent) {
    //@ts-expect-error - Incomplete types
    const updates = super._prepareDragLeftDropUpdates(event) as [[], { movement: Record<string, { waypoints: { width: number, height: number }[] }> }];

    if (Array.isArray(updates) && updates.length > 1) {
      const update = updates[1];
      if (update && typeof update === "object" && "movement" in update) {
        for (const user in update.movement) {
          const token = canvas.tokens.get(user);
          if (!token) continue;
          const waypoints = update.movement[user].waypoints;
          if (Array.isArray(waypoints)) {
            const size = TokenDocumentPTR2e.prepareSize(token.document);
            if (size) {
              for (const waypoint of waypoints) {
                if (waypoint.width !== size.width || waypoint.height !== size.height) {
                  waypoint.width = size.width;
                  waypoint.height = size.height;
                }
              }
            }
          }
        };
      }
    }

    return updates;
  }
}

export { TokenPTR2e }