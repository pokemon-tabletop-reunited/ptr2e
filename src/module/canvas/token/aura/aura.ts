import { AuraAppearanceData, AuraData, AuraEffectData } from "@actor";
import { TokenDocumentPTR2e } from "../document.ts";
import { ScenePTR2e } from "@module/canvas/scene.ts";
import { EffectAreaSquare } from "@module/canvas/effect-area-square.ts";
import { getAreaSquares } from "./util.ts";
import { measureDistanceCuboid } from "@module/canvas/helpers.ts";
import { Trait } from "@data";
import { TokenAuraData } from "./types.ts";

class TokenAura implements TokenAuraData {
  #squares?: EffectAreaSquare[];
  _shape: PIXI.Circle | undefined;

  constructor(params: TokenAuraParams) {
    this.slug = params.slug;
    this.token = params.token;
    this.radius = params.radius;
    this.traits = params.traits;
    this.effects = params.effects;
    this.appearance = params.appearance;
  }

  get radiusPixels(): number {
    const gridSize = this.scene.grid.distance;
    const gridSizePixels = this.scene.grid.size;
    const tokenWidth = this.token.mechanicalBounds.width;
    return 0.5 * tokenWidth + (this.radius / gridSize) * gridSizePixels;
  }

  get scene(): ScenePTR2e {
    return this.token.scene!;
  }

  get bounds(): PIXI.Rectangle {
    const { token, radiusPixels } = this;
    const bounds = token.mechanicalBounds;
    return new PIXI.Rectangle(
      bounds.x - (radiusPixels - bounds.width / 2),
      bounds.y - (radiusPixels - bounds.width / 2),
      radiusPixels * 2,
      radiusPixels * 2,
    );
  }

  get center(): Point {
    return this.token.center;
  }

  /** The squares covered by this aura */
  get squares(): EffectAreaSquare[] {
    return (this.#squares ??= getAreaSquares(this));
  }

  get shape(): PIXI.Circle {
    return this._shape ??= MeasuredTemplate.getCircleShape(this.radius);
  }

  /** Does this aura overlap with (at least part of) a token? */
  containsToken(token: TokenDocumentPTR2e): boolean {
    // If either token is hidden or not rendered, return false early
    if (this.token.hidden || token.hidden || !this.token.object || !token.object) {
      return false;
    }

    // If the token is the one emitting the aura, return true early
    if (token === this.token) return true;

    // If this aura is out of range, return false early
    if (this.token.object.distanceTo(token.object) > this.radius) return false;

    // If the grid is gridless, the aura radius is all that is checked.
    if(canvas.grid.type === CONST.GRID_TYPES.GRIDLESS) {
      return true;
    }

    const round = (n: number) => {
      if(canvas.grid.type === CONST.GRID_TYPES.SQUARE) return n;
      const scl = Math.pow(10, 2);
      return Math.round(n * scl) / scl;
    }

    // Check whether any aura square intersects the token's space
    return this.squares.some((s) => s.active 
    && (
      canvas.grid.type === CONST.GRID_TYPES.SQUARE
        ? measureDistanceCuboid(s, token.mechanicalBounds) === 0
        : round(canvas.grid.measurePath([s.center, token.center]).distance) === 0
    ));
  }

  /** Notify tokens' actors if they are inside this aura. */
  async notifyActors(): Promise<void> {
    if (!this.scene.isInFocus) return;

    const auraActor = this.token.actor;
    const auraData = auraActor?.auras.get(this.slug);
    if (!(auraActor && auraData?.effects.length)) return;

    const auradTokens = this.scene.tokens.filter(
      (t) => t.actor?.primaryUpdater === game.user && this.containsToken(t),
    );
    const affectedActors = new Set(auradTokens.flatMap((t) => t.actor ?? []));

    const origin = { actor: auraActor, token: this.token };
    for (const actor of affectedActors) {
      await actor.applyAreaEffects(auraData, origin, affectedActors);
    }
  }
}

interface TokenAura {
  slug: string;
  token: TokenDocumentPTR2e;
  /** the radius of the aura in meters */
  radius: number;
  traits: Trait[];
  effects: AuraEffectData[];
  appearance: AuraAppearanceData;
}

interface TokenAuraParams extends Omit<AuraData, "effects" | "traits"> {
  slug: string;
  radius: number;
  token: TokenDocumentPTR2e;
  traits: Trait[];
  effects: AuraEffectData[];
}

export { TokenAura }