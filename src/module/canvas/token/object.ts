import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";

class TokenPTR2e<TDocument extends TokenDocumentPTR2e = TokenDocumentPTR2e> extends Token<TDocument> {
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