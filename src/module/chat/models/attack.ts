import { ActorPTR2e } from "@actor";
import AttackPTR2e from "@module/data/models/attack.ts";
import { ChatMessagePTR2e } from "@chat";
import { AccuracySuccessCategory, PokeballActionPTR2e, PTRCONSTS, SummonAttackPTR2e } from "@data";
import { SlugField } from "@module/data/fields/slug-field.ts";
import { AttackRoll } from "@system/rolls/attack-roll.ts";
import { AccuracyCalc, DamageCalc } from "./data.ts";
import { CollectionField } from "@module/data/fields/collection-field.ts";
import * as R from "remeda";
import { PredicateField } from "@system/predication/schema-data-fields.ts";
import { UserVisibility } from "@scripts/ui/user-visibility.ts";
import { ModifierPTR2e } from "@module/effects/modifiers.ts";
import { RollNote } from "@system/notes.ts";
import { ActiveEffectPTR2e } from "@effects";
import { ConsumablePTR2e, ItemPTR2e, ItemSourcePTR2e, ItemSystemsWithActions } from "@item";
import ConsumableSystem from "@item/data/consumable.ts";
import { CheckRoll } from "@system/rolls/check-roll.ts";
import { ItemAlteration } from "@module/effects/alterations/item.ts";

abstract class AttackMessageSystem extends foundry.abstract.TypeDataModel {
  declare parent: ChatMessagePTR2e<AttackMessageSystem>;

  /**
   * Define the schema for the AttackMessageSystem data model
   */
  static override defineSchema(): AttackMessageSchema {
    const fields = foundry.data.fields;
    return {
      origin: new fields.JSONField({ required: true }),
      originItem: new fields.JSONField({ required: true, nullable: true, initial: null }),
      attack: new fields.JSONField({ required: false }),
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
          context: new fields.SchemaField({
            check: new fields.SchemaField({
              breakdown: new fields.StringField({ required: true, blank: true, initial: "" }),
              slug: new SlugField({ required: true, blank: true, initial: "" }),
              totalModifier: new fields.NumberField({ required: true, initial: 0 }),
              totalModifiers: new fields.ObjectField({ required: true, initial: {} }),
              _modifiers: new fields.ArrayField(new fields.ObjectField(), { required: true, initial: [] }),
            }),
            action: new fields.StringField({ required: true, blank: true, initial: "" }),
            domains: new fields.ArrayField(new SlugField(), { required: true, initial: [] }),
            notes: new fields.ArrayField(
              new fields.SchemaField({
                selector: new fields.StringField({ required: true, blank: true, initial: "" }),
                title: new fields.StringField({ required: true, blank: true, initial: "" }),
                text: new fields.StringField({ required: true, blank: true, initial: "" }),
                predicate: new PredicateField({ required: true, initial: [] }),
                outcome: new fields.ArrayField(new fields.NumberField(), { required: true, initial: [] }),
                visibility: new fields.StringField({ required: true, initial: "all", choices: ["all", "gm", "owner", "none"] }),
              }),
              { required: true, initial: [] }
            ),
            title: new fields.StringField({ required: true, blank: true, initial: "" }),
            type: new fields.StringField({ required: true, blank: true, initial: "" }),
            options: new fields.ArrayField(new fields.StringField(), { required: true, initial: [] }),
          }),
          effectRolls: new fields.SchemaField({
            applied: new fields.BooleanField({ required: true, initial: false }),
            target: new fields.ArrayField(new fields.SchemaField({
              chance: new fields.NumberField({ required: true, min: 1, max: 100 }),
              effect: new fields.DocumentUUIDField(),
              label: new fields.StringField({ required: true, initial: "" }),
              roll: new fields.JSONField({ required: true, nullable: true, initial: null }),
              success: new fields.BooleanField({ required: true, nullable: true, initial: null }),
              critOnly: new fields.BooleanField({ required: true, initial: false }),
              alterations: new fields.ArrayField(new fields.EmbeddedDataField(ItemAlteration)),
            }), { required: true, initial: [] }),
            origin: new fields.ArrayField(new fields.SchemaField({
              chance: new fields.NumberField({ required: true, min: 1, max: 100 }),
              effect: new fields.DocumentUUIDField(),
              label: new fields.StringField({ required: true, initial: "" }),
              roll: new fields.JSONField({ required: true, nullable: true, initial: null }),
              success: new fields.BooleanField({ required: true, nullable: true, initial: null }),
              critOnly: new fields.BooleanField({ required: true, initial: false }),
              alterations: new fields.ArrayField(new fields.EmbeddedDataField(ItemAlteration)),
            }), { required: true, initial: [] }),
            defensive: new fields.ArrayField(new fields.SchemaField({
              chance: new fields.NumberField({ required: true, min: 1, max: 100 }),
              effect: new fields.DocumentUUIDField(),
              label: new fields.StringField({ required: true, initial: "" }),
              roll: new fields.JSONField({ required: true, nullable: true, initial: null }),
              success: new fields.BooleanField({ required: true, nullable: true, initial: null }),
              critOnly: new fields.BooleanField({ required: true, initial: false }),
              alterations: new fields.ArrayField(new fields.EmbeddedDataField(ItemAlteration)),
            }), { required: true, initial: [] }),
          }, { required: true, nullable: true, initial: null }),
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
      selfEffects: new fields.SchemaField({
        applied: new fields.BooleanField({ required: true, initial: false }),
        rolls: new fields.ArrayField(new fields.SchemaField({
          chance: new fields.NumberField({ required: true, min: 1, max: 100 }),
          effect: new fields.DocumentUUIDField(),
          label: new fields.StringField({ required: true, initial: "" }),
          roll: new fields.JSONField({ required: true, nullable: true, initial: null }),
          success: new fields.BooleanField({ required: true, nullable: true, initial: null }),
          critOnly: new fields.BooleanField({ required: true, initial: false }),
          alterations: new fields.ArrayField(new fields.EmbeddedDataField(ItemAlteration)),
        }), { required: true, initial: [] }),
      }, { required: true, nullable: true, initial: null })
    };
  }

