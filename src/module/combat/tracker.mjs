export class PTRCombatTracker extends CombatTracker {
    
    /**
     * @override
     */
    get template() {
        return 'systems/ptr2e/static/templates/sidebar/combat-tracker.hbs';
    }

    /**
     * @override
     */
    async getData(options = {}) {
        const data = await super.getData(options);

        return data;
    }
}