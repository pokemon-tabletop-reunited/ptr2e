import type {
  CombatantPTR2e,
  CombatantSystemPTR2e,
  CombatSystemPTR2e,
  SummonCombatantSystem
} from "@combat";
import {
  RoundCombatantSystem
} from "@combat";
import { ActorPTR2e } from "@actor";
import type { DeepPartial, InexactPartial } from "fvtt-types/utils";

class CombatPTR2e extends Combat {
  public _averageLevel: number | null;

  get averageLevel(): number {
    return (this._averageLevel ||=
      this.combatants.reduce((acc, combatant) => {
        if (!combatant.actor) return acc;
        return acc + combatant.actor.level;
      }, 0) / ((this.combatants.size - 1) || 1));
  }

  get summons(): CombatantPTR2e[] {
    return this.combatants.filter((c) => c.type === "summon") as CombatantPTR2e[];
  }

  get roundCombatant(): CombatantPTR2e {
    return this.combatants.get(RoundCombatantSystem.id) as CombatantPTR2e;
  }

  get roundIndex(): number {
    return this.turns.findIndex((c) => c.id === RoundCombatantSystem.id);
  }

  override async rollInitiative(
    maybeIds: string | string[],
    { updateTurn = true }: Combat.InitiativeOptions = {}
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
      return { _id: id, initiative: combatant.baseAV, system: { advanceDelayPercent: 0 } };
    });
  }

  public override _sortCombatants(
    a: { initiative: Maybe<number>; id: string | null, actor: Actor | null, preview?: boolean },
    b: { initiative: Maybe<number>; id: string | null, actor: Actor | null, preview?: boolean },
  ): number {
    // Sort initiative ascending, then by speed descending, finally by speed stages ascending
    const resolveTie = (a: Maybe<ActorPTR2e>, b: Maybe<ActorPTR2e>): number => {
      // Sort by speed descending
      const speedA = a?.speed ?? 0;
      const speedB = b?.speed ?? 0;

      if (speedA !== speedB) return speedB - speedA;

      // Sort by speed stages ascending
      const stagesA = a?.speedStage ?? 0;
      const stagesB = b?.speedStage ?? 0;
      return stagesB - stagesA;
    };

    // if(preview) {
    //     const aCurrent = !a.preview && (this ?? game.combat)?.current?.combatantId === a.id;
    //     const bCurrent = !b.preview && (this ?? game.combat)?.current?.combatantId === b.id;
    //     if (aCurrent && !bCurrent) return -1;
    //     if (bCurrent && !aCurrent) return 1;
    // }

    const ia = Number.isNumeric(a.initiative) ? a.initiative! : -Infinity;
    const ib = Number.isNumeric(b.initiative) ? b.initiative! : -Infinity;

    return typeof a.initiative === "number" &&
      typeof b.initiative === "number" &&
      a.initiative === b.initiative
      ? (resolveTie(a.actor as unknown as ActorPTR2e, b.actor as unknown as ActorPTR2e) || (a.id! > b.id! ? 1 : -1))
      : ia - ib || (a.id! > b.id! ? 1 : -1);
  }

  override async startCombat(): Promise<this> {
    this._playCombatSound("startEncounter");
    const updateData = this._prepareTurnUpdateData();
    updateData.round = 1;
    Hooks.callAll("combatStart", this, updateData);
    const result = await this.update(updateData);
    if (result) {
      await ChatMessage.create({
        type: "combat",
        flavor: game.i18n.format("PTR2E.Combat.Messages.Round", { round: updateData.round }),
      });
      await this.combatant?.onStartActivation();
    }
    return result as this;
  }

  override async nextTurn(): Promise<this> {
    try {
      const updateData = this._prepareTurnUpdateData();

      Hooks.callAll("combatTurn", this, updateData, {
        advanceTime: CONFIG.time.turnTime,
        direction: 1,
      });

      // if (!game.user.isGM) {
      //     return this.update(updateData) as Promise<this>;
      // } else {
      await this.updateEmbeddedDocuments(
        "Combatant",
        updateData.combatants
      );
      delete updateData.combatants;
      const result = await this.update(updateData);
      if (result) {
        if (updateData.round) await ChatMessage.create({
          type: "combat",
          flavor: game.i18n.format("PTR2E.Combat.Messages.Round", { round: updateData.round }),
        });
        await this.combatant?.onStartActivation();
      }
      return result as this;
      // }
    } catch (error: unknown) {
      ui.notifications.error((error as Error).message);
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
    const next = (() => {
      if (turn > 0) return 0;
      return getNext(turn);
    })()

    const currentCombatant = this.combatant;
    const nextCombatant = this.turns[next];

    const updateData: Record<string, unknown> = { turn: 0 };
    if (this.turn === null) updateData.turn = 0;
    const combatantUpdateData: Record<string, {
      _id: string;
      initiative: number;
      system?: Partial<CombatantSystemPTR2e["_source"]>;
    }> = {};

    // Reduce everyone's initiative by the current combatant's initiative
    let initiativeReduction = nextCombatant.type === "summon" && nextCombatant.system.delay !== null ? 0 : nextCombatant.initiative ?? 0;
    if (nextCombatant.type === "round") {
      const afterRound = this.turns[getNext(next)];
      if (!afterRound) {
        ui.notifications.warn(
          "Only one combatant left in the turn order. Unable to advance to the next turn."
        );
        return {};
      }
      initiativeReduction += afterRound.initiative ?? 0;
      combatantUpdateData[nextCombatant._id!] = {
        _id: nextCombatant._id!,
        initiative: Math.max(0, nextCombatant.baseAV - initiativeReduction),
      };
      updateData.round = (this.round ?? -1) + 1;
    }

    // Unless the combat hasn't started yet, reset the current initiative to their BaseAV.
    if (currentCombatant) {
      combatantUpdateData[currentCombatant._id!] = {
        _id: currentCombatant._id!,
        initiative: Math.max(0, currentCombatant.baseAV - initiativeReduction),
        system: {
          activationsHad: (currentCombatant.system.activations ?? 0) + 1,
        },
      };
    }

    for (const combatant of this.turns) {
      if (combatant.type === "summon" && (combatant.system as SummonCombatantSystem).delay !== null && !combatant.isDefeated) {
        combatantUpdateData[combatant._id!] = {
          _id: combatant._id!,
          initiative: 999,
          system: {
            delay: (combatant.system as SummonCombatantSystem).delay! - 1,
            activationsHad: combatantUpdateData[combatant._id!]?.system?.activationsHad ?? combatant.system.activations ?? 0,
          }
        };
        continue;
      }
      if (combatantUpdateData[combatant._id!]) continue;
      if (combatant.isDefeated) continue;
      combatantUpdateData[combatant._id!] = {
        _id: combatant._id!,
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
  protected override async _manageTurnEvents(): Promise<void> {
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
        this.combatant as CombatantPTR2e
      );
  }

  /**
   * Exact copy of the original method, however with added handling for Delay Summons.
   * Return the Array of combatants sorted into initiative order, breaking ties alphabetically by name.
   * @returns {Combatant[]}
   */
  override setupTurns() {
    this.turns ||= [];

    // Determine the turn order and the current turn
    const turns = this.combatants.contents.sort(this._sortCombatants) as CombatantPTR2e[];
    if (this.turn !== null) this.turn = Math.clamp(this.turn, 0, turns.length - 1);

    const delaySummons = turns.filter(c => c.type === "summon" && (c.system as SummonCombatantSystem).delay !== null).sort(this._sortCombatants) as CombatantPTR2e[];
    for (const summon of delaySummons) {
      // Delayed summons go after X amount of other activations, instead of being based on AV.
      // Thus, insert the summon at the correct position in the turn order.
      const delay = (summon.system as SummonCombatantSystem).delay!;
      if (delay === -2) continue;

      turns.splice(turns.indexOf(delaySummons[0]), 1);

      if (delay === -1) {
        turns.unshift(summon);
        continue;
      }

      let i = 0;
      let validTurns = 0;
      while (validTurns < delay) {
        i++;

        if (i >= turns.length) {
          break;
        }
        const nextTurn = turns[i];
        // Make sure to exclude other rounds & summons from the delay count
        if (nextTurn.type === "round" || nextTurn.type === "summon" || nextTurn.isDefeated) {
          continue;
        }
        validTurns++;
      }
      turns.splice(i + 1, 0, summon);
    }

    // Update state tracking
    const c = turns[this.turn!];
    this.current = this._getCurrentState(c);

    // One-time initialization of the previous state
    if (!this.previous) this.previous = this.current;

    // Return the array of prepared turns
    return (this.turns = turns as Combatant[]) as CombatantPTR2e[];
  }

  async resetEncounter(): Promise<this | undefined> {
    const inits = this._idToUpdateBaseInitiativeArray(this.combatants.map((c) => c.id!)).map(
      (u) => ({ ...u, system: { activationsHad: 0, advanceDelayPercent: 0 } })
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async _preCreate(data: foundry.data.fields.SchemaField.AssignmentType<Combat.Schema>, options: foundry.abstract.Document.PreCreateOptions<any>, user: User): Promise<boolean | void> {
    await super._preCreate(data, options, user);

    const round = new CONFIG.Combatant.documentClass({
      _id: "roundsinitiative",
      name: game.i18n.localize("PTR2E.Combat.Round.Name"),
      img: "icons/svg/clockwork.svg",
      type: "round",
      initiative: 150,
    }, { parent: this });
    const combatants = this.combatants.map((c) => c.toObject());
    combatants.push(round.toObject());
    this.updateSource({ combatants });
  }

  protected override _onCreateDescendantDocuments(
    parent: ClientDocument,
    collection: "combatants",
    documents: Combatant[],
    results: Combatant['_source'][],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.OnCreateOptions<"Combatant"> & InexactPartial<{ combatTurn: number; turnEvents: boolean }>,
    userId: string
  ): void {
    super._onCreateDescendantDocuments(parent, collection, documents, results, options, userId);
    this._averageLevel = null;

    const inits = this._idToUpdateBaseInitiativeArray(
      this.round === 0 ? this.combatants.map((c) => c.id!) : documents.map((c) => c._id!)
    );
    this.updateEmbeddedDocuments("Combatant", inits).then(() => {
      const participants = new Set(
        [
          ...this.system.participants,
          ...this.combatants.map((c) => c.actor?.uuid ?? c.token?.uuid ?? []),
        ].flat()
      );
      this.update({ "system.participants": participants });
    });
  }

  protected override _onDeleteDescendantDocuments(
    parent: ClientDocument,
    collection: "combatants",
    documents: Combatant[],
    ids: string[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.OnDeleteOptions<"Combatant"> & InexactPartial<{ combatTurn: number; turnEvents: boolean }>,
    userId: string
  ): void {
    super._onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId);
    this._averageLevel = null;

    if (this.round === 0) {
      const inits = this._idToUpdateBaseInitiativeArray(this.combatants.map((c) => c.id!));
      this.updateEmbeddedDocuments("Combatant", inits);
    }
  }

  protected override _onDelete(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.OnDeleteOptions<any>,
    userId: string
  ): void {
    super._onDelete(options, userId);

    const participants = this.system.participants;
    for (const uuid of participants) {
      const actor = fromUuidSync(uuid!);
      if (actor instanceof ActorPTR2e) actor.onEndCombat();
    }

    ChatMessage.create({
      type: "combat",
      flavor: game.i18n.localize("PTR2E.Combat.Messages.End"),
    })
  }

  protected override _onUpdate(
    changed: DeepPartial<foundry.data.fields.SchemaField.AssignmentType<Combat.Schema>>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.OnUpdateOptions<any>,
    userId: string
  ): void {
    super._onUpdate(changed, options, userId);

    const toDelete = [];
    for (const combatant of (this.combatants?.filter(c => c.type === "summon") ?? [])) {
      if (combatant.system.expired) {
        toDelete.push(combatant.id);
      }
    }
    if (toDelete.length) {
      this.deleteEmbeddedDocuments("Combatant", toDelete);
    }
  }
}

interface CombatPTR2e extends Combat {
  system: CombatSystemPTR2e;
}

export default CombatPTR2e;
