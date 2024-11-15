import { ActorPTR2e, ActorSystemPTR2e } from "@actor";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import { TokenFlagsPTR2e } from "@module/canvas/token/data.ts";
import { ScenePTR2e } from "../scene.ts";
import { CombatantPTR2e, CombatPTR2e } from "@combat";
// TODO: Fix circular dependency when imported from @combat
import CharacterCombatantSystem from "../../combat/combatant/models/character.ts";

class TokenDocumentPTR2e<TParent extends ScenePTR2e | null = ScenePTR2e | null> extends TokenDocument<TParent> {

  /** This should be in Foundry core, but ... */
  get scene(): this["parent"] {
    return this.parent;
  }

  get playersCanSeeName(): boolean {
    const anyoneCanSee: TokenDisplayMode[] = [CONST.TOKEN_DISPLAY_MODES.ALWAYS, CONST.TOKEN_DISPLAY_MODES.HOVER];
    const nameDisplayMode = this.displayName;
    return anyoneCanSee.includes(nameDisplayMode) || this.actor?.alliance === "party";
  }

  /**
   * Whenever the token's actor delta changes, or the base actor changes, perform associated refreshes.
   * @param {object} [update]                               The update delta.
   * @param {Partial<DatabaseUpdateOperation>} [operation]  The database operation that was performed
   * @protected
   */
  protected override _onRelatedUpdate(update: Record<string, unknown> = {}, options: DocumentModificationContext<null> = {}): void {
    super._onRelatedUpdate(update, options);

    // If the actor's speed combat stages are different from the token's combatant, update the combatant's speed stages
    const combatant = this.combatant as CombatantPTR2e<CombatPTR2e> | null;
    if (!combatant || !(combatant.system instanceof CharacterCombatantSystem)) return;
    if (this.actor?.speedStage !== undefined && this.actor.speedStage !== combatant.system.speedStages) {
      const previous = combatant.system.previousBaseAV;
      const initiativeChange = combatant.system.calculateInitiativeChange(previous, combatant.system.baseAV);
      if (initiativeChange !== 0) {
        combatant.update({ initiative: initiativeChange });
      }
    }
  }
}

interface TokenDocumentPTR2e<TParent extends ScenePTR2e | null = ScenePTR2e | null> extends TokenDocument<TParent> {
  flags: TokenFlagsPTR2e;

  get actor(): ActorPTR2e<ActorSystemPTR2e, this | null> | null;
  get combatant(): Combatant<Combat, this> | null;
  get object(): TokenPTR2e<this> | null;
  get sheet(): TokenConfig<this>;
}

export { TokenDocumentPTR2e }