import { SquareGridPTR2e } from "./grid.ts";

export class ScenePTR2e extends Scene {

    get hasHexGrid(): boolean {
        return !([CONST.GRID_TYPES.GRIDLESS, CONST.GRID_TYPES.SQUARE]as number[]).includes(this.grid.type);
    }
    
    override prepareBaseData(): void {
        const grid = ScenePTR2e.#getGrid(this);
        if(grid) this.grid = grid;
        super.prepareBaseData();
    }

    static #getGrid(scene: Scene): BaseGrid | null {
        const grid = scene.grid;
        if ( grid instanceof BaseGrid ) return grid;

        const T = CONST.GRID_TYPES;
        const type = grid.type;

        if(type === T.SQUARE) {
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
}