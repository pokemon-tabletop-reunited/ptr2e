import CombatantPTR2e from "./document.ts";

export default abstract class CombatantSystemPTR2e extends foundry.abstract.TypeDataModel {
    declare parent: CombatantPTR2e;

    abstract get baseAV(): number;

    get activations() {
        return this.activationsHad;
    }

    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            ...super.defineSchema(),
            activationsHad: new fields.NumberField({
                required: true,
                initial: 0,
                min: 0,
                nullable: false,
            }),
        };
    }

    override _onUpdate(changed: object, options: object, userId: string): void {
        super._onUpdate(changed, options, userId);
        if (
            "system" in changed &&
            changed.system &&
            typeof changed.system === "object" &&
            "activationsHad" in changed.system &&
            typeof changed.system.activationsHad === "number"
        ) {
            this.parent.actor?.onEndActivation();
        }
    }
}

export default interface CombatantSystemPTR2e
    extends foundry.abstract.TypeDataModel,
        ModelPropsFromSchema<CombatantSystemSchema> {
    _source: SourceFromSchema<CombatantSystemSchema>;
}

type CombatantSystemSchema = {
    activationsHad: foundry.data.fields.NumberField<number, number, true, false, true>;
};
