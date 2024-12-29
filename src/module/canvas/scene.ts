import { SquareGridPTR2e } from "./grid.ts";
import { checkAuras } from "./helpers.ts";
import type { TokenDocumentPTR2e } from "./token/document.ts";

export class ScenePTR2e extends Scene {

  get hasHexGrid(): boolean {
    return !([CONST.GRID_TYPES.GRIDLESS, CONST.GRID_TYPES.SQUARE] as number[]).includes(this.grid.type);
  }

  /** Whether this scene is "in focus": the active scene, or the viewed scene if only a single GM is logged in */
  get isInFocus(): boolean {
    const soleUserIsGM = game.user.isGM && game.users.filter((u) => u.active).length === 1;
    return (this.active && !soleUserIsGM) || (this.isView && soleUserIsGM);
  }

  protected override _initialize(options?: Record<string, unknown>): void {
    this.initialized = false; this.tokens
    super._initialize(options);
  }

  /**
   * Prevent double data preparation of child documents.
   * @removeme in V13
   */
  override prepareData(): void {
    if (game.release.generation === 12 && this.initialized) return;
    this.initialized = true;
    super.prepareData();

    Promise.resolve().then(() => {
      this.checkAuras();
    });
  }

  override prepareBaseData(): void {
    const grid = ScenePTR2e.#getGrid(this);
    if (grid) this.grid = grid;
    super.prepareBaseData();
  }

  static #getGrid(scene: Scene): BaseGrid | null {
    const grid = scene.grid;
    //@ts-expect-error - Foundry types are incomplete
    if (grid instanceof foundry.grid.GridlessGrid) return grid;

    const T = CONST.GRID_TYPES;
    const type = grid.type;

    if (type === T.SQUARE) {
      return new SquareGridPTR2e({
        size: grid.size,
        distance: grid.distance,
        units: grid.units,
        style: grid.style,
        thickness: grid.thickness,
        color: grid.color,
        alpha: grid.alpha,
        diagonals: CONST.GRID_DIAGONALS.EXACT
      });
    }
    return null;
  }

  override _onUpdate(changed: DeepPartial<this["_source"]>, options: SceneUpdateContext, userId: string): void {
    super._onUpdate(changed, options, userId);

    // Check if this is the new active scene or an update to an already active scene
    if (changed.active !== false && canvas.scene === this) {
      for (const token of canvas.tokens.placeables) {
        token.auras.reset();
      }
    }
  }
}

export interface ScenePTR2e extends Scene {
  initialized: boolean;

  readonly tokens: foundry.abstract.EmbeddedCollection<TokenDocumentPTR2e<this>>;

  /** Check for auras containing newly-placed or moved tokens (added as a debounced method) */
  checkAuras(): void;
}

// Added as debounced method
Object.defineProperty(ScenePTR2e.prototype, "checkAuras", {
  configurable: false,
  enumerable: false,
  writable: false,
  value: checkAuras,
});