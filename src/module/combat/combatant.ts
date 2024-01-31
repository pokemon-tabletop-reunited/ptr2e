import { TokenDocumentPTR2e } from "../canvas/token/document.ts";
import { PTRCombat } from "./document.ts";

class CombatantPTR2e<
    TParent extends PTRCombat | null = PTRCombat | null,
    TTokenDocument extends TokenDocumentPTR2e | null = TokenDocumentPTR2e | null
> extends Combatant<TParent, TTokenDocument> {

    get encounter() {
        return this.parent;
    }

    async endTurn() {
        Hooks.callAll("ptr2e.endTurn", this, this.encounter, game.user.id);
    }

    async startTurn() {
    }
}

interface CombatantPTR2e<
    TParent extends PTRCombat | null = PTRCombat | null,
    TTokenDocument extends TokenDocumentPTR2e | null = TokenDocumentPTR2e | null
> extends Combatant<TParent, TTokenDocument> {

}

export { CombatantPTR2e as PTRCombatant }