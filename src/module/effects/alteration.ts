import { ItemPTR2e } from "@item";
import { ModifierPTR2e } from "./modifiers.ts";

class DamageAlteration {
    getNewValue(
        _damage: /*BaseDamageData | DamageDicePF2e |*/ ModifierPTR2e,
        _item: ItemPTR2e | null,
    ): number | null {
        throw new Error("Not implemented");
    }

    applyTo<TDamage extends /*DamageDicePF2e | */ModifierPTR2e>(
        _damage: TDamage,
        _options: { item: ItemPTR2e; test: Iterable<string> },
    ): TDamage {
        throw new Error("Not implemented");
    }
}

export { DamageAlteration };