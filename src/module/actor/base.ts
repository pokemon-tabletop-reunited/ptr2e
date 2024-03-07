import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { ActorSystemPTR2e } from "@actor";
import { ActiveEffectPTR2e } from "@module/effects/document.ts";
import { ActionPTR2e, ActionType } from "@module/data/models/action.ts";

class ActorPTR2e<TSystem extends ActorSystemPTR2e = ActorSystemPTR2e, TParent extends TokenDocumentPTR2e | null = TokenDocumentPTR2e | null> extends Actor<TParent, TSystem> {

    get traits() {
        return this.system.traits;
    }

    get attributes() {
        return this.system.attributes;
    }

    get actions() {
        return this._actions;
    }

    /** 
     * Step 1 - Copies data from source object to instance attributes
     * */
    override _initialize() {
        const preparationWarnings = new Set<string>();
        this.synthetics = {
            ephemeralEffects: { all: [], damage: [] },
            damageDice: { damage: [], healing: [] },
            modifierAdjustments: { all: [], damage: [] },
            statisticsModifiers: { all: [], damage: [] },
            preparationWarnings: {
                add: (warning: string) => preparationWarnings.add(warning),
                flush: fu.debounce(() => {
                    for (const warning of preparationWarnings) {
                        console.warn(warning);
                    }
                    preparationWarnings.clear();
                }, 10), // 10ms also handles separate module executions
            },
        }

        this._actions = {
            generic: new Map(),
            attack: new Map(),
            exploration: new Map(),
            downtime: new Map(),
            camping: new Map(),
            passive: new Map(),
        }

        super._initialize();
    }

    /** 
     * Step 2 - Prepare data for use by the instance. This method is called automatically by DataModel#_initialize workflow
     * The work done by this method should be idempotent. There are situations in which prepareData may be called more than once.
     * */
    override prepareData() {
        this.health = {
            percent: Math.floor(Math.random() * 100)
        }

        super.prepareData();
    }

    /**
     * Step 3 - Prepare data related to this Document itself, before any embedded Documents or derived data is computed.
     * */
    override prepareBaseData() {
        return super.prepareBaseData();
    }

    /** 
     * Step 4 - Prepare all embedded Document instances which exist within this primary Document.
     * */
    override prepareEmbeddedDocuments() {
        return super.prepareEmbeddedDocuments();
    }

    /** 
     * Step 5 - Apply transformations or derivations to the values of the source data object.
     * Compute data fields whose values are not stored to the database.
     * */
    override prepareDerivedData() {
        return super.prepareDerivedData();
    }

    /**
     * Apply any transformations to the Actor data which are caused by ActiveEffects.
     */
    override applyActiveEffects() {
        this.statuses ??= new Set();
        // Identify which special statuses had been active
        const specialStatuses = new Map();
        for (const statusId of Object.values(CONFIG.specialStatusEffects)) {
            specialStatuses.set(statusId, this.statuses.has(statusId));
        }
        this.statuses.clear();

        // Organize non-disabled effects by their application priority
        const changes = [];
        for (const effect of this.allApplicableEffects() as Generator<ActiveEffectPTR2e<ActorPTR2e>, void, void>) {
            if (!effect.active) continue;
            changes.push(...effect.changes.map(change => {
                const c = foundry.utils.deepClone(change);
                c.priority = c.priority ?? (c.mode * 10);
                return c;
            }));
            for (const statusId of effect.statuses) this.statuses.add(statusId);
        }
        changes.sort((a, b) => a.priority! - b.priority!);

        // Apply all changes
        for (const change of changes) {
            change.apply(this);
        }

        // Apply special statuses that changed to active tokens
        let tokens;
        for (const [statusId, wasActive] of specialStatuses) {
            const isActive = this.statuses.has(statusId);
            if (isActive === wasActive) continue;
            tokens ??= this.getActiveTokens();
            for (const token of tokens) token._onApplyStatusEffect(statusId, isActive);
        }
    }

    /**
     * Toggle the perk tree for this actor
     * @param {boolean} active 
     */
    async togglePerkTree(active: boolean) {
        if ((game.ptr.tree.actor === this) && (active !== true)) return game.ptr.tree.close();
        else if (active !== false) return game.ptr.tree.open(this);
        return;
    }

    getRollOptions(): string[] {
        return [];
    }

    /**
     * Debug only method to get all effects.
     * @remarks
     * Marked as deprecated because it is not intended for use in production code.
     * @deprecated
     */
    get allEffects() {
        const effects = [];
        for (const effect of this.allApplicableEffects()) {
            effects.push(effect);
        }
        return effects;
    }

    protected override _onEmbeddedDocumentChange(): void {
        super._onEmbeddedDocumentChange();

        // Send any accrued warnings to the console
        this.synthetics.preparationWarnings.flush();
    }
}

interface ActorPTR2e<TSystem extends ActorSystemPTR2e = ActorSystemPTR2e, TParent extends TokenDocumentPTR2e | null = TokenDocumentPTR2e | null> extends Actor<TParent, TSystem> {
    health: {
        percent: number
    }
    synthetics: ActorSynthetics
    
    _actions: Record<ActionType, Map<string, ActionPTR2e>>;

    level: number
}

export { ActorPTR2e }