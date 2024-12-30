import { EffectAreaSquare } from "@module/canvas/effect-area-square.ts";
import type { TokenPTR2e } from "../object.ts";
import { TokenDocumentPTR2e } from "../document.ts";
import type { Trait } from "@data";

export function getAreaSquares(data: GetAreaSquaresParams): EffectAreaSquare[] {
  if (!canvas.ready) return [];
  const squareWidth = canvas.dimensions.size;

  if(canvas.grid.type === CONST.GRID_TYPES.GRIDLESS) {
    return [];
  }

  const collisionType = "move";
  const pointSource = (() => {
    const sources = foundry.canvas.sources;
    const PointSource: ConstructorOf<BaseEffectSource<TokenPTR2e>> = {
      sight: sources.PointVisionSource,
      sound: sources.PointSoundSource,
      move: sources.PointMovementSource,
    }[collisionType];
    const tokenObject = data.token instanceof TokenDocumentPTR2e ? data.token.object : data.token;
    return new PointSource({ object: tokenObject });
  })();

  const positions = getGridHighlightPositions(data.token.center, data.shape);
  return positions.map(p => {
    const square = new EffectAreaSquare(p.x, p.y, squareWidth, squareWidth)
    square.active = !CONFIG.Canvas.polygonBackends[collisionType].testCollision(data.token.center, square.center, {
      type: collisionType,
      mode: "any",
      source: pointSource
    })
    return square;
  })
}

/**
   * Get the shape to highlight on a Scene which uses grid-less mode.
   * @returns {PIXI.Polygon|PIXI.Circle|PIXI.Rectangle}
   * @protected
   */
export function getGridHighlightShape({ x, y }: { x: number, y: number }, circle: PIXI.Circle): PIXI.Polygon | PIXI.Circle | PIXI.Rectangle {
  const shape = circle.clone();
  if ("points" in shape) {
    shape.points = (shape.points as number[]).map((p, i) => {
      if (i % 2) return y + p;
      else return x + p;
    });
  } else {
    shape.x += x;
    shape.y += y;
  }
  return shape;
}

/**
 * Get an array of points which define top-left grid spaces to highlight for square or hexagonal grids.
 * @returns {Point[]}
 * @protected
 */
export function getGridHighlightPositions({ x, y }: { x: number, y: number }, shape: PIXI.Circle): Point[] {
  const grid = canvas.grid;
  const ox = x, oy = y;
  const bounds = shape.getBounds();
  bounds.x += ox;
  bounds.y += oy;
  bounds.fit(canvas.dimensions.rect);
  bounds.pad(1);

  // Identify grid space that have their center points covered by the template shape
  const positions = [];
  const [i0, j0, i1, j1] = grid.getOffsetRange(bounds);
  for (let i = i0; i < i1; i++) {
    for (let j = j0; j < j1; j++) {
      const offset = { i, j };
      const { x: cx, y: cy } = grid.getCenterPoint(offset);

      // If the origin of the template is a grid space center, this grid space is highlighted
      let covered = (Math.max(Math.abs(cx - ox), Math.abs(cy - oy)) < 1);
      if (!covered) {
        for (let dx = -0.5; dx <= 0.5; dx += 0.5) {
          for (let dy = -0.5; dy <= 0.5; dy += 0.5) {
            if (shape.contains(cx - ox + dx, cy - oy + dy)) {
              covered = true;
              break;
            }
          }
        }
      }
      if (!covered) continue;
      positions.push(grid.getTopLeftPoint(offset));
    }
  }
  return positions;
}

interface GetAreaSquaresParams {
  bounds: PIXI.Rectangle;
  radius: number;
  token: TokenPTR2e | TokenDocumentPTR2e;
  traits?: Trait[];
  shape: PIXI.Circle;
}
