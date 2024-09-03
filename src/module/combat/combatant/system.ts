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
            avModifiers: new fields.NumberField({
                required: true,
                initial: 0,
                min: -100,
                max: 100,
                nullable: false,
            }),
            avModifiersFromSpdStages: new fields.NumberField({
                required: true,
                initial: 0,
                min: -100,
                max: 100,
                nullable: false,
            }),
        };
    }

    getInitiativeSpeedChange(avMods: number, avModsApplied: number, current: number) {
        const alreadyApplied = avModsApplied;
        if (alreadyApplied === avMods) return 0;

        const base = this.baseAV;

        if (base === 100) return 0;

        const appliedChange = Math.round((base * alreadyApplied) / 100);
        const effectiveAppliedChange = appliedChange + base > 100 ? 100 - base : appliedChange;
        const alreadyAppliedChangePercent = (effectiveAppliedChange / base) * 100;

        const toApplyModifier = avMods - alreadyAppliedChangePercent;
        const change = Math.round((base * toApplyModifier) / 100);

        return appliedChange + change + base > 100
            ? Math.max(100 - base - appliedChange, 0)
            : current + change < 0
                ? -current
                : change;
    }

    override async _preUpdate(changed: DeepPartial<this["parent"]["_source"]>, options: DocumentUpdateContext<this["parent"]["parent"]>, user: User): Promise<boolean | void> {
        const result = await super._preUpdate(changed, options, user);
        if (result === false) return false;

        const speedStages = this.parent.actor?.speedStage ?? 0;
        const speedStageModifier = Math.clamp(-speedStages * 15, -100, 100);

        if (changed.system?.activationsHad !== undefined || changed.initiative == this.baseAV) {
            //@ts-expect-error - This is a valid check
            changed.system ??= {};
            changed.system.avModifiers = speedStageModifier;
            changed.system.avModifiersFromSpdStages = speedStages;
            const current = (Number(changed.initiative) || 0)
            changed.initiative = current + this.getInitiativeSpeedChange(Number(changed.system.avModifiers), 0, current);
        }
        else {
            if (changed.system?.avModifiers !== undefined && typeof changed.system.avModifiers === "number") {
                const current = (Number(changed.initiative) || this.parent.initiative || 0)
                changed.initiative = current + this.getInitiativeSpeedChange(changed.system.avModifiers, this.avModifiers as number, current);
            }
            else if (changed.initiative !== undefined && typeof changed.initiative === "number") {
                changed.initiative = Math.round(changed.initiative)
            }
        }
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

interface CombatantSystemSchema extends foundry.data.fields.DataSchema {
    activationsHad: foundry.data.fields.NumberField<number, number, true, false, true>;
    avModifiers: foundry.data.fields.NumberField<number, number, true, false, true>;
    avModifiersFromSpdStages: foundry.data.fields.NumberField<number, number, true, false, true>;
}
