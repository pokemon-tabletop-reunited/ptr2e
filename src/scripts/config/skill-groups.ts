import SkillGroupPTR2e from "@module/data/models/skill.ts";
import { SkillGroup } from "@module/data/models/skill-group.ts";

/**
 * Get all skills loaded into the world for default skill creation.
 * Luck & Resources are always present.
 */
export function getAllSkillGroupSlugs(): string[] {
    return [...game.ptr.data.skillGroups.keys()];
}

/**
 * Prepare data object for initial skill list of actor system creation
 */
export function getInitialSkillGroupList(): SkillGroupPTR2e['_source'][] {
    return Array.from(getAllSkillGroupSlugs()).map((group) => {
        const baseValue = game.ptr.data.skillGroups.get(group) ?? BaseSkillGroups[group];
        return partialGroupToGroup(baseValue ? baseValue : { slug: group });
    });
}

export function partialGroupToGroup(partialSkill: Partial<SkillGroupPTR2e['_source']>): SkillGroupPTR2e['_source'] {
    const schema = SkillGroupPTR2e.schema;
    const initial = (schema.initial as () => SourceFromSchema<foundry.data.fields.DataSchema>)();

    if (!partialSkill.slug) throw new Error("Partial Skill Group is missing slug");
    return fu.mergeObject(initial, partialSkill) as SkillGroupPTR2e['_source'];
}

const BaseSkillGroups = {
    "arts-group": { slug: "arts-group", points: 20 },
    "athletics-group": { slug: "athletics-group", points: 20 },
    "social-group": { slug: "social-group", points: 20 },
    "practical-group": { slug: "practical-group", points: 20 },
    "wilderness-group": { slug: "wilderness-group", points: 20 },
    "technology-group": { slug: "technology-group", points: 20 },
    "occult-group": { slug: "occult-group", points: 20 },
    "performance-group": { slug: "performance-group", points: 20 },
    "pilot-group": { slug: "pilot-group", points: 20 },
    "cars-group": { slug: "cars-group", parentGroup: "pilot", points: 20 },
    "aircraft-group": { slug: "aircraft-group", parentGroup: "pilot", points: 20 },
    "science-group": { slug: "science-group", points: 20 },
    "biology-group": { slug: "biology-group", parentGroup: "science", points: 20 },
    "chemistry-group": { slug: "chemistry-group", parentGroup: "science", points: 20 },
    "mathematics-group": { slug: "mathematics-group", parentGroup: "science", points: 20 },
} as Record<string, Partial<Omit<SkillGroup, 'slug' | 'points'>> & Required<Pick<SkillGroup, 'slug' | 'points'>>>;

export default BaseSkillGroups;