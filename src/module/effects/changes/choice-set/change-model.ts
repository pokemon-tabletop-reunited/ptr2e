import { ChangeModel, ChangeModelOptions, ChangeSchema } from "@data";
import { ItemType } from "@item/data/system.ts";
import { PickableThing } from "@module/apps/pick-a-thing-prompt.ts";
import { DataUnionField } from "@module/data/fields/data-union-field.ts";
import { StrictArrayField, StrictBooleanField, StrictObjectField, StrictStringField } from "@module/data/fields/strict-primitive-fields.ts";
import { Predicate, RawPredicate } from "@system/predication/predication.ts";
import { PredicateField } from "@system/predication/schema-data-fields.ts";
import { sluggify } from "@utils";
import * as R from "remeda"
import { UUIDUtils } from "src/util/uuid.ts";
import { ChoiceSetPrompt } from "./prompt.ts";
import { ItemPTR2e, ItemSystemPTR } from "@item";
import { ActorPTR2e } from "@actor";

export default class ChoiceSetChangeSystem extends ChangeModel {
  declare choices: UninflatedChoiceSet;
  declare flag: string;
  declare allowedDrops: AllowedDropsData | null;
  declare allowNoSelection: boolean;

  /** Whether this choice set consists of items */
  containsItems = false;

  /** The user's selection from among the options in `choices`, or otherwise `null` */
  selection: string | number | object | null;

  constructor(source: ChoiceSetSource, options: ChangeModelOptions) {
    super(source, options);

    this.allowedDrops ??= null;
    this.allowNoSelection ??= false;
    this.rollOption ??= this.slug;

    this.flag = this.setDefaultFlag(this);
    this.selection =
      typeof source.selection === "string" || typeof source.selection === "number" || R.isObject(source.selection)
        ? source.selection
        : null;

    if (R.isObject(this.choices) && !Array.isArray(this.choices) && !("filter" in this.choices)) {
      this.choices.predicate = new Predicate(this.choices.predicate ?? [])
    }

    // Assign the selection to a flag on the parent item so that it may be referenced by other choice models on
    // the same item. If a roll option is specified, assign that as well.
    this.item?.rollOptions.addOption("change-selections", this.rollOption);
    if (this.selection !== null) {
      this.setRollOption(this.selection);
    } else if (!this.allowNoSelection && this.test()) {
      // Disable this and all other change models on the effect until a selection is made
      this.ignored = true;
      for (const change of this.effect.changes) {
        change.ignored = true;
      }
    }
  }

