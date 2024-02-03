import { ActorPTR2e, ActorSystemPTR2e } from "@actor";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import { TokenFlagsPTR2e } from "@module/canvas/token/data.ts";

class TokenDocumentPTR2e<TParent extends Scene | null = Scene | null> extends TokenDocument<TParent> {

}

interface TokenDocumentPTR2e<TParent extends Scene | null = Scene | null> extends TokenDocument<TParent> {
    flags: TokenFlagsPTR2e;

    get actor(): ActorPTR2e<ActorSystemPTR2e, this | null> | null;
    get combatant(): Combatant<Combat, this> | null;
    get object(): TokenPTR2e<this> | null;
    get sheet(): TokenConfig<this>;
}

export { TokenDocumentPTR2e }