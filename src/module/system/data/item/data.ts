export const grades = ["E", "D", "C", "B", "A", "S"] as const;
export const rarities = ["common", "uncommon", "rare", "unique"] as const;
export type GearGrade = typeof grades[number];