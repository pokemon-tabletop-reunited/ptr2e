import { PredicateField } from "@system/predication/schema-data-fields.ts";
import type { ActiveEffectSystemSchema } from "../system.ts";
import ActiveEffectSystem from "../system.ts";
import { Predicate } from "@system/predication/predication.ts";
import { sluggify } from "@utils";
import * as R from "remeda";
import type { DeepPartial } from "fvtt-types/utils";

const formEffectSchema = {
  trigger: new foundry.data.fields.StringField({
    required: true,
    choices: {
      "manual": "PTR2E.Effect.FIELDS.trigger.manual",
      "automatic": "PTR2E.Effect.FIELDS.trigger.automatic"
    },
    initial: "manual",
    label: "PTR2E.Effect.FIELDS.trigger.label",
    hint: "PTR2E.Effect.FIELDS.trigger.hint"
  }),
  conditions: new PredicateField({
    label: "PTR2E.Effect.FIELDS.conditions.label",
    hint: "PTR2E.Effect.FIELDS.conditions.hint"
  }),
}

export type FormActiveEffectSchema = typeof formEffectSchema & ActiveEffectSystemSchema;

class FormActiveEffectSystem extends ActiveEffectSystem<FormActiveEffectSchema> {
  static override defineSchema(): FormActiveEffectSchema {
    return {
      ...super.defineSchema(),
      ...formEffectSchema
    }
  }

  get manualOption(): string {
    return `forme:${sluggify(this.parent.name)}:active`;
  }

  get additionalPredicates() {
    const self = this as FormActiveEffectSystem;
    return [...self.conditions, ...(self.trigger === "manual" ? [self.manualOption] : [])];
  }

  override prepareBaseData(): void {
    this.parent.transfer = true;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async _preCreate(data: foundry.abstract.TypeDataModel.ParentAssignmentType<FormActiveEffectSchema, ActiveEffect.ConfiguredInstance>, options: foundry.abstract.Document.PreCreateOptions<any>, user: User): Promise<boolean | void> {
    const self = this as FormActiveEffectSystem;
    const result = await super._preCreate(data, options, user);
    if(result === false) {
      return result;
    }

    // Make sure the toggle roll option is dealt with
    const trigger = (data?.system?.trigger ?? self.trigger) as "manual" | "automatic";
    if(trigger === "manual") {
      const change = self.changes.find(change => change.key === "manual-forme-toggle");
      if(!change) {
        const change = {
          type: "roll-option",
          key: "manual-forme-toggle",
          value: self.manualOption,
          domain: "all",
          toggleable: true,
          label: `Toggle: ${self.parent.name} Forme`,
          mode: 2,
          predicate: self.conditions
        }
        const changes = [...(data.system?.changes ?? self.changes ?? [])];
        // @ts-expect-error - Correct type
        changes.unshift(change);
        self.updateSource({ "system.changes": changes });
      }
    }
    else {
      const change = self.changes.findIndex(change => change.key === "manual-forme-toggle");
      if(change) {
        const changes = [...(data.system?.changes ?? self.changes ?? [])];
        changes.splice(change, 1);
        self.updateSource({ "system.changes": changes });
      }
    }

    return result;
  }

  protected override _preUpdate(
    changed: foundry.abstract.TypeDataModel.ParentAssignmentType<FormActiveEffectSchema, ActiveEffect.ConfiguredInstance>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.PreUpdateOptions<any>,
    user: User
  ): Promise<boolean | void>  {
    const self = this as FormActiveEffectSystem;
    // Make sure the toggle roll option is dealt with
    const trigger = (changed?.system?.trigger ?? self.trigger) as "manual" | "automatic";
    if(trigger === "manual") {
      const change = self.changes.find(change => change.key === "manual-forme-toggle");
      if(!change) {
        const change = {
          type: "roll-option",
          key: "manual-forme-toggle",
          value: self.manualOption,
          domain: "all",
          toggleable: true,
          label: `Toggle: ${self.parent.name} Forme`,
          mode: 2
        };
        changed.system ??= {};
        changed.system.changes ??= [];
        // @ts-expect-error - Correct type
        changed.system.changes.unshift(change);
      }
    }
    else {
      changed.system ??= {};
      changed.system.changes ??= [];
      // @ts-expect-error - Correct type
      changed.system.changes = (changed.system.changes as this['_source']['changes']).filter(change => change.key !== "manual-forme-toggle");
    }

    const {removedConditions, removedAdditionalProperties } = (() => {
      const removedConditions: this["conditions"][number][] = [];
      if(Array.isArray(changed?.system?.conditions)) {
        for(const condition of self.conditions) {
          if(typeof condition === "string" && !changed.system.conditions.includes(condition)) {
            removedConditions.push(condition);
          }
          else if(!changed.system.conditions.some(c => typeof c === "string" ? false : R.isDeepEqual(c, condition))) {
            removedConditions.push(condition);
          }
        }
      }
      const removedAdditionalProperties = [...removedConditions];
      if(changed?.system?.trigger && changed.system.trigger !== self.trigger) {
        if(self.trigger === "manual") {
          removedAdditionalProperties.push(self.manualOption);
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
          if(change.key === "manual-forme-toggle") return changed?.system?.conditions ?? self.conditions;

          if(self.trigger === "manual" || changed.system.trigger === "manual") {
            return [...((changed?.system?.conditions ?? self.conditions) as this['conditions']), self.manualOption];
          }

          return changed?.system?.conditions ?? self.conditions;
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

export default FormActiveEffectSystem;