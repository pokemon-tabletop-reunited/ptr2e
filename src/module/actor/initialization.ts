/**
 * Configure explicit lists of attributes that are trackable on the token HUD and in the combat tracker.
 * @internal
 */
export default function getTrackableAttributes() {
    const common = {
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
    };
  
    return {
      humanoid: {
        bar: [...common.bar],
        value: [...common.value]
      },
      pokemon: {
        bar: [...common.bar],
        value: [...common.value]
      },
    };
  }