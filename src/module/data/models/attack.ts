import type { ContestType, PokemonCategory, PokemonType } from "@data";
import { ActionPTR2e, PTRCONSTS } from "@data";
import { getTypes } from "@scripts/config/effectiveness.ts";
import type { ActionSchema } from "./action.ts";
import { AttackStatistic } from "@system/statistics/attack.ts";
import type { AttackStatisticRollParameters } from "@system/statistics/statistic.ts";
// import { MovePTR2e } from "@item";
import type { ActorPTR2e } from "@actor";
import { SlugField } from "../fields/slug-field.ts";
import type { AttackRollResult } from "@system/rolls/check-roll.ts";
import type { SummonPTR2e } from "@item";
import { ItemPTR2e } from "@item";
import type { CombatantPTR2e } from "@combat";
import type { ActorSizePTR2e } from "@actor/data/size.ts";

export default class AttackPTR2e extends ActionPTR2e {
  declare type: "attack" | "summon";

  static override TYPE: "attack" | "summon" = "attack" as const;

  static override defineSchema(): AttackSchema & ActionSchema {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      types: new fields.SetField(
        new fields.StringField({
          required: true,
          choices: getTypes().reduce<Record<string, string>>(
            (acc, type) => ({ ...acc, [type]: type }),
            {}
          ),
          initial: PTRCONSTS.Types.UNTYPED,
          label: "PTR2E.FIELDS.pokemonType.label",
          hint: "PTR2E.FIELDS.pokemonType.hint",
        }),
        {
          initial: ["untyped"],
          label: "PTR2E.FIELDS.pokemonType.labelPlural",
          hint: "PTR2E.FIELDS.pokemonType.hintPlural",
          required: true,
          validate: (d) =>
            d instanceof Set ? d.size > 0 : Array.isArray(d) ? d.length > 0 : false,
          validationError: "PTR2E.Errors.PokemonType",
        }
      ),
      category: new fields.StringField({
        required: true,
        choices: Object.values(PTRCONSTS.Categories).reduce<Record<string, string>>(
          (acc, category) => ({ ...acc, [category]: category }),
          {}
        ),
        initial: PTRCONSTS.Categories.PHYSICAL,
        label: "PTR2E.FIELDS.pokemonCategory.label",
        hint: "PTR2E.FIELDS.pokemonCategory.hint",
      }),
      power: new fields.NumberField({
        required: false,
        nullable: true,
        min: 10,
        max: 250,
        label: "PTR2E.FIELDS.power.label",
        hint: "PTR2E.FIELDS.power.hint",
      }),
      accuracy: new fields.NumberField({
        required: false,
        nullable: true,
        min: 10,
        max: 100,
        label: "PTR2E.FIELDS.accuracy.label",
        hint: "PTR2E.FIELDS.accuracy.hint",
      }),
      contestType: new fields.StringField({ required: true, blank: true, initial: "" }),
      contestEffect: new fields.StringField({ required: true, blank: true, initial: "" }),
      free: new fields.BooleanField({
        required: true,
        initial: false,
        label: "PTR2E.FIELDS.free.label",
        hint: "PTR2E.FIELDS.free.hint",
      }),
      slot: new fields.NumberField({
        required: true,
        nullable: true,
        initial: null,
        label: "PTR2E.FIELDS.slot.label",
        hint: "PTR2E.FIELDS.slot.hint",
      }),
      summon: new fields.DocumentUUIDField({
        required: true,
        nullable: true,
        initial: null,
        label: "PTR2E.FIELDS.summon.label",
        hint: "PTR2E.FIELDS.summon.hint",
        type: "Item"
      }),
      defaultVariant: new SlugField({ 
        required: true, 
        nullable: true, 
        initial: null,
        label: "PTR2E.FIELDS.defaultVariant.label",
        hint: "PTR2E.FIELDS.defaultVariant.hint"
      }),
      flingItemId: new foundry.data.fields.StringField({
        required: true,
        nullable: true,
        initial: null,
        label: "PTR2E.FIELDS.flingItemId.label",
        hint: "PTR2E.FIELDS.flingItemId.hint",
      }),
      offensiveStat: new fields.StringField<PTRCONSTS.Stat, PTRCONSTS.Stat, true, true, true>({
        required: true,
        nullable: true,
        choices: PTRCONSTS.Stats.reduce((acc, stat) => ({ ...acc, [stat]: stat }), {"":""} as unknown as Record<PTRCONSTS.Stat, string>),
        initial: null,
        label: "PTR2E.FIELDS.offensiveStat.label",
        hint: "PTR2E.FIELDS.offensiveStat.hint",
      }),
      defensiveStat: new fields.StringField<PTRCONSTS.Stat, PTRCONSTS.Stat, true, true, true>({
        required: true,
        nullable: true,
        choices: PTRCONSTS.Stats.reduce((acc, stat) => ({ ...acc, [stat]: stat }), {"":""} as unknown as Record<PTRCONSTS.Stat, string>),
        initial: null,
        label: "PTR2E.FIELDS.defensiveStat.label",
        hint: "PTR2E.FIELDS.defensiveStat.hint",
      })
    };
  }

  get isFree(): boolean {
    return this.free;
  }

  static override validateJoint(data: AttackPTR2e["_source"]) {
    const category = data.category as PokemonCategory;
    const power = data.power as number;
    if (category === "status" && power)
      throw new Error("Status moves cannot have a power value.");
  }

  override get css() {
    const categorySize = this.types.size > 1 ? "66%" : "50%";
    const typeSizes = this.types.size > 1 ? 66 / this.types.size : 50;
    const gradient = `linear-gradient(120deg, ${Array.from(this.types)
      .flatMap((t, i) => {
        if (i === 0) return [`var(--${t}-color)`, `var(--${t}-color) ${typeSizes}%`];
        return [
          `var(--${t}-color) ${typeSizes * i}%`,
          `var(--${t}-color) ${typeSizes * (i + 1)}%`,
        ];
      })
      .join(` , `)}, var(--${this.category}-color) ${categorySize})`;

    return {
      style: `background: ${gradient};`,
      class: "attack-styling",
    };
  }

  get hasVariants(): boolean {
    return this.variants.length > 0;
  }

  get variants(): string[] {
    if(this.variant) return this.actor?.actions.attack.get(this.variant)?.variants ?? [];
    return this.actor?.actions.attack.filter(a => a.variant == this.slug).map(a => a.slug) ?? [];
  }

  // TODO: This should add any relevant modifiers
  get stab(): 0 | 1 | 1.5 {
    if (!this.actor) return 1;
    const intersection = this.actor.system.type.types.intersection(this.types);
    return intersection.size === 1 && this.types.has(PTRCONSTS.Types.UNTYPED)
      ? 1
      : intersection.size > 0
        ? 1.5
        : 1;
  }

  get rollable(): boolean {
    return true//this.accuracy !== null || this.power !== null;
  }

  getAttackStat(actor: Maybe<ActorPTR2e> = this.actor): number {
    return actor?.getAttackStat(this) ?? 0;
  }

  async roll(args?: AttackStatisticRollParameters): Promise<AttackRollResult['rolls'][] | null | false> {
    if (!this.rollable) return false;
    if(!args?.modifierDialog && !this.variant && this.defaultVariant) {
      const variant = this.actor?.actions.attack.get(this.defaultVariant);
      if(variant) return variant.roll(args);
    } 
    return this.statistic!.check.roll(args);
  }

  override prepareDerivedData(): void {
    super.prepareDerivedData();

    this.statistic = this.prepareStatistic();
  }

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  get isMelee(): boolean {
    return false; // TODO: Implement
  }

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  get isRanged(): boolean {
    return false; // TODO: Implement
  }

  public prepareStatistic({ force }: { force?: boolean } = {}): AttackStatistic | null {
    if (!force && this.statistic) return this.statistic;
    if (!this.actor) return null;
    return new AttackStatistic(this);
  }

  public getRangeIncrement(distance: number | null, size: ActorSizePTR2e): number | null {
    if (
      distance === null ||
      !this.range ||
      !["ally", "enemy", "creature", "object"].includes(this.range.target)
    )
      return null;
    const dangerClose = !!this.traits.get("danger-close");

    const reach = {
      0: 1,
      1: 1,
      2: 1,
      3: 1,
      4: 2,
      5: 3,
      6: 4,
      7: 5,
      8: 6
    }[size.rank] ?? 1;
    const rangeMultiplier = {
      0: 1,
      1: 1,
      2: 1,
      3: 1,
      4: 1.1,
      5: 1.2,
      6: 1.3,
      7: 1.4,
      8: 1.5
    }[size.rank] ?? 1;

    const isInteger = Number.isInteger(distance);
    const reachLimit = isInteger ? reach : Math.sqrt(2 * Math.pow(reach, 2));

    if (this.range.distance <= 1) return distance >= reachLimit ? Infinity : 0;
    const increment = this.range.distance * rangeMultiplier;

    const rangeIncrement = Math.max(Math.ceil(distance / increment), 1) - 1;

    return dangerClose
      ? rangeIncrement == 0
        ? -Infinity
        : rangeIncrement - 1
      : rangeIncrement;
  }

  async delayAction(number?: number) {
    if(!this.actor) return;
    if(!game.combat) return void ui.notifications.error("You must be in combat to be able to delay an action.");
    if(game.combat.combatant?.actor !== this.actor) return void ui.notifications.error("You must be the active combatant to delay this action.");
    if(number === undefined || number === null) {
      const dialog = await foundry.applications.api.DialogV2.prompt<number>({
        window: {title: game.i18n.localize("PTR2E.Dialog.DelayActionTitle")},
        classes: ["center-text"],
        content: `<p>${game.i18n.localize("PTR2E.Dialog.DelayActionContent")}</p><input type="number" name="delay" min=1 max=3 step=1>`,
        ok: {
          action: "ok",
          label: "Delay Action",
          callback: (_event, _button, dialog) => {
            return dialog?.querySelector<HTMLInputElement>("input[name='delay']")?.value
          }
        }
      })
      if(!dialog) return;
      number = dialog;
    }
    if(number <= 0) return;

    const delay = Math.min(3, number);

    const summonItem = new ItemPTR2e({
      name: `${this.actor.name}'s Delayed (${delay}) ${this.name}`,
      type: "summon",
      img: this.img,
      system: {
        owner: this.actor.uuid,
        actions: [
          this.clone({
            type: "summon",
            targetType: "target"
          }).toObject()
        ]
      }
    }) as SummonPTR2e;

    const combatants = await game.combat.createEmbeddedDocuments("Combatant", [{
      name: summonItem.name,
      type: "summon",
      system: {
        owner: this.actor?.uuid ?? null,
        item: summonItem.toObject(),
        delay
      }
    }])

    if (!combatants.length) return void ui.notifications.error("Failed to create delay action.");

    ChatMessage.create({
      content: `Added: ${(combatants as CombatantPTR2e[]).map(c => c.link).join(", ")} to Combat.`,
    });
  }

  override prepareUpdate(data: DeepPartial<SourceFromSchema<ActionSchema>>): ActionPTR2e[] {
    const currentActions = super.prepareUpdate(data);

    for (const action of currentActions) {
      if (action.type !== "attack") continue;
      const attack = action as AttackPTR2e;
      if (attack.category === "status") {
        attack.power = null;
      }
    }
    return currentActions;
  }

  override getRollOptions(prefix = ""): Set<string> {
    return new Set([
      `attack:${this.slug}`,
      `attack:slug:${this.slug}`,
      `attack:category:${this.category}`,
      ...(this.types.map(type => `attack:type:${type}`)),
    ]).map(key => prefix ? `${prefix}:${key}` : key);
  }
}

