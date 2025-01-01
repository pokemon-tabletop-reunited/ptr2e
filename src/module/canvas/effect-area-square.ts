import type { AuraAppearanceData } from "@actor";

/** A square (`PIXI.Rectangle`) with additional information about an effect area it's part of */
export class EffectAreaSquare extends PIXI.Rectangle {
  /** Whether this square is an active part of the aura or blocked (typically by a wall) */
  active: boolean;

  constructor(x: number, y: number, width = canvas!.grid!.sizeX, height = canvas!.grid!.sizeY, active = true) {
    super(x, y, width, height);
    this.active = active;
  }

  override get center(): {x: number, y: number} {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };
  }

  highlight(layer: GridHighlight, { border, highlight }: AuraAppearanceData): void {
    // Don't bother highlighting if outside the map boundaries
    if (this.x < 0 || this.y < 0) return;

    if (this.active) {
      //@ts-expect-error - fvtt-types unfinished types
      canvas!.interface!.grid!.highlightPosition(layer.name, {
        x: this.x,
        y: this.y,
        border: border?.color,
        color: highlight.color,
        alpha: highlight.alpha,
      });
    } else {
      //@ts-expect-error - fvtt-types unfinished types
      canvas!.interface!.grid!.highlightPosition(layer.name, {
        x: this.x,
        y: this.y,
        border: 0x000000,
        color: 0x000000,
      });
      layer
        .beginFill(0x000000, 0.5)
        .moveTo(this.x, this.y)
        .lineTo(this.x + this.width, this.y + this.height)
        .endFill();
    }
  }
}
