import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { CombatantPTR2e } from "@combat";
import TypeDataModel from "types/foundry/common/abstract/type-data.js";
import { CombatantSchema } from "types/foundry/common/documents/combatant.js";
import BaseActor from "types/foundry/common/documents/actor.js";
import BaseUser from "types/foundry/common/documents/user.js";

class CombatPTR2e extends Combat {

    get averageLevel(): number {
        return this._averageLevel ||= this.combatants.reduce((acc, combatant) => {
            if (!combatant.actor) return acc;
            return acc + combatant.actor.level;
        }, 0) / (this.combatants.size || 1);
    }

    override async rollInitiative(maybeIds: string | string[], { updateTurn = true }: RollInitiativeOptions = {}): Promise<this> {
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
            await this.update({ turn: this.turns.findIndex(t => t.id === currentId) });
        }

        return this;
    }

    _idToUpdateBaseInitiativeArray(ids: string[]): { _id: string; initiative: number; }[] {
        return ids.flatMap((id) => {
            const combatant = this.combatants.get(id);
            if (!combatant?.isOwner) return [];
            return { _id: id, initiative: combatant.baseAV };
        });
    }

    override _sortCombatants(a: CombatantPTR2e<this, TokenDocumentPTR2e | null>, b: CombatantPTR2e<this, TokenDocumentPTR2e | null>) {
        // Sort initiative ascending, then by speed descending
        const resolveTie = () => {
            // Sort by speed descending
            const speedA = a.actor?.speed ?? 0;
            const speedB = b.actor?.speed ?? 0;
            return speedB - speedA;
        }

        const ia = Number.isNumeric(a.initiative) ? a.initiative! : -Infinity;
        const ib = Number.isNumeric(b.initiative) ? b.initiative! : -Infinity;

        return typeof a.initiative === "number" && typeof b.initiative === "number" && a.initiative === b.initiative
            ? resolveTie()
            : (ia - ib) || (a.id > b.id ? 1 : -1);
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

            // @ts-ignore
            Hooks.callAll("combatTurn", this, updateData, { advanceTime: CONFIG.time.turnTime, direction: 1 });

            if (game.user.isGM) {
                return this.update(updateData) as Promise<this>
            }
            else {
                await this.updateEmbeddedDocuments("Combatant", updateData.combatants as EmbeddedDocumentUpdateData[])
                delete updateData.combatants;
                return this.update(updateData) as Promise<this>
            }
        }
        catch (error: any) {
            ui.notifications.error(error.message)
        }
        return this;
    }

    /**
     * Advances forward to the next turn in the Combat turn order
     * @returns An object with the data to update the combat with
     */
    _prepareTurnUpdateData(): { turn?: number; round?: number; combatants?: { _id: string; initiative: number; }[] } {
        const turn = this.turn ?? -1;
        const getNext = (from: number) => {
            for (let i = from + 1; i < this.turns.length; i++) {
                if (this.turns[i].isDefeated) continue;
                return i;
            }
            throw new Error("No valid combatant found to take the next turn.");
        }
        const next = getNext(turn);

        const currentCombatant = this.combatant;
        const nextCombatant = this.turns[next];

        const updateData: Record<string, unknown> = { turn: 0 };
        if (this.turn === null) updateData.turn = 0;
        const combatantUpdateData: {
            [key: string]: {
                _id: string;
                initiative: number;
            }
        } = {};

        // Reduce everyone's initiative by the current combatant's initiative
        let initiativeReduction = nextCombatant.initiative ?? 0;
        if (nextCombatant.type === "round") {
            const afterRound = this.turns[getNext(next)];
            if (!afterRound) {
                ui.notifications.warn("Only one combatant left in the turn order. Unable to advance to the next turn.")
                return {};
            }
            initiativeReduction += afterRound.initiative ?? 0;
            combatantUpdateData[nextCombatant._id] = {
                _id: nextCombatant._id,
                initiative: Math.max(0, nextCombatant.baseAV - initiativeReduction)
            };
            updateData.round = (this.round ?? -1) + 1;
        }

        // Unless the combat hasn't started yet, reset the current initiative to their BaseAV.
        if (currentCombatant) {
            combatantUpdateData[currentCombatant._id] = {
                _id: currentCombatant._id,
                initiative: Math.max(0, currentCombatant.baseAV - initiativeReduction)
            };
        }

        for (const combatant of this.turns) {
            if (combatantUpdateData[combatant._id]) continue;
            if (combatant.defeated) continue;
            combatantUpdateData[combatant._id] = {
                _id: combatant._id,
                initiative: Math.max(0, (combatant.initiative ?? 0) - initiativeReduction)
            };
        }

        updateData.combatants = Object.values(combatantUpdateData);
        return updateData;
    }

    override nextRound(): Promise<this> {
        throw new Error("Skipping to next round is not possible. Please use nextTurn to advance initiative.");
    }
    override previousRound(): Promise<this> {
        throw new Error("Reversing initiative is not possible. Please use nextTurn to advance initiative.");
    }
    override previousTurn(): Promise<this> {
        throw new Error("Reversing initiative is not possible. Please use nextTurn to advance initiative.");
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
        if (advanceRound && (this.previous.round !== null)) await this._onEndRound();

        // Begin the new round
        if (advanceRound) await this._onStartRound();

        // Begin a new Combatant turn
        const next = this.combatant;
        if ((advanceTurn || changeCombatant) && next) await this._onStartTurn(this.combatant as CombatantPTR2e<this, TokenDocumentPTR2e | null>);
    }

    async resetEncounter(): Promise<this | undefined> {
        const inits = this._idToUpdateBaseInitiativeArray(this.combatants.map((c) => c.id));
        const updateData = {
            round: 0,
            turn: null,
            combatants: inits,
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

    protected override async _preCreate(data: this["_source"], options: DocumentModificationContext<null>, user: BaseUser<BaseActor<null>>): Promise<boolean | void> {
        await super._preCreate(data, options, user);

        const round = new CONFIG.Combatant.documentClass({
            name: game.i18n.localize("PTR2E.Combat.Round.Name"),
            img: "icons/svg/clockwork.svg",
            type: "round",
            initiative: 100
        })
        const combatants = this.combatants.map(c => c.toObject());
        combatants.push(round.toObject());
        this.updateSource({ combatants });
    }

    protected override _onCreateDescendantDocuments(parent: this, collection: "combatants", documents: Combatant<this, TokenDocument<Scene | null> | null, TypeDataModel>[], data: SourceFromSchema<CombatantSchema<string, TypeDataModel>>[], options: DocumentModificationContext<this>, userId: string): void {
        super._onCreateDescendantDocuments(parent, collection, documents, data, options, userId);
        this._averageLevel = null;

        const inits = this._idToUpdateBaseInitiativeArray((this.round === 0) ? this.combatants.map(c => c.id) : documents.map(c => c._id!));
        this.updateEmbeddedDocuments("Combatant", inits);
    }

    protected override _onDeleteDescendantDocuments(parent: this, collection: "combatants", documents: Combatant<this, TokenDocument<Scene | null> | null, TypeDataModel>[], ids: string[], options: DocumentModificationContext<this>, userId: string): void {
        super._onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId);
        this._averageLevel = null;

        if (this.round === 0) {
            const inits = this._idToUpdateBaseInitiativeArray(this.combatants.map((c) => c.id));
            this.updateEmbeddedDocuments("Combatant", inits);
        }
    }

    // @ts-ignore
    // // @ts-ignore
    // override async createEmbeddedDocuments(embeddedName = "Combatant", data, context = {}) {
    //     const createData = data.filter((datum: { tokenId: string; }) => {
    //         const token = canvas.tokens.placeables.find((canvasToken) => canvasToken.id === datum.tokenId);
    //         if (!token) return false;

    //         const { actor } = token;
    //         if (!actor) {
    //             ui.notifications.warn(`${token.name} has no associated actor.`);
    //             return false;
    //         }

    //         // TODO: Add actor types that cannot be part of combat here

    //         return true;
    //     })
    //     return super.createEmbeddedDocuments(embeddedName, createData, context);
    // }

    // override async rollInitiative(ids: any[], options: {
    //     messageOptions?: any;
    //     rollMode?: string;
    //     secret?: boolean;
    //     temporary?: boolean;
    //     extraRollOptions?: string[];
    // } = {}): Promise<any> {
    //     const extraRollOptions = options.extraRollOptions ?? [];
    //     //const rollMode = options.messageOptions?.rollMode ?? options.rollMode ?? game.settings.get("core", "rollMode");
    //     if (options.secret) extraRollOptions.push("secret");

    //     const combatants = ids.flatMap(
    //         (id) => this.combatants.get(id) ?? []
    //     );

    //     //@ts-ignore
    //     const fightyCombatants = combatants.filter((c) => !!c.actor?.speed);
    //     /**
    //      * @type {{initiative: number, _id: string}[]}}
    //      */
    //     const initiatives = await Promise.all(
    //         fightyCombatants.map(async (combatant) => {
    //             const actor = combatant.actor;
    //             if (!actor) return { initiative: 0, _id: combatant.id };
    //             const data = {
    //                 initiative: Math.round(
    //                     (
    //                         500 *
    //                         (1 + ((combatant.actor.level - 5) * 21) / 95) // Hardcoded level 10 for now
    //                     )
    //                     / combatant.actor.speed
    //                 ),
    //                 _id: combatant.id,
    //             }
    //             await combatant.setFlag("ptr2e", "baseAV", data.initiative)
    //             return data;
    //         })
    //     );

    //     if (options.temporary) return initiatives;
    //     return this.setMultipleInitiatives(initiatives);

    //     // Roll the rest with the parent method
    //     const remainingIds = ids.filter((id) => !fightyCombatants.some((c) => c.id === id));
    //     console.warn(remainingIds)
    //     // return super.rollInitiative(remainingIds, options);
    // }

    // /**
    //  * Set the initiative of multiple combatants at once.
    //  * @param {{initiative: number, _id: string}[]} initiatives 
    //  */
    // async setMultipleInitiatives(initiatives: { initiative: number; _id: string; }[]) {
    //     const update = {
    //         combatants: initiatives,
    //     } as {
    //         combatants: { initiative: number; _id: string; }[];
    //         turn?: number;
    //     }
    //     if (this.combatant?.id) update.turn = 0;

    //     return this.update(update);
    // }


    // override async nextTurn(): Promise<this> {
    //     const turn = this.turn ?? -1;

    //     // Determine the next turn number
    //     let next = null;
    //     let nextRound = false;
    //     for (let [i, t] of this.turns.entries()) {
    //         if (i <= turn) continue;
    //         // @ts-ignore
    //         if (t.hasActed) continue;
    //         if (this.settings.skipDefeated && t.isDefeated) continue;
    //         next = i;
    //         if (t.id === "roundsinitiative") nextRound = true;
    //         break;
    //     }

    //     // Maybe advance to the next round
    //     let round = this.round;
    //     if (nextRound) {
    //         await this.nextRound();
    //         return this;
    //     }

    //     // Update the document, passing data through a hook first
    //     const updateData = { round, turn: next };
    //     // @ts-ignore
    //     const updateOptions = { advanceTime: CONFIG.time.turnTime, direction: 1 };
    //     Hooks.callAll("combatTurn", this, updateData, updateOptions);
    //     await this.update(updateData, updateOptions);
    //     return this;
    // }

    // override async nextRound() {
    //     if (this.turn === null) return super.nextRound();

    //     const next = this.turns[(this.turn ?? 0) + 1];
    //     if (next?.id !== "roundsinitiative") {
    //         await super.nextRound();
    //         return this;
    //     }

    //     const current = this.combatant;
    //     const nextFightyCombattant = this.turns[(this.turn ?? 0) + 2];

    //     if (!current || !nextFightyCombattant) {
    //         await super.nextRound();
    //         return this;
    //     }

    //     const initiative = nextFightyCombattant.initiative;
    //     const updates = {
    //         turn: 0,
    //         round: this.round + 1,
    //         combatants: this.combatants.contents.flatMap((combatant) => { // @ts-ignore
    //             if (combatant.id === "roundsinitiative") return [{ _id: combatant.id, initiative: combatant.getFlag("ptr2e", "baseAV") - initiative }]; // @ts-ignore
    //             if (combatant.id === current.id && combatant.initiative === 0) return [{ _id: combatant.id, initiative: combatant.getFlag("ptr2e", "baseAV") - initiative }];
    //             if (combatant.id === nextFightyCombattant.id) return [{ _id: combatant.id, initiative: 0 }];
    //             if (combatant.initiative === 0) return []; // @ts-ignore
    //             return [{ _id: combatant.id, initiative: combatant.initiative - initiative }];
    //         })
    //     }
    //     const updateOptions = { direction: 1 };

    //     Hooks.callAll("combatRound", this, updates, updateOptions);
    //     await this.update(updates, updateOptions);
    //     return this;
    // }


    // override async previousTurn() {
    //     const backup = await this.getFlag("ptr2e", "stateBackup");
    //     // @ts-ignore
    //     if (backup?.length > 0) {
    //         // @ts-ignore
    //         const { combatants, round, turn } = backup.pop();
    //         if (combatants.some((c: { initiative: number; }) => c.initiative === 0)) {
    //             await this.update({
    //                 combatants,
    //                 round,
    //                 turn,
    //                 flags: {
    //                     ptr2e: {
    //                         stateBackup: backup
    //                     }
    //                 }
    //             });
    //             return this;
    //         }
    //     }
    //     if (this.round === 1) {
    //         await Dialog.confirm({
    //             title: "Restart Combat",
    //             content: "Are you sure you want to restart combat?",
    //             yes: () => {
    //                 return this.update({
    //                     round: 0,
    //                     turn: null,
    //                     combatants: this.combatants.contents.map((c) => ({ _id: c.id, initiative: null })),
    //                 });
    //             }
    //         });
    //         return this;
    //     }
    //     ui.notifications.warn("No previous turn to go back to.");
    //     return this;
    // }

    // override async update(data: Record<string, unknown>, options = {}) {
    //     if (!this.combatants.get("roundsinitiative")) {
    //         await Combatant.create({
    //             tokenId: undefined,
    //             actorId: undefined,
    //             _id: "roundsinitiative",
    //             name: "The Round",
    //             type: "round",
    //             img: "icons/svg/clockwork.svg",
    //             hidden: false,
    //             defeated: false,
    //             initiative: 100,
    //             flags: {
    //                 ptr2e: {
    //                     baseAV: 100
    //                 }
    //             }
    //         }, { parent: this, keepId: true, keepEmbeddedIds: true })
    //     }

    //     const noInits = this.combatants.contents.filter((c) => c.initiative === null);
    //     if (noInits.length > 0) {
    //         const initiatives = await this.rollInitiative(noInits.map((c) => c.id), { secret: true, temporary: true });
    //         data.combatants = data.combatants ?? []; // @ts-ignore
    //         data.combatants.push(...initiatives);
    //     }

    //     // @ts-ignore
    //     if (!data?.flags?.ptr2e?.stateBackup) {
    //         data.flags = data.flags ?? {};
    //         // @ts-ignore
    //         data.flags.ptr2e = data.flags.ptr2e ?? {};
    //         // @ts-ignore
    //         data.flags.ptr2e.stateBackup = this.flags?.ptr2e?.stateBackup ?? [];
    //         const newBackup = {
    //             combatants: this.combatants.contents.map((c) => ({ _id: c._id, initiative: c.initiative })),
    //             round: this.round,
    //             turn: 0
    //         }
    //         // @ts-ignore
    //         if (!fu.objectsEqual(data.flags.ptr2e.stateBackup.at(-1), newBackup)) data.flags.ptr2e.stateBackup.push(newBackup);
    //     }
    //     return super.update(data, options);
    // }

    // override _onUpdate(changed: DeepPartial<this["_source"]>, options: DocumentModificationContext<null>, userId: string) {
    //     super._onUpdate(changed, options, userId);

    //     if (!this.started) return;

    //     const { combatant, previous } = this;

    //     const [newRound, newTurn] = [changed.round, changed.turn];
    //     const isRoundChange = typeof newRound === "number";
    //     const isTurnChange = typeof newTurn === "number"; // @ts-ignore
    //     const isNewTurnUnacted = isTurnChange && this.turns[newTurn]?.hasActed === false;
    //     const isNextRound = isRoundChange && (previous.round === null || newRound > previous.round);
    //     const isNextTurn = isTurnChange && (previous.turn === null || newTurn > previous.turn || isNewTurnUnacted);

    //     // End early if no change
    //     if (!(isRoundChange || isTurnChange)) return;

    //     Promise.resolve()
    //         // .then(async () => {
    //         //     const noInits = this.combatants.contents.filter((c) => c.initiative === null);
    //         //     if (noInits.length > 0) await this.rollInitiative(noInits.map((c) => c.id), { secret: true });
    //         // })
    //         // .then(async () => {
    //         //     if (!this.combatants.get("roundsinitiative")) {
    //         //         await Combatant.create({
    //         //             tokenId: undefined,
    //         //             actorId: undefined,
    //         //             _id: "roundsinitiative",
    //         //             name: "The Round",
    //         //             img: "icons/svg/clockwork.svg",
    //         //             hidden: false,
    //         //             defeated: false,
    //         //             initiative: 100,
    //         //             flags: {
    //         //                 ptr2e: {
    //         //                     baseAV: 100
    //         //                 }
    //         //             }
    //         //         }, { parent: this, keepId: true, keepEmbeddedIds: true })
    //         //     }
    //         // })
    //         .then(async () => {
    //             if (isNextRound || isNextTurn) {
    //                 const previousCombatant = this.combatants.get(previous.combatantId ?? "");
    //                 // Only the primary updater of the previous actor can end their turn
    //                 if (game.user.isGM && previousCombatant) {
    //                     //if (game.user === previousCombatant?.actor?.primaryUpdater) {
    //                     // @ts-ignore
    //                     const alreadyWent = previousCombatant.roundOfLastTurnEnd === previous.round
    //                     if (typeof previous.round === "number" && !alreadyWent) {
    //                         // Handle actor specific turn end
    //                         // @ts-ignore
    //                         await previousCombatant.endTurn({ round: previous.round });
    //                     }
    //                 }

    //                 // Only the primary updater of the current actor can start their turn
    //                 // if (game.user === combatant?.actor?.primaryUpdater) {
    //                 if (game.user.isGM) {
    //                     // @ts-ignore
    //                     const alreadyWent = combatant?.roundOfLastTurn === this.round;
    //                     if (combatant && !alreadyWent) {
    //                         // Update everyone's initiative
    //                         if (newRound === 1 || !isNextRound) await this.updateInitiatives(previousCombatant!, combatant);

    //                         // Handle actor specific turn start
    //                         // @ts-ignore
    //                         await combatant.startTurn();
    //                     }
    //                 }
    //             }

    //             // // Reset all data to get updated encounter roll options
    //             // this.resetActors();
    //             // await game.ptu.effectTracker.refresh();
    //             // game.ptu.tokenPanel.refresh();
    //         });
    // }

    // async updateInitiatives(previousCombatant: CombatantPTR2e, newCombatant: CombatantPTR2e) {
    //     const combatants = this.combatants;
    //     const initiative = combatants.get(newCombatant.id)?.initiative;

    //     return this.setMultipleInitiatives(combatants.contents.flatMap((combatant) => {
    //         if (combatant.id === previousCombatant?.id) return [{ _id: combatant.id, initiative: (previousCombatant.getFlag("ptr2e", "baseAV") as number) - initiative! }];
    //         if (combatant.id === newCombatant.id && combatant.initiative !== 0) return [{ _id: combatant.id, initiative: 0 }];
    //         if (combatant.initiative === 0) return [];
    //         return [{ _id: combatant.id, initiative: combatant.initiative! - initiative! }];
    //     }));
    // }



    // override async _manageTurnEvents(adjustedTurn: number | undefined) {
    //     if (this.previous || game.release.build >= 308)
    //         return super._manageTurnEvents(adjustedTurn);
    // }
}

interface CombatPTR2e extends Combat {
    readonly combatants: foundry.abstract.EmbeddedCollection<CombatantPTR2e<this, TokenDocumentPTR2e | null>>

    _averageLevel: number | null;
}

export { CombatPTR2e };