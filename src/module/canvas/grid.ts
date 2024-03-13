export class SquareGridPTR2e extends SquareGrid {

    diagonals: ValueOf<typeof CONST.GRID_DIAGONALS>;

    constructor(options: BaseGridOptions) {
        super(options);

        this.type = CONST.GRID_TYPES.SQUARE;

        this.diagonals = options.diagonals ?? CONST.GRID_DIAGONALS.EQUIDISTANT;
    }

    getTokensAdjacent(t1: Token, t2: Token, reach = false): boolean {
        const c1 = this.getOffset(t1.position) as GridOffsetWithElevation;
        const c2 = this.getOffset(t2.position) as GridOffsetWithElevation;

        c1.e = Math.floor((t1.document.elevation / canvas.dimensions.distance) * canvas.dimensions.size) / this.size;
        c2.e = Math.floor((t2.document.elevation / canvas.dimensions.distance) * canvas.dimensions.size) / this.size;

        const measurements = this.#get3DSteps(c1, c2);

        return (measurements.doubleDiagonals + measurements.diagonals + measurements.straights) <= (reach ? 2 : 1);
    }

    getDistanceBetweenTokens(t1: Token, t2: Token): number {
        const c1 = this.getOffset(t1.position) as GridOffsetWithElevation;
        const c2 = this.getOffset(t2.position) as GridOffsetWithElevation;

        c1.e = Math.floor((t1.document.elevation / canvas.dimensions.distance) * canvas.dimensions.size) / this.size;
        c2.e = Math.floor((t2.document.elevation / canvas.dimensions.distance) * canvas.dimensions.size) / this.size;

        const measurements = this.#get3DSteps(c1, c2);

        return (measurements.doubleDiagonals * Math.sqrt(3) + measurements.diagonals * Math.sqrt(2) + measurements.straights) * this.distance;
    }

    #get3DSteps(c1: GridOffsetWithElevation, c2: GridOffsetWithElevation) {
        let dx = Math.abs(c1.i - c2.i);
        let dy = Math.abs(c1.j - c2.j);
        let dz = Math.abs(c1.e - c2.e);

        let totalDiagonalSteps = Math.min(dx, dy, dz);
        dx -= totalDiagonalSteps;
        dy -= totalDiagonalSteps;
        dz -= totalDiagonalSteps;

        let diagonalStepsXY = Math.min(dx, dy);
        dx -= diagonalStepsXY;
        dy -= diagonalStepsXY;

        let diagonalStepsXZ = Math.min(dx, dz);
        dx -= diagonalStepsXZ;
        dz -= diagonalStepsXZ;

        let diagonalStepsYZ = Math.min(dy, dz);
        dy -= diagonalStepsYZ;
        dz -= diagonalStepsYZ;

        let remainingDiagonalSteps = diagonalStepsXY + diagonalStepsXZ + diagonalStepsYZ;
        let straightSteps = dx + dy + dz;

        return {
            /** 3D Diagonals */
            doubleDiagonals: totalDiagonalSteps,
            /** 2D Diagonals */
            diagonals: remainingDiagonalSteps,
            /** Straights */
            straights: straightSteps
        };
    }
}

declare type GridOffsetWithElevation = GridOffset & { e: number };