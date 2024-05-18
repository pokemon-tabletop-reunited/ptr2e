import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { SquareGridPTR2e } from "../grid.ts";

class TokenPTR2e<TDocument extends TokenDocumentPTR2e = TokenDocumentPTR2e> extends Token<TDocument> {
    distanceTo(target: TokenPTR2e): number {
        if(!canvas.ready) return NaN;
        if(this === target) return 0;

        if(canvas.grid.type === CONST.GRID_TYPES.SQUARE) {
            return (canvas.grid as unknown as SquareGridPTR2e).getDistanceBetweenTokens(this, target);
        }
        return canvas.grid.measureDistance(this.position, target.position);
    }

    override _onControl(options: { releaseOthers?: boolean; pan?: boolean } = {}) {
        super._onControl(options);

        if(game.ready) game.ptr.tokenPanel.token = this;
    }

    override _onRelease(options: Record<string, unknown> = {}) {
        super._onRelease(options);

        if(game.ready) {
            game.ptr.tokenPanel.token = (game.user.character?.getActiveTokens().at(0) as this) ?? null;
        }
    }
}

export { TokenPTR2e }