import { ActionPTR2e, ContestType, PTRCONSTS, PokemonCategory, PokemonType } from "@data";
import { getTypes } from "@scripts/config/effectiveness.ts";
import { ActionSchema } from "./action.ts";
import { AttackStatistic } from "@system/statistics/attack.ts";
import { AttackStatisticRollParameters } from "@system/statistics/statistic.ts";
// import { MovePTR2e } from "@item";
import { ActorPTR2e } from "@actor";
import { SlugField } from "../fields/slug-field.ts";
import { AttackRollResult } from "@system/rolls/check-roll.ts";

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

  public getRangeIncrement(distance: number | null): number | null {
    if (
      distance === null ||
      !this.range ||
      !["ally", "enemy", "creature", "object"].includes(this.range.target)
    )
      return null;
    const dangerClose = !!this.traits.get("danger-close");

    // TODO: Implement Reach
    if (this.range.distance <= 1) return distance >= 2 ? Infinity : 0;
    const increment = this.range.distance;

    const rangeIncrement = Math.max(Math.ceil(distance / increment), 1) - 1;

    return dangerClose
      ? rangeIncrement == 0
        ? -Infinity
        : rangeIncrement - 1
      : rangeIncrement;
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
}
