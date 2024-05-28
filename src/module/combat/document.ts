import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import {
    CombatantPTR2e,
    CombatantSystemPTR2e,
    CombatSystemPTR2e,
    RoundCombatantSystem,
} from "@combat";
import TypeDataModel from "types/foundry/common/abstract/type-data.js";
import { CombatantSchema } from "types/foundry/common/documents/combatant.js";
import { ActorPTR2e } from "@actor";

class CombatPTR2e extends Combat<CombatSystemPTR2e> {
    get averageLevel(): number {
        return (this._averageLevel ||=
            this.combatants.reduce((acc, combatant) => {
                if (!combatant.actor) return acc;
                return acc + combatant.actor.level;
            }, 0) / ((this.combatants.size - 1) || 1));
    }

    get roundCombatant(): CombatantPTR2e<this, null, RoundCombatantSystem> {
        return this.combatants.get(RoundCombatantSystem.id) as CombatantPTR2e<
            this,
            null,
            RoundCombatantSystem
        >;
    }

    get roundIndex(): number {
        return this.turns.findIndex((c) => c.id === RoundCombatantSystem.id);
    }

    override async rollInitiative(
        maybeIds: string | string[],
        { updateTurn = true }: RollInitiativeOptions = {}
    ): Promise<this> {
        // Structure input data
        const ids = typeof maybeIds === "string" ? [maybeIds] : maybeIds;
        const currentId = this.combatant?.id;

        // Iterate over Combatants, performing an initiative roll for each
        const updates = this._idToUpdateBaseInitiativeArray(ids);
        if (!updates.length) return this;

        // Update multiple combatants
        await this.updateEmbeddedDocuments("Combatant", updates);

        // Ensure the turn order remains with the same combatant
        if (updateTurn && currentId) {
            await this.update({ turn: this.turns.findIndex((t) => t.id === currentId) });
        }

        return this;
    }

    _idToUpdateBaseInitiativeArray(ids: string[]): { _id: string; initiative: number }[] {
        return ids.flatMap((id) => {
            const combatant = this.combatants.get(id);
            if (!combatant?.isOwner) return [];
            return { _id: id, initiative: combatant.baseAV };
        });
    }

    override _sortCombatants(
        a: CombatantPTR2e<this, TokenDocumentPTR2e | null>,
        b: CombatantPTR2e<this, TokenDocumentPTR2e | null>
    ) {
        // Sort initiative ascending, then by speed descending
        const resolveTie = () => {
            // Sort by speed descending
            const speedA = a.actor?.speed ?? 0;
            const speedB = b.actor?.speed ?? 0;
            return speedB - speedA;
        };

        const ia = Number.isNumeric(a.initiative) ? a.initiative! : -Infinity;
        const ib = Number.isNumeric(b.initiative) ? b.initiative! : -Infinity;

        return typeof a.initiative === "number" &&
            typeof b.initiative === "number" &&
            a.initiative === b.initiative
            ? resolveTie()
            : ia - ib || (a.id > b.id ? 1 : -1);
    }

    override startCombat(): Promise<this> {
        this._playCombatSound("startEncounter");
        const updateData = this._prepareTurnUpdateData();
        updateData.round = 1;
        Hooks.callAll("combatStart", this, updateData);
        return this.update(updateData) as Promise<this>;
    }

    override async nextTurn(): Promise<this> {
        try {
            const updateData = this._prepareTurnUpdateData();

            Hooks.callAll("combatTurn", this, updateData, {
                // @ts-ignore
                advanceTime: CONFIG.time.turnTime,
                direction: 1,
            });

            // if (!game.user.isGM) {
            //     return this.update(updateData) as Promise<this>;
            // } else {
            await this.updateEmbeddedDocuments(
                "Combatant",
                updateData.combatants as EmbeddedDocumentUpdateData[]
            );
            delete updateData.combatants;
            return this.update(updateData) as Promise<this>;
            // }
        } catch (error: any) {
            ui.notifications.error(error.message);
        }
        return this;
    }

