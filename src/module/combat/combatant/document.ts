class CombatantPTR2e extends Combatant {

  get encounter(): Combat.ConfiguredInstance {
    return this.parent!;
  }

  get baseAV() {
    const baseAv = Math.floor(this.system.baseAV);
    return this.actor?.rollOptions.getFromDomain("effect")["reverse-initiative"] ? 195 - baseAv : baseAv;
  }

  async onStartActivation() {
    await ChatMessage.create({
      type: "combat",
      flavor: game.i18n.format("PTR2E.Combat.Messages.Activation", { name: ('name' in this.system && typeof this.system.name === "string") ? this.system.name : this.name }),
    })
    return this.system.onStartActivation();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async _preCreate(data: foundry.data.fields.SchemaField.AssignmentType<Combatant.Schema>, options: foundry.abstract.Document.PreCreateOptions<any>, user: foundry.documents.BaseUser): Promise<boolean | void> {
    if (!data) return false;
    const result = await super._preCreate(data, options, user);
    if (result === false) return false;

    if (!this.type || this.type === 'base') {
      this.updateSource({ type: 'character' });
    }
    if (!data.initiative) this.updateSource({ initiative: this.baseAV || 150 });
  }

  protected override _preUpdate(
    changed: foundry.data.fields.SchemaField.AssignmentType<Combatant.Schema>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.PreUpdateOptions<any>,
    user: foundry.documents.BaseUser
  ): Promise<boolean | void> {
    if (!changed) return Promise.resolve(false);
    if (changed["initiative"] === null || ('-=initiative' in changed) || Number(changed.initiative ?? 0) < 0) {
      ui.notifications.error(game.i18n.localize("PTR2E.Combat.Combatant.InitiativeNotZeroOrNull"));
      return Promise.resolve(false);
    }
    return super._preUpdate(changed, options, user);
  }

  override getInitiativeRoll(formula: string | undefined): Roll {
    return super.getInitiativeRoll(formula);
  }
}

interface CombatantPTR2e {
  system: PTR.Combatant.SystemInstance;
  initiative: Maybe<number>;
}

export default CombatantPTR2e;
export { type CombatantPTR2e }