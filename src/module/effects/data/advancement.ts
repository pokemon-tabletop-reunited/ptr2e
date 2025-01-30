import { CombatantPTR2e } from "@combat";
import ActiveEffectSystem, { ActiveEffectSystemSchema } from "../system.ts";

class AdvancementActiveEffectSystem extends ActiveEffectSystem {
  static override LOCALIZATION_PREFIXES = ["PTR2E.Effect"];

  static override defineSchema(): AdvancementSystemSchema {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      amount: new fields.NumberField({
        required: true, 
        nullable: false, 
        initial: 0
      })
    };
  }

  override async _preCreate(data: this["parent"]["_source"], options: DocumentModificationContext<this["parent"]["parent"]>, user: User): Promise<boolean | void> {
    const combat = game.combat?.current;
    const actor = this.parent.targetsActor() ? this.parent.target : null;
    const combatant = actor?.combatant
    const amount = (this.amount / 100);
    if(!actor || !amount || !combat || !combatant || combatant.id === combat.combatantId) return super._preCreate(data, options, user);

    await combatant.system.applyAdvancementDelay(amount);
    await ChatMessage.create({
      type: "combat",
      flavor: game.i18n.format(`PTR2E.Combat.Messages.${amount > 0 ? "Advanced" : "Delayed"}`, { name: actor.name, amount: this.amount }),
    });

    return false;
  }

  async onEndActivation(combatant: CombatantPTR2e) {
    const amount = (this.amount / 100);
    await combatant.system.applyAdvancementDelay(amount);
    await ChatMessage.create({
      type: "combat",
      flavor: game.i18n.format(`PTR2E.Combat.Messages.${amount > 0 ? "Advanced" : "Delayed"}`, { name: combatant.name, amount: this.amount }),
    });
    await this.parent.delete();
  }
}

interface AdvancementActiveEffectSystem extends ActiveEffectSystem, ModelPropsFromSchema<AdvancementSystemSchema> {}

interface AdvancementSystemSchema extends ActiveEffectSystemSchema {
  amount: foundry.data.fields.NumberField<number, number, true, false, true>;
}

export default AdvancementActiveEffectSystem;