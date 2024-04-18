import CombatPTR2e from "./document.ts";

class CombatSystem extends foundry.abstract.TypeDataModel {
    declare parent: CombatPTR2e;

    get maxTurns() {
        return Math.min(this.parent.roundIndex + 1, this.parent.turns.length);
    }

    static override defineSchema(): CombatSystemSchema {
        const fields = foundry.data.fields;
        return {
            ...super.defineSchema(),
            turn: new fields.NumberField({ required: true, initial: 0, min: 0, nullable: false }),
            participants: new fields.SetField(new fields.DocumentUUIDField(), {required: true, initial: []}),
        };
    }

    override prepareDerivedData(): void {
        super.prepareDerivedData();
    }
}

interface CombatSystem extends foundry.abstract.TypeDataModel, ModelPropsFromSchema<CombatSystemSchema> {
    _source: SourceFromSchema<CombatSystemSchema>;
}

type CombatSystemSchema = {
    turn: foundry.data.fields.NumberField<number, number, true, false, true>;
    participants: foundry.data.fields.SetField<foundry.data.fields.DocumentUUIDField<string>, string[], Set<string>, true, false, true>;
};

export default CombatSystem;