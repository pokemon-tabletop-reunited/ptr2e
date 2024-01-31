import { PTRActor } from "src/module/actor/base.ts";
import { TokenPTR2e } from "./object.ts";
import { TokenFlagsPTR2e } from "./data.ts";

class TokenDocumentPTR2e<TParent extends Scene | null = Scene | null> extends TokenDocument<TParent> {

}

interface TokenDocumentPTR2e<TParent extends Scene | null = Scene | null> extends TokenDocument<TParent> {
    flags: TokenFlagsPTR2e;

    get actor(): PTRActor<this | null> | null;
    get combatant(): Combatant<Combat, this> | null;
    get object(): TokenPTR2e<this> | null;
    get sheet(): TokenConfig<this>;
}

export { TokenDocumentPTR2e }