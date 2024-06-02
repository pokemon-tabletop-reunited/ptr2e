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

        c1.e =
            Math.floor(
                (t1.document.elevation / canvas.dimensions.distance) * canvas.dimensions.size
            ) / this.size;
        c2.e =
            Math.floor(
                (t2.document.elevation / canvas.dimensions.distance) * canvas.dimensions.size
            ) / this.size;

        const measurements = this.#get3DSteps(c1, c2);

        return (
            measurements.doubleDiagonals + measurements.diagonals + measurements.straights <=
            (reach ? 2 : 1)
        );
    }

    /**
     * Attempt to find the distance between 2 tokens based on 3d grid space.
     * The distance should be the shortest path between the two tokens, taking into account elevation and their size.
     */
    getDistanceBetweenTokens(t1: Token, t2: Token): number {
        const getBounds = (t: Token) => this.getOffsetRangeInclusive(t.bounds);
        const getElevation = (t: Token) =>
            Math.floor(
                (t.document.elevation / canvas.dimensions.distance) * canvas.dimensions.size
            ) / this.size;
        const getHeight = (b: number[]) => Math.max(b[2] - b[0], b[3] - b[1]);
        const getDistance = (c1: GridOffsetWithElevation, c2: GridOffsetWithElevation) => {
            const measurements = this.#get3DSteps(c1, c2);
            return (
                (measurements.doubleDiagonals * Math.sqrt(3) +
                    measurements.diagonals * Math.sqrt(2) +
                    measurements.straights) *
                this.distance
            );
        };

        const bounds1 = getBounds(t1),
            bounds2 = getBounds(t2);
        const elevation1 = getElevation(t1),
            elevation2 = getElevation(t2);
        const height1 = getHeight(bounds1),
            height2 = getHeight(bounds2);
        
        function generateOuterSquares(bounds: number[], elevation: number, height: number) {
            const [x1, y1, x2, y2] = bounds;
            const squares = [];
        
            // Top and bottom edges
            for (let x = x1; x <= x2; x++) {
                for(let e = elevation; e <= height + elevation; e++) {
                    squares.push({i: x, j: y1, e: e});
                    squares.push({i: x, j: y2, e: e});
                }
            }
        
            // Left and right edges (excluding corners)
            for (let y = y1 + 1; y < y2; y++) {
                for(let e = elevation; e <= height + elevation; e++) {
                    squares.push({i: x1, j: y, e: e});
                    squares.push({i: x2, j: y, e: e});
                }
            }

            // Top and bottom side of cube (excluding corners)
            for (let x = x1 + 1; x < x2; x++) {
                for (let y = y1 + 1; y < y2; y++) {
                    squares.push({i: x, j: y, e: elevation});
                    squares.push({i: x, j: y, e: height + elevation});
                }
            }
        
            return squares;
        }
        
        const squares1 = generateOuterSquares(bounds1, elevation1, height1);
        const squares2 = generateOuterSquares(bounds2, elevation2, height2);
        
        return Math.min(...squares1.flatMap((s1) => squares2.map((s2) => getDistance(s1, s2))));
    }

    getOffsetRangeInclusive(bounds: Rectangle): [number, number, number, number] {
        const [i1, j1, i2, j2] = super.getOffsetRange(bounds);
        return [i1, j1, i2 - 1, j2 - 1];
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
            straights: straightSteps,
        };
    }
}

declare type GridOffsetWithElevation = GridOffset & { e: number };
