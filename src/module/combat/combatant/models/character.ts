import CombatantSystemPTR2e, { type CombatantSystemSchema } from "../system.ts";

class CharacterCombatantSystem extends CombatantSystemPTR2e {

  get actor(): Actor.ConfiguredInstance | null {
    const self = this as CharacterCombatantSystem;
    //if (!this.parent.actor) throw new Error("A Combatant must have an associated Actor to use this method.")
    return self.parent.actor;
  }

  get speedStages() {
    const self = this as CharacterCombatantSystem;
    return self._speedStages;
  }

  private set speedStages(value: number) {
    const self = this as CharacterCombatantSystem;
    self._speedStages = Math.clamp(value, -6, 6);
  }
  
  private _speedStages = 0;
  private _baseAV = 0;

  override get baseAV() {
    const self = this as CharacterCombatantSystem;
    self.speedStages = self.actor?.speedStage ?? 0;
    return self._baseAV = CharacterCombatantSystem.calculateBaseAV(self.actor, self.combat);
  }

  get previousBaseAV() {
    const self = this as CharacterCombatantSystem;
    return self._baseAV ||= self.baseAV;
  }

  override prepareDerivedData(): void {
    super.prepareDerivedData();

    this._speedStages ||= this.actor?.speedStage ?? 0;
    this._baseAV ||= this.baseAV;
  }

  static calculateBaseAV(
    actor: Actor.ConfiguredInstance | null,
    combat: Combat.ConfiguredInstance,
    speedStages = actor?.speedStage ?? 0
  ): number {
    if (!actor) return Infinity;

    // Calculate base AV and stretch it values between 45 and 150
    const unboundBaseAV = Math.floor(
      this.stretchBaseAV(
        (750 * (1 + ((combat.averageLevel) * 23) / 99)) * (1 - speedStages * 0.125) / actor.speed,
        70 - Math.max(5 * Math.min(5, speedStages), 0),
        125 - Math.min(5 * Math.max(-5, speedStages), 0)
      )
    );

    // Clamp the base AV between 70 and 125, modified by the speed stages up to 45 and 150
    return this.clampBaseAV(unboundBaseAV, speedStages);
  }

  static clampBaseAV(value: number, speedStages: number): number {
    return Math.clamp(
      value,
      70 - Math.max(5 * Math.min(5, speedStages), 0),
      125 - Math.min(5 * Math.max(-5, speedStages), 0)
    );
  }

  /**
   * Take an unbound base AV value and stretch it to a sigmoid curve between 45 and 150
   * This is used to provide a more granular distribution of initiative values
   * @param value - Unbound Base AV value
   * @param min - Lower bound of initiative clamping, currently 45
   * @param max - Upper bound of initiative clamping, currently 150
   * @returns 
   */
  static stretchBaseAV(value: number, min = 45, max = 150): number {
    function sigmoid(x: number): number {
      return 1 / (1 + Math.exp(-x));
    }

    // Normalize the value to a -6 to 6 range (approximate range for sigmoid to be effective)
    const normalized = ((value - min) / (max - min)) * 7 - 3.5;

    // Apply the sigmoid function
    const compressed = sigmoid(normalized);

    // Scale the value back to the original range
    return compressed * (max - min) + min;
  }

  handleSummonEffects() {
    const summons = this.combat?.summons;
    if(!summons?.length) return;

    for(const summon of summons) {
      (summon.system as PTR.Combatant.System.Summon.Instance).notifyActorsOfEffectsIfApplicable([this.parent]);
    }
  }

  override _preDelete(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.PreDeleteOptions<any>,
    user: User.ConfiguredInstance
  ): Promise<boolean | void> {
    if (this.combat.combatant?.id === this.parent.id) return Promise.resolve(false);
    return super._preDelete(options, user);
  }

  override _onCreate(
    data: foundry.abstract.TypeDataModel.ParentAssignmentType<CombatantSystemSchema, Combatant.ConfiguredInstance>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.OnCreateOptions<any>,
    userId: string
  ): void {
    super._onCreate(data, options, userId);
    this.handleSummonEffects();
  }

  override _onDelete(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.OnDeleteOptions<any>,
    userId: string
  ): void {
    super._onDelete(options, userId);
    this.handleSummonEffects();
  }
}

export default CharacterCombatantSystem;
export type { CharacterCombatantSystem };