export default interface AttackPTR2e extends ActionPTR2e, ModelPropsFromSchema<AttackSchema> {
  // update(
  //     data: DeepPartial<SourceFromSchema<AttackSchema>> &
  //         DeepPartial<SourceFromSchema<ActionSchema>>
  // ): Promise<this["item"]>;
  // prepareUpdate(
  //     data: DeepPartial<SourceFromSchema<AttackSchema>> &
  //         DeepPartial<SourceFromSchema<ActionSchema>>
  // ): (SourceFromSchema<ActionSchema> & SourceFromSchema<AttackSchema>)[];

  statistic: Maybe<AttackStatistic>;

  _source: SourceFromSchema<AttackSchema> & SourceFromSchema<ActionSchema>;
}

interface AttackSchema extends foundry.data.fields.DataSchema {
  types: foundry.data.fields.SetField<
    foundry.data.fields.StringField<string, PokemonType, true, false, true>,
    PokemonType[],
    Set<PokemonType>,
    true,
    false,
    true
  >;
  category: foundry.data.fields.StringField<string, PokemonCategory, true, false, true>;
  power: foundry.data.fields.NumberField<number>;
  accuracy: foundry.data.fields.NumberField<number>;
  contestType: foundry.data.fields.StringField<string, ContestType, true>;
  contestEffect: foundry.data.fields.StringField<string, string, true>;
  free: foundry.data.fields.BooleanField<boolean, boolean>;
  slot: foundry.data.fields.NumberField<number, number, true, true, true>;
  summon: foundry.data.fields.DocumentUUIDField<string>;
  defaultVariant: SlugField<string, string, true, true, true>;
  flingItemId: foundry.data.fields.StringField<string, string, true, true, true>;
  offensiveStat: foundry.data.fields.StringField<PTRCONSTS.Stat, PTRCONSTS.Stat, true, true, true>;
  defensiveStat: foundry.data.fields.StringField<PTRCONSTS.Stat, PTRCONSTS.Stat, true, true, true>;
}