  /**
   * Validate that Rolls belonging to the ChatMessage document are valid
   * @param {string} rollJSON     The serialized Roll data
   */
  static #validateRoll(rollJSON: unknown) {
    const roll = JSON.parse(rollJSON as string);
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
        return ItemPTR2e.fromJSON(itemData) as ItemPTR2e<ItemSystemsWithActions>;
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
          return JSON.parse(actorData);
        } catch (error: unknown) {
          Hooks.onError("AttackMessageSystem#prepareBaseData", error as Error, {
            log: "error",
          });
        }
      })();
      if (!jsonData) return null;

      const worldActor = fromUuidSync(jsonData.uuid) as Maybe<ActorPTR2e>;
      if (worldActor) return worldActor;

      try {
        return ActorPTR2e.fromJSON(actorData) as ActorPTR2e;
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
            alterations: e.alterations?.map(a => new ItemAlteration(a)) ?? [],
          })),
          origin: source.effectRolls.origin.map((e) => ({
            chance: e.chance,
            effect: e.effect as ItemUUID,
            label: e.label,
            roll: fromRollData(e.roll),
            success: e.success,
            critOnly: e.critOnly,
            alterations: e.alterations?.map(a => new ItemAlteration(a)) ?? [],
          })),
          defensive: source.effectRolls.defensive.map((e) => ({
            chance: e.chance,
            effect: e.effect as ItemUUID,
            label: e.label,
            roll: fromRollData(e.roll),
            success: e.success,
            critOnly: e.critOnly,
            alterations: e.alterations?.map(a => new ItemAlteration(a)) ?? [],
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
        alterations: e.alterations?.map(a => new ItemAlteration(a)) ?? [],
      }))
    }

    this.origin = fromActorData(this._source.origin)!;
    this.originItem = fromItemData(this._source.originItem);

    this.attack = ((): AttackPTR2e => {
      if (!this._source.attack) return this.origin.actions.attack.get(this._source.attackSlug) as AttackPTR2e;
      const jsonData = (() => {
        try {
          return JSON.parse(this._source.attack);
        } catch (error: unknown) {
          Hooks.onError("AttackMessageSystem#prepareBaseData", error as Error, {
            log: "error",
          });
        }
      })();
      if (!jsonData) return {} as AttackPTR2e;

      try {
        const attack = (jsonData.type === 'summon' ? SummonAttackPTR2e.fromJSON(this._source.attack) : AttackPTR2e.fromJSON(this._source.attack)) as AttackPTR2e;
        const sourceItem = this.originItem ?? this.origin.actions.attack.get(this._source.attackSlug)?.item;
        const clonedAttack = attack && sourceItem ? attack.clone({}, { parent: sourceItem }) : attack;
        clonedAttack.prepareDerivedData();
        return clonedAttack;
      } catch (error: unknown) {
        Hooks.onError("AttackMessageSystem#prepareBaseData", error as Error, {
          log: "error",
        });
      }
      return {} as AttackPTR2e;
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

  static async renderInnerRoll(roll: Rolled<Roll> | null, isPrivate: boolean, success: boolean | null) {
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
        async function handleRoll(effectRoll: foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<EffectRollsSchema>>, target: "origin" | "target" | "defensive") {
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
        for (const effectRoll of data.effectRolls.defensive) {
          await handleRoll(effectRoll, "defensive");
        }
      }

      if (!rolls.accuracy && !rolls.crit && !rolls.damage && !rolls.effects.length) rolls.none = true;

      return rolls;
    };
    const summonAttack = 'damageType' in this.attack ? this.attack as SummonAttackPTR2e : null;

    const context: AttackMessageRenderContext =
      this.context ??
      (this.context = {
        pp: this.pp,
        origin: this.origin,
        attack: this.attack,
        hasDamage: summonAttack?.damageType === "flat" ? true : this.results.some((result) => !!result.damage),
        hasEffect: this.results.some((result) => result.effectRolls?.origin.length || result.effectRolls?.target.length || result.effectRolls?.defensive.length),
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
                    defensive: result.effectRolls.defensive,
                  }
                } : { some: false, applied: false },
                hasCaptureRoll: !!(this.attack.slug?.startsWith("fling") && this.attack.flingItemId),
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
          const rolls = [];
          for (const roll of this.selfEffects!.rolls) {
            const item = await fromUuid(roll.effect);
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

  async rollCaptureCheck({ accuracyRoll, critRoll, target }: { accuracyRoll: Rolled<CheckRoll>, critRoll: Rolled<CheckRoll>, target: ActorPTR2e }) {
    if (!(this.attack.slug.startsWith("fling") && this.attack.flingItemId)) return;

    const flingItem = this.origin.items.get(this.attack.flingItemId) as ItemPTR2e;
    if (!(flingItem.type === "consumable" && (flingItem.system as ConsumableSystem).consumableType === "pokeball")) return;

    const action = PokeballActionPTR2e.fromConsumable(flingItem as ConsumablePTR2e);
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

    async function applyEffects(target: ActorPTR2e, effects: foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<EffectRollsSchema>>[], isCrit = false) {
      if (!effects.length) return;
      const toApply = await (async () => {
        const toApply: ActiveEffectPTR2e['_source'][] = [];
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

          const grantedSource = item.toObject();

          try {
            for (const alteration of effectRoll.alterations ?? []) {
              alteration.applyTo(grantedSource as ItemSourcePTR2e);
            }

            toApply.push(...grantedSource.effects as ActiveEffectPTR2e['_source'][]);
          } catch (error) {
            if (error instanceof Error) console.warn(error);
          }

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
      (async (): Promise<void> => {
        const target = result.target;
        await applyEffects(target, result.effect.effects?.defensive ?? [], result.hit === "critical");
      })(),
    ]))[0];
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
    const results = fu.duplicate(this.parent.system.results);
    const currentResult = results[this.parent.system.results.findIndex(r => r.target.uuid == targetUuid)];
    if (!currentResult || !currentResult.accuracy) return;
    const accuracy = currentResult.accuracy;

    const actor = await this.currentOrigin;
    if (!actor) return;

    const number = accuracy.total;
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

    //@ts-expect-error - As this is an object duplicate, the property is no longer read-only.
    accuracy.total = 0;

    await this.parent.update({ "system.results": results });

    await ChatMessagePTR2e.create({
      whisper: ChatMessagePTR2e.getWhisperRecipients("GM") as unknown as string[],
      speaker: { alias: actor.name },
      content: notification,
    });
  }

  public async spendLuck({ entry, choice }: { entry: TargetData, choice: { type: string; amount: number; name?: string; index?: number } }) {
    const actor = ["origin-effect", "defensive-effect"].includes(choice.type) ? await fromUuid<ActorPTR2e>(entry.uuid) : await this.currentOrigin;
    if (!actor) return;

    const luck = actor.system.skills.get("luck")!.total;
    if (!entry.result) {
      if (choice.type !== "self-effect") throw new Error("Attempting to spend luck on a Self Effect but no Self Effect was selected");
      if (choice.index === undefined) throw new Error("No Self Effect index was provided");
      if (!this.selfEffects) throw new Error("No Self Effects were found");

      const results = fu.duplicate(this.selfEffects);
      const currentResult = results[choice.index] as { roll: Rolled<AttackRoll>, success: boolean };
      if (!currentResult) return;

      const value = currentResult.roll!.total;
      if (luck < value) {
        ui.notifications.warn("You do not have enough Luck to apply this increase.");
        return;
      }

      await actor.update({
        "system.skills": actor.system.skills.map((skill) => {
          return skill.slug === "luck"
            ? {
              ...skill,
              value: luck - value,
            }
            : skill;
        })
      });

      const notification = game.i18n.format("PTR2E.ChatContext.SpendLuckAttack.spent", {
        amount: value,
        actor: actor.name,
        total: actor.system.skills.get("luck")!.total,
        type: choice.name ?? "Self Effect "
      });
      ui.notifications.info(notification);

      //@ts-expect-error - As this is an object duplicate, the property is no longer read-only.
      currentResult.roll.total = 0;
      currentResult.success = true;

      await this.parent.update({ "system.selfEffects": results });

      await ChatMessagePTR2e.create({
        whisper: ChatMessagePTR2e.getWhisperRecipients("GM") as unknown as string[],
        speaker: { alias: actor.name },
        content: notification,
      });
    }

    const results = fu.duplicate(this.parent.system.results);
    const currentResult = results[this.parent.system.results.findIndex(r => r.target.uuid == entry.uuid)];
    if (!currentResult) return;
    
    const result = (() => {
      switch (choice.type) {
        case "target-effect": return currentResult.effectRolls?.target[choice.index!];
        case "origin-effect": return currentResult.effectRolls?.origin[choice.index!];
        case "defensive-effect": return currentResult.effectRolls?.defensive[choice.index!];
      }
      return null;
    })()
    const roll = result ? result.roll : choice.type === "accuracy" ? currentResult.accuracy : choice.type === "crit" ? currentResult.crit : null;
    if (!roll) return;

    const value = roll.total;
    if (luck < value) {
      ui.notifications.warn("You do not have enough Luck to apply this increase.");
      return;
    }

    await actor.update({
      "system.skills": actor.system.skills.map((skill) => {
        return skill.slug === "luck"
          ? {
            ...skill,
            value: luck - value,
          }
          : skill;
      })
    });
    
    const notification = game.i18n.format("PTR2E.ChatContext.SpendLuckAttack.spent", {
      amount: value,
      actor: actor.name,
      total: actor.system.skills.get("luck")!.total,
      type: (() => {
        switch (choice.type) {
          case "accuracy": return "Accuracy";
          case "crit": return "Crit";
          case "target-effect":
          case "origin-effect":
          case "defensive-effect": return choice.name ?? "Effect"
        }
        return "";
      })()
    })
    ui.notifications.info(notification);

    //@ts-expect-error - As this is an object duplicate, the property is no longer read-only.
    roll.total = 0;
    if(result) result.success = true;

    await this.parent.update({ "system.results": results });

    await ChatMessagePTR2e.create({
      whisper: ChatMessagePTR2e.getWhisperRecipients("GM") as unknown as string[],
      speaker: { alias: actor.name },
      content: notification,
    });
  }
}

export interface TargetData {
  uuid: string;
  name: string;
  img: string;
  result?: AttackResultsData;
  results: { type: string; amount: number, name?: string, index?: number }[];
}

interface AttackMessageSystem extends ModelPropsFromSchema<AttackMessageSchema> {
  _source: SourceFromSchema<AttackMessageSchema>;
  attack: AttackPTR2e;
  context: Maybe<AttackMessageRenderContext>;
}
interface AttackMessageRenderContext {
  origin: ActorPTR2e;
  originItem?: ItemPTR2e<ItemSystemsWithActions>;
  attack: AttackPTR2e;
  hasDamage: boolean;
  hasEffect: boolean;
  results: Map<ActorUUID, AttackMessageRenderContextData>;
  pp: ModelPropsFromSchema<PPSchema>;
  selfEffectRolls: string[];
}

interface AttackMessageRenderContextData {
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
  notes: Maybe<string>;
  effect: {
    some: boolean;
    applied: boolean;
    effects?: {
      origin: foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<EffectRollsSchema>>[];
      target: foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<EffectRollsSchema>>[];
      defensive: foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<EffectRollsSchema>>[];
    };
  };
  hasCaptureRoll?: boolean;
}

export type AttackResultsData = ModelPropsFromSchema<AttackMessageSchema>["results"][number];

interface AttackMessageSchema extends foundry.data.fields.DataSchema {
  origin: foundry.data.fields.JSONField<ActorPTR2e, true, false, false>;
  originItem: foundry.data.fields.JSONField<ItemPTR2e<ItemSystemsWithActions>, true, true, true>;
  attack: foundry.data.fields.JSONField<AttackPTR2e, false, false, false>;
  attackSlug: SlugField<string, string, true, false, false>;
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
    Collection<foundry.data.fields.ModelPropFromDataField<
      foundry.data.fields.SchemaField<OverrideSchema>
    >>,
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
  selfEffects: foundry.data.fields.SchemaField<
    SelfEffectsSchema,
    foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<SelfEffectsSchema>>,
    foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<SelfEffectsSchema>>,
    true,
    true,
    true
  >;
}

interface OverrideSchema extends foundry.data.fields.DataSchema {
  value: SlugField<AccuracySuccessCategory, AccuracySuccessCategory, true, false, false>;
  uuid: foundry.data.fields.DocumentUUIDField<"Actor", true, false, false>;
}

interface PPSchema extends foundry.data.fields.DataSchema {
  spent: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
  cost: foundry.data.fields.NumberField<number, number, true, false, true>;
}

type ResultData = foundry.data.fields.ModelPropFromDataField<ResultSchema>;

type ResultSchema = foundry.data.fields.SchemaField<
  {
    target: foundry.data.fields.JSONField<ActorPTR2e, true, false, false>;
    accuracy: foundry.data.fields.JSONField<Rolled<AttackRoll>, true, true, false>;
    crit: foundry.data.fields.JSONField<Rolled<AttackRoll>, true, true, false>;
    damage: foundry.data.fields.JSONField<Rolled<AttackRoll>, true, true, false>;
    context: foundry.data.fields.SchemaField<
      CheckContextSchema,
      foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<CheckContextSchema>>,
      foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<CheckContextSchema>>,
      true, false, true>;
    effectRolls: foundry.data.fields.SchemaField<
      TargetEffectRollsSchema,
      foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<TargetEffectRollsSchema>>,
      foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<TargetEffectRollsSchema>>,
      true, true, true>;
  },
  {
    target: string;
    accuracy: string | null;
    crit: string | null;
    damage: string | null;
    context: foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<CheckContextSchema>>;
    effectRolls: foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<TargetEffectRollsSchema>> | null;
  },
  {
    target: ActorPTR2e;
    accuracy: Rolled<AttackRoll> | null;
    crit: Rolled<AttackRoll> | null;
    damage: Rolled<AttackRoll> | null;
    context: foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<CheckContextSchema>>;
    effectRolls: foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<TargetEffectRollsSchema>> | null;
  }
>;

interface TargetEffectRollsSchema extends foundry.data.fields.DataSchema {
  applied: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
  target: foundry.data.fields.ArrayField<
    foundry.data.fields.SchemaField<EffectRollsSchema>,
    foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<EffectRollsSchema>>[],
    foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<EffectRollsSchema>>[],
    true, false, true>;
  origin: foundry.data.fields.ArrayField<
    foundry.data.fields.SchemaField<EffectRollsSchema>,
    foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<EffectRollsSchema>>[],
    foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<EffectRollsSchema>>[],
    true, false, true>;
  defensive: foundry.data.fields.ArrayField<
    foundry.data.fields.SchemaField<EffectRollsSchema>,
    foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<EffectRollsSchema>>[],
    foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<EffectRollsSchema>>[],
    true, false, true>;
}

interface CheckContextSchema extends foundry.data.fields.DataSchema {
  check: foundry.data.fields.SchemaField<
    CheckContextCheckSchema,
    foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<CheckContextCheckSchema>>,
    foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<CheckContextCheckSchema>>,
    true,
    false,
    false
  >;
  action: foundry.data.fields.StringField<string, string, true, false, true>;
  domains: foundry.data.fields.ArrayField<SlugField, string[], string[], true, false, true>;
  notes: foundry.data.fields.ArrayField<
    CheckContextRollNotesSchemaField,
    foundry.data.fields.SourcePropFromDataField<CheckContextRollNotesSchemaField>[],
    foundry.data.fields.ModelPropFromDataField<CheckContextRollNotesSchemaField>[],
    true, false, true>;
  title: foundry.data.fields.StringField<string, string, true, false, true>;
  type: foundry.data.fields.StringField<string, string, true, false, true>;
  options: foundry.data.fields.ArrayField<foundry.data.fields.StringField, string[], string[], true, false, true>;
}

interface CheckContextCheckSchema extends foundry.data.fields.DataSchema {
  breakdown: foundry.data.fields.StringField<string, string, true, false, true>;
  slug: SlugField<string, string, true, false, true>;
  totalModifier: foundry.data.fields.NumberField<number, number, true, false, true>;
  totalModifiers: foundry.data.fields.ObjectField<object, object, true, false, true>;
  _modifiers: foundry.data.fields.ArrayField<foundry.data.fields.ObjectField<ModifierPTR2e>, ModifierPTR2e[], ModifierPTR2e[], true, false, true>;
}

export type CheckContextRollNotesSchemaField = foundry.data.fields.SchemaField<
  CheckContextRollNoteSchema,
  foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<CheckContextRollNoteSchema>>,
  foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<CheckContextRollNoteSchema>>,
  true,
  false,
  true
>;

interface CheckContextRollNoteSchema extends foundry.data.fields.DataSchema {
  selector: foundry.data.fields.StringField<string, string, true, false, true>;
  title: foundry.data.fields.StringField<string, string, true, false, true>;
  text: foundry.data.fields.StringField<string, string, true, false, true>;
  predicate: PredicateField<true, false, true>;
  outcome: foundry.data.fields.ArrayField<foundry.data.fields.NumberField, number[], number[], true, false, true>;
  visibility: foundry.data.fields.StringField<UserVisibility, UserVisibility, true, false, true>;
}

interface SelfEffectsSchema extends foundry.data.fields.DataSchema {
  applied: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
  rolls: foundry.data.fields.ArrayField<
    SelfEffectRollsSchemaField,
    foundry.data.fields.SourcePropFromDataField<SelfEffectRollsSchemaField>[],
    foundry.data.fields.ModelPropFromDataField<SelfEffectRollsSchemaField>[],
    true,
    false,
    true
  >
}

type SelfEffectRollsSchemaField = foundry.data.fields.SchemaField<
  EffectRollsSchema,
  foundry.data.fields.SourcePropFromDataField<foundry.data.fields.SchemaField<EffectRollsSchema>>,
  foundry.data.fields.ModelPropFromDataField<foundry.data.fields.SchemaField<EffectRollsSchema>>,
  true,
  false,
  true>;

interface EffectRollsSchema extends foundry.data.fields.DataSchema {
  chance: foundry.data.fields.NumberField<number, number, true, false, false>;
  effect: foundry.data.fields.DocumentUUIDField<ItemUUID, true, false, false>;
  label: foundry.data.fields.StringField<string, string, true, false, true>;
  roll: foundry.data.fields.JSONField<Rolled<Roll>, true, true, true>;
  success: foundry.data.fields.BooleanField<boolean, boolean, true, true, true>;
  critOnly: foundry.data.fields.BooleanField<boolean, boolean, true, false, true>;
  alterations: foundry.data.fields.ArrayField<foundry.data.fields.EmbeddedDataField<ItemAlteration>>;
}

export default AttackMessageSystem;
