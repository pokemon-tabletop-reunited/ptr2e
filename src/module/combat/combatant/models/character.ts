import { CombatantPTR2e, CombatPTR2e } from "@combat";
import CombatantSystemPTR2e from "../system.ts";
import { ActorPTR2e } from "@actor";
import { ActiveEffectPTR2e } from "@effects";
import { ItemPTR2e } from "@item";
import AdvancementActiveEffectSystem from "@module/effects/data/advancement.ts";

class CharacterCombatantSystem extends CombatantSystemPTR2e {
  declare parent: CombatantPTR2e;

  get actor() {
    //if (!this.parent.actor) throw new Error("A Combatant must have an associated Actor to use this method.")
    return this.parent.actor;
  }

  get speedStages() {
    return this._speedStages;
  }

  private set speedStages(value: number) {
    this._speedStages = Math.clamp(value, -6, 6);
  }

  private _speedStages = 0;
  private _baseAV = 0;

  override get baseAV() {
    this.speedStages = this.actor?.speedStage ?? 0;
    return this._baseAV = CharacterCombatantSystem.calculateBaseAV(this.actor, this.combat);
  }

  get previousBaseAV() {
    return this._baseAV ||= this.baseAV;
  }

  override prepareDerivedData(): void {
    super.prepareDerivedData();

    this._speedStages ||= this.actor?.speedStage ?? 0;
    this._baseAV ||= this.baseAV;
  }

  /**
   * Handle Confused Effect
   */
  override async onEndActivation(): Promise<void> {
    if (!this.actor) return;
    await this.handleConfusedAffliction();

    for(const effect of this.actor.allApplicableEffects()) {
      if(effect.type !== "advancement") continue;
      await (effect.system as AdvancementActiveEffectSystem).onEndActivation(this.parent);
    }
  }

  private async handleConfusedAffliction() {
    if (!this.actor) return;
    const confusedEffect = this.actor.effects.find(effect => effect.statuses.has("confused")) as ActiveEffectPTR2e | undefined;
    if (!confusedEffect) return;

    if(this.actor.rollOptions.getFromDomain("immunities")["damage:affliction:confused"]) return;

    const roll = await new Roll("1dcc").roll();
    await roll.toMessage({ flavor: game.i18n.format("PTR2E.Combat.Messages.ConfusionRoll", { name: this.parent.name }) });
    const success = !!roll.total;
    if (success) return void await ChatMessage.create({
      type: "combat",
      flavor: game.i18n.format("PTR2E.Combat.Messages.ConfusionRollSuccess", { name: this.parent.name }),
    });

    const existingFumble = this.actor.actions.attack.get("fumble");
    const fumble = existingFumble ?? await fromUuid<ItemPTR2e>("Compendium.ptr2e.core-moves.Item.xoFyO6Z8yZJ9Ko8e");
    if (!fumble) return void await ChatMessage.create({
      type: "combat",
      flavor: "An error occured trying to resolve Fumble. Please resolve it manually."
    })
    try {
      if (!existingFumble) {
        await this.actor.createEmbeddedDocuments("Item", [fumble.toObject()]);
      }

      await this.actor.actions.attack.get("fumble")!.roll({ targets: [this.actor], skipDialog: true });
    }
    catch {
      return void await ChatMessage.create({
        type: "combat",
        flavor: "An error occured trying to resolve Fumble. Please resolve it manually."
      });
    }
  }

  static calculateBaseAV(
    actor: ActorPTR2e | null,
    combat: CombatPTR2e,
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
    if (!summons?.length) return;

    for (const summon of summons) {
      summon.system.notifyActorsOfEffectsIfApplicable([this.parent]);
    }
  }

  override _preDelete(
    _options: DocumentModificationContext<this["parent"]["parent"]>,
    _user: User
  ): Promise<boolean | void> {
    if (this.combat.combatant?.id === this.parent.id) return Promise.resolve(false);
    return super._preDelete(_options, _user);
  }

  override _onCreate(data: object, options: object, userId: string): void {
    super._onCreate(data, options, userId);
    this.handleSummonEffects();
  }

  override _onDelete(options: object, userId: string): void {
    super._onDelete(options, userId);
    this.handleSummonEffects();
  }
}

export default CharacterCombatantSystem;
