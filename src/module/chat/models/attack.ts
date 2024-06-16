import { ActorPTR2e } from "@actor";
import AttackPTR2e from "@module/data/models/attack.ts";
import { ChatMessagePTR2e } from "@chat";
import { AccuracySuccessCategory, PTRCONSTS } from "@data";
import { SlugField } from "@module/data/fields/slug-field.ts";
import { AttackRoll } from "@system/rolls/attack-roll.ts";
import { AccuracyCalc, DamageCalc } from "./data.ts";
import { CollectionField } from "@module/data/fields/collection-field.ts";

abstract class AttackMessageSystem extends foundry.abstract.TypeDataModel {
    declare parent: ChatMessagePTR2e<AttackMessageSystem>;

    /**
     * Define the schema for the AttackMessageSystem data model
     */
    static override defineSchema(): AttackMessageSchema {
        const fields = foundry.data.fields;
        return {
            origin: new fields.JSONField({ required: true }),
            attackSlug: new SlugField(),
            results: new fields.ArrayField(
                new fields.SchemaField({
                    target: new fields.JSONField({ required: true }),
                    accuracy: new fields.JSONField({
                        required: true,
                        nullable: true,
                        validate: AttackMessageSystem.#validateRoll,
                    }),
                    crit: new fields.JSONField({
                        required: true,
                        nullable: true,
                        validate: AttackMessageSystem.#validateRoll,
                    }),
                    damage: new fields.JSONField({
                        required: true,
                        nullable: true,
                        validate: AttackMessageSystem.#validateRoll,
                    }),
                }),
                {
                    required: true,
                    initial: [],
                }
            ),
            overrides: new CollectionField(
                new fields.SchemaField({
                    value: new SlugField({
                        choices: Object.values(PTRCONSTS.AccuracySuccessCategories),
                    }),
                    uuid: new fields.DocumentUUIDField({}),
                }),
                "uuid",
                { required: true, initial: [] }
            ),
            pp: new fields.SchemaField({
                spent: new fields.BooleanField({ required: true, initial: false }),
                cost: new fields.NumberField({ required: true, initial: 0 }),
            }),
        };
    }

