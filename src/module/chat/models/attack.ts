import type { AccuracySuccessCategory } from "@data";
import { PTRCONSTS } from "@data";
import { SlugField } from "@module/data/fields/slug-field.ts";
import { AttackRoll } from "@system/rolls/attack-roll.ts";
import type { AccuracyCalc, DamageCalc } from "./data.ts";
import { CollectionField } from "@module/data/fields/collection-field.ts";
import * as R from "remeda";
import { PredicateField } from "@system/predication/schema-data-fields.ts";
import type { UserVisibility } from "@scripts/ui/user-visibility.ts";
import type { ModifierPTR2e } from "@module/effects/modifiers.ts";
import { RollNote } from "@system/notes.ts";
import type { CheckRoll } from "@system/rolls/check-roll.ts";
import type { AnyObject } from "fvtt-types/utils";
import type { RawPredicate } from "@system/predication/predication.ts";

/**
 * Validate that Rolls belonging to the ChatMessage document are valid
 * @param {string} rollJSON     The serialized Roll data
 */
function validateRoll(rollJSON: unknown) {
  const roll = JSON.parse(rollJSON as string);
  if (!roll.evaluated)
    throw new Error(`Roll objects added to ChatMessage documents must be evaluated`);
}

const attackMessageSchema = {
  origin: new foundry.data.fields.JSONField<{ required: true }, AnyObject, Actor.ConfiguredInstance>({ required: true }),
  originItem: new foundry.data.fields.JSONField<{ required: true, nullable: true, initial: null }, AnyObject, Item.ConfiguredInstance>({ required: true, nullable: true, initial: null }),
  attack: new foundry.data.fields.JSONField<{ required: false }, AnyObject, PTR.Models.Action.Models.Attack.Instance>({ required: false }),
  attackSlug: new SlugField(),
  results: new foundry.data.fields.ArrayField(
    new foundry.data.fields.SchemaField({
      target: new foundry.data.fields.JSONField<
        { required: true },
        AnyObject,
        Actor.ConfiguredInstance
      >({ required: true }),
      accuracy: new foundry.data.fields.JSONField<
        { required: true, nullable: true, validate: foundry.data.fields.DataField.Validator<string> },
        AnyObject,
        Roll.Evaluated<AttackRoll> | null,
        string | null
      >({
        required: true,
        nullable: true,
        validate: validateRoll,
      }),
      crit: new foundry.data.fields.JSONField<
        { required: true, nullable: true, validate: foundry.data.fields.DataField.Validator<string> },
        AnyObject,
        Roll.Evaluated<AttackRoll> | null,
        string | null
      >({
        required: true,
        nullable: true,
        validate: validateRoll,
      }),
      damage: new foundry.data.fields.JSONField<
        { required: true, nullable: true, validate: foundry.data.fields.DataField.Validator<string> },
        AnyObject,
        Roll.Evaluated<AttackRoll> | null,
        string | null
      >({
        required: true,
        nullable: true,
        validate: validateRoll,
      }),
      context: new foundry.data.fields.SchemaField({
        check: new foundry.data.fields.SchemaField({
          breakdown: new foundry.data.fields.StringField({ required: true, blank: true, initial: "" }),
          slug: new SlugField({ required: true, blank: true, initial: "" }),
          totalModifier: new foundry.data.fields.NumberField({ required: true, nullable: false, initial: 0 }),
          totalModifiers: new foundry.data.fields.ObjectField<
            { required: true, initial: AnyObject },
            Record<string, number>,
            Record<string, number>
          >({ required: true, initial: {} }),
          _modifiers: new foundry.data.fields.ArrayField(new foundry.data.fields.ObjectField<
            { required: true, initial: AnyObject },
            AnyObject,
            ModifierPTR2e
          >(), { required: true, initial: [] }),
        }),
        action: new foundry.data.fields.StringField({ required: true, blank: true, initial: "" }),
        domains: new foundry.data.fields.ArrayField(new SlugField(), { required: true, initial: [] }),
        notes: new foundry.data.fields.ArrayField(
          new foundry.data.fields.SchemaField({
            selector: new foundry.data.fields.StringField({ required: true, blank: true, initial: "" }),
            title: new foundry.data.fields.StringField({ required: true, blank: true, initial: "" }),
            text: new foundry.data.fields.StringField({ required: true, blank: true, initial: "" }),
            predicate: new PredicateField({ required: true, initial: [] }),
            outcome: new foundry.data.fields.ArrayField(new foundry.data.fields.NumberField({ required: true, nullable: false }), { required: true, initial: [] }),
            visibility: new foundry.data.fields.StringField<
              { required: true, initial: "all", choices: ["all", "gm", "owner", "none"] },
              "all" | "gm" | "owner" | "none",
              "all" | "gm" | "owner" | "none"
            >({ required: true, initial: "all", choices: ["all", "gm", "owner", "none"] }),
          }),
          { required: true, initial: [] }
        ),
        title: new foundry.data.fields.StringField({ required: true, blank: true, initial: "" }),
        type: new foundry.data.fields.StringField({ required: true, blank: true, initial: "" }),
        options: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField({ required: true }), { required: true, initial: [] }),
      }),
      effectRolls: new foundry.data.fields.SchemaField({
        applied: new foundry.data.fields.BooleanField({ required: true, initial: false }),
        target: new foundry.data.fields.ArrayField(new foundry.data.fields.SchemaField({
          chance: new foundry.data.fields.NumberField({ required: true, nullable: false, min: 1, max: 100 }),
          effect: new foundry.data.fields.DocumentUUIDField<AnyObject, ItemUUID, ItemUUID>(),
          label: new foundry.data.fields.StringField({ required: true, initial: "" }),
          roll: new foundry.data.fields.JSONField<
            { required: true, nullable: true, initial: null },
            AnyObject,
            Roll.Evaluated<AttackRoll> | null,
            string | null
          >({ required: true, nullable: true, initial: null }),
          success: new foundry.data.fields.BooleanField({ required: true, nullable: true, initial: null }),
          critOnly: new foundry.data.fields.BooleanField({ required: true, initial: false })
        }), { required: true, initial: [] }),
        origin: new foundry.data.fields.ArrayField(new foundry.data.fields.SchemaField({
          chance: new foundry.data.fields.NumberField({ required: true, nullable: false, min: 1, max: 100 }),
          effect: new foundry.data.fields.DocumentUUIDField<AnyObject, ItemUUID, ItemUUID>(),
          label: new foundry.data.fields.StringField({ required: true, initial: "" }),
          roll: new foundry.data.fields.JSONField<
            { required: true, nullable: true, initial: null },
            AnyObject,
            Roll.Evaluated<AttackRoll> | null,
            string | null
          >({ required: true, nullable: true, initial: null }),
          success: new foundry.data.fields.BooleanField({ required: true, nullable: true, initial: null }),
          critOnly: new foundry.data.fields.BooleanField({ required: true, initial: false })
        }), { required: true, initial: [] }),
      }, { required: true, nullable: true, initial: null }),
    }),
    {
      required: true,
      initial: [],
    }
  ),
  overrides: new CollectionField(
    new foundry.data.fields.SchemaField({
      value: new SlugField({
        choices: Object.values(PTRCONSTS.AccuracySuccessCategories),
      }),
      uuid: new foundry.data.fields.DocumentUUIDField({}),
    }),
    "uuid",
    { required: true, initial: [] }
  ),
  pp: new foundry.data.fields.SchemaField({
    spent: new foundry.data.fields.BooleanField({ required: true, nullable: false, initial: false }),
    cost: new foundry.data.fields.NumberField({ required: true, nullable: false, initial: 0 }),
  }),
  selfEffects: new foundry.data.fields.SchemaField({
    applied: new foundry.data.fields.BooleanField({ required: true, initial: false }),
    rolls: new foundry.data.fields.ArrayField(new foundry.data.fields.SchemaField({
      chance: new foundry.data.fields.NumberField({ required: true, nullable: false, min: 1, max: 100 }),
      effect: new foundry.data.fields.DocumentUUIDField(),
      label: new foundry.data.fields.StringField({ required: true, initial: "" }),
      roll: new foundry.data.fields.JSONField<
        { required: true, nullable: true, initial: null },
        AnyObject,
        Roll.Evaluated<AttackRoll> | null,
        string | null
      >({ required: true, nullable: true, initial: null }),
      success: new foundry.data.fields.BooleanField({ required: true, nullable: true, initial: null }),
      critOnly: new foundry.data.fields.BooleanField({ required: true, initial: false }),
    }), { required: true, initial: [] }),
  }, { required: true, nullable: true, initial: null })
}

