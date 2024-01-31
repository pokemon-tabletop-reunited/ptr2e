import { CombatPTR2e } from "@combat";

class CombatTrackerPTR2e<TEncounter extends CombatPTR2e | null> extends CombatTracker<TEncounter> {
    
    override get template() {
        return 'systems/ptr2e/templates/sidebar/combat-tracker.hbs';
    }

    override async getData(options: CombatTrackerOptions): Promise<CombatTrackerData> {
        const data = await super.getData(options);

        return data;
    }
}

export { CombatTrackerPTR2e };