    /**
     * Advances forward to the next turn in the Combat turn order
     * @returns An object with the data to update the combat with
     */
    _prepareTurnUpdateData(): {
        turn?: number;
        round?: number;
        combatants?: { _id: string; initiative: number }[];
    } {
        const turn = this.turn ?? -1;
        const getNext = (from: number) => {
            for (let i = from + 1; i < this.turns.length; i++) {
                if (this.turns[i].isDefeated) continue;
                return i;
            }
            throw new Error("No valid combatant found to take the next turn.");
        };
        const next = getNext(turn);

        const currentCombatant = this.combatant;
        const nextCombatant = this.turns[next];

        const updateData: Record<string, unknown> = { turn: 0 };
        if (this.turn === null) updateData.turn = 0;
        const combatantUpdateData: {
            [key: string]: {
                _id: string;
                initiative: number;
                system?: Partial<CombatantSystemPTR2e["_source"]>;
            };
        } = {};

        // Reduce everyone's initiative by the current combatant's initiative
        let initiativeReduction = nextCombatant.initiative ?? 0;
        if (nextCombatant.type === "round") {
            const afterRound = this.turns[getNext(next)];
            if (!afterRound) {
                ui.notifications.warn(
                    "Only one combatant left in the turn order. Unable to advance to the next turn."
                );
                return {};
            }
            initiativeReduction += afterRound.initiative ?? 0;
            combatantUpdateData[nextCombatant._id] = {
                _id: nextCombatant._id,
                initiative: Math.max(0, nextCombatant.baseAV - initiativeReduction),
            };
            updateData.round = (this.round ?? -1) + 1;
        }

        // Unless the combat hasn't started yet, reset the current initiative to their BaseAV.
        if (currentCombatant) {
            combatantUpdateData[currentCombatant._id] = {
                _id: currentCombatant._id,
                initiative: Math.max(0, currentCombatant.baseAV - initiativeReduction),
                system: {
                    activationsHad: (currentCombatant.system.activations ?? 0) + 1,
                },
            };
        }

        for (const combatant of this.turns) {
            if (combatantUpdateData[combatant._id]) continue;
            if (combatant.defeated) continue;
            combatantUpdateData[combatant._id] = {
                _id: combatant._id,
                initiative: Math.max(0, (combatant.initiative ?? 0) - initiativeReduction),
            };
        }

        updateData.combatants = Object.values(combatantUpdateData);
        return this._prepareAdvanceEffectTurnData(updateData);
    }

    _prepareAdvanceEffectTurnData(
        data: ReturnType<CombatPTR2e["_prepareTurnUpdateData"]> & {
            system?: Partial<CombatSystemPTR2e["_source"]>;
        }
    ) {
        const currentTurn = this.system.turn;
        data.system ??= { turn: currentTurn + 1 };
        return data;
    }

    override nextRound(): Promise<this> {
        throw new Error(
            "Skipping to next round is not possible. Please use nextTurn to advance initiative."
        );
    }
    override previousRound(): Promise<this> {
        throw new Error(
            "Reversing initiative is not possible. Please use nextTurn to advance initiative."
        );
    }
    override previousTurn(): Promise<this> {
        throw new Error(
            "Reversing initiative is not possible. Please use nextTurn to advance initiative."
        );
    }

    /**
     * Exact copy of the original method, but with the call to this.update removed, as turns shouldn't advance.
     */
    protected override async _manageTurnEvents(_adjustedTurn?: number | undefined): Promise<void> {
        if (!game.users.activeGM?.isSelf) return;

        // Adjust the turn order before proceeding. Used for embedded document workflows
        //if (Number.isNumeric(adjustedTurn)) await this.update({ turn: adjustedTurn }, { turnEvents: false });
        if (!this.started) return;

        // Identify what progressed
        const advanceRound = this.current.round! > (this.previous.round ?? -1);
        const advanceTurn = this.current.turn! > (this.previous.turn ?? -1);
        const changeCombatant = this.current.combatantId !== this.previous.combatantId;
        if (!(advanceTurn || advanceRound || changeCombatant)) return;

        // Conclude the prior Combatant turn
        const prior = this.combatants.get(this.previous.combatantId!);
        if ((advanceTurn || changeCombatant) && prior) await this._onEndTurn(prior);

        // Conclude the prior round
        if (advanceRound && this.previous.round !== null) await this._onEndRound();

        // Begin the new round
        if (advanceRound) await this._onStartRound();

        // Begin a new Combatant turn
        const next = this.combatant;
        if ((advanceTurn || changeCombatant) && next)
            await this._onStartTurn(
                this.combatant as CombatantPTR2e<this, TokenDocumentPTR2e | null>
            );
    }

