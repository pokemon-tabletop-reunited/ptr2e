// @ts-nocheck
export class PTRCombat extends Combat {
    /** @override */
    _sortCombatants(a, b) {
        // Sort initiative ascending, then by speed descending
        const resolveTie = () => {
            // Sort by speed descending
            const speedA = a.actor?.system.speed ?? 0;
            const speedB = b.actor?.system.speed ?? 0;
            return speedB - speedA;
        }

        const ia = Number.isNumeric(a.initiative) ? a.initiative : -Infinity;
        const ib = Number.isNumeric(b.initiative) ? b.initiative : -Infinity;

        return typeof a.initiative === "number" && typeof b.initiative === "number" && a.initiative === b.initiative
            ? resolveTie()
            : (ia - ib) || (a.id > b.id ? 1 : -1);
    }

    /** @override */
    async createEmbeddedDocuments(embeddedName = "Combatant", data, context = {}) {
        const createData = data.filter((datum) => {
            const token = canvas.tokens.placeables.find((canvasToken) => canvasToken.id === datum.tokenId);
            if (!token) return false;

            const { actor } = token;
            if (!actor) {
                ui.notifications.warn(`${token.name} has no associated actor.`);
                return false;
            }

            // TODO: Add actor types that cannot be part of combat here

            return true;
        })
        return super.createEmbeddedDocuments(embeddedName, createData, context);
    }

    /** @override */
    async rollInitiative(ids, options = {}) {
        const extraRollOptions = options.extraRollOptions ?? [];
        const rollMode = options.messageOptions?.rollMode ?? options.rollMode ?? game.settings.get("core", "rollMode");
        if (options.secret) extraRollOptions.push("secret");

        const combatants = ids.flatMap(
            (id) => this.combatants.get(id) ?? []
        );
        const fightyCombatants = combatants.filter((c) => !!c.actor?.system?.speed);
        /**
         * @type {{initiative: number, _id: string}[]}}
         */
        const initiatives = await Promise.all(
            fightyCombatants.map(async (combatant) => {
                // (500 * (1 + ((level - 5) * 21) / 95)) / speed
                const data = {
                    initiative: Math.round(
                        (
                            500 *
                            (1 + ((10 - 5) * 21) / 95) // Hardcoded level 10 for now
                        )
                        / combatant.actor.system.speed
                    ),
                    _id: combatant.id,
                }
                await combatant.setFlag("ptr2e", "baseAV", data.initiative)
                return data;
            })
        );

        if (options.temporary) return initiatives;
        return this.setMultipleInitiatives(initiatives);

        // Roll the rest with the parent method
        const remainingIds = ids.filter((id) => !fightyCombatants.some((c) => c.id === id));
        console.warn(remainingIds)
        // return super.rollInitiative(remainingIds, options);
    }

    /**
     * Set the initiative of multiple combatants at once.
     * @param {{initiative: number, _id: string}[]} initiatives 
     */
    async setMultipleInitiatives(initiatives) {
        const update = {
            combatants: initiatives,
        }
        if (this.combatant?.id) update.turn = 0;

        return this.update(update);
    }

    /** @override */
    async nextTurn() {
        const turn = this.turn ?? -1;

        // Determine the next turn number
        let next = null;
        let nextRound = false;
        for (let [i, t] of this.turns.entries()) {
            if (i <= turn) continue;
            if (t.hasActed) continue;
            if (this.settings.skipDefeated && t.isDefeated) continue;
            next = i;
            if (t.id === "roundsinitiative") nextRound = true;
            break;
        }

        // Maybe advance to the next round
        let round = this.round;
        if (nextRound) {
            return this.nextRound();
        }

        // Update the document, passing data through a hook first
        const updateData = { round, turn: next };
        const updateOptions = { advanceTime: CONFIG.time.turnTime, direction: 1 };
        Hooks.callAll("combatTurn", this, updateData, updateOptions);
        return this.update(updateData, updateOptions);
    }

    /** @override */
    async nextRound() {
        if (this.turn === null) return super.nextRound();

        const next = this.turns[(this.turn ?? 0) + 1];
        if (next?.id !== "roundsinitiative") return super.nextRound();

        const current = this.combatant;
        const nextFightyCombattant = this.turns[(this.turn ?? 0) + 2];

        if (!current || !nextFightyCombattant) return super.nextRound();

        const initiative = nextFightyCombattant.initiative;
        const updates = {
            turn: 0,
            round: this.round + 1,
            combatants: this.combatants.contents.flatMap((combatant) => {
                if (combatant.id === "roundsinitiative") return [{ _id: combatant.id, initiative: combatant.getFlag("ptr2e", "baseAV") - initiative }];
                if (combatant.id === current.id && combatant.initiative === 0) return [{ _id: combatant.id, initiative: combatant.getFlag("ptr2e", "baseAV") - initiative }];
                if (combatant.id === nextFightyCombattant.id) return [{ _id: combatant.id, initiative: 0 }];
                if (combatant.initiative === 0) return [];
                return [{ _id: combatant.id, initiative: combatant.initiative - initiative }];
            })
        }
        const updateOptions = { direction: 1 };

        Hooks.callAll("combatRound", this, updates, updateOptions);
        return this.update(updates, updateOptions);
    }

