import { ActorPTR2e } from "@actor";
import AttackPTR2e from "@module/data/models/attack.ts";
import { ChatMessagePTR2e } from "@chat";
import { AccuracySuccessCategory, PTRCONSTS } from "@data";
import { SlugField } from "@module/data/fields/slug-field.ts";
import { MappingField } from "@module/data/fields/mapping-field.ts";
import { AttackRoll } from "@system/rolls/attack-roll.ts";
import { AccuracyCalc, DamageCalc } from "./data.ts";

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
            overrides: new MappingField(
                new fields.SchemaField({
                    hit: new SlugField({
                        required: true,
                        nullable: true,
                        choices: Object.values(PTRCONSTS.AccuracySuccessCategories),
                    }),
                    crit: new fields.BooleanField({ required: true, nullable: true }),
                }),
                { required: true, initial: {} }
            ) as AttackMessageSchema["overrides"],
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

    override prepareBaseData(): void {
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
                accuracy: await renderInnerRoll(data.accuracy, isPrivate),
                crit: await renderInnerRoll(data.crit, isPrivate),
                damage: await renderInnerRoll(data.damage, isPrivate),
            };

            return rolls;
        };

        const context: AttackMessageRenderContext =
            this.context ??
            (this.context = {
                origin: this.origin,
                attack: this.attack,
                results: new Map<ActorUUID, AttackMessageRenderContextData>(
                    // @ts-expect-error - This is a valid operation
                    await Promise.all(
                        this.results.map(async (result) => {
                            const context: AttackMessageRenderContextData = {
                                target: result.target,
                                rolls: await renderRolls(result, false),
                                hit:
                                    this.overrides[result.target.uuid] ||
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
                            if(result.accuracy) {
                                context.accuracyRoll = {
                                    category: context.hit,
                                    context: result.accuracy.options
                                }
                                context.accuracyRoll.context.override = this.overrides[result.target.uuid] !== undefined;
                                context.accuracyRoll.context.accuracyRoll = result.accuracy.dice[0].values[0];
                            }
                            return [result.target.uuid, context];
                        })
                    )
                ),
            });

        return renderTemplate("systems/ptr2e/templates/chat/attack.hbs", context);
    }

    //@ts-ignore
    async updateTarget(targetUuid: string, {status }: { status: AccuracySuccessCategory }) {
        // const target = this.context?.targets.get(targetUuid);
        // if (!target) return false;
        // const source = fu.duplicate(this._source.targets);
        // const index = source.findIndex((t) => t.uuid === targetUuid);
        // if (index === -1) return false;
        // source[index].status = status;
        // return await this.parent.update({ "system.targets": source });
    }

    async applyDamage(targetUuid: ActorUUID) {
        const result = this.context!.results.get(targetUuid);
        if (!result) return false;

        const target = result.target;
        const damage = result.damage;
        if (!damage) return false;

        const damageApplied = await target.applyDamage(damage);

        // @ts-ignore
        return ChatMessage.create({
            type: "damage-applied",
            system: {
                target: targetUuid,
                damageApplied,
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
    }
}

interface AttackMessageSystem
    extends foundry.abstract.TypeDataModel,
        ModelPropsFromSchema<AttackMessageSchema> {
    _source: SourceFromSchema<AttackMessageSchema>;
    attack: AttackPTR2e;
    context: Maybe<AttackMessageRenderContext>;
    overrides: Record<ActorUUID, AccuracySuccessCategory>;
}
type AttackMessageRenderContext = {
    origin: ActorPTR2e;
    attack: AttackPTR2e;
    results: Map<ActorUUID, AttackMessageRenderContextData>;
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
    damageRoll?: DamageCalc
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
    overrides: MappingField<
        Record<ActorUUID, AccuracySuccessCategory>,
        Record<ActorUUID, AccuracySuccessCategory>,
        true,
        false,
        true
    >;
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
