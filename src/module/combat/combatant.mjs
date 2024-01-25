// @ts-nocheck

export class PTRCombatant extends Combatant {

    /**
     * @type {import('./document.mjs').PTRCombat}
     */
    get encounter() {
        return this.combat;
    }

    async endTurn(options) {
        Hooks.callAll("ptr2e.endTurn", this, this.encounter, game.user.id);
    }

    async startTurn(options) {
    }
}