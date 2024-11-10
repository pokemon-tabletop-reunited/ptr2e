import { ChangeModel, ChangeModelOptions, ChangeSchema } from "@data";
import { PickableThing } from "@module/apps/pick-a-thing-prompt.ts";
import { DataUnionField } from "@module/data/fields/data-union-field.ts";
import { StrictArrayField, StrictBooleanField, StrictObjectField, StrictStringField } from "@module/data/fields/strict-primitive-fields.ts";
import { Predicate } from "@system/predication/predication.ts";
import { PredicateField } from "@system/predication/schema-data-fields.ts";
import { sluggify } from "@utils";
import * as R from "remeda"
import { UUIDUtils } from "src/util/uuid.ts";
import { ChoiceSetPrompt } from "./prompt.ts";
import { ItemPTR2e, ItemSystemPTR } from "@item";
import { ActorPTR2e } from "@actor";

export default class ChoiceSetChangeSystem extends ChangeModel {
  static override TYPE = "choice-set";

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
      typeof source.selection === "string" || typeof source.selection === "number" || R.isPlainObject(source.selection)
        ? source.selection
        : null;
  }

  override prepareData(): void {
    if(this.item) {
      this.item.flags.ptr2e.choiceSelections ??= {};
      this.item.flags.ptr2e.choiceSelections[this.flag] = this.selection;
    }

    if (this.selection !== null) {
      this.setRollOption(this.selection);
    } else if (!this.allowNoSelection && this.test(null, true)) {
      // Disable this and all other change models on the effect until a selection is made
      this.ignored = true;
      for (const change of this.effect.changes) {
        change.ignored = true;
      }
    }
  }

  /**
   *  Due to prepareData running after DataModel initialization, the property of `ignore` is set, which causes `this.test` to always fail.
   *  Since during `this.prepareData` we need to check if the change should be ignored, we need to override `this.test` to ignore the `ignore` property.
   */
  override test(options?: Iterable<string> | null, ignoreIgnore = false): boolean {
    if(ignoreIgnore && this.ignored) {
      this.ignored = false;
      const result = super.test(options);
      this.ignored = true;
      return result;
    }
    return super.test(options);
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
          new StrictStringField<string, string, true, false, false>({ required: true, nullable: false, initial: undefined, }),
        ],
        { required: true, nullable: false, initial: [] }
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
      selection: new fields.AnyField({ required: false, nullable: true }),
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  override apply(): void { }

  override async preCreate({ changeSource, effectSource }: ChangeModel.PreCreateParams<ChoiceSetSource>): Promise<void> {
    const rollOptions = new Set([this.actor?.getRollOptions() ?? [], this.item?.getRollOptions() ?? []].flat());
    const predicate = this.resolveInjectedProperties(this.predicate);
    if (!predicate.test(rollOptions)) return;

    this.setDefaultFlag(changeSource);

    const inflatedChoices = await this.inflateChoices(rollOptions);

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

    if(this.adjustName) {
      const effectName = effectSource.name;
      const label = game.i18n.localize(selection.label);
      if(this.adjustName === true) {
        const newName = `${effectName} (${label})`;
        // Deduplicate if parenthetical is already present
        const pattern = ((): RegExp => {
          const escaped = RegExp.escape(label);
          return new RegExp(`\\(${escaped}\\) \\(${escaped}\\)$`);
        })();
        effectSource.name = newName.replace(pattern, `(${label})`);
      }
      else {
        effectSource.name = game.i18n.format(this.adjustName, {
          [this.flag]: game.i18n.localize(selection.label),
        })
      }
    }
    
    this.effect.flags.ptr2e.choiceSelections ??= {};
    this.effect.flags.ptr2e.choiceSelections[this.flag] = selection.value;

    
    this.setRollOption(changeSource.selection);

    for (const change of this.effect?.system?.changes ?? []) {
      // Now that a selection is made, other rule elements can be set back to unignored
      change.ignored = false;
    }
  }

  /**
   * If an array was passed, localize & sort the labels and return. If a string, look it up in CONFIG.PF2E and
   * create an array of choices.
   * @param rollOptions  A set of actor roll options to for use in predicate testing
   * @param pendingItems Items passed to #queryCompendium for checking max takability of feats
   * @returns The array of choices to present to the user
   */
  async inflateChoices(rollOptions: Set<string>): Promise<PickableThing[]> {
    const choices: PickableThing<string | number | object>[] = Array.isArray(this.choices)
      ? this.choicesFromArray(this.choices, rollOptions) // Static choices from CM constructor data
      : typeof this.choices === "string"
        ? this.choicesFromPath(this.choices)
        : [];

    interface ItemChoice extends PickableThing<string> {
      value: ItemUUID;
    }

    // If every choice is an item UUID, get the label and images from those items
    const choicesAreUUIDs = choices.every((c): c is ItemChoice => UUIDUtils.isItemUUID(c.value));
    if (choicesAreUUIDs) {
      const itemChoices = await UUIDUtils.fromUUIDs(choices.map(c => c.value));
      for (let i = 0; i < choices.length; i++) {
        const item = itemChoices[i];
        if (item instanceof ItemPTR2e) {
          choices[i].label = item.name;
          choices[i].img = item.img;
        }
      }
      this.containsItems = true;
    }

    try {
      const choiceData = choices.map(c => ({
        value: c.value,
        label: game.i18n.localize(c.label),
        img: c.img,
      }))

      // Only sort if the choices were generated via compendium query or actor data
      if (!Array.isArray(this.choices)) {
        choiceData.sort((a, b) => a.label.localeCompare(b.label));
      }
      return choiceData;
    }
    catch {
      return [];
    }
  }

  private choicesFromArray(choices: PickableThing[], actorRollOptions: Set<string>): PickableThing[] {
    return choices.filter((c) =>
      this.resolveInjectedProperties(new Predicate(c.predicate ?? [])).test(actorRollOptions),
    );
  }

  private choicesFromPath(path: string): PickableThing<string>[] {
    const choiceObject: unknown = fu.getProperty(CONFIG.PTR, path) ?? fu.getProperty(this.actor ?? {}, path) ?? {};
    if (
      Array.isArray(choiceObject) &&
      choiceObject.every((c) => R.isPlainObject<{ value: string }>(c) && typeof c.value === "string")
    ) {
      return choiceObject;
    } else if (R.isPlainObject(choiceObject) && Object.values(choiceObject).every((c) => typeof c === "string")) {
      return Object.entries(choiceObject).map(([value, label]) => ({
        value,
        label: String(label),
      }));
    }

    return [];
  }

  private setDefaultFlag(source: ChoiceSetChangeSystem | ChoiceSetSource): string {
    return (source.flag =
      typeof source.flag === "string" && source.flag.length > 0
        ? source.flag.replace(/[^-a-z0-9]/gi, "")
        : sluggify(this.slug ?? this.effect.slug ?? this.effect.name, { camel: "dromedary" })
    )
  }

  private setRollOption(selection: unknown): void {
    if (!(this.rollOption && (typeof selection === "string" || typeof selection === "number"))) return;

    // If the selection was a UUID, the roll option had its suffix appended at item creation
    const suffix = UUIDUtils.isItemUUID(selection) ? "" : `:${selection}`;
    this.effect.flags.ptr2e.choiceSelections ??= {};
    this.effect.flags.ptr2e.choiceSelections[this.rollOption] = selection;
    this.actor?.rollOptions.addOption("all", `${this.rollOption}${suffix}`);
  }

  private getPreselection(): PickableThing | null {
    const choice = Array.isArray(this.choices) ? this.choices.find(c => R.isDeepEqual(c.value, this.selection)) : null;
    return choice ?? null;
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
   * `CONFIG.PTR2E`, and the `PromptChoice` array is composed from its entries.
   */
  choices: DataUnionField<
    | StrictArrayField<StrictObjectField<PickableThing>, PickableThing[], PickableThing[], true, false, false>
    | StrictStringField<string, string, true, false, false>,
    true,
    false,
    true
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
  selection: foundry.data.fields.AnyField;
};

interface AllowedDropsSchema extends foundry.data.fields.DataSchema {
  label: foundry.data.fields.StringField<string, string, true, true, true>;
  predicate: PredicateField;
}

type AllowedDropsData = ModelPropsFromSchema<AllowedDropsSchema>;

type UninflatedChoiceSet = string | PickableThing[]

export type {
  AllowedDropsData,
  ChoiceSetSchema,
  ChoiceSetSource,
  UninflatedChoiceSet,
};
