import { SlugField } from "../fields/slug-field.ts";

const skillSchema = {
  slug: new SlugField({ required: true, blank: false }),
  value: new foundry.data.fields.NumberField({
    required: true,
    nullable: false,
    initial: 1,
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

declare namespace SkillPTR2e {
  type Schema = typeof skillSchema;
}

class SkillPTR2e extends foundry.abstract.DataModel<SkillPTR2e.Schema> {
  static override defineSchema(): SkillPTR2e.Schema {
    return skillSchema;
  }

  static override validateJoint(data: foundry.data.fields.SchemaField.PersistedData<SkillPTR2e.Schema>): void {
    if ((data.rvs ?? 0) < 0 && !["resources"].includes(data.slug)) {
      throw new Error("Skill value must be at least 1");
    }
  }

  // get actor(): unknown {
  //   //@ts-expect-error - This is properly typed, however I can't setup the parent properly due to circularities.
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  //   return this.parent.parent;
  // }

  // prepareBaseData(): void {
  //   const speciesTrait = this.actor.species?.skills?.get(this.slug);
  //   if (speciesTrait && this.value <= 1) {
  //     this.value = speciesTrait.value;
  //   }
  //   if(speciesTrait && this.slug === "resources") {
  //     if(speciesTrait?.value > this.value) this.value = speciesTrait.value;
  //   }
  //   if(this.actor.system.skills[this.slug]) {
  //     const {value, rvs} = this.actor.system.skills[this.slug] as {value: number, rvs: number};
  //     if(value) this.value += value;
  //     if(rvs) {
  //       this.rvs = this.rvs ? this.rvs + rvs : rvs;
  //     }
  //   }

  //   this.total = this.value + (this.rvs ?? 0);
  //   if ((this.rvs ?? 0) > 0 && this.parent.advancement?.rvs?.total && !["luck", "resources"].includes(this.slug)) {
  //     this.parent.advancement.rvs.spent += this.rvs!;
  //   }
  //   if (this.slug === "resources") {
  //     this.parent.advancement.rvs.spent += this.value - 10;
  //   }
  // }

  // get statistic() {
  //   return this.actor.skills[this.slug];
  // }

  // async roll() {
  //   return this.statistic.roll();
  // }

  // async endOfDayLuckRoll() {
  //   if (this.slug !== "luck") return;
  //   return this.statistic.roll({ type: 'luck-check' })
  // }
}

interface SkillPTR2e extends foundry.abstract.DataModel<SkillPTR2e.Schema> {
  total: number;
}

type CoreSkill = Pick<foundry.data.fields.SchemaField.PersistedData<SkillPTR2e.Schema>, 'slug' | 'favourite' | 'hidden' | 'group'>;
type CustomSkill = CoreSkill & { label: string; description: string };
type Skill = CoreSkill | CustomSkill;

export default SkillPTR2e;
export type { SkillPTR2e, Skill, CoreSkill, CustomSkill };
