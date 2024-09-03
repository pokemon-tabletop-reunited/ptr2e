import { ActorPTR2e } from "@actor";
import ChangeModel from "../changes/change.ts";
import ActiveEffectSystem, { ActiveEffectSystemSchema } from "../system.ts";
import { extractNotes } from "src/util/rule-helpers.ts";
import { RollNote } from "@system/notes.ts";

class AfflictionActiveEffectSystem extends ActiveEffectSystem {
  static override defineSchema(): AfflictionSystemSchema {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      priority: new fields.NumberField({
        required: true,
        initial: 50,
        nullable: false,
      }),
      formula: new fields.StringField({
        required: true,
        initial: "",
        nullable: true,
      }),
      type: new fields.StringField({
        required: true,
        initial: "damage",
        nullable: true, //@ts-expect-error - This is a valid choice
        choices: { damage: "damage", healing: "healing" },
      }),
    };
  }

  get remainingActivations() {
    return this.stacks > 0 ? this.stacks : this.parent.duration.remaining;
  }

  public onEndActivation(): EndOfTurn {
    const output = {} as EndOfTurn;
    if (this.remainingActivations === 0) {
      output.type = "delete";
    }
    // If special update needs to happen
    // eslint-disable-next-line no-constant-condition
    else if (false) {
      // TODO: Implement this case
    }

    const stacksToRemove = (() => {
      if (this.slug.startsWith("blight")) {
        const stacksToRemove = Math.min(this.stacks, Math.pow(2, this.parent.duration.turns! - this.parent.duration.remaining! - 1));
        return stacksToRemove || 0;
      }

      return this.stacks > 1 ? 1 : 0;
    })();
    if (stacksToRemove) {
      if (stacksToRemove === this.stacks) {
        output.type = "delete";
      }
      else {
        output.type = "update";

        //@ts-expect-error - This is a valid update
        output.update = {
          _id: this.parent.id,
          "system.stacks": this.stacks - stacksToRemove,
        }
      }
    }

    const damage = this._calculateDamage(stacksToRemove);
    if (damage) {
      output.damage = damage;
    }

    if (this.parent.targetsActor() && this.parent.parent?.synthetics?.rollNotes) {
      const selectors = [
        "all",
        "affliction",
        `affliction-${this.parent.slug}`,
        `affliction-${this.parent.id}`,
        ...this.traits.map(t => `affliction-trait-${t.slug}`),
      ];
      const options = this.parent.getRollOptions();

      const notes = extractNotes(this.parent.parent.synthetics.rollNotes, selectors).filter((n) => n.predicate.test(Array.from(new Set(options))));
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
    if (!this.formula || !this.type) return;

    const formula = Roll.replaceFormulaData(
      this.formula,
      {
        effect: this.parent,
        actor: this.parent.target,
        stacksToRemove: stacksToRemove || 0,
      },
      { warn: false }
    );

    return {
      formula,
      type: this.type,
    };
  }

  override apply(actor: ActorPTR2e, change?: ChangeModel, options?: string[]): unknown {
    const afflictions = (actor.synthetics.afflictions ??= { data: [], ids: new Set() });
    if (!afflictions.ids.has(this.parent.id)) {
      afflictions.data.push(this);
      afflictions.ids.add(this.parent.id);
    }

    if (!change) return false;
    return super.apply(actor, change, options);
  }
}

interface AfflictionActiveEffectSystem
  extends ActiveEffectSystem,
  ModelPropsFromSchema<AfflictionSystemSchema> { }

type AfflictionSystemSchema = {
  priority: foundry.data.fields.NumberField<number, number, true, false, true>;
  formula: foundry.data.fields.StringField<string, string, true, true, true>;
  type: foundry.data.fields.StringField<
    "damage" | "healing",
    "damage" | "healing",
    true,
    true,
    true
  >;
} & ActiveEffectSystemSchema;

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
