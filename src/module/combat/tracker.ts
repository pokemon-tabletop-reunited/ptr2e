import { PTRCombat } from "./document.ts";

class PTRCombatTracker<TEncounter extends PTRCombat | null> extends CombatTracker<TEncounter> {
    
    override get template() {
        return 'systems/ptr2e/templates/sidebar/combat-tracker.hbs';
    }

    override async getData(options: CombatTrackerOptions): Promise<CombatTrackerData> {
        const data = await super.getData(options);

        return data;
    }
}

export { PTRCombatTracker };