  static override defineSchema(): ChoiceSetSchema {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    return {
      ...schema,
      choices: new DataUnionField(
        [
          new StrictArrayField<
            StrictObjectField<PickableThing>,
            PickableThing[],
            PickableThing[],
            true,
            false,
            false
          >(new StrictObjectField<PickableThing>({ required: true, nullable: false, initial: undefined })),
          new StrictObjectField<ChoiceSetObject>({ required: true, nullable: false, initial: undefined }),
          new StrictStringField<string, string, true, false, false>({ required: true, nullable: false, initial: undefined, }),
        ],
        { required: true, nullable: false, initial: undefined }
      ),
      prompt: new fields.StringField({
        required: false,
        blank: false,
        nullable: false,
        initial: "PTR2E.ChoiceSetPrompt.Prompt",
      }),
      adjustName: new DataUnionField(
        [
          new StrictBooleanField({ required: true, nullable: false, initial: undefined }),
          new StrictStringField<string, string, true, false, false>({ required: true, nullable: false, initial: undefined }),
        ],
        { required: true, nullable: false, initial: true }
      ),
      allowedDrops: new fields.SchemaField(
        {
          label: new fields.StringField({ required: true, blank: false, nullable: true, initial: null }),
          predicate: new PredicateField(),
        },
        { required: false, nullable: true, initial: undefined }
      ),
      flag: new fields.StringField({ required: false, blank: false, nullable: false, initial: undefined }),
      rollOption: new fields.StringField({ required: false, blank: false, nullable: true, initial: null }),
      allowNoSelection: new StrictBooleanField({ required: false, nullable: false, initial: undefined }),
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  override apply(): void { }

  override async preCreate({ changeSource, effectSource, pendingItems, context }: ChangeModel.PreCreateParams<ChoiceSetSource>): Promise<void> {
    const rollOptions = new Set([this.actor?.getRollOptions() ?? [], this.item?.getRollOptions() ?? []].flat());
    const predicate = this.resolveInjectedProperties(this.predicate);
    if (!predicate.test(rollOptions)) return;

    if (R.isObject(this.choices)) {
      if ("ownedItems" in this.choices && this.choices.ownedItems && !this.choices.types?.length) {
        console.warn("ChoiceSetChangeSystem#preCreate | `ownedItems` was true but no `types` were specified");
        changeSource.ignored = true;
        return;
      }
    }

    this.setDefaultFlag(changeSource);

    const inflatedChoices = await this.inflateChoices(rollOptions, pendingItems);

    const selection = this.getPreselection() ?? (await new ChoiceSetPrompt({
      prompt: this.prompt,
      item: this.item as Maybe<ItemPTR2e<ItemSystemPTR, ActorPTR2e>>,
      title: this.label,
      choices: inflatedChoices,
      containsItems: this.containsItems,
      allowedDrops: this.allowedDrops,
      allowNoSelection: this.allowNoSelection,
    }).resolveSelection());

    if (!selection) { changeSource.ignored = true; return; }

    changeSource.selection = selection.value;

    // if(this.adjustName && this.item) {
    //   const itemName = this.item.name;
    //   const label = game.i18n.localize(selection.label);
    //   if(this.adjustName === true) {
        // const newName = `${itemName} (${label})`;
        // // Deduplicate if parenthetical is already present
        // const pattern = ((): RegExp => {
        //   const escaped = RegExp.escape(label);
        //   return new RegExp(`\\(${escaped}\\) \\(${escaped}\\)$`);
        // })();
        // this.item.update({ name: newName.replace(pattern, `(${label})`) });
    //   }
    // }
  }

  private setDefaultFlag(source: ChoiceSetChangeSystem | ChoiceSetSource): string {
    return (source.flag =
      typeof source.flag === "string" && source.flag.length > 0
        ? source.flag.replace(/[^-a-z0-9]/gi, "")
        : sluggify(this.slug ?? this.effect.slug ?? this.effect.name, { camel: "dromedary" })
    )
  }

  private setRollOption(selection: unknown): void {
    if (!this.actor) return;
    if (!(this.rollOption && (typeof selection === "string" || typeof selection === "number"))) return;

    // If the selection was a UUID, the roll option had its suffix appended at item creation
    const suffix = UUIDUtils.isItemUUID(selection) ? "" : `:${selection}`;
    this.actor.rollOptions.addOption("all", `${this.rollOption}${suffix}`);
  }

  private getPreselection(): PickableThing | null {
    
  }
}

export default interface ChoiceSetChangeSystem extends ChangeModel, ModelPropsFromSchema<ChoiceSetSchema> {
  _source: SourceFromSchema<ChoiceSetSchema>;
  value: string;
}

type ChoiceSetSource = SourceFromSchema<ChoiceSetSchema> & {
  selection?: unknown;
}

interface ChoiceSetSchema extends ChangeSchema {
  /**
   * The options from which the user can choose. If a string is provided, it is treated as a reference to a record in
   * `CONFIG.PF2E`, and the `PromptChoice` array is composed from its entries.
   */
  choices: DataUnionField<
    | StrictArrayField<StrictObjectField<PickableThing>, PickableThing[], PickableThing[], true, false, false>
    | StrictObjectField<ChoiceSetObject>
    | StrictStringField<string, string, true, false, false>,
    true,
    false,
    false
  >;
  /** The prompt to present in the ChoiceSet application window */
  prompt: foundry.data.fields.StringField<string, string, false, false, true>;
  /** Whether the parent item's name should be adjusted to reflect the choice made */
  adjustName: DataUnionField<
    StrictBooleanField<true, false, false> | StrictStringField<string, string, true, false, false>,
    true,
    false,
    true
  >;
  /**
   * The name of the flag that will contain the user's selection. If not set, it defaults to the camel-casing of the
   * parent item's slug, falling back to name.
   */
  flag: foundry.data.fields.StringField<string, string, false, false, false>;
  /** An optional roll option to be set from the selection */
  rollOption: foundry.data.fields.StringField<string, string, false, true, true>;
  /** A predicate indicating valid dropped item selections */
  allowedDrops: foundry.data.fields.SchemaField<
    AllowedDropsSchema,
    SourceFromSchema<AllowedDropsSchema>,
    ModelPropsFromSchema<AllowedDropsSchema>,
    false,
    true,
    false
  >;
  /** Allow the user to make no selection without suppressing all other rule elements on the parent item */
  allowNoSelection: StrictBooleanField<false, false, false>;
};

interface AllowedDropsSchema extends foundry.data.fields.DataSchema {
  label: foundry.data.fields.StringField<string, string, true, true, true>;
  predicate: PredicateField;
}

type AllowedDropsData = ModelPropsFromSchema<AllowedDropsSchema>;

type ChoiceSetObject = ChoiceSetOwnedItems | ChoiceSetAttacks | ChoiceSetPackQuery;
type UninflatedChoiceSet = string | PickableThing[] | ChoiceSetObject;

// interface ChoiceSetSource {
//   flag?: unknown;
//   prompt?: unknown;
//   selection?: unknown;
//   adjustName?: unknown;
//   recordSlug?: unknown;
//   allowedDrops?: unknown;
//   allowNoSelection?: unknown;
//   rollOption?: unknown;
// }

interface ChoiceSetOwnedItems {
  /** Whether the choices should pull from items on the actor. */
  ownedItems: boolean;
  /** Whether the choices should include handwraps of mighty blows in addition to weapons */
  includeHandwraps?: boolean;
  /** The filter to apply the actor's own weapons/unarmed attacks */
  predicate: RawPredicate;
  attacks?: never;
  unarmedAttacks?: never;
  types: (ItemType | "physical")[];
}

interface ChoiceSetAttacks {
  /** Include all attacks, limited by predicate */
  attacks?: boolean;
  /** Include only unarmed attacks as the basis of the choices */
  unarmedAttacks?: boolean;
  /** The filter to apply the actor's own weapons/unarmed attacks */
  predicate: RawPredicate;
  ownedItems?: never;
}

interface ChoiceSetPackQuery {
  /** A system item type: defaults to "feat" */
  itemType?: ItemType;
  /** An optional pack to restrict the search to */
  pack?: boolean;
  /** A predicate used to filter items constructed from index data */
  filter: RawPredicate;
  /** Use the item slugs as values instead of their UUIDs */
  slugsAsValues?: boolean;
  ownedItems?: never;
  attacks?: never;
  unarmedAttacks?: never;
}

export type {
  AllowedDropsData,
  ChoiceSetAttacks,
  ChoiceSetObject,
  ChoiceSetOwnedItems,
  ChoiceSetPackQuery,
  ChoiceSetSchema,
  ChoiceSetSource,
  UninflatedChoiceSet,
};