    /**
     * Validate that Rolls belonging to the ChatMessage document are valid
     * @param {string} rollJSON     The serialized Roll data
     */
    static #validateRoll(rollJSON: any) {
        const roll = JSON.parse(rollJSON);
        if (!roll.evaluated)
            throw new Error(`Roll objects added to ChatMessage documents must be evaluated`);
    }

    get currentOrigin(): Promise<Maybe<ActorPTR2e>> {
        return this.context?.origin?.uuid ? fromUuid<ActorPTR2e>(this.context.origin.uuid) : Promise.resolve(null);
    }

    override prepareBaseData(): void {
        this.context = null;

        const fromRollData = (rollData: string | null) => {
            if (!rollData) return null;
            try {
                return Roll.fromJSON(rollData) as Rolled<AttackRoll>;
            } catch (error: any) {
                Hooks.onError("AttackMessageSystem#prepareBaseData", error, {
                    log: "error",
                });
            }
            return null;
        };

        const fromActorData = (actorData: string) => {
            if (!actorData) return null;

            const jsonData = (() => {
                try {
                    return JSON.parse(actorData);
                } catch (error: any) {
                    Hooks.onError("AttackMessageSystem#prepareBaseData", error, {
                        log: "error",
                    });
                }
            })();
            if (!jsonData) return null;

            const worldActor = fromUuidSync(jsonData.uuid) as Maybe<ActorPTR2e>;
            if (worldActor) return worldActor;

            try {
                return ActorPTR2e.fromJSON(actorData) as ActorPTR2e;
            } catch (error: any) {
                Hooks.onError("AttackMessageSystem#prepareBaseData", error, {
                    log: "error",
                });
            }
            return null;
        };

        for (let i = 0; i < this.results.length; i++) {
            const result = this.results[i];
            const source = this._source.results[i];

            result.accuracy = fromRollData(source.accuracy);
            result.crit = fromRollData(source.crit);
            result.damage = fromRollData(source.damage);
            result.target = fromActorData(source.target)!;
        }

        this.origin = fromActorData(this._source.origin)!;

        this.attack = this.origin.actions.attack.get(this._source.attackSlug) as AttackPTR2e;
        if (!this.attackSlug)
            Hooks.onError(
                "AttackMessageSystem#attack",
                new Error(
                    `Could not find attack with slug ${this._source.attackSlug} in ${this._source.origin}`
                ),
                { log: "error", data: this._source }
            );
    }

    async getHTMLContent() {
        const renderRolls = async (data: ResultData, isPrivate: boolean) => {
            const renderInnerRoll = async (roll: Rolled<AttackRoll> | null, isPrivate: boolean) => {
                return roll ? roll.render({ isPrivate }) : null;
            };

            // TODO: Implement effect checks
            const rolls = {
                accuracy: await renderTemplate(
                    "/systems/ptr2e/templates/chat/rolls/accuracy-check.hbs",
                    {
                        inner: await renderInnerRoll(data.accuracy, isPrivate),
                        isPrivate,
                        type: "accuracy",
                        label: "PTR2E.Attack.AccuracyCheck",
                    }
                ),
                crit: await renderTemplate("/systems/ptr2e/templates/chat/rolls/crit-check.hbs", {
                    inner: await renderInnerRoll(data.crit, isPrivate),
                    isPrivate,
                    type: "crit",
                    label: "PTR2E.Attack.CritCheck",
                }),
                damage: await renderTemplate(
                    "/systems/ptr2e/templates/chat/rolls/damage-randomness.hbs",
                    {
                        inner: await renderInnerRoll(data.damage, isPrivate),
                        isPrivate,
                        type: "damage",
                        label: "PTR2E.Attack.DamageRandomness",
                    }
                ),
            };

            return rolls;
        };

        const context: AttackMessageRenderContext =
            this.context ??
            (this.context = {
                pp: this.pp,
                origin: this.origin,
                attack: this.attack,
                hasDamage: this.results.some((result) => !!result.damage),
                results: new Map<ActorUUID, AttackMessageRenderContextData>(
                    // @ts-expect-error - This is a valid operation
                    await Promise.all(
                        this.results.map(async (result) => {
                            const context: AttackMessageRenderContextData = {
                                target: result.target,
                                rolls: await renderRolls(result, false),
                                hit:
                                    this.overrides.get(result.target.uuid)?.value ||
                                    AttackRoll.successCategory(result.accuracy, result.crit),
                            };
                            if (result.damage) {
                                const damage = result.damage.calculateDamageTotal({
                                    origin: this.origin,
                                    target: result.target,
                                    isCritHit: context.hit === "critical",
                                    attack: this.attack,
                                    isMultiTarget: this._source.results.length > 1,
                                });
                                if (damage) {
                                    context.damage = damage.value;
                                    context.damageRoll = damage;
                                }
                            }
                            if (result.accuracy) {
                                context.accuracyRoll = {
                                    category: context.hit,
                                    context: result.accuracy.options,
                                };
                                context.accuracyRoll.context.override =
                                    this.overrides.get(result.target.uuid) !== undefined;
                                context.accuracyRoll.context.accuracyRoll =
                                    result.accuracy.dice[0].values[0];
                                context.accuracyRoll.context.critRoll =
                                    result.crit?.dice[0].values[0];
                            }
                            return [result.target.uuid, context];
                        })
                    )
                ),
            });

        return renderTemplate("systems/ptr2e/templates/chat/attack.hbs", context);
    }

    async updateTarget(targetUuid: ActorUUID, { status }: { status: AccuracySuccessCategory }) {
        const target = this.context?.results.get(targetUuid);
        if (!target) return false;

        const overrides = fu.duplicate(this._source.overrides);
        const index = overrides.findIndex((override) => override.uuid === targetUuid);
        if (index === -1) {
            overrides.push({
                value: status,
                uuid: targetUuid,
            });
        } else {
            overrides[index].value = status;
        }

        return this.parent.update({
            system: {
                overrides,
            },
        });
    }

    async spendPP() {
        if (this.pp.spent) return false;

        const pp = this.context?.pp;
        if (!pp) return false;

        const actor = await this.currentOrigin;
        if (!actor) return false;

        if (actor.system.powerPoints.value < pp.cost) {
            ui.notifications.error("PTR2E.Attack.NotEnoughPP");
            return false;
        }

        await this.parent.update({
            system: {
                pp: {
                    spent: true,
                },
            },
        });
        await actor.update({
            "system.powerPoints.value": actor.system.powerPoints.value - pp.cost,
        })
        ui.notifications.info(`You have ${actor.system.powerPoints.value} power points remaining. (Used ${pp.cost})`);

        return true;
    }

    async applyDamage(targetUuid: ActorUUID) {
        const result = this.context!.results.get(targetUuid);
        if (!result) return false;

        const target = result.target;
        const damage = result.damage;
        if (!damage) return false;

        const damageApplied = await target.applyDamage(damage);
        return damageApplied;
    }

    async updateTargets(event: JQuery.ClickEvent) {
        const targets = (() => {
            const controlled = canvas.tokens.controlled
                .map((t) => t.actor)
                .filter((t) => !!t) as ActorPTR2e[];
            if (controlled.length) {
                if (!(controlled.length === 1 && controlled[0].uuid === this.origin.uuid))
                    return controlled;
            }

            return [...game.user.targets].map((t) => t.actor).filter((t) => !!t) as ActorPTR2e[];
        })();
        if (!targets.length) return;

        await this.attack.statistic?.check.roll({
            createMessage: false,
            targets,
            callback: (_context, results) => {
                const newResults = results.map((r) => ({
                    target: (() => {
                        const json: Record<string, unknown> = r.context.target!.actor.toJSON();
                        json.uuid =
                            r.context.target!.token?.actor?.uuid ?? r.context.target!.actor.uuid;
                        return json;
                    })(),
                    accuracy: r.rolls.accuracy!.toJSON(),
                    crit: r.rolls.crit!.toJSON(),
                    damage: r.rolls.damage!.toJSON(),
                }));

                if (event.altKey) {
                    this.parent.update({
                        system: {
                            results: newResults,
                        },
                    });
                    return;
                }

                //@ts-expect-error
                const updateResults = this._source.results.concat(newResults);

                this.parent.update({
                    system: {
                        results: updateResults,
                    },
                });
            },
        });
    }

    activateListeners(html: JQuery<HTMLElement>) {
        html.find(".apply-damage").on("click", (event) => {
            const targetUuid = (event.currentTarget.closest("[data-target-uuid]") as HTMLElement)
                ?.dataset?.targetUuid as Maybe<ActorUUID>;
            if (!targetUuid) return;
            this.applyDamage(targetUuid);
        });
        html.find(".update-targets").on("click", this.updateTargets.bind(this));
        html.find("[data-action='consume-pp']").on("click", this.spendPP.bind(this));
    }
}

