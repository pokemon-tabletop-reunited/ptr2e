import type ChangeModel from "../changes/change.ts";
import type { ActiveEffectSystemSchema } from "../system.ts";
import ActiveEffectSystem from "../system.ts";
import { extractNotes } from "src/util/change-helpers.ts";
import { RollNote } from "@system/notes.ts";

const afflictionEffectSchema = {
  priority: new foundry.data.fields.NumberField({
    required: true,
    initial: 50,
    nullable: false,
  }),
  formula: new foundry.data.fields.StringField({
    required: true,
    initial: "",
    nullable: true,
  }),
  type: new foundry.data.fields.StringField({
    required: true,
    initial: "damage",
    nullable: true,
    choices: { damage: "damage", healing: "healing" },
  }),
}

export type AfflictionSystemSchema = typeof afflictionEffectSchema & ActiveEffectSystemSchema;

class AfflictionActiveEffectSystem<Schema extends AfflictionSystemSchema = AfflictionSystemSchema> extends ActiveEffectSystem<Schema> {
  static override defineSchema(): ActiveEffectSystemSchema {
    return {
      ...super.defineSchema() as ActiveEffectSystemSchema,
      ...afflictionEffectSchema
    };
  }

  get remainingActivations(): number {
    const self = this as AfflictionActiveEffectSystem;
    return self.stacks > 0 ? self.stacks : self.parent.duration.remaining;
  }

  public onEndActivation(): EndOfTurn {
    const self = this as AfflictionActiveEffectSystem;
    const output = {} as EndOfTurn;
    if (self.remainingActivations === 0) {
      output.type = "delete";
    }
    // If special update needs to happen
    // eslint-disable-next-line no-constant-condition
    else if (false) {
      // TODO: Implement this case
    }

    const stacksToRemove = (() => {
      if (self.slug.startsWith("blight")) {
        const stacksToRemove = Math.min(self.stacks, Math.pow(2, self.parent.duration.turns! - self.parent.duration.remaining! - 1));
        return stacksToRemove || 0;
      }

      return self.stacks > 1 ? 1 : 0;
    })();
    if (stacksToRemove) {
      if (stacksToRemove === this.stacks) {
        output.type = "delete";
      }
      else {
        output.type = "update";

        //@ts-expect-error - This is a valid update
        output.update = {
          _id: self.parent.id,
          "system.stacks": self.stacks - stacksToRemove,
        }
      }
    }

    const damage = self._calculateDamage(stacksToRemove);
    if (damage) {
      output.damage = damage;
    }

    if (self.parent.targetsActor() && self.parent.parent?.synthetics?.rollNotes) {
      const selectors = [
        "all",
        "affliction",
        `affliction-${self.parent.slug}`,
        `affliction-${self.parent.id}`,
        ...self.traits.map(t => `affliction-trait-${t.slug}`),
      ];
      const options = self.parent.getRollOptions();

      const notes = extractNotes(self.parent.parent.synthetics.rollNotes, selectors).filter((n) => n.predicate.test(Array.from(new Set(options))));
      const html = RollNote.notesToHTML(notes)?.innerHTML;
      if (html) output.note = { options, domains: selectors, html }
    }

    return output;
  }

  /**
   * Calculate the damage of the affliction
   * Returns a string of the damage formula
   */
  protected _calculateDamage(stacksToRemove: number): { formula: string; type: "damage" | "healing" } | void {
    const self = this as AfflictionActiveEffectSystem;
    if (!self.formula || !self.type) return;

    if(self.type === 'damage' && self.parent.targetsActor()) {
      const immunities = self.parent.target.rollOptions.getFromDomain("immunities");
      
      const isImmune = self.parent.target.isImmuneToEffect(self.parent) 
        || (
          (immunities[`damage:indirect`] || immunities[`damage:affliction:${self.parent.slug}`])
          && !self.parent.traits.has("ignore-immunity") && !self.parent.traits.has(`ignore-immunity:${self.parent.slug}`)
        )
      
      if(isImmune) return;
    }

    const formula = Roll.replaceFormulaData(
      self.formula,
      {
        effect: self.parent,
        actor: self.parent.target,
        stacksToRemove: stacksToRemove || 0,
      },
      { warn: false }
    );

    return {
      formula,
      type: self.type,
    };
  }

  override apply(actor: Actor.ConfiguredInstance, change?: ChangeModel, options?: string[]): unknown {
    const self = this as AfflictionActiveEffectSystem;
    const afflictions = (actor.synthetics.afflictions ??= { data: [], ids: new Set() });
    if (!afflictions.ids.has(self.parent.id)) {
      afflictions.data.push(self);
      afflictions.ids.add(self.parent.id);
    }

    if (!change) return false;
    return super.apply(actor, change, options);
  }
}

type EndOfTurn =
  | {
    type: "delete";
    damage?: {
      formula: string;
      type: "damage" | "healing";
    };
    note?: {
      options: string[];
      domains: string[];
      html: string;
    };
  }
  | {
    type: "update";
    update: Partial<AfflictionActiveEffectSystem["parent"]["_source"]>;
    damage?: {
      formula: string;
      type: "damage" | "healing";
    };
    note?: {
      options: string[];
      domains: string[];
      html: string;
    };
  }
  | {
    type?: never;
    update?: Partial<AfflictionActiveEffectSystem["parent"]["_source"]>;
    damage?: {
      formula: string;
      type: "damage" | "healing";
    };
    note?: {
      options: string[];
      domains: string[];
      html: string;
    };
  };

export default AfflictionActiveEffectSystem;
export type { AfflictionActiveEffectSystem };