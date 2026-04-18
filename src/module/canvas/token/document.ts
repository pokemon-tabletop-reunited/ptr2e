import { ActorPTR2e, ActorSystemPTR2e } from "@actor";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import { TokenFlagsPTR2e } from "@module/canvas/token/data.ts";
import { ScenePTR2e } from "../scene.ts";
import { CombatantPTR2e, CombatPTR2e } from "@combat";
// TODO: Fix circular dependency when imported from @combat
import CharacterCombatantSystem from "../../combat/combatant/models/character.ts";
import { TokenAura } from "./aura/aura.ts";
// import { TokenConfigPTR2e } from "./sheet.ts";
import BaseUser from "types/foundry/common/documents/user.js";
import { ActiveEffectPTR2e } from "@effects";

class TokenDocumentPTR2e<TParent extends ScenePTR2e | null = ScenePTR2e | null> extends TokenDocument<TParent> {

  debouncedRender = foundry.utils.debounce(this.renderActorSheet.bind(this), 250);

  get objectFromLayer() {
    return this.object ?? this.layer?.get(this.id) ?? null;
  }

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

  get movementType() {
    if (this.actor) return this.actor.movementType;
    const type = this.getFlag("ptr2e", "movementType") as string;
    if (type in CONFIG.Token.movement.actions) return type;
    else return CONFIG.Token.movement.defaultAction;
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

    this.flags = fu.mergeObject(this.flags, { ptr2e: {} });
    const actor = this.actor;
    if (!actor) return;

    this.actor.system.movementType = this.movementAction

    // Dimensions and scale
    const autoscaleDefault = game.ptr.settings.tokens.autoscale;
    const linkDefault = autoscaleDefault && (["humanoid", "pokemon"] as string[]).includes(actor.type);
    const linkToActorSize = this.flags.ptr2e?.linkToActorSize ?? linkDefault;

    // Autoscaling is a secondary feature of linking to actor size
    const autoscale = linkToActorSize ? (this.flags.ptr2e.autoscale ?? autoscaleDefault) : false;
    this.flags.ptr2e = fu.mergeObject(this.flags.ptr2e ?? {}, { linkToActorSize, autoscale });

    // Add token overrides from effects
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

    // Alliance coloration, appropriating core token dispositions
    const alliance = actor.system.details.alliance;
    this.disposition =
      this.disposition === CONST.TOKEN_DISPOSITIONS.SECRET
        ? CONST.TOKEN_DISPOSITIONS.SECRET
        : alliance
          ? {
            party: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
            opposition: CONST.TOKEN_DISPOSITIONS.HOSTILE,
          }[alliance]
          : CONST.TOKEN_DISPOSITIONS.NEUTRAL;

    for (const [key, data] of actor.auras.entries()) {
      this.auras.set(key, new TokenAura({ token: this, ...fu.deepClone(data) }));
    }
  }

  override prepareDerivedData(): void {
    super.prepareDerivedData();
    this.registerSpentMovement();
  }

  registerSpentMovement(reset?: boolean): void {
    if (!this.actor || !canvas.ready || !game.ready) return;
    this.actor.system.movementType = this.movementAction
    if (reset === true) {
      for (const movement in this.actor.system.movement) {
        this.actor.system.movement[movement].available = this.actor.system.movement[movement].value;
      }
    }
    else {
      if (this.movementHistory.length === 0 || this.movementHistory.every(w => w.action === "walk")) return;
      this.actor.system.registerSpentMovement(this.objectFromLayer!);
    }

    if (this.actor.sheet?.rendered && !this.actor.sheet.minimized) {
      this.debouncedRender?.();
    }
    //@ts-expect-error - Outdated types
    if (ui.hotbar.token === this.objectFromLayer) {
      //@ts-expect-error - Outdated types
      ui.hotbar.updateFooterMovement();
    }
  }

  waiting = false;
  async renderActorSheet(): Promise<void> {
    if (this.waiting) return;
    if (this.objectFromLayer && this.objectFromLayer?.movementAnimationPromise !== null) {
      this.waiting = true;
      await this.objectFromLayer.movementAnimationPromise;
      this.waiting = false;
    }

    if (this.actor?.sheet?.rendered && !this.actor.sheet.minimized) {
      //@ts-expect-error - Outdated types
      this.actor.sheet.render({ force: true });
    }
  }

