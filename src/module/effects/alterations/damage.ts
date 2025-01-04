/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ModifierPTR2e } from "../modifiers.ts";

class DamageAlteration {
  getNewValue(
    _damage: /*BaseDamageData | DamageDicePF2e |*/ ModifierPTR2e,
    _item: Item.ConfiguredInstance | null,
  ): number | null {
    throw new Error("Not implemented");
  }

  applyTo<TDamage extends /*DamageDicePF2e | */ModifierPTR2e>(
    _damage: TDamage,
    _options: { item: Item.ConfiguredInstance; test: Iterable<string> },
  ): TDamage {
    throw new Error("Not implemented");
  }
}

export { DamageAlteration };