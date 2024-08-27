import SkillPTR2e, { CoreSkill } from "@module/data/models/skill.ts";

/**
 * Get all skills loaded into the world for default skill creation.
 * Luck & Resources are always present.
 */
export function getAllSkillSlugs(): string[] {
    return [...game.ptr.data.skills.keys()];
}

/**
 * Prepare data object for initial skill list of actor system creation
 */
export function getInitialSkillList(): SkillPTR2e['_source'][] {
    return Array.from(getAllSkillSlugs()).map((skill) => {
        const baseValue = game.ptr.data.skills.get(skill) ?? BaseSkills[skill];
        return partialSkillToSkill(baseValue ? baseValue : { slug: skill });
    });
}

export function partialSkillToSkill(partialSkill: Partial<SkillPTR2e['_source']>): SkillPTR2e['_source'] {
    const schema = SkillPTR2e.schema;
    const initial = (schema.initial as () => SourceFromSchema<foundry.data.fields.DataSchema>)();

    if (!partialSkill.slug) throw new Error("Partial Skill is missing slug");
    return fu.mergeObject(initial, partialSkill) as SkillPTR2e['_source'];
}

const BaseSkills = {
    luck: {
        slug: "luck",
        favourite: true,
    },
    resources: {
        slug: "resources",
        favourite: true,
        value: 10
    },
    accounting: { slug: "accounting", group: "practical-group" },
    acrobatics: { slug: "acrobatics", group: "athletics-group" },
    appraise: { slug: "appraise" },
    archaeology: { slug: "archaeology", group: "science-group" },
    painting: { slug: "painting", group: "arts-group" },
    sculpting: { slug: "sculpting", group: "arts-group" },
    acting: { slug: "acting", group: "arts-group" },
    dancing: { slug: "dancing", group: "arts-group" },
    singing: { slug: "singing", group: "arts-group" },
    "flower-arrangement": { slug: "flower-arrangement", group: "arts-group" },
    writing: { slug: "writing", group: "arts-group" },
    "aura-mastery": { slug: "aura-mastery", group: "athletics-group" },
    climb: { slug: "climb", group: "athletics-group" },
    computers: { slug: "computers", group: "technology-group" },
    conversation: { slug: "conversation", group: "social-group" },
    disguise: { slug: "disguise", group: "social-group" },
    electronics: { slug: "electronics", group: "technology-group" },
    engineering: { slug: "engineering", group: "technology-group" },
    "fast-talk": { slug: "fast-talk", group: "social-group" },
    flying: { slug: "flying", group: "athletics-group" },
    handiwork: { slug: "handiwork", group: "practical-group" },
    history: { slug: "history" },
    husbandry: { slug: "husbandry", group: "practical-group" },
    intimidate: { slug: "intimidate", group: "social-group" },
    leadership: { slug: "leadership", group: "social-group" },
    legal: { slug: "legal" },
    lift: { slug: "lift", group: "athletics-group" },
    listen: { slug: "listen", group: "wilderness-group" },
    locksmith: { slug: "locksmith", group: "practical-group" },
    mechanics: { slug: "mechanics", group: "technology-group" },
    medicine: { slug: "medicine" },
    "natural-world": { slug: "natural-world", group: "wilderness-group" },
    navigate: { slug: "navigate", group: "practical-group" },
    negotiation: { slug: "negotiation", group: "social-group" },
    dragon: { slug: "dragon", group: "occult-group" },
    fairy: { slug: "fairy", group: "occult-group" },
    ghost: { slug: "ghost", group: "occult-group" },
    psychic: { slug: "psychic", group: "occult-group" },
    spiritual: { slug: "spiritual", group: "occult-group" },
    legendary: { slug: "legendary", group: "occult-group" },
    paradox: { slug: "paradox", group: "occult-group" },
    beauty: { slug: "beauty", group: "performance-group" },
    cool: { slug: "cool", group: "performance-group" },
    clever: { slug: "clever", group: "performance-group" },
    cute: { slug: "cute", group: "performance-group" },
    tough: { slug: "tough", group: "performance-group" },
    bike: { slug: "bike", group: "pilot-group" },
    "small-motor-vehicles": { slug: "small-motor-vehicles", group: "cars-group" },
    cars: { slug: "cars", group: "cars-group" },
    "utility-vehicles": { slug: "utility-vehicles", group: "cars-group" },
    "military-ground-vehicles": { slug: "military-ground-vehicles", group: "cars-group" },
    walkers: { slug: "walkers", group: "pilot-group" },
    aircraft: { slug: "aircraft", group: "aircraft-group" },
    "aerospace-vehicles": { slug: "aerospace-vehicles", group: "aircraft-group" },
    watercraft: { slug: "watercraft", group: "pilot-group" },
    psychology: { slug: "psychology", group: "science-group" },
    "read-lips": { slug: "read-lips" },
    research: { slug: "research" },
    ride: { slug: "ride", group: "athletics-group" },
    running: { slug: "running", group: "athletics-group" },
    astronomy: { slug: "astronomy", group: "science-group" },
    biology: { slug: "biology", group: "biology-group" },
    botany: { slug: "botany", group: "science-group" },
    chemistry: { slug: "chemistry", group: "chemistry-group" },
    cryptography: { slug: "cryptography", group: "mathematics-group" },
    forensics: { slug: "forensics", group: "science-group" },
    geology: { slug: "geology", group: "science-group" },
    mathematics: { slug: "mathematics", group: "mathematics-group" },
    meteorology: { slug: "meteorology", group: "science-group" },
    parapsychology: { slug: "parapsychology", group: "science-group" },
    pharmacy: { slug: "pharmacy", group: "chemistry-group" },
    physics: { slug: "physics", group: "science-group" },
    zoology: { slug: "zoology", group: "biology-group" },
    eschatobiology: { slug: "eschatobiology", group: "biology-group" },
    megalobiology: { slug: "megalobiology", group: "biology-group" },
    terastology: { slug: "terastology", group: "biology-group" },
    ultrology: { slug: "ultrology", group: "biology-group" },
    "paradoxian-studies": { slug: "paradoxian-studies", group: "biology-group" },
    "sleight-of-hand": { slug: "sleight-of-hand-group" },
    spot: { slug: "spot", group: "wilderness-group" },
    stealth: { slug: "stealth", group: "wilderness-group" },
    survival: { slug: "survival", group: "wilderness-group" },
    swim: { slug: "swim", group: "athletics-group" },
    teaching: { slug: "teaching", group: "social-group" },
    track: { slug: "track", group: "wilderness-group" },
} as Record<string, Partial<Omit<CoreSkill, 'slug'>> & Required<Pick<CoreSkill, 'slug'>>>;

export default BaseSkills;
