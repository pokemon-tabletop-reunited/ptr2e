// @ts-nocheck

export class PTRCombatant extends Combatant {

    /**
     * @type {import('./document.mjs').PTRCombat}
     */
    get encounter() {
        return this.combat;
    }
}