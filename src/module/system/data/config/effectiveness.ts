export function getTypes(): string[] {
  return Object.keys(game.settings.get("ptr2e", "pokemonTypes"));
}