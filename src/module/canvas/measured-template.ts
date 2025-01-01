import type { TemplateLayerPTR2e } from "./layer/template.ts";

export class MeasuredTemplatePTR2e extends MeasuredTemplate {
  override highlightGrid(): void {
    const isCircleOrCone = ["circle", "cone"].includes(this.document.t);
    const hasSquareGrid = canvas!.grid!.type === CONST.GRID_TYPES.SQUARE;
    if (!isCircleOrCone || !hasSquareGrid) {
      return super.highlightGrid();
    }

    const grid = canvas!.grid;
    //@ts-expect-error - Foundry types are incomplete
    grid.clearHighlightLayer(this.highlightId);

    this.layer.snapFor(this.document.t);

    // Highlight colors
    const border = this.document.borderColor;
    const color = this.document.fillColor;

    const positions = this._getGridHighlightPositions();
    for (const { x, y } of positions) {
      //@ts-expect-error - Foundry types are incomplete
      grid.highlightPosition(this.highlightId, { x, y, color, border });
    }
  }
}

export interface MeasuredTemplatePTR2e {
  get layer(): TemplateLayerPTR2e;
}