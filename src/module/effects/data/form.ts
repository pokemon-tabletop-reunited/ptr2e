import { PredicateField } from "@system/predication/schema-data-fields.ts";
import ActiveEffectSystem, { ActiveEffectSystemSchema } from "../system.ts";
import { Predicate } from "@system/predication/predication.ts";
import { sluggify } from "@utils";
import * as R from "remeda";

class FormActiveEffectSystem extends ActiveEffectSystem {
  static override defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      trigger: new fields.StringField({
        required: true,
        choices: {
          "manual": "PTR2E.Effect.FIELDS.trigger.manual",
          "automatic": "PTR2E.Effect.FIELDS.trigger.automatic"
        } as Record<"manual" | "automatic", string>,
        initial: "manual",
        label: "PTR2E.Effect.FIELDS.trigger.label",
        hint: "PTR2E.Effect.FIELDS.trigger.hint"
      }),
      conditions: new PredicateField({
        label: "PTR2E.Effect.FIELDS.conditions.label",
        hint: "PTR2E.Effect.FIELDS.conditions.hint"
      }),
    }
  }

  get manualOption(): string {
    return `forme:${sluggify(this.parent.name)}:active`;
  }

  get additionalPredicates() {
    return [...this.conditions, ...(this.trigger === "manual" ? [this.manualOption] : [])];
  }

  override prepareBaseData(): void {
    this.parent.transfer = true;
  }

  override async _preCreate(data: this["parent"]["_source"], options: DocumentModificationContext<this["parent"]["parent"]>, user: User): Promise<boolean | void> {
    const result = await super._preCreate(data, options, user);
    if(result === false) {
      return result;
    }

    // Make sure the toggle roll option is dealt with
    const trigger = (data?.system?.trigger ?? this.trigger) as "manual" | "automatic";
    if(trigger === "manual") {
      const change = this.changes.find(change => change.key === "manual-forme-toggle");
      if(!change) {
        const change = {
          type: "roll-option",
          key: "manual-forme-toggle",
          value: this.manualOption,
          domain: "all",
          toggleable: true,
          label: `Toggle: ${this.parent.name} Forme`,
          mode: 2,
          predicate: this.conditions
        }
        const changes = [...(data.system?.changes ?? this.changes ?? [])];
        // @ts-expect-error - Correct type
        changes.unshift(change);
        this.updateSource({ "system.changes": changes });
      }
    }
    else {
      const change = this.changes.findIndex(change => change.key === "manual-forme-toggle");
      if(change) {
        const changes = [...(data.system?.changes ?? this.changes ?? [])];
        changes.splice(change, 1);
        this.updateSource({ "system.changes": changes });
      }
    }

    return result;
  }

  override _preUpdate(changed: DeepPartial<this["parent"]["_source"]>, options: DocumentUpdateContext<this["parent"]["parent"]>, user: User): Promise<boolean | void> {
    // Make sure the toggle roll option is dealt with
    const trigger = (changed?.system?.trigger ?? this.trigger) as "manual" | "automatic";
    if(trigger === "manual") {
      const change = this.changes.find(change => change.key === "manual-forme-toggle");
      if(!change) {
        const change = {
          type: "roll-option",
          key: "manual-forme-toggle",
          value: this.manualOption,
          domain: "all",
          toggleable: true,
          label: `Toggle: ${this.parent.name} Forme`,
          mode: 2
        };
        // @ts-expect-error - Correct type
        changed.system ??= {};
        changed.system.changes ??= [];
        // @ts-expect-error - Correct type
        changed.system.changes.unshift(change);
      }
    }
    else {
      // @ts-expect-error - Correct type
      changed.system ??= {};
      changed.system.changes ??= [];
      // @ts-expect-error - Correct type
      changed.system.changes = (changed.system.changes as this['_source']['changes']).filter(change => change.key !== "manual-forme-toggle");
    }

    const {removedConditions, removedAdditionalProperties } = (() => {
      const removedConditions: this["conditions"][number][] = [];
      if(Array.isArray(changed?.system?.conditions)) {
        for(const condition of this.conditions) {
          if(typeof condition === "string" && !changed.system.conditions.includes(condition)) {
            removedConditions.push(condition);
          }
          else if(!changed.system.conditions.some(c => typeof c === "string" ? false : R.isDeepEqual(c, condition))) {
            removedConditions.push(condition);
          }
        }
      }
      const removedAdditionalProperties = [...removedConditions];
      if(changed?.system?.trigger && changed.system.trigger !== this.trigger) {
        if(this.trigger === "manual") {
          removedAdditionalProperties.push(this.manualOption);
        }
      }
      return { removedConditions, removedAdditionalProperties };
    })();

    if(changed?.system?.changes?.length) {
      for(const change of changed.system.changes as this['_source']['changes']) {
        const totalPredicate = change.predicate ?? [];
        // Remove any conditions that are no longer present
        for(const predicate of change.key === "manual-forme-toggle" ? removedConditions : removedAdditionalProperties) {
          const index = totalPredicate.findIndex(p => typeof p === "string" ? p === predicate : R.isDeepEqual(p, predicate as object));
          if(index !== -1) {
            totalPredicate.splice(index, 1);
          }
        }
        // Add any missing conditions
        const conditions = (() => {
          if(change.key === "manual-forme-toggle") return changed?.system?.conditions ?? this.conditions;

          if(this.trigger === "manual" || changed.system.trigger === "manual") {
            return [...((changed?.system?.conditions ?? this.conditions) as this['conditions']), this.manualOption];
          }

          return changed?.system?.conditions ?? this.conditions;
        })() as this["additionalPredicates"];
        for(const predicate of conditions) {
          if(typeof predicate === "string") {
            if(!totalPredicate.includes(predicate)) totalPredicate.push(predicate);
            continue;
          }
          if(!totalPredicate.some(p => typeof p === "string" ? false : R.isDeepEqual(p, predicate))) {
            totalPredicate.push(predicate);
          }
        }
        change.predicate = new Predicate(...totalPredicate);
      }
    }

    return super._preUpdate(changed, options, user);
  }
}

interface FormActiveEffectSystem
  extends ActiveEffectSystem,
  ModelPropsFromSchema<FormActiveEffectSchema> { }

interface FormActiveEffectSchema extends ActiveEffectSystemSchema {
  trigger: foundry.data.fields.StringField<"manual" | "automatic", "manual" | "automatic", true, false, true>;
  conditions: PredicateField;
}

export default FormActiveEffectSystem;