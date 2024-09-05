import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { CombatPTR2e } from "@combat";
import { CombatantSystemPTR2e } from "@combat";

class CombatantPTR2e<
  TParent extends CombatPTR2e | null = CombatPTR2e | null,
  TTokenDocument extends TokenDocumentPTR2e | null = TokenDocumentPTR2e | null,
  TSystem extends CombatantSystemPTR2e = CombatantSystemPTR2e
> extends Combatant<TParent, TTokenDocument, TSystem> {

  get encounter() {
    return this.parent!;
  }

  get baseAV() {
    return Math.floor(this.system.baseAV);
  }

  protected override async _preCreate(data: this["_source"], options: DocumentModificationContext<TParent>, user: User): Promise<boolean | void> {
    const result = await super._preCreate(data, options, user);
    if (result === false) return false;

    if (!this.type || this.type === 'base') {
      this.updateSource({ type: 'character' });
    }
    if (!data.initiative) this.updateSource({ initiative: this.baseAV || 150 });
  }

  protected override _preUpdate(changed: DeepPartial<this["_source"]>, options: DocumentUpdateContext<TParent>, user: User): Promise<boolean | void> {
    if (changed["initiative"] === null || ('-=initiative' in changed) || Number(changed.initiative ?? 0) < 0) {
      ui.notifications.error(game.i18n.localize("PTR2E.Combat.Combatant.InitiativeNotZeroOrNull"));
      return Promise.resolve(false);
    }
    return super._preUpdate(changed, options, user);
  }

  override getInitiativeRoll(formula: string | null): Roll {
    return super.getInitiativeRoll(formula!);
  }
}

interface CombatantPTR2e<
  TParent extends CombatPTR2e | null = CombatPTR2e | null,
  TTokenDocument extends TokenDocumentPTR2e | null = TokenDocumentPTR2e | null,
  TSystem extends CombatantSystemPTR2e = CombatantSystemPTR2e
> extends Combatant<TParent, TTokenDocument, TSystem> {
  _id: string;
}

export default CombatantPTR2e;