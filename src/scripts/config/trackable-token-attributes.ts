/**
 * A list of token attributes that can be tracked by the system.
 * If a new property (or actor type) is added to the system that should be tracked, it should be added here.
 */
export default Object.freeze([
  "humanoid", "pokemon"
].reduce((acc, type) => {
  acc[type] = {
    bar: ["health", "powerPoints", "shield"],
    value: [
      "health.percent",
      ...["atk", "def", "hp", "spa", "spd", "spe"].map(attribute => [
        `attributes.${attribute}.value`,
        `attributes.${attribute}.stage`
      ]).flat(),
      "advancement.experience.current",
      "advancement.experience.diff",
      "advancement.experience.next",
      "advancement.level",
      "battleStats.accuracy.stage",
      "battleStats.critRate.stage",
      "battleStats.evasion.stage",
      "inventoryPoints.current",
      "battleStats.accuracy.stage",
      "species.captureRate",
      "species.number",
      "battleStats.accuracy.stage",
      "species.size.height",
      "species.size.weight"
    ]
  }
  return acc;
}, {} as Record<string, { bar: string[], value: string[] }>));