import SkillPTR2e, { type CoreSkill } from "../models/skill";

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
export function getInitialSkillList(): foundry.data.fields.SchemaField.PersistedData<SkillPTR2e.Schema>[] {
    return Array.from(getAllSkillSlugs()).map((skill) => {
        const baseValue = game.ptr.data.skills.get(skill) ?? BaseSkills[skill];
        return partialSkillToSkill(baseValue ? fu.duplicate(baseValue) : { slug: skill });
    });
}

export function partialSkillToSkill(partialSkill: Partial<foundry.data.fields.SchemaField.PersistedData<SkillPTR2e.Schema>>): foundry.data.fields.SchemaField.PersistedData<SkillPTR2e.Schema> {
    const initial = SkillPTR2e.schema?.initial as foundry.data.fields.DataField.Options.InitialType<foundry.data.fields.SchemaField.PersistedData<SkillPTR2e.Schema>>
    const value = (typeof initial === "function" ? initial({}) : {} );

    if (!partialSkill.slug) throw new Error("Partial Skill is missing slug");
    return fu.mergeObject(value, partialSkill) as foundry.data.fields.SchemaField.PersistedData<SkillPTR2e.Schema>;
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
    accounting: { slug: "accounting" },
    acrobatics: { slug: "acrobatics" },
    appraise: { slug: "appraise" },
    archaeology: { slug: "archaeology" },
    painting: { slug: "painting", group: "arts" },
    sculpting: { slug: "sculpting", group: "arts" },
    acting: { slug: "acting", group: "arts" },
    dancing: { slug: "dancing", group: "arts" },
    singing: { slug: "singing", group: "arts" },
    "flower-arrangement": { slug: "flower-arrangement", group: "arts" },
    writing: { slug: "writing", group: "arts" },
    "aura-sense": { slug: "aura-sense" },
    climb: { slug: "climb" },
    computers: { slug: "computers" },
    conversation: { slug: "conversation" },
    disguise: { slug: "disguise" },
    electronics: { slug: "electronics" },
    engineering: { slug: "engineering" },
    "fast-talk": { slug: "fast-talk" },
    flying: { slug: "flying" },
    handiwork: { slug: "handiwork" },
    history: { slug: "history" },
    husbandry: { slug: "husbandry" },
    intimidate: { slug: "intimidate" },
    leadership: { slug: "leadership" },
    legal: { slug: "legal" },
    lift: { slug: "lift" },
    listen: { slug: "listen" },
    locksmith: { slug: "locksmith" },
    mechanics: { slug: "mechanics" },
    medicine: { slug: "medicine" },
    "natural-world": { slug: "natural-world" },
    navigate: { slug: "navigate" },
    negotiation: { slug: "negotiation" },
    dragon: { slug: "dragon", group: "occult" },
    fairy: { slug: "fairy", group: "occult" },
    ghost: { slug: "ghost", group: "occult" },
    psychic: { slug: "psychic", group: "occult" },
    spiritual: { slug: "spiritual", group: "occult" },
    legendary: { slug: "legendary", group: "occult" },
    paradox: { slug: "paradox", group: "occult" },
    alchemy: { slug: "alchemy", group: "occult" },
    thaumaturgy: { slug: "thaumaturgy", group: "occult" },
    beauty: { slug: "beauty", group: "performance" },
    cool: { slug: "cool", group: "performance" },
    clever: { slug: "clever", group: "performance" },
    cute: { slug: "cute", group: "performance" },
    tough: { slug: "tough", group: "performance" },
    bike: { slug: "bike", group: "pilot" },
    "small-motor-vehicles": { slug: "small-motor-vehicles", group: "pilot" },
    cars: { slug: "cars", group: "pilot" },
    "utility-vehicles": { slug: "utility-vehicles", group: "pilot" },
    "military-ground-vehicles": { slug: "military-ground-vehicles", group: "pilot" },
    walkers: { slug: "walkers", group: "pilot" },
    aircraft: { slug: "aircraft", group: "pilot" },
    "aerospace-vehicles": { slug: "aerospace-vehicles", group: "pilot" },
    watercraft: { slug: "watercraft", group: "pilot" },
    "profession-specific": { slug: "profession-specific" },
    psychology: { slug: "psychology" },
    "read-lips": { slug: "read-lips" },
    research: { slug: "research" },
    ride: { slug: "ride" },
    running: { slug: "running" },
    astronomy: { slug: "astronomy", group: "science" },
    biology: { slug: "biology", group: "science" },
    botany: { slug: "botany", group: "science" },
    chemistry: { slug: "chemistry", group: "science" },
    cryptography: { slug: "cryptography", group: "science" },
    forensics: { slug: "forensics", group: "science" },
    geology: { slug: "geology", group: "science" },
    mathematics: { slug: "mathematics", group: "science" },
    meteorology: { slug: "meteorology", group: "science" },
    palaeontology: { slug: "palaeontology", group: "science" },
    parapsychology: { slug: "parapsychology", group: "science" },
    pharmacy: { slug: "pharmacy", group: "science" },
    physics: { slug: "physics", group: "science" },
    zoology: { slug: "zoology", group: "science" },
    eschatobiology: { slug: "eschatobiology", group: "science" },
    megalobiology: { slug: "megalobiology", group: "science" },
    terastology: { slug: "terastology", group: "science" },
    ultrology: { slug: "ultrology", group: "science" },
    "paradoxian-studies": { slug: "paradoxian-studies", group: "science" },
    "sleight-of-hand": { slug: "sleight-of-hand" },
    spot: { slug: "spot" },
    stealth: { slug: "stealth" },
    survival: { slug: "survival" },
    swim: { slug: "swim" },
    teaching: { slug: "teaching" },
    track: { slug: "track" },
} as Record<string, Partial<Omit<CoreSkill, 'slug'>> & Required<Pick<CoreSkill, 'slug'>>>;

export default BaseSkills;
