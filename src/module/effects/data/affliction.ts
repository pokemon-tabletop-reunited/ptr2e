import { ActorPTR2e } from "@actor";
import ChangeModel from "../changes/change.ts";
import ActiveEffectSystem from "../system.ts";

class AfflictionActiveEffectSystem extends ActiveEffectSystem {
    static override defineSchema(): AfflictionSystemSchema {
        const fields = foundry.data.fields;
        return {
            ...super.defineSchema(),
            priority: new fields.NumberField({
                required: true,
                initial: 0,
                min: 0,
                nullable: false,
            }),
        };
    }

    get remainingActivations() {
        return this.parent.duration.remaining;
    }

    public onEndActivation(): EndOfTurn {
        const output = {} as EndOfTurn;
        if (this.remainingActivations === 0) {
            output.type = "delete";
        }
        // If special update needs to happen
        else if (false) {
            // TODO: Implement this case
        }

        const damage = this._calculateDamage();
        if (damage) {
            output.damage = damage;
            if(this.parent.id === 'mTtT8rk8ROvlR1p0') {
                output.damage.type = "healing";
            }
        }

        return output;
    }

    /**
     * Calculate the damage of the affliction
     * Returns a string of the damage formula
     */
    protected _calculateDamage(): { formula: string; type: "damage" | "healing" } | void {
        return { formula: "1/16", type: "damage" };
    }

    override apply(actor: ActorPTR2e, change?: ChangeModel, options?: string[]): unknown {
        const afflictions = (actor.synthetics.afflictions ??= {data: [], ids: new Set()});
        if(!afflictions.ids.has(this.parent.id)) {
            afflictions.data.push(this);
            afflictions.ids.add(this.parent.id);
        }

        if (!change) return false;
        return super.apply(actor, change, options);
    }
}

interface AfflictionActiveEffectSystem
    extends ActiveEffectSystem,
        ModelPropsFromSchema<AfflictionSystemSchema> {}

type AfflictionSystemSchema = {
    priority: foundry.data.fields.NumberField<number, number, true, false, true>;
};

type EndOfTurn =
    | {
          type: "delete";
          damage?: {
              formula: string;
              type: "damage" | "healing";
          };
          note?: string;
      }
    | {
          type: "update";
          update: Partial<AfflictionActiveEffectSystem["parent"]["_source"]>;
          damage?: {
              formula: string;
              type: "damage" | "healing";
          };
          note?: string;
      }
    | {
          type?: never;
          update?: Partial<AfflictionActiveEffectSystem["parent"]["_source"]>;
          damage?: {
              formula: string;
              type: "damage" | "healing";
          };
          note?: string;
      };

export default AfflictionActiveEffectSystem;
