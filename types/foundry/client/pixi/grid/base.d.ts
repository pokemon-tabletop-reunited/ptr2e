export { };

declare global {
    type GridOffset = { i: number, j: number };
    type GridCoordinates = GridOffset | Point;
    interface GridMeasurePathResultWaypoint {
        backward: GridMeasurePathResultSegment | null;
        forward: GridMeasurePathResultSegment | null;
        distance: number;
        spaces: number;
        diagonals: number;
    }

    interface GridMeasurePathResultSegment {
        from: GridMeasurePathResultWaypoint;
        to: GridMeasurePathResultWaypoint;
        distance: number;
        spaces: number;
        diagonals: number;
    }
    interface GridMeasurePathResult {
        waypoints: GridMeasurePathResultWaypoint[];
        segments: GridMeasurePathResultSegment[];
        distance: number;
        spaces: number;
        diagonals: number;
    }

    /**
     * The base grid class.
     * This double-dips to implement the "gridless" option
     */
    abstract class BaseGrid extends PIXI.Container {
        constructor(options: BaseGridOptions);

        options: BaseGridOptions;

        /**
        * The grid type (see {@link CONST.GRID_TYPES}).
        * @type {number}
        */
        type: ValueOf<typeof CONST.GRID_TYPES>;

        /**
         * The size of a grid space in pixels.
         * @type {number}
         */
        size: number;

        /**
         * The width of a grid space in pixels.
         * @type {number}
         */
        sizeX: number;

        /**
         * The height of a grid space in pixels.
         * @type {number}
         */
        sizeY: number;

        /**
         * The distance of a grid space in units.
         * @type {number}
         */
        distance: number;

        /**
         * The distance units used in this grid.
         * @type {string}
         */
        units: string;

        /**
         * The style of the grid.
         * @type {string}
         */
        style: string;

        /**
         * The thickness of the grid.
         * @type {number}
         */
        thickness: number;

        /**
         * The color of the grid.
         * @type {Color}
         */
        color: HexColorString;

        /**
         * The opacity of the grid.
         * @type {number}
         */
        alpha: number;

        /**
         * Returns the offset of the grid space corresponding to the given coordinates.
         * @param {GridCoordinates} coords    The coordinates
         * @returns {GridOffset}              The offset
         */
        getOffset(coords: GridCoordinates): GridOffset;

        /**
         * Returns the smallest possible range containing the offsets of all grid spaces that intersect the given bounds.
         * If the bounds are empty (nonpositive width or height), then the offset range is empty.
         * @example
         * ```js
         * const [i0, j0, i1, j1] = grid.getOffsetRange(bounds);
         * for ( let i = i0; i < i1; i++ ) {
         *   for ( let j = j0; j < j1; j++ ) {
         *     const offset = {i, j};
         *     // ...
         *   }
         * }
         * ```
         * @param {Rectangle} bounds                                      The bounds
         * @returns {[i0: number, j0: number, i1: number, j1: number]}    The offset range
         * @abstract
         */
        getOffsetRange(bounds: Rectangle): [number, number, number, number];

        /**
         * Measure a shortest, direct path through the given waypoints.
         * @param {GridCoordinates[]} waypoints    The waypoints the path must pass through
         * @returns {GridMeasurePathResult}
         */
        measurePath(waypoints: GridCoordinates[]): GridMeasurePathResult;

        /**
         * Measures the path and writes the measurements into `result`.
         * Called by {@link BaseGrid#measurePath}.
         * @param {GridCoordinates[]} waypoints     The waypoints the path must pass through
         * @param {GridMeasurePathResult} result    The measurement result that the measurements need to be written to
         * @protected
         */
        _measurePath(waypoints: GridCoordinates[], result: GridMeasurePathResult): void;

        /** Grid Unit Width */
        w: number;

        /** Grid Unit Height */
        h: number;

        /** Highlight active grid spaces */
        highlight: PIXI.Container;

        /**
         * Draw the grid. Subclasses are expected to override this method to perform their type-specific drawing logic.
         * @param [preview] Override settings used in place of those saved to the scene data.
         * @param [preview.gridColor=null] The grid color.
         * @param [preview.gridAlpha=null] The grid transparency.
         */
        draw(preview?: { gridColor?: string | null; gridAlpha?: string | null }): this;

        /**
         * Highlight a grid position for a certain coordinates
         * @param layer  The highlight layer to use
         * @param x      The x-coordinate of the highlighted position
         * @param y      The y-coordinate of the highlighted position
         * @param color  The hex fill color of the highlight
         * @param border The hex border color of the highlight
         * @param alpha  The opacity of the highlight
         */
        highlightGridPosition(
            layer: GridHighlight,
            data?: { x?: number; y?: number; color?: number; border?: number; alpha?: number },
        ): this;

        /* -------------------------------------------- */
        /*  Grid Measurement Methods
        /* -------------------------------------------- */

        /**
         * Given a pair of coordinates (x, y) - return the top-left of the grid square which contains that point
         * @return    An Array [x, y] of the top-left coordinate of the square which contains (x, y)
         */
        getTopLeft(x: number, y: number): number[];

        /* -------------------------------------------- */

        /**
         * Given a pair of coordinates (x, y), return the center of the grid square which contains that point
         * @return    An Array [x, y] of the central point of the square which contains (x, y)
         */
        getCenter(x: number, y: number): number[];

        /* -------------------------------------------- */

        /**
         * Given a pair of coordinates (x1,y1), return the grid coordinates (x2,y2) which represent the snapped position
         * Under a "gridless" system, every pixel position is a valid snapping position
         *
         * @param x The exact target location x
         * @param y The exact target location y
         * @param interval An interval of grid spaces at which to snap, default is 1
         *
         * @return  An object containing the coordinates of the snapped location
         */
        getSnappedPosition(x: number, y: number, interval: number): { x: number; y: number };

        /* -------------------------------------------- */

        /**
         * Given a pair of pixel coordinates, return the grid position as an Array.
         * Always round down to the nearest grid position so the pixels are within the grid space (from top-left).
         * @param x The x-coordinate pixel position
         * @param y The y-coordinate pixel position
         * @return  An array representing the position in grid units
         */
        getGridPositionFromPixels(x: number, y: number): number[];

        /* -------------------------------------------- */

        /**
         * Given a pair of grid coordinates, return the pixel position as an Array.
         * Always round up to a whole pixel so the pixel is within the grid space (from top-left).
         * @param x The x-coordinate grid position
         * @param y The y-coordinate grid position
         * @return An array representing the position in pixels
         */
        getPixelsFromGridPosition(x: number, y: number): number[];

        /* -------------------------------------------- */

        /**
         * Shift a pixel position [x,y] by some number of grid units dx and dy
         * @param x    The starting x-coordinate in pixels
         * @param y    The starting y-coordinate in pixels
         * @param dx   The number of grid positions to shift horizontally
         * @param dy   The number of grid positions to shift vertically
         */
        shiftPosition(x: number, y: number, dx: number, dy: number): number[];

        /* -------------------------------------------- */

        /**
         * Measure the distance traversed over an array of measured segments
         * @param segments  An Array of measured movement segments
         * @param options   Additional options which modify the measurement
         * @return  An Array of distance measurements for each segment
         */
        measureDistances(segments: Segment[], options: MeasureDistancesOptions): number[];

        /* -------------------------------------------- */

        /**
         * Get the grid row and column positions which are neighbors of a certain position
         * @param row  The grid row coordinate against which to test for neighbors
         * @param col  The grid column coordinate against which to test for neighbors
         * @return      An array of grid positions which are neighbors of the row and column
         */
        getNeighbors(row: number, col: number): number[];
    }

    interface BaseGridOptions {
        dimensions?: {
            size: number;
        };
        diagonals?: ValueOf<typeof CONST.GRID_DIAGONALS>;
        size?: number;
        distance?: number;
        units?: string;
        style?: string;
        thickness?: number;
        color?: HexColorString;
        alpha?: number;
    }

    interface Segment {
        ray: Ray;
        label: PIXI.Container;
    }

    interface MeasureDistancesOptions {
        gridSpaces?: boolean;
    }
}