    async resetEncounter(): Promise<this | undefined> {
        const inits = this._idToUpdateBaseInitiativeArray(this.combatants.map((c) => c.id)).map(
            (u) => ({ ...u, system: { activationsHad: 0 } })
        );
        const updateData = {
            round: 0,
            turn: null,
            combatants: inits,
            system: { turn: 0 },
        };
        return this.update(updateData);
    }

    /**
     * Normally resets all combatants to a base initiative of null
     * However since no initiative needs to be rolled, we can skip this
     */
    override resetAll(): Promise<this> {
        return Promise.resolve(this);
    }

    protected override async _preCreate(
        data: this["_source"],
        options: DocumentModificationContext<null>,
        user: User
    ): Promise<boolean | void> {
        await super._preCreate(data, options, user);

        const round = new CONFIG.Combatant.documentClass({
            _id: "roundsinitiative",
            name: game.i18n.localize("PTR2E.Combat.Round.Name"),
            img: "icons/svg/clockwork.svg",
            type: "round",
            initiative: 100,
        }, { parent: this});
        const combatants = this.combatants.map((c) => c.toObject());
        combatants.push(round.toObject());
        this.updateSource({ combatants });
    }

    protected override _onCreateDescendantDocuments(
        parent: this,
        collection: "combatants",
        documents: Combatant<this, TokenDocument<Scene | null> | null, TypeDataModel>[],
        data: SourceFromSchema<CombatantSchema<string, TypeDataModel>>[],
        options: DocumentModificationContext<this>,
        userId: string
    ): void {
        super._onCreateDescendantDocuments(parent, collection, documents, data, options, userId);
        this._averageLevel = null;

        const inits = this._idToUpdateBaseInitiativeArray(
            this.round === 0 ? this.combatants.map((c) => c.id) : documents.map((c) => c._id!)
        );
        this.updateEmbeddedDocuments("Combatant", inits);

        const participants = new Set(
            [
                ...this.system.participants,
                ...this.combatants.map((c) => c.actor?.uuid ?? c.token?.uuid ?? []),
            ].flat()
        );
        this.update({ "system.participants": participants });
    }

    protected override _onDeleteDescendantDocuments(
        parent: this,
        collection: "combatants",
        documents: Combatant<this, TokenDocument<Scene | null> | null, TypeDataModel>[],
        ids: string[],
        options: DocumentModificationContext<this>,
        userId: string
    ): void {
        super._onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId);
        this._averageLevel = null;

        if (this.round === 0) {
            const inits = this._idToUpdateBaseInitiativeArray(this.combatants.map((c) => c.id));
            this.updateEmbeddedDocuments("Combatant", inits);
        }
    }

    protected override _onDelete(options: DocumentModificationContext<null>, userId: string): void {
        super._onDelete(options, userId);
    
        const participants = this.system.participants;
        for (const uuid of participants) {
            const actor = fromUuidSync(uuid);
            if(actor instanceof ActorPTR2e) actor.onEndCombat();
        }

    }
}

interface CombatPTR2e extends Combat<CombatSystemPTR2e> {
    readonly combatants: foundry.abstract.EmbeddedCollection<
        CombatantPTR2e<this, TokenDocumentPTR2e | null>
    >;

    _averageLevel: number | null;
}

export default CombatPTR2e;
