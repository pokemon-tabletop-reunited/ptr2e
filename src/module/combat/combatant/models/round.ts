import { CombatantSystemPTR2e } from "@combat";
import type { CombatantSystemSchema } from "../system.ts";

class RoundCombatantSystem extends CombatantSystemPTR2e {

  static readonly id = "roundsinitiative" as const;
  static get instance(): Combatant.ConfiguredInstance | null {
    return game.combat?.combatants.get(this.id) as Combatant.ConfiguredInstance ?? null;
  }

  override get activations() {
    return this.parent.parent!.round;
  }

  /**
   * The Round always has a base AV of 150
   */
  override get baseAV() { return 150 }

  override async _preUpdate(
    changed: foundry.abstract.TypeDataModel.ParentAssignmentType<CombatantSystemSchema, Combatant.ConfiguredInstance>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.PreUpdateOptions<any>,
    userId: string
  ): Promise<boolean | void> {
    if (changed.defeated) {
      changed.defeated = false;
    }
    return super._preUpdate(changed, options, userId);
  }

  override _preDelete(): Promise<boolean | void> {
    return Promise.resolve(false);
  }
}

export default RoundCombatantSystem;