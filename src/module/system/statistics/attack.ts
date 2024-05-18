import { AttackPTR2e } from "@data";
import { RollOptionConfig, Statistic, StatisticCheck, StatisticRollParameters } from "./statistic.ts";
import { StatisticData } from "./data.ts";
import * as R from "remeda";
import { ModifierPTR2e } from "@module/effects/modifiers.ts";
import { CheckRoll } from "@system/rolls/check-roll.ts";
import { ItemPTR2e, ItemSystemsWithActions } from "@item";
import { ActorPTR2e } from "@actor";
import { CheckContext } from "@system/data.ts";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import { extractNotes } from "src/util/rule-helpers.ts";
import { CheckRollContext } from "@system/rolls/data.ts";
import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { CheckPTR2e } from "@system/check.ts";

type AttackStatisticData = StatisticData & Required<Pick<StatisticData, "defferedValueParams" | 'modifiers' | 'domains' | 'rollOptions'>>;
type AttackRollParameters = StatisticRollParameters & { consumeAmmo?: boolean };

class AttackStatistic extends Statistic {
    declare data: AttackStatisticData;

    item: ItemPTR2e<ItemSystemsWithActions, ActorPTR2e>;
    attack: AttackPTR2e;

    #check: AttackCheck<this> | null = null;

    constructor(attack: AttackPTR2e) {
        const {actor, item} = attack;
        if(!actor) throw Error("Attack must have an actor for Statistic to be created.");

        const data: AttackStatisticData = {
            slug: attack.slug,
            label: attack.name,
            check: {
                type: "attack-roll"
            },
            defferedValueParams: {
                resolvables: {
                    attack,
                    actor: actor,
                    item: item,
                },
                injectables: {
                    attack,
                    actor: actor,
                    item: item,
                }
            },
            modifiers: [],
            domains: [],
            rollOptions: []
        };

        const itemRollOptions = item.getRollOptions("item");
        const itemTraits = item.traits!;
        const meleeOrRanged = attack.isMelee ? "melee" : "ranged";

        data.domains = R.uniq(
            [
                `all`,
                `check`,
                `attack`,
                `${meleeOrRanged}-attack`,
                `${attack.category}-attack`,
                attack.traits.map((t) => `${t.slug}-trait-attack`),
                `${attack.slug}-attack`,
                `${item.id}-attack`,
            ].flat()
        );

        // Power and category based Modifiers
        if (attack.category !== "status") {
            if (typeof attack.power === "number") {
                data.modifiers.push(
                    new ModifierPTR2e({
                        slug: `power`,
                        label: game.i18n.localize("PTR2E.Modifiers.power"),
                        modifier: attack.power!,
                        method: "base",
                    })
                );
            } else {
                //TODO: Implement alt. move formulas, such as flat damage or weight based.
            }

            data.modifiers.push(
                new ModifierPTR2e({
                    slug: "category",
                    label: game.i18n.localize(`PTR2E.Modifiers.${attack.category}Attack`),
                    modifier: actor.attributes[attack.category === "physical" ? "atk" : "spa"].value,
                    method: "flat",
                })
            );
        }

        data.rollOptions = [
            ...actor.getRollOptions(data.domains),
            ...itemRollOptions, 
            itemTraits.map((t) => t.slug), 
            meleeOrRanged,
        ].flat()

        super(actor, data);

        this.item = item as ItemPTR2e<ItemSystemsWithActions, ActorPTR2e>;
        this.attack = attack;
    }

    override get check(): AttackCheck<this> {
        return this.#check ??= new AttackCheck(this, this.data, this.config);
    }
}

class AttackCheck<Statistic extends AttackStatistic> extends StatisticCheck<Statistic> {
    constructor(statistic: Statistic, data: AttackStatisticData, config: RollOptionConfig) {
        super(statistic, data, config);
    }

    get item(): ItemPTR2e<ItemSystemsWithActions, ActorPTR2e> {
        return this.parent.item;
    }
    get attack() {
        return this.parent.attack;
    }
    get itemConsumesAmmo() {
        return false;
    }

    override async roll(args: AttackRollParameters = {}): Promise<Rolled<CheckRoll> | Promise<Rolled<CheckRoll>[]> | null> {
        const options: Set<string> = new Set(args.extraRollOptions ?? []);
        //const consumeAmmo = args.consumeAmmo ?? this.itemConsumesAmmo;
        //TODO: If ammo is consumed, check if there is ammo to consume

        const targets: {actor: ActorPTR2e, token?: TokenPTR2e}[] = (() => {
            if(args.targets) return args.targets.map(t => ({actor: t}));
            return [...game.user.targets ?? []].map(t => ({actor: t.actor as ActorPTR2e, token: t as TokenPTR2e}));
        })()
        const contexts: Record<ActorPTR2e['id'], CheckContext<ActorPTR2e, AttackCheck<Statistic>, ItemPTR2e<ItemSystemsWithActions, ActorPTR2e>>> = {}
        let anyValidTargets = false;
        for(const target of targets) {
            const currContext = contexts[target.actor.id] = await this.actor.getCheckContext({
                attack: this.attack,
                domains: this.domains,
                statistic: this,
                target: target,
                options,
                traits: args.traits ?? this.item.traits,
            }) as CheckContext<ActorPTR2e, AttackCheck<Statistic>, ItemPTR2e<ItemSystemsWithActions, ActorPTR2e>>

            if(this.attack.isRanged && typeof currContext.target?.rangeIncrement === "number") {
                const rip = currContext.target!.rangeIncrement!;
                if(!rip) {
                    anyValidTargets = true;
                    continue;
                }
                if (rip >= 5) {
                    currContext.dc = { value: Infinity };
                    currContext.outOfRange = true;
                    continue;
                }

                // TODO: Calculate Accuracy and determine if RIP is within range
                // This includes target evasion
                anyValidTargets = true;
            }

            currContext.notes = extractNotes(currContext.self.actor.synthetics.rollNotes, this.domains)
        }
        // TODO: Change 'false' here to game setting
        if(!anyValidTargets && false) {
            ui.notifications.warn(game.i18n.localize("PTR2E.AttackWarning.NoValidTargets"));
            return null;
        }

        const token =
            args.token ??
            (this.actor.getActiveTokens(false, true).shift() as TokenDocumentPTR2e | null);

        //TODO: Apply just-in-time roll options from changes
        const checkContext: CheckRollContext & {contexts: Record<string, CheckContext>} = {
            type: "attack-roll",
            identifier: args.identifier ?? `${this.item.slug}.${this.attack.slug}`,
            action: args.action || this.label || this.attack.name,
            title: args.title || this.label || this.attack.name,
            actor: this.actor,
            token,
            contexts,
            item: args.item ?? this.item,
            domains: this.domains,
            damaging: args.damaging,
            createMessage: args.createMessage ?? true,
        }

        const rolls = await CheckPTR2e.rolls(checkContext, args.event, args.callback);
        if(rolls?.length) {
            //TODO: Apply post-roll options from changes
        }

        return rolls;
    }
}

export { AttackStatistic, AttackCheck };
export type { AttackStatisticData };