    /** @override */
    async previousTurn() {
        const backup = await this.getFlag("ptr2e", "stateBackup");
        if (backup?.length > 0) {
            const { combatants, round, turn } = backup.pop();
            if (combatants.some((c) => c.initiative === 0)) {
                return this.update({
                    combatants,
                    round,
                    turn,
                    flags: {
                        ptr2e: {
                            stateBackup: backup
                        }
                    }
                });
            }
        }
        if (this.round === 1) {
            return Dialog.confirm({
                title: "Restart Combat",
                content: "Are you sure you want to restart combat?",
                yes: () => {
                    return this.update({
                        round: 0,
                        turn: null,
                        combatants: this.combatants.contents.map((c) => ({ _id: c.id, initiative: null })),
                    });
                }
            });
        }
        return ui.notifications.warn("No previous turn to go back to.");
    }

    /** @override */
    async update(data, options = {}) {
        if (!this.combatants.get("roundsinitiative")) {
            await Combatant.create({
                tokenId: undefined,
                actorId: undefined,
                _id: "roundsinitiative",
                name: "The Round",
                img: "icons/svg/clockwork.svg",
                hidden: false,
                defeated: false,
                initiative: 100,
                flags: {
                    ptr2e: {
                        baseAV: 100
                    }
                }
            }, { parent: this, keepId: true, keepEmbeddedIds: true })
        }

        const noInits = this.combatants.contents.filter((c) => c.initiative === null);
        if (noInits.length > 0) {
            const initiatives = await this.rollInitiative(noInits.map((c) => c.id), { secret: true, temporary: true });
            data.combatants = data.combatants ?? [];
            data.combatants.push(...initiatives);
        }

        if (!data?.flags?.ptr2e?.stateBackup) {
            data.flags = data.flags ?? {};
            data.flags.ptr2e = data.flags.ptr2e ?? {};
            data.flags.ptr2e.stateBackup = this.flags?.ptr2e?.stateBackup ?? [];
            const newBackup = {
                combatants: this.combatants.contents.map((c) => ({ _id: c._id, initiative: c.initiative })),
                round: this.round,
                turn: 0
            }
            if (!objectsEqual(data.flags.ptr2e.stateBackup.at(-1), newBackup)) data.flags.ptr2e.stateBackup.push(newBackup);
        }
        return super.update(data, options);
    }

    /** @override */
    _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);

        if (!this.started) return;

        const { combatant, previous } = this;

        const [newRound, newTurn] = [changed.round, changed.turn];
        const isRoundChange = typeof newRound === "number";
        const isTurnChange = typeof newTurn === "number";
        const isNewTurnUnacted = isTurnChange && this.turns[newTurn]?.hasActed === false;
        const isNextRound = isRoundChange && (previous.round === null || newRound > previous.round);
        const isNextTurn = isTurnChange && (previous.turn === null || newTurn > previous.turn || isNewTurnUnacted);

        // End early if no change
        if (!(isRoundChange || isTurnChange)) return;

        Promise.resolve()
            // .then(async () => {
            //     const noInits = this.combatants.contents.filter((c) => c.initiative === null);
            //     if (noInits.length > 0) await this.rollInitiative(noInits.map((c) => c.id), { secret: true });
            // })
            // .then(async () => {
            //     if (!this.combatants.get("roundsinitiative")) {
            //         await Combatant.create({
            //             tokenId: undefined,
            //             actorId: undefined,
            //             _id: "roundsinitiative",
            //             name: "The Round",
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
            // })
            .then(async () => {
                if (isNextRound || isNextTurn) {
                    const previousCombatant = this.combatants.get(previous.combatantId ?? "");
                    // Only the primary updater of the previous actor can end their turn
                    if (game.user.isGM && previousCombatant) {
                        //if (game.user === previousCombatant?.actor?.primaryUpdater) {
                        const alreadyWent = previousCombatant.roundOfLastTurnEnd === previous.round
                        if (typeof previous.round === "number" && !alreadyWent) {
                            // Handle actor specific turn end
                            await previousCombatant.endTurn({ round: previous.round });
                        }
                    }

                    // Only the primary updater of the current actor can start their turn
                    // if (game.user === combatant?.actor?.primaryUpdater) {
                    if (game.user.isGM) {
                        const alreadyWent = combatant?.roundOfLastTurn === this.round;
                        if (combatant && !alreadyWent) {
                            // Update everyone's initiative
                            if (newRound === 1 || !isNextRound) await this.updateInitiatives(previousCombatant, combatant);

                            // Handle actor specific turn start
                            await combatant.startTurn();
                        }
                    }
                }

                // // Reset all data to get updated encounter roll options
                // this.resetActors();
                // await game.ptu.effectTracker.refresh();
                // game.ptu.tokenPanel.refresh();
            });
    }

    /**
     * @param {import('./combatant.mjs').PTRCombatant} previousCombatant
     * @param {import('./combatant.mjs').PTRCombatant} newCombatant 
     */
    async updateInitiatives(previousCombatant, newCombatant) {
        const combatants = this.combatants;
        const initiative = combatants.get(newCombatant.id).initiative;

        return this.setMultipleInitiatives(combatants.contents.flatMap((combatant) => {
            if (combatant.id === previousCombatant?.id) return [{ _id: combatant.id, initiative: previousCombatant.getFlag("ptr2e", "baseAV") - initiative }];
            if (combatant.id === newCombatant.id && combatant.initiative !== 0) return [{ _id: combatant.id, initiative: 0 }];
            if (combatant.initiative === 0) return [];
            return [{ _id: combatant.id, initiative: combatant.initiative - initiative }];
        }));
    }



    async _manageTurnEvents(adjustedTurn) {
        if (this.previous || game.release.build >= 308)
            return super._manageTurnEvents(adjustedTurn);
    }
}