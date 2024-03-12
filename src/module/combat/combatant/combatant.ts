import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { CombatPTR2e } from "@combat";
import { CombatantSystemPTR2e } from "./system.ts";

class CombatantPTR2e<
    TParent extends CombatPTR2e | null = CombatPTR2e | null,
    TTokenDocument extends TokenDocumentPTR2e | null = TokenDocumentPTR2e | null,
    TSystem extends CombatantSystemPTR2e = CombatantSystemPTR2e
> extends Combatant<TParent, TTokenDocument, TSystem> {

    get encounter() {
        return this.parent!;
    }

    get baseAV() {
        return this.system.baseAV;
    }

    async endTurn() {
        Hooks.callAll("ptr2e.endTurn", this, this.encounter, game.user.id);
    }

    async startTurn() {
    }

    override getInitiativeRoll(formula: string | null): Roll {
        return super.getInitiativeRoll(formula!);
    }
}

interface CombatantPTR2e<
    TParent extends CombatPTR2e | null = CombatPTR2e | null,
    TTokenDocument extends TokenDocumentPTR2e | null = TokenDocumentPTR2e | null,
    TSystem extends CombatantSystemPTR2e = CombatantSystemPTR2e
> extends Combatant<TParent, TTokenDocument, TSystem> {

}

export { CombatantPTR2e }