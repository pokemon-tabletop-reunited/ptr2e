import { ActorPTR2e } from "@actor";
import { ActiveEffectPTR2e } from "@effects";
import { ItemPTR2e } from "@item";
import ChangeModel from "@module/effects/changes/change.ts";
import { formatSlug } from "@utils";
import AttackPTR2e from "./attack.ts";

class Trait {
  static isValid(value: unknown): value is Trait {
    if (typeof value === 'string') {
      return true; //!!game.ptr.data.traits.get(value);
    }
    if (value instanceof Trait) {
      return true;
    }
    return false;
  }

  static bgColors = {
    narrative: {
      border: "#79AF7A",
      bg: "#79AF7A",
      hover: "#7bd77b",
    },
    automated: {
      border: "#7fcbc8",
      bg: "#7fcbc8",
      hover: "#9fd1cf",
    },
    default: {
      border: "var(--border-theme-color)",
      bg: "var(--color-theme-4)",
      hover: "var(--color-theme-3)",
    }
  }

  static effectsFromChanges<TParent extends ActorPTR2e | ItemPTR2e>(this: Trait, parent: TParent, attack?: AttackPTR2e) {
    const actor = parent instanceof ActorPTR2e ? parent : parent.actor;
    const item = parent instanceof ItemPTR2e ? parent : null;
    const effect = new ActiveEffectPTR2e<TParent>({
      name: this.label ?? formatSlug(this.slug),
      type: "passive",
      system: {
        changes: this.changes,
        traits: [this.slug]
      }
    }, { parent });
    effect.changes.forEach(c => {
      c.key = c.resolveValue(c.key, c.key, {
        evaluate: false, resolvables: {
          actor,
          item,
          effect,
          attack
        }
      }) as string;
      c.value = c.resolveValue(c.value, c.value, {
        evaluate: false, resolvables: {
          actor,
          item,
          effect,
          attack
        }
      }) as string | number;
    })
    return effect;
  }
}

interface Trait {
  slug: string,
  label: string,
  related: string[],
  description: string,
  virtual?: boolean,
  type?: "narrative" | "automated"
  changes: ChangeModel['_source'][]
}

// interface Keyword {
//     slug: string,
//     label: string,
//     traits: string[],
//     description: string,
// }

export default Trait;