import { ChangeModel, ChangeSchema } from "@data";
import { ItemPTR2e } from "@item";
import ActiveEffectPTR2e from "../document.ts";

export default class RemoveEffectChangeSystem extends ChangeModel {
  static override TYPE = "remove-effect";

  static override defineSchema() {
    return {
      ...super.defineSchema(),
      remove: new foundry.data.fields.StringField<"All" | "Oldest", "All" | "Oldest", true>({
        required: true,
        nullable: false,
        initial: "All",
        choices: {
          "All": "PTR2E.Effect.FIELDS.RemoveEffect.All",
          "Oldest": "PTR2E.Effect.FIELDS.RemoveEffect.Oldest",
        }
      })
    }
  }

  override apply(): void {
    // Does nothing during apply phase.
  }

  override async preCreate({ effectSource, pendingItems, pendingEffects, }: ChangeModel.PreCreateParams): Promise<void> {
    if (this.ignored) return;
    if (!this.actor) return;

    if(!this.test(this.actor.getRollOptions())) return;

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
      await foundry.documents.modifyBatch([
        {
          action: "delete",
          documentName: "ActiveEffect",
          ids: sorted.map(e => e.id!),
          parent: this.actor
        },
        {
          action: "create",
          documentName: "ChatMessage",
          data: [{
            content: `Removed effect${sorted.length > 1 ? "s" : ""}: ${sorted.map(e => e.link).join(", ")}`,
          }]
        }
      ])
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
  value: number;
}

interface RemoveEffectChangeSchema extends ChangeSchema {
  /** The method to apply the tick damage */
  remove: foundry.data.fields.StringField<"All" | "Oldest", "All" | "Oldest", true>;
};