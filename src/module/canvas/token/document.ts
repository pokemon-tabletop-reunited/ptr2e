import { ActorPTR2e, ActorSystemPTR2e } from "@actor";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import { TokenFlagsPTR2e } from "@module/canvas/token/data.ts";
import { ScenePTR2e } from "../scene.ts";
import { CombatantPTR2e, CombatPTR2e } from "@combat";
// TODO: Fix circular dependency when imported from @combat
import CharacterCombatantSystem from "../../combat/combatant/models/character.ts";
import { TokenAura } from "./aura/aura.ts";

class TokenDocumentPTR2e<TParent extends ScenePTR2e | null = ScenePTR2e | null> extends TokenDocument<TParent> {

  /** This should be in Foundry core, but ... */
  get scene(): this["parent"] {
    return this.parent;
  }

  /** The pixel-coordinate definition of this token's space */
  get bounds(): PIXI.Rectangle {
    const gridSize = this.scene?.grid.size ?? 100;
    // Use source values since coordinates are changed in real time over the course of movement animation
    return new PIXI.Rectangle(this._source.x, this._source.y, this.width * gridSize, this.height * gridSize);
  }

  /** Bounds used for mechanics, such as flanking and drawing auras */
  get mechanicalBounds(): PIXI.Rectangle {
    const bounds = this.bounds;
    if (this.width < 1) {
      const position = canvas.grid.getTopLeftPoint({
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2,
      });
      return new PIXI.Rectangle(
        position.x,
        position.y,
        Math.max(canvas.grid.size, bounds.width),
        Math.max(canvas.grid.size, bounds.height),
      );
    }

    return bounds;
  }

  /** The pixel-coordinate pair constituting this token's center */
  get center(): Point {
    const bounds = this.bounds;
    return {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };
  }

  get playersCanSeeName(): boolean {
    const anyoneCanSee: TokenDisplayMode[] = [CONST.TOKEN_DISPLAY_MODES.ALWAYS, CONST.TOKEN_DISPLAY_MODES.HOVER];
    const nameDisplayMode = this.displayName;
    return anyoneCanSee.includes(nameDisplayMode) || this.actor?.alliance === "party";
  }

  protected override _initialize(options?: Record<string, unknown>): void {
    this.initialized = false;
    this.auras = new Map();
    super._initialize(options);
  }

  /**
   * If embedded, don't prepare data if the parent hasn't finished initializing.
   * @removeme in V13
   */
  override prepareData(): void {
    if (game.release.generation === 12 && (this.initialized || (this.parent && !this.parent.initialized))) {
      return;
    }
    this.initialized = true;
    super.prepareData();
  }

  override prepareBaseData(): void {
    super.prepareBaseData();

    const actor = this.actor;
    if (!actor) return;

    const tokenOverrides = actor.synthetics.tokenOverrides;
    this.name = tokenOverrides.name ?? this.name;
    this.alpha = tokenOverrides.alpha ?? this.alpha;

    if (tokenOverrides.texture) {
      this.texture.src = tokenOverrides.texture.src;
      if ("scaleX" in tokenOverrides.texture) {
        this.texture.scaleX = tokenOverrides.texture.scaleX;
        this.texture.scaleY = tokenOverrides.texture.scaleY;
        this.flags.ptr2e.autoscale = false;
      }
      this.texture.tint = tokenOverrides.texture.tint ?? this.texture.tint;
    }

    if (tokenOverrides.light) {
      this.light = new foundry.data.LightData(tokenOverrides.light, { parent: this });
    }

    for (const [key, data] of actor.auras.entries()) {
      this.auras.set(key, new TokenAura({ token: this, ...fu.deepClone(data) }));
    }
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

  initialized: boolean;
  auras: Map<string, TokenAura>;

  get actor(): ActorPTR2e<ActorSystemPTR2e, this | null> | null;
  get combatant(): Combatant<Combat, this> | null;
  get object(): TokenPTR2e<this> | null;
  get sheet(): TokenConfig<this>;
}

export { TokenDocumentPTR2e }