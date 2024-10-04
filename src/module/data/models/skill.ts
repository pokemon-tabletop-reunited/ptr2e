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
        positive: true
      }),
      // Luck does not use RVs
      rvs: new fields.NumberField({
        required: true,
        nullable: true,
        initial: 0,
      }),
      favourite: new fields.BooleanField({ required: true, initial: false }),
      hidden: new fields.BooleanField({ required: true, initial: false }),
      group: new SlugField({ required: false }),
    };
  }

  static override validateJoint(data: SourceFromSchema<SkillSchema>): void {
    if ((data.rvs ?? 0) < 0 && !["resources"].includes(data.slug)) {
      throw new Error("Skill value must be at least 1");
    }
  }

  get actor() {
    return this.parent.parent!;
  }

  prepareBaseData(): void {
    const speciesTrait = this.parent.species?.skills?.get(this.slug);
    if (speciesTrait && this.value <= 1) {
      this.value = speciesTrait.value;
    }
    if(speciesTrait && this.slug === "resources") {
      if(speciesTrait?.value > this.value) this.value = speciesTrait.value;
    }

    this.total = this.value + (this.rvs ?? 0);
    if ((this.rvs ?? 0) > 0 && this.parent.advancement?.rvs?.total && !["luck", "resources"].includes(this.slug)) {
      this.parent.advancement.rvs.spent += this.rvs!;
    }
    if (this.slug === "resources") {
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
    if (this.slug !== "luck") return;
    return this.statistic.roll({ type: 'luck-check' })
  }
}

interface SkillPTR2e extends foundry.abstract.DataModel, ModelPropsFromSchema<SkillSchema> {
  _source: SourceFromSchema<SkillSchema>;

  total: number;
}

type CoreSkill = Pick<SkillPTR2e["_source"], 'slug' | 'favourite' | 'hidden' | 'group'>;
type CustomSkill = CoreSkill & { label: string; description: string };
type Skill = CoreSkill | CustomSkill;

interface SkillSchema extends foundry.data.fields.DataSchema {
  slug: SlugField<string, string, true, false, false>;
  value: foundry.data.fields.NumberField<number, number, true, false, true>;
  rvs: foundry.data.fields.NumberField<number, number, true, true, true>;
  favourite: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
  hidden: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
  group: SlugField<string, string, false, false, true>;
}

export default SkillPTR2e;
export type { SkillSchema, Skill, CoreSkill, CustomSkill };
