import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { CombatPTR2e } from "@combat";

class CombatantPTR2e<
    TParent extends CombatPTR2e | null = CombatPTR2e | null,
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
    TParent extends CombatPTR2e | null = CombatPTR2e | null,
    TTokenDocument extends TokenDocumentPTR2e | null = TokenDocumentPTR2e | null
> extends Combatant<TParent, TTokenDocument> {

}

export { CombatantPTR2e }