interface AttackMessageSystem
    extends foundry.abstract.TypeDataModel,
        ModelPropsFromSchema<AttackMessageSchema> {
    _source: SourceFromSchema<AttackMessageSchema>;
    attack: AttackPTR2e;
    context: Maybe<AttackMessageRenderContext>;
    overrides: Collection<{ value: AccuracySuccessCategory; uuid: ActorUUID }>;
}
type AttackMessageRenderContext = {
    origin: ActorPTR2e;
    attack: AttackPTR2e;
    hasDamage: boolean;
    results: Map<ActorUUID, AttackMessageRenderContextData>;
    pp: ModelPropsFromSchema<PPSchema>;
};

type AttackMessageRenderContextData = {
    rolls: {
        accuracy: string | null;
        crit: string | null;
        damage: string | null;
    };
    target: ActorPTR2e;
    hit: AccuracySuccessCategory;
    damage?: number;
    damageRoll?: DamageCalc;
    accuracyRoll?: AccuracyCalc;
};

type AttackMessageSchema = {
    origin: foundry.data.fields.JSONField<ActorPTR2e, true, false, false>;
    attackSlug: SlugField<true, false, false>;
    results: foundry.data.fields.ArrayField<
        ResultSchema,
        foundry.data.fields.SourcePropFromDataField<ResultSchema>[],
        foundry.data.fields.ModelPropFromDataField<ResultSchema>[],
        true,
        false,
        true
    >;
    overrides: CollectionField<
        foundry.data.fields.SchemaField<OverrideSchema>,
        foundry.data.fields.SourcePropFromDataField<
            foundry.data.fields.SchemaField<OverrideSchema>
        >[],
        foundry.data.fields.ModelPropFromDataField<
            foundry.data.fields.SchemaField<OverrideSchema>
        >[],
        true,
        false,
        true
    >;
    pp: foundry.data.fields.SchemaField<
        PPSchema,
        foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<PPSchema>>,
        foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<PPSchema>>,
        true,
        false,
        false
    >;
};

type OverrideSchema = {
    value: SlugField<true, false, false>;
    uuid: foundry.data.fields.DocumentUUIDField<"Actor", true, false, false>;
};

type PPSchema = {
    spent: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
    cost: foundry.data.fields.NumberField<number, number, true, false, true>;
};

type ResultData = foundry.data.fields.ModelPropFromDataField<ResultSchema>;

type ResultSchema = foundry.data.fields.SchemaField<
    {
        target: foundry.data.fields.JSONField<ActorPTR2e, true, false, false>;
        accuracy: foundry.data.fields.JSONField<Rolled<AttackRoll>, true, true, false>;
        crit: foundry.data.fields.JSONField<Rolled<AttackRoll>, true, true, false>;
        damage: foundry.data.fields.JSONField<Rolled<AttackRoll>, true, true, false>;
    },
    {
        target: string;
        accuracy: string | null;
        crit: string | null;
        damage: string | null;
    },
    {
        target: ActorPTR2e;
        accuracy: Rolled<AttackRoll> | null;
        crit: Rolled<AttackRoll> | null;
        damage: Rolled<AttackRoll> | null;
    }
>;

export default AttackMessageSystem;
