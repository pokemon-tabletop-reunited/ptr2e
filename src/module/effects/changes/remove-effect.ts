import { ChangeModel, ChangeSchema } from "@data";
import { ItemPTR2e } from "@item";
import ActiveEffectPTR2e from "../document.ts";
import { BatchUpdate } from "types/foundry/common/documents/module.js";

export default class RemoveEffectChangeSystem extends ChangeModel {
  static override TYPE = "remove-effect";

  static override defineSchema() {
    return {
      ...super.defineSchema(),
      remove: new foundry.data.fields.StringField<"All" | "Oldest" | "Stacks", "All" | "Oldest" | "Stacks", true>({
        required: true,
        nullable: false,
        initial: "All",
        choices: {
          "All": "PTR2E.Effect.FIELDS.RemoveEffect.All",
          "Oldest": "PTR2E.Effect.FIELDS.RemoveEffect.Oldest",
          "Stacks": "PTR2E.Effect.FIELDS.RemoveEffect.Stacks",
        }
      }),
    }
  }

  get stacks() {
    return this.value;
  }

  override apply(): void {
    // Does nothing during apply phase.
  }

  override async preCreate({ effectSource, pendingItems, pendingEffects, }: ChangeModel.PreCreateParams): Promise<void> {
    if (this.ignored) return;
    if (!this.actor) return;

    if (!this.test(this.actor.getRollOptions())) return;

    const selector = this.key;

    const applicableEffects = (this.actor.effects as unknown as Collection<ActiveEffectPTR2e>).filter(effect => {
      const selectors = [
        effect.slug,
        ...(effect.traits.map(t => `${t.slug}-trait`)),
        `${effect.type}-effect`
      ]
      return selectors.includes(selector);
    })
    const sorted = this.remove === "All" ? applicableEffects : applicableEffects.sort((a, b) => (a._stats.createdTime! - b._stats.createdTime!)).slice(0, 1);
    if (sorted.length === 0) ui.notifications.warn(game.i18n.localize("PTR2E.UI.Warnings.RemoveEffect.NoEffectsToRemove"));
    else {
      const updates: BatchUpdate[] = [];

      const toDelete: ActiveEffectPTR2e[] = [];
      const toUpdate: object[] = [];
      if (this.remove === "Stacks") {
        for (const effect of sorted) {
          if (effect.system.stacks) {
            const newStacks = Math.max(effect.system.stacks - (this.stacks ?? 0), 0);
            if (newStacks === 0) toDelete.push(effect);
            else toUpdate.push({
              _id: effect.id,
              "system.stacks": newStacks,
            });
          } else {
            const newDuration = Math.max((effect.duration.value ?? 0) - (this.stacks ?? 0), 0);
            if (newDuration === 0 || newDuration === Infinity || newDuration === -Infinity) toDelete.push(effect);
            else toUpdate.push({
              _id: effect.id,
              "duration.value": newDuration,
            });
          }
        }
      }
      if (toDelete.length > 0) {
        updates.push({
          action: "delete",
          documentName: "ActiveEffect",
          ids: toDelete.map(e => e.id!),
          parent: this.actor
        });
      }
      if (toUpdate.length > 0) {
        updates.push({
          action: "update",
          documentName: "ActiveEffect",
          updates: toUpdate,
          parent: this.actor
        });
      }
      const content = (
        toDelete.length > 0
          ? `Removed effect${toDelete.length > 1 ? "s" : ""} from ${this.actor.link}: ${sorted.map(e => e.link).join(", ")}`
          : ``
      )
        +
        (
          toUpdate.length > 0
            ? `Updated duration/stacks off effect${toUpdate.length > 1 ? "s" : ""} on ${this.actor.link}: ${sorted.map(e => e.link).join(", ")}`
            : ``
        );

      updates.push({
        action: "create",
        documentName: "ChatMessage",
        data: [{
          content
        }]
      });

      await foundry.documents.modifyBatch(updates);
    }

    // If this is not the only change, we keep the effect
    if (this.effect?.changes?.length > 1) {
      const changes = this.effect.changes.filter(c => c !== this);
      if (!changes.every(c => c.type === "remove-effect")) {
        return;
      }
    }

    // If this is the only change, we remove the effect
    if (this.effect.target instanceof ItemPTR2e) {
      pendingItems.splice(pendingItems.findIndex(i => i._id === this.effect.target!._id), 1);
    }
    pendingEffects.splice(pendingEffects.findIndex(e => e._id === this.effect._id || e === effectSource), 1);
  }

}

export default interface RemoveEffectChangeSystem extends ChangeModel, ModelPropsFromSchema<RemoveEffectChangeSchema> {
  _source: SourceFromSchema<RemoveEffectChangeSchema>;
  /** The number of stacks to remove, if applicable */
  value: number;
}

interface RemoveEffectChangeSchema extends ChangeSchema {
  /** The method to apply the tick damage */
  remove: foundry.data.fields.StringField<"All" | "Oldest" | "Stacks", "All" | "Oldest" | "Stacks", true>;
};