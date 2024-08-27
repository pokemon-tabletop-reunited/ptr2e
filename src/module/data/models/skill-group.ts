import { ActorSystemPTR2e } from "@actor";
import { SlugField } from "../fields/slug-field.ts";

class SkillGroupPTR2e extends foundry.abstract.DataModel {
  declare parent: ActorSystemPTR2e;

  static override defineSchema(): SkillGroupSchema {
    const fields = foundry.data.fields;
    return {
      slug: new SlugField({ required: true, blank: false }),
      parentGroup: new SlugField({ required: false, blank: false }),
      points: new fields.NumberField({
        required: true,
        initial: 0,
        positive: true
      }),
      rvs: new fields.NumberField({
        required: true,
        nullable: true,
        initial: 0,
      }),
      value: new fields.NumberField({
        required: true,
        initial: 1,
        positive: true
      }),
    };
  }

  static override validateJoint(data: SourceFromSchema<SkillGroupSchema>): void {
    if ((data.rvs ?? 0) < 0) {
      throw new Error("Skill group value cannot be negative");
    }
  }

  get actor() {
    return this.parent.parent!;
  }

  prepareBaseData(): void {
    this.total = this.value + (this.rvs ?? 0);
    if ((this.rvs ?? 0) > 0 && this.parent.advancement?.rvs?.total) {
      this.parent.advancement.rvs.spent += this.rvs!;
    }
  }

  get statistic() {
    return this.actor.skillGroups[this.slug];
  }

  async roll() {
    return this.statistic.roll();
  }
}

interface SkillGroupPTR2e extends foundry.abstract.DataModel, ModelPropsFromSchema<SkillGroupSchema> {
  _source: SourceFromSchema<SkillGroupSchema>;

  total: number;
}

type SkillGroup = Pick<SkillGroupPTR2e["_source"], 'slug' | 'points'> & Partial<Pick<SkillGroupPTR2e["_source"], 'parentGroup'>>;

interface SkillGroupSchema extends foundry.data.fields.DataSchema {
  slug: SlugField<string, string, true, false, false>;
  parentGroup: SlugField<string, string, false, false, false>;
  points: foundry.data.fields.NumberField<number, number, true, false, true>;
  rvs: foundry.data.fields.NumberField<number, number, true, true, true>;
  value: foundry.data.fields.NumberField<number, number, true, false, true>;
}

export default SkillGroupPTR2e;
export type { SkillGroupSchema, SkillGroup };