  /**
   * Whenever the token's actor delta changes, or the base actor changes, perform associated refreshes.
   * @param {object|object[]} [update]                               The update delta.
   * @param {Partial<DatabaseUpdateOperation>} [operation]  The database operation that was performed
   * @protected
   */
  protected override _onRelatedUpdate(update: Record<string, unknown> = {}, options: DocumentModificationContext<null> = {}): void {
    super._onRelatedUpdate(update, options);

    this.registerSpentMovement();

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

  /** Set a TokenData instance's dimensions from actor data. Static so actors can use for their prototypes */
  static prepareSize(token: TokenDocumentPTR2e, { linkToActorSize = !!token.flags.ptr2e.linkToActorSize, autoscale = !!token.flags.ptr2e.autoscale }: { linkToActorSize?: boolean, autoscale?: boolean } = {}): { width: number; height: number, scaleX: number, scaleY: number } | null {
    const actor = token.actor;
    if (!(actor && linkToActorSize)) return null;

    // If not overridden by an actor override, set according to creature size (skipping gargantuan)
    const size = actor.dimensions; // In case an AE-like corrupted actor size data
    const result = {
      width: token.width,
      height: token.height,
      scaleX: token.texture.scaleX,
      scaleY: token.texture.scaleY,
    }

    if (token.width !== size.width || token.height !== size.length) {
      result.width = size.width;
      result.height = size.length;
    }

    if (game.ptr.settings.tokens.autoscale && autoscale !== false) {
      const absoluteScale = ["diminutive", "tiny", "small"].includes(actor.size.value) ? 0.75 : 1;
      const mirrorX = token.texture.scaleX < 0 ? -1 : 1;
      result.scaleX = mirrorX * absoluteScale;
      const mirrorY = token.texture.scaleY < 0 ? -1 : 1;
      result.scaleY = mirrorY * absoluteScale;
    }
    return result;
  }

  protected override async _preCreate(data: this["_source"], options: DocumentModificationContext<TParent>, user: BaseUser): Promise<boolean | void> {
    const result = await super._preCreate(data, options, user);
    if (result === false) return false;

    const flags = {
      autoscale: !!this.flags.ptr2e.autoscale,
      linkToActorSize: !!this.flags.ptr2e.linkToActorSize,
    }
    if ('flags' in data && typeof data.flags === "object" && data.flags && 'ptr2e' in data.flags && typeof data.flags.ptr2e === "object" && data.flags.ptr2e) {
      if ('autoscale' in data.flags.ptr2e) {
        flags.autoscale = !!data.flags.ptr2e.autoscale;
      }
      if ('linkToActorSize' in data.flags.ptr2e) {
        flags.linkToActorSize = !!data.flags.ptr2e.linkToActorSize;
      }
    }
    const size = TokenDocumentPTR2e.prepareSize(this, flags);

    if (size) {
      const { width, height, scaleX, scaleY } = size;
      if (width !== this.width || height !== this.height) {
        this.updateSource({ width, height });
      }
      if (scaleX !== this.texture.scaleX || scaleY !== this.texture.scaleY) {
        this.updateSource({ texture: { scaleX, scaleY } });
      }
    }
  }

  //@ts-expect-error - Outdated types
  override async move(waypoints, options = {}): Promise<boolean> {
    if (!Array.isArray(waypoints)) waypoints = [waypoints];

    const size = TokenDocumentPTR2e.prepareSize(this);
    if (size) {
      const { width, height } = size;
      for (const waypoint of waypoints) {
        if (waypoint.width !== width || waypoint.height !== height) {
          waypoint.width = width;
          waypoint.height = height;
        }
      }
    }

    //@ts-expect-error - Outdated types
    return super.move(waypoints, options);
  }

  protected override async _preUpdate(changed: Record<string, unknown>, options: TokenUpdateContext<TParent>, user: User): Promise<boolean | void> {
    const allowed = await super._preUpdate(changed, options, user);
    if (allowed === false) return false;

    const flags = {
      autoscale: !!this.flags.ptr2e.autoscale,
      linkToActorSize: !!this.flags.ptr2e.linkToActorSize,
    }
    if ('flags' in changed && typeof changed.flags === "object" && changed.flags && 'ptr2e' in changed.flags && typeof changed.flags.ptr2e === "object" && changed.flags.ptr2e) {
      if ('autoscale' in changed.flags.ptr2e) {
        options.autoscale = !!changed.flags.ptr2e.autoscale;
      }
      if ('linkToActorSize' in changed.flags.ptr2e) {
        options.linkToActorSize = !!changed.flags.ptr2e.linkToActorSize;
      }
    }

    const size = TokenDocumentPTR2e.prepareSize(this, flags);
    if (size) {
      const { scaleX, scaleY } = size
      if (scaleX !== this.texture.scaleX || scaleY !== this.texture.scaleY) {
        changed.texture = changed.texture || {};
        (changed.texture as { scaleX: number }).scaleX = scaleX;
        (changed.texture as { scaleY: number }).scaleY = scaleY;
      }
    }
  }

  protected override _preDelete(options: DocumentModificationContext<TParent>, user: User): Promise<boolean | void> {
    if (this.actor) {
      if (this.actor.statuses.has("stuck")) {
        ui.notifications.warn("PTR2E.TokenDeleteWarning", { localize: true })
        return Promise.resolve(false);
      }

      if (this.isLinked) {
        // Check for any effects that should be deleted on recall
        const effects: ActiveEffectPTR2e[] = [];
        for (const effect of this.actor.effects.contents as ActiveEffectPTR2e[]) {
          if (!effect.system.removeOnRecall) continue;

          effects.push(effect);
        }
        if (effects.length > 0) {
          (async () => {
            if (!effects) return;
            foundry.applications.api.DialogV2.prompt({
              window: {
                title: "Delete Effects on Recall",
              },
              content: await (async () => {
                const htmlString = `<p>The following effects are marked to be deleted on recall</p><ul>${effects.map(effect => `<li>${effect.link}</li>`).join('')}</ul><p>Do you want to delete them now?</p>`;
                const html = globalThis.document.createElement("div");
                html.innerHTML = await foundry.applications.ux.TextEditor.enrichHTML(htmlString);
                return html;
              })(),
              ok: {
                action: "delete",
                label: "Delete",
                callback: async () => {
                  if (effects[0].parent) await effects[0].parent.deleteEmbeddedDocuments("ActiveEffect", effects.map(e => e.id));
                },
              },
            });
          })()
        }
      }
    }



    return super._preDelete(options, user);
  }
}

interface TokenDocumentPTR2e<TParent extends ScenePTR2e | null = ScenePTR2e | null> extends TokenDocument<TParent> {
  flags: TokenFlagsPTR2e;

  movementAction: string;

  initialized: boolean;
  auras: Map<string, TokenAura>;

  get actor(): ActorPTR2e<ActorSystemPTR2e, this | null> | null;
  get combatant(): Combatant<Combat, this> | null;
  get object(): TokenPTR2e<this> | null;
}

export { TokenDocumentPTR2e }