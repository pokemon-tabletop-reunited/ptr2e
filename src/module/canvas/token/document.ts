import { ActorPTR2e, ActorSystemPTR2e } from "@actor";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import { TokenFlagsPTR2e } from "@module/canvas/token/data.ts";
import { ScenePTR2e } from "../scene.ts";

class TokenDocumentPTR2e<TParent extends ScenePTR2e | null = ScenePTR2e | null> extends TokenDocument<TParent> {
    get playersCanSeeName(): boolean {
        const anyoneCanSee: TokenDisplayMode[] = [CONST.TOKEN_DISPLAY_MODES.ALWAYS, CONST.TOKEN_DISPLAY_MODES.HOVER];
        const nameDisplayMode = this.displayName;
        return anyoneCanSee.includes(nameDisplayMode) || this.actor?.alliance === "party";
    }
}

interface TokenDocumentPTR2e<TParent extends ScenePTR2e | null = ScenePTR2e | null> extends TokenDocument<TParent> {
    flags: TokenFlagsPTR2e;

    get actor(): ActorPTR2e<ActorSystemPTR2e, this | null> | null;
    get combatant(): Combatant<Combat, this> | null;
    get object(): TokenPTR2e<this> | null;
    get sheet(): TokenConfig<this>;
}

export { TokenDocumentPTR2e }