export type AttackMessageSchema = typeof attackMessageSchema;

abstract class AttackMessageSystem extends foundry.abstract.TypeDataModel<AttackMessageSchema, ChatMessage.ConfiguredInstance> {

  declare parent: ChatMessage.ConfiguredInstance & { system: AttackMessageSystem };

  /**
   * Define the schema for the AttackMessageSystem data model
   */
  static override defineSchema(): AttackMessageSchema {
    return attackMessageSchema
  }

  get currentOrigin(): Promise<Maybe<Actor.ConfiguredInstance>> {
    return this.context?.origin?.uuid ? fromUuid<Actor.ConfiguredInstance>(this.context.origin.uuid) : Promise.resolve(null);
  }

  override prepareBaseData(): void {
    this.context = null;

    const fromRollData = (rollData: string | null) => {
      if (!rollData) return null;
      try {
        return Roll.fromJSON(rollData) as unknown as Roll.Evaluated<AttackRoll>;
      } catch (error: unknown) {
        Hooks.onError("AttackMessageSystem#prepareBaseData", error as Error, {
          log: "error",
        });
      }
      return null;
    };

    const fromItemData = (itemData: string | null) => {
      if (!itemData) return null;
      try {
        return CONFIG.Item.documentClass.fromJSON(itemData) as PTR.Item.ItemWithActions;
      } catch (error: unknown) {
        Hooks.onError("AttackMessageSystem#prepareBaseData", error as Error, {
          log: "error",
        });
      }
      return null;
    };

    const fromActorData = (actorData: string) => {
      if (!actorData) return null;

      const jsonData = (() => {
        try {
          return JSON.parse(actorData) as { uuid: ActorUUID };
        } catch (error: unknown) {
          Hooks.onError("AttackMessageSystem#prepareBaseData", error as Error, {
            log: "error",
          });
          return;
        }
      })();
      if (!jsonData) return null;

      const worldActor = fromUuidSync(jsonData.uuid) as Maybe<Actor.ConfiguredInstance>;
      if (worldActor) return worldActor;

      try {
        return CONFIG.Actor.documentClass.fromJSON(actorData) as Actor.ConfiguredInstance;
      } catch (error: unknown) {
        Hooks.onError("AttackMessageSystem#prepareBaseData", error as Error, {
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
      if (source.effectRolls) {
        result.effectRolls = {
          applied: source.effectRolls.applied,
          target: source.effectRolls.target.map((e) => ({
            chance: e.chance,
            effect: e.effect as ItemUUID,
            label: e.label,
            roll: fromRollData(e.roll),
            success: e.success,
            critOnly: e.critOnly,
          })),
          origin: source.effectRolls.origin.map((e) => ({
            chance: e.chance,
            effect: e.effect as ItemUUID,
            label: e.label,
            roll: fromRollData(e.roll),
            success: e.success,
            critOnly: e.critOnly,
          })),
        }
      }
      result.target = fromActorData(source.target)!;
    }

    if (this.selfEffects) {
      this.selfEffects.rolls = this._source.selfEffects!.rolls.map(e => ({
        chance: e.chance,
        effect: e.effect as ItemUUID,
        label: e.label,
        roll: fromRollData(e.roll),
        success: e.success,
        critOnly: e.critOnly,
      }))
    }

    this.origin = fromActorData(this._source.origin)!;
    this.originItem = fromItemData(this._source.originItem)!;

    this.attack = ((): PTR.Models.Action.Models.Attack.Instance => {
      if (!this._source.attack) return this.origin.actions.attack.get(this._source.attackSlug) as PTR.Models.Action.Models.Attack.Instance;
      const jsonData = (() => {
        try {
          return JSON.parse(this._source.attack);
        } catch (error: unknown) {
          Hooks.onError("AttackMessageSystem#prepareBaseData", error as Error, {
            log: "error",
          });
        }
      })();
      if (!jsonData) return {} as PTR.Models.Action.Models.Attack.Instance;

      try {
        const attack = (jsonData.type === 'summon' ? CONFIG.PTR.models.actions.summon.fromJSON(this._source.attack) : CONFIG.PTR.models.actions.attack.fromJSON(this._source.attack)) as PTR.Models.Action.Models.Attack.Instance;
        const sourceItem = (this.originItem ?? this.origin.actions.attack.get(this._source.attackSlug)?.item) as PTR.Item.ItemWithActions;
        const clonedAttack = attack && sourceItem ? attack.clone({}, { parent: sourceItem }) : attack;
        clonedAttack.prepareDerivedData();
        return clonedAttack;
      } catch (error: unknown) {
        Hooks.onError("AttackMessageSystem#prepareBaseData", error as Error, {
          log: "error",
        });
      }
      return {} as PTR.Models.Action.Models.Attack.Instance;
    })() ?? {};

    if (!this.attackSlug)
      Hooks.onError(
        "AttackMessageSystem#attack",
        new Error(
          `Could not find attack with slug ${this._source.attackSlug} in ${this._source.origin}`
        ),
        { log: "error", data: this._source }
      );
  }

  static async renderInnerRoll(roll: Roll.Evaluated<Roll> | null, isPrivate: boolean, success: boolean | null) {
    if (!roll) return null;

    const rollHtmlString = await roll.render({ isPrivate });
    if (success === null) return rollHtmlString;

    const rollHtml = $(rollHtmlString);
    $(rollHtml).find("ol.dice-rolls li.roll").addClass(success ? "success" : "failure");

    return rollHtml[0].outerHTML;
  };

  async getHTMLContent() {
    const renderRolls = async (data: ResultData, isPrivate: boolean) => {
      const result = this.overrides.get(data.target.uuid)?.value || AttackRoll.successCategory(data.accuracy, data.crit);

      const rolls = {
        accuracy: await renderTemplate(
          "systems/ptr2e/templates/chat/rolls/accuracy-check.hbs",
          {
            inner: await AttackMessageSystem.renderInnerRoll(data.accuracy, isPrivate, ["hit", "critical"].includes(result)),
            isPrivate,
            type: "accuracy",
            label: "PTR2E.Attack.AccuracyCheck",
          }
        ),
        crit: await renderTemplate("systems/ptr2e/templates/chat/rolls/crit-check.hbs", {
          inner: await AttackMessageSystem.renderInnerRoll(data.crit, isPrivate, result === "critical"),
          isPrivate,
          type: "crit",
          label: "PTR2E.Attack.CritCheck",
        }),
        damage: await renderTemplate(
          "systems/ptr2e/templates/chat/rolls/damage-randomness.hbs",
          {
            inner: await AttackMessageSystem.renderInnerRoll(data.damage, isPrivate, null),
            isPrivate,
            type: "damage",
            label: "PTR2E.Attack.DamageRandomness",
          }
        ),
        effects: [] as string[],
        none: false
      };
      if (data.effectRolls) {
        async function handleRoll(effectRoll: EffectRollData, target: "origin" | "target") {
          const item = await fromUuid(effectRoll.effect);
          if (!item) {
            Hooks.onError("AttackMessageSystem#getHTMLContent", new Error(`Could not find item with uuid ${effectRoll.effect}`), { log: "error" });
            return;
          };
          if (!effectRoll.roll) {
            Hooks.onError("AttackMessageSystem#getHTMLContent", new Error(`Effect roll for ${item.name} is missing`), { log: "error" });
            return;
          }

          rolls.effects.push(await renderTemplate(
            "systems/ptr2e/templates/chat/rolls/effect-roll.hbs",
            {
              inner: await AttackMessageSystem.renderInnerRoll(effectRoll.roll, isPrivate, effectRoll.success),
              isPrivate,
              type: "effect",
              label: `${effectRoll.label || item.name}${target === 'origin' ? ` (${target})` : ''}`,
            }
          ));
        }

        for (const effectRoll of data.effectRolls.target) {
          await handleRoll(effectRoll, "target");
        }
        for (const effectRoll of data.effectRolls.origin) {
          await handleRoll(effectRoll, "origin");
        }
      }

      if (!rolls.accuracy && !rolls.crit && !rolls.damage && !rolls.effects.length) rolls.none = true;

      return rolls;
    };
    const summonAttack = 'damageType' in this.attack ? this.attack as unknown as PTR.Models.Action.Models.Summon.Instance : null;

    const context: AttackMessageRenderContext =
      this.context ??
      (this.context = {
        pp: this.pp,
        origin: this.origin,
        attack: this.attack,
        hasDamage: summonAttack?.damageType === "flat" ? true : this.results.some((result) => !!result.damage),
        hasEffect: this.results.some((result) => result.effectRolls?.origin.length || result.effectRolls?.target.length),
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
                notes: RollNote.notesToHTML(result.context.notes.map(n => new RollNote(n)))?.outerHTML,
                effect: result.effectRolls ? {
                  some: true,
                  applied: result.effectRolls.applied,
                  effects: {
                    origin: result.effectRolls.origin,
                    target: result.effectRolls.target,
                  }
                } : { some: false, applied: false },
                hasCaptureRoll: !!(this.attack.slug.startsWith("fling") && this.attack.flingItemId),
              };
              if (result.damage) {
                const damage = result.damage.calculateDamageTotal({
                  origin: this.origin,
                  target: result.target,
                  isCritHit: context.hit === "critical",
                  attack: this.attack,
                  isMultiTarget: this._source.results.length > 1,
                  useEnemyStats: this.attack.traits.has("use-opponents-stats")
                });
                if (damage) {
                  context.damage = damage.value;
                  context.damageRoll = damage;
                }
              }
              else if (summonAttack?.damageType === "flat") {
                const damage = AttackRoll.calculateFlatDamage(summonAttack, result.target);
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
        selfEffectRolls: this.selfEffects ? await (async () => {
          const rolls: string[] = [];
          for (const roll of this.selfEffects!.rolls) {
            const item = await fromUuid<Item.ConfiguredInstance>(roll.effect);
            if (!item) {
              Hooks.onError("AttackMessageSystem#getHTMLContent", new Error(`Could not find item with uuid ${roll.effect}`), { log: "error" });
              continue;
            };
            if (!roll.roll) {
              Hooks.onError("AttackMessageSystem#getHTMLContent", new Error(`Effect roll for ${item.name} is missing`), { log: "error" });
              continue;
            }

            rolls.push(await renderTemplate(
              "systems/ptr2e/templates/chat/rolls/effect-roll.hbs",
              {
                inner: await AttackMessageSystem.renderInnerRoll(roll.roll, false, roll.success),
                isPrivate: false,
                type: "effect",
                label: roll.label || item.name,
              }
            ));
          }
          return rolls;
        })() : [],
      });

    return renderTemplate("systems/ptr2e/templates/chat/attack.hbs", context);
  }

  async updateTarget(targetUuid: ActorUUID, { status }: { status: AccuracySuccessCategory }) {
    const target = this.context?.results.get(targetUuid);
    if (!target) return false;

    const overrides = foundry.utils.duplicate(this._source.overrides);
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

  async rollCaptureCheck({ accuracyRoll, critRoll, target }: { accuracyRoll: Roll.Evaluated<CheckRoll>, critRoll: Roll.Evaluated<CheckRoll>, target: Actor.ConfiguredInstance }) {
    if (!(this.attack.slug.startsWith("fling") && this.attack.flingItemId)) return;

    const flingItem = this.origin.items.get(this.attack.flingItemId) as Item.ConfiguredInstance;
    if (!(flingItem.type === "consumable" && (flingItem.system as PTR.Item.System.Consumable.Instance).consumableType === "pokeball")) return;

    const action = CONFIG.PTR.models.actions.pokeball.fromConsumable(flingItem as PTR.Item.System.Consumable.ParentInstance);
    await action.roll({ accuracyRoll, critRoll, targets: [target] })
  }

  async spendPP() {
    if (this.pp.spent) return false;

    const pp = this.context?.pp;
    if (!pp) return false;

    const actor = await this.currentOrigin;
    if (!actor) return false;

    if (actor.system.powerPoints.value < pp.cost) {
      ui.notifications.error(game.i18n.format("PTR2E.AttackWarning.NotEnoughPP", { cost: pp.cost, current: actor.system.powerPoints.value }));
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

  async applyDamage(targetUuid: ActorUUID): Promise<false | number> {
    const result = this.context!.results.get(targetUuid);
    if (!result) return false;

    async function applyEffects(target: Actor.ConfiguredInstance, effects: EffectRollData[], isCrit = false) {
      if (!effects.length) return;
      const toApply = await (async () => {
        const toApply: foundry.data.fields.SchemaField.PersistedType<ActiveEffect.Schema>[] = [];
        for (const effectRoll of effects) {
          if (effectRoll.success === null) {
            effectRoll.success = (effectRoll.roll?.total ?? 1) <= 0
          }
          if (!isCrit && effectRoll.critOnly) continue;
          if (!effectRoll.success) continue;


          const item = await fromUuid(effectRoll.effect);
          if (!item) {
            Hooks.onError("AttackMessageSystem#applyDamage", new Error(`Could not find item with uuid ${effectRoll.effect}`), { log: "error" });
            continue;
          };
          if (item.type !== "effect") {
            Hooks.onError("AttackMessageSystem#applyDamage", new Error(`Item with uuid ${effectRoll.effect} is not an effect`), { log: "error" });
            continue;
          }

          toApply.push(...item.toObject().effects);
        }
        return toApply;
      })();

      if (toApply.length) {
        await target.applyRollEffects(toApply);
      }
    }

    return (await Promise.all([
      (async () => {
        const target = result.target;
        const damage = result.damage;
        if (!damage) return false;

        const damageApplied = await target.applyDamage(damage);
        return damageApplied;
      })(),
      (async (): Promise<void> => {
        const target = result.target;
        await applyEffects(target, result.effect.effects?.target ?? [], result.hit === "critical");
      })(),
      (async (): Promise<void> => {
        const target = await this.currentOrigin;
        if (!target) return;
        await applyEffects(target, result.effect.effects?.origin ?? [], result.hit === "critical");
      })(),
    ]))[0];
  }

  async updateTargets(event: JQuery.ClickEvent) {
    const targets = (() => {
      const controlled = canvas!.tokens!.controlled
        .map((t) => t.actor)
        .filter((t) => !!t) as Actor.ConfiguredInstance[];
      if (controlled.length) {
        if (!(controlled.length === 1 && controlled[0].uuid === this.origin.uuid))
          return controlled;
      }

      return [...game.user.targets].map((t) => t.actor).filter((t) => !!t) as Actor.ConfiguredInstance[];
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
          accuracy: r.rolls.accuracy?.toJSON() ?? null,
          crit: r.rolls.crit?.toJSON() ?? null,
          damage: r.rolls.damage?.toJSON() ?? null,
          context: {
            check: r.check,
            ...R.pick(r.context, ["action", "domains", "notes", "title", "type"]),
            options: Array.from(r.context.options ?? [])
          },
          effectRolls: r.context.effectRolls ?? null
        }));

        if (event.altKey) {
          this.parent.update({
            system: {
              results: newResults,
            },
          });
          return;
        }

        const map = new Map<ActorUUID, typeof this._source.results>();
        for (const result of this._source.results) {
          const json = JSON.parse(result.target);
          map.set(json.uuid as unknown as ActorUUID, result as unknown as typeof this._source.results);
        }
        for (const result of newResults) {
          map.set(result.target.uuid as unknown as ActorUUID, result as unknown as typeof this._source.results);
        }

        const updateResults = Array.from(map.values());

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
    html.find("[data-action='apply-capture']").on("click", async (event) => {
      const targetUuid = (event.currentTarget.closest("[data-target-uuid]") as HTMLElement)?.dataset?.targetUuid;
      if (!targetUuid) return;
      const result = this.results.find(r => r.target.uuid === targetUuid);
      if (!result) return;
      await this.rollCaptureCheck({
        accuracyRoll: result.accuracy!,
        critRoll: result.crit!,
        target: result.target
      });
    });
  }

  public async applyLuckIncrease(targetUuid: ActorUUID) {
    const results = foundry.utils.duplicate(this.results);
    const currentResult = results[this.results.findIndex(r => r.target.uuid == targetUuid)];
    if (!currentResult || !currentResult.accuracy) return;
    const accuracy = currentResult.accuracy;

    const actor = await this.currentOrigin;
    if (!actor) return;

    const number = accuracy.total!;
    const luck = actor.system.skills.get("luck")!.total;
    if (luck < number) {
      ui.notifications.warn("You do not have enough Luck to apply this increase.");
      return;
    }

    const skills = actor.system.skills.map((skill) => {
      return skill.slug === "luck"
        ? {
          ...skill,
          value: luck - number,
        }
        : skill;
    });
    await actor.update({ "system.skills": skills });

    const notification = game.i18n.format("PTR2E.ChatContext.SpendLuckAttack.spent", {
      amount: number,
      actor: actor.name,
      total: actor.system.skills.get("luck")!.total
    })
    ui.notifications.info(notification);

    accuracy.total = 0;

    await this.parent.update({ "system.results": results });

    await CONFIG.ChatMessage.documentClass.create({
      whisper: CONFIG.ChatMessage.documentClass.getWhisperRecipients("GM") as unknown as string[],
      speaker: { alias: actor.name },
      content: notification,
    });
  }
}

interface AttackMessageSystem {
  attack: PTR.Models.Action.Models.Attack.Instance;
  context: Maybe<AttackMessageRenderContext>;
}

interface AttackMessageRenderContext {
  origin: Actor.ConfiguredInstance;
  originItem?: PTR.Item.ItemWithActions;
  attack: PTR.Models.Action.Models.Attack.Instance;
  hasDamage: boolean;
  hasEffect: boolean;
  results: Map<ActorUUID, AttackMessageRenderContextData>;
  pp: {
    spent: boolean;
    cost: number;
  };
  selfEffectRolls: string[];
}

interface AttackMessageRenderContextData {
  rolls: {
    accuracy: string | null;
    crit: string | null;
    damage: string | null;
  };
  target: Actor.ConfiguredInstance;
  hit: AccuracySuccessCategory;
  damage?: number;
  damageRoll?: DamageCalc;
  accuracyRoll?: AccuracyCalc;
  notes: Maybe<string>;
  effect: {
    some: boolean;
    applied: boolean;
    effects?: {
      origin: EffectRollData[];
      target: EffectRollData[];
    }
  }
  hasCaptureRoll?: boolean;
}

// interface Override {
//   value: AccuracySuccessCategory;
//   uuid: ActorUUID;
// }

interface ResultData {
  target: Actor.ConfiguredInstance;
  accuracy: Roll.Evaluated<AttackRoll> | null;
  crit: Roll.Evaluated<AttackRoll> | null;
  damage: Roll.Evaluated<AttackRoll> | null;
  context: CheckContext;
  effectRolls: TargetEffectRolls | null;
}

interface TargetEffectRolls {
  applied: boolean;
  target: EffectRollData[];
  origin: EffectRollData[];
}

interface CheckContext {
  check: CheckContextCheck;
  action: string;
  domains: string[];
  notes: CheckContextRollNote[];
  title: string;
  type: string;
  options: string[];
}

interface CheckContextCheck {
  breakdown: string
  slug: string
  totalModifier: number
  totalModifiers: Record<string, number>
  _modifiers: ModifierPTR2e[]
}

interface CheckContextRollNote {
  selector: string;
  title: string;
  text: string;
  predicate: RawPredicate;
  outcome: number[];
  visibility: UserVisibility;
}

// interface SelfEffects {
//   applied: boolean;
//   rolls: EffectRollData[];
// }

interface EffectRollData {
  chance: number;
  effect: ItemUUID;
  label: string;
  roll: Roll.Evaluated<Roll> | null;
  success: boolean | null;
  critOnly: boolean;
}

export default AttackMessageSystem;