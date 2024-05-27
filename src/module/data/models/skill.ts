import { ActorSystemPTR2e } from "@actor";
import { SlugField } from "../fields/slug-field.ts";

class SkillPTR2e extends foundry.abstract.DataModel {
    declare parent: ActorSystemPTR2e;

    static override defineSchema(): SkillSchema {
        const fields = foundry.data.fields;
        return {
            slug: new SlugField({ required: true, blank: false }),
            value: new fields.NumberField({
                required: true,
                initial: 1,
                positive: true,
            }),
            // Luck & Resources do not use RVs
            rvs: new fields.NumberField({
                required: true,
                nullable: true,
                initial: 0,
                min: 0,
            }),
            favourite: new fields.BooleanField({ required: true, initial: false }),
            hidden: new fields.BooleanField({ required: true, initial: false }),
            group: new SlugField({ required: false }),
        };
    }

    get actor() {
        return this.parent.parent!;
    }

    prepareBaseData(): void {
        const speciesTrait = this.parent.species?.skills?.get(this.slug);
        if (speciesTrait && this.value <= 1) {
            this.value = speciesTrait.value;
        }

        this.total = this.value + (this.rvs ?? 0);
        if ((this.rvs ?? 0) > 0 && this.parent.advancement?.rvs?.total && !["luck", "resources"].includes(this.slug)) {
            this.parent.advancement.rvs.spent += this.rvs!;
        }
        if(this.slug === "resources") {
            this.parent.advancement.rvs.spent += this.value - 10;
        }
    }

    get statistic() {
        return this.actor.skills[this.slug];
    }

    async roll() {
        return this.statistic.roll();
    }

    async endOfDayLuckRoll() {
        if(this.slug !== "luck") return;
        return this.statistic.roll({type: 'luck-check'})
    }
}

interface SkillPTR2e extends foundry.abstract.DataModel, ModelPropsFromSchema<SkillSchema> {
    _source: SourceFromSchema<SkillSchema>;

    total: number;
}

type CoreSkill = Omit<SkillPTR2e["_source"], "value" | "rvs">;
type CustomSkill = CoreSkill & { label: string; description: string };
type Skill = CoreSkill | CustomSkill;

type SkillSchema = {
    slug: SlugField<true, false, false>;
    value: foundry.data.fields.NumberField<number, number, true, false, true>;
    rvs: foundry.data.fields.NumberField<number, number, true, true, true>;
    favourite: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
    hidden: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
    group: SlugField<false, false, true>;
};

export default SkillPTR2e;
export type { SkillSchema, Skill, CoreSkill, CustomSkill };
