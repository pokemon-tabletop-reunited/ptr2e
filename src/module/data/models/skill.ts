import { SlugField } from "../fields/slug-field.ts";

const skillSchema = {
  slug: new SlugField({ required: true, blank: false }),
  value: new foundry.data.fields.NumberField({
    required: true,
    initial: 1,
    nullable: false,
    positive: true
  }),
  // Luck does not use RVs
  rvs: new foundry.data.fields.NumberField({
    required: true,
    nullable: true,
    initial: 0,
  }),
  favourite: new foundry.data.fields.BooleanField({ required: true, initial: false }),
  hidden: new foundry.data.fields.BooleanField({ required: true, initial: false }),
  group: new SlugField({ required: false }),
}

export type SkillSchema = typeof skillSchema;

class SkillPTR2e extends foundry.abstract.DataModel<SkillSchema, Actor> {
  // declare parent: ActorSystemPTR2e;
  declare total: number;

  static override defineSchema(): SkillSchema {
    return skillSchema;
  }

  static override validateJoint(data: SkillPTR2e['_source']): void {
    if ((data.rvs ?? 0) < 0 && !["resources"].includes(data.slug)) {
      throw new Error("Skill value must be at least 1");
    }
  }

  get actor() {
    return this.parent.parent!;
  }

  prepareBaseData(): void {
    const speciesTrait = this.actor.species?.skills?.get(this.slug);
    if (speciesTrait && this.value <= 1) {
      this.value = speciesTrait.value;
    }
    if (speciesTrait && this.slug === "resources") {
      if (speciesTrait?.value > this.value) this.value = speciesTrait.value;
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

type CoreSkill = Pick<SkillPTR2e["_source"], 'slug' | 'favourite' | 'hidden' | 'group'>;
type CustomSkill = CoreSkill & { label: string; description: string };
type Skill = CoreSkill | CustomSkill;

export default SkillPTR2e;
export type { Skill, CoreSkill, CustomSkill };
