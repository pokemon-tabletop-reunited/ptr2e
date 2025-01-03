import type { ActorPTR2e, RollOptionToggle } from "@actor";
import type { ChangeModelOptions, ChangeSource } from "@data";
import { ChangeModel } from "@data";
import ResolvableValueField from "@module/data/fields/resolvable-value-field.ts";
import { StrictStringField } from "@module/data/fields/strict-primitive-fields.ts";
import { RollOptionDomains, type RollOptions } from "@module/data/roll-option-manager.ts";
import { PredicateField } from "@system/predication/schema-data-fields.ts";
import { isObject, sluggify } from "@utils";
import type { ChangeModelSchema } from "./change.ts";
import type { Predicate, RawPredicate } from "@system/predication/predication.ts";

const rollOptionChangeSchema = {
  domain: new foundry.data.fields.StringField<{ required: true, initial: string, choices: string[] }, keyof RollOptions, keyof RollOptions>({ required: true, initial: "all", choices: Object.values(RollOptionDomains) }),
  suboptions: new foundry.data.fields.ArrayField<
    foundry.data.fields.DataField.Any,
    { required: false, nullable: false, initial: [], validate: ((v: unknown[]) => boolean), validationError: string },
    {
      label: string,
      value: string,
      predicate: RawPredicate,
      selected: boolean,
    },
    {
      label: string,
      value: string,
      predicate: Predicate,
      selected: boolean,
    },
    {
      label: string,
      value: string,
      predicate: RawPredicate,
      selected: boolean,
    }[],
    {
      label: string,
      value: string,
      predicate: Predicate,
      selected: boolean,
    }[]
  >(
    new foundry.data.fields.SchemaField({
      label: new foundry.data.fields.StringField({
        required: true,
        nullable: false,
        blank: false
      }),
      value: new StrictStringField({
        required: true,
        nullable: false,
        blank: false,
        initial: undefined,
      }),
      predicate: new PredicateField(),
      selected: new foundry.data.fields.BooleanField(),
    }),
    {
      required: false,
      nullable: false,
      initial: [],
      validate: (v: unknown[]): boolean => Array.isArray(v) && v.length !== 1,
      validationError: "must have zero or 2+ suboptions",
    },
  ),
  state: new ResolvableValueField({
    required: false,
    initial: (d: Record<string, unknown>) => !d.toggleable,
    validate: (v: unknown) => ["boolean", "string"].includes(typeof v),
    validationError: "must be a boolean, string, or otherwise omitted",
  }),
  toggleable: new foundry.data.fields.BooleanField({ required: false, nullable: false, initial: undefined, label: "PTR2E.Effect.FIELDS.ChangeToggleable.label", hint: "PTR2E.Effect.FIELDS.ChangeToggleable.hint" }),
  placement: new foundry.data.fields.StringField({ required: false, nullable: false, initial: undefined }),
  disabledIf: new PredicateField({ required: false, initial: undefined, label: "PTR2E.Effect.FIELDS.ChangeDisabledIf.label", hint: "PTR2E.Effect.FIELDS.ChangeDisabledIf.hint" }),
  disabledValue: new foundry.data.fields.BooleanField({ required: false, initial: undefined }),
  alwaysActive: new foundry.data.fields.BooleanField({ required: false, initial: undefined, label: "PTR2E.Effect.FIELDS.ChangeAlwaysActive.label", hint: "PTR2E.Effect.FIELDS.ChangeAlwaysActive.hint" }),
  count: new foundry.data.fields.BooleanField({ required: false, initial: undefined, label: "PTR2E.Effect.FIELDS.ChangeCount.label", hint: "PTR2E.Effect.FIELDS.ChangeCount.hint" }),
  removeAfterRoll: new foundry.data.fields.BooleanField({ required: false, initial: undefined }),
}

export type RollOptionChangeSchema = typeof rollOptionChangeSchema & ChangeModelSchema;

class RollOptionChangeSystem extends ChangeModel<RollOptionChangeSchema> {
  static override TYPE = "roll-option";

  constructor(source: ChangeSource, options: ChangeModelOptions) {
    super(source, options);

    this.priority ??= -10;
  }

  static override defineSchema(): RollOptionChangeSchema {
    return {
      ...super.defineSchema(),
      ...rollOptionChangeSchema
    }
  }

  static override validateJoint(s: foundry.data.fields.SchemaField.AssignmentType<RollOptionChangeSchema>): void {
    const source = s!;
    super.validateJoint(source);

    if ((source.suboptions?.length ?? 0) > 0 && !source.toggleable) {
      throw Error("suboptions: must be omitted if not toggleable");
    }

    if (source.disabledIf && !source.toggleable) {
      throw Error("disabledIf: must be false if not toggleable");
    }

    if (source.count && source.toggleable) {
      throw Error("count: must be false if toggleable");
    }

    if (typeof source.disabledValue === "boolean" && (!source.toggleable || !source.disabledIf)) {
      throw Error("disabledValue: may only be included if toggeable and there is a disabledIf predicate.");
    }

    if (source.alwaysActive && (!source.toggleable || source.suboptions?.length === 0)) {
      throw Error("alwaysActive: must be false unless toggleable and containing suboptions");
    }

    if (source.placement && !source.toggleable) {
      throw Error("placement: may only be present if toggleable");
    }
  }

  get option() {
    return this.value;
  }
  set option(option: string) {
    this.value = option;
  }

  override resolveValue() {
    return this.alwaysActive ? true : !!super.resolveValue(this.state);
  }

  private resolveOption({ appendSuboption = true } = {}): string {
    const baseOption = (this.resolveInjectedProperties(this.option) + "")
      .replace(/[^-:\w]/g, "")
      .replace(/:+/g, ":")
      .replace(/-+/g, "-")
      .trim();

    if (appendSuboption) {
      const selectedSuboption = this.suboptions.find((o) => o.selected);
      return selectedSuboption ? `${baseOption}:${selectedSuboption.value}` : baseOption;
    } else {
      return baseOption;
    }
  }

  override apply(actor: ActorPTR2e): void {
    this.domain = this.resolveInjectedProperties(this.domain);
    const isStandardDomain = /^[-a-z0-9]+$/.test(this.domain) && /[a-z]/.test(this.domain);
    // Domains can be of the form "{id}-term"
    const isIdDomain = /^[a-zA-Z0-9]{16}-[-a-z0-9]+[a-z0-9]$/.test(this.domain);
    if (!isStandardDomain && !isIdDomain) {
      return this.failValidation(
        "domain must be a string consisting of only lowercase letters, numbers, and hyphens.",
      );
    }

    const optionSet = new Set(
      [actor.getRollOptions([this.domain])].flat(),
    );
    if (!this.test(optionSet)) return this.setFlag(false);

    const baseOption = (this.option = this.resolveOption({ appendSuboption: false }));
    if (!baseOption) {
      this.failValidation("option: must be a string consisting of only letters, numbers, colons, and hyphens");
      return;
    }

    if (this.toggleable) {
      const suboptions = this.suboptions.filter((s) => s.predicate.test(optionSet));
      if (suboptions.length > 0 && !suboptions.some((s) => s.selected)) {
        // If predicate testing eliminated the selected suboption, select the first and deselect the rest.
        suboptions[0].selected = true;
        for (const otherSuboption of this.suboptions) {
          if (otherSuboption !== suboptions[0]) otherSuboption.selected = false;
        }
      } else if (this.suboptions.length > 0 && suboptions.length === 0) {
        // If no suboptions remain after predicate testing, don't set the roll option or expose the toggle.
        return;
      }

      const toggle: RollOptionToggle = {
        effectUuid: this.effect.uuid,
        label: this.getReducedLabel(),
        placement: this.placement ?? "effects",
        domain: this.domain,
        option: baseOption,
        suboptions,
        alwaysActive: !!this.alwaysActive,
        checked: false,
        enabled: true,
      };

      if (actor.synthetics.toggles.some(t => t.domain == toggle.domain && t.option == toggle.option)) {
        return;
      }

      if (this.disabledIf) {
        const rollOptions = actor.getRollOptions([this.domain]);
        toggle.enabled = !this.disabledIf.test(rollOptions);
        if (!toggle.enabled && !this.alwaysActive && typeof this.disabledValue === "boolean") {
          this.state = this.disabledValue;
        }
      }

      const value = (toggle.checked = this.resolveValue());
      this.setOption(baseOption, value, actor);
      this.setFlag(value);
      actor.synthetics.toggles.push(toggle);
    } else if (this.count) {
      this.setCount(baseOption, actor);
    } else {
      this.setOption(baseOption, this.resolveValue(), actor);
    }
  }

  private setOption(baseOption: string, value: boolean, actor: ActorPTR2e) {
    const fullOption = this.resolveOption();

    if (value) {
      actor.rollOptions.addOption(this.domain, fullOption);
      // Also set option without the suboption appended
      actor.rollOptions.addOption(this.domain, baseOption);
    }
    // else {
    //   actor.rollOptions.removeOption(this.domain, fullOption);
    //   // Also remove option without the suboption appended
    //   actor.rollOptions.removeOption(this.domain, baseOption);
    // }
  }

  private setFlag(value: boolean): void {
    const suboption = this.suboptions.find((o) => o.selected) ?? this.suboptions.at(0);
    if (suboption) {
      const flagKey = sluggify(this.resolveOption({ appendSuboption: false }), { camel: "dromedary" });
      if (value) {
        const flagValue = /^\d+$/.test(suboption.value) ? Number(suboption.value) : suboption.value;
        this.effect.flags.ptr2e.choiceSelections[flagKey] = flagValue;
      } else {
        this.effect.flags.ptr2e.choiceSelections[flagKey] = null;
      }
    }
  }

  private setCount(option: string, actor: ActorPTR2e): void {
    const domainRecord = actor.rollOptions.getFromDomain(this.domain);
    const existing = Object.keys(domainRecord)
      .flatMap((key: string) => ({
        key,
        count: Number(new RegExp(`^${option}:(\\d+)$`).exec(key)?.[1]) || 0,
      }))
      .find((kc) => !!kc.count);

    if (existing) {
      delete domainRecord[existing.key];
      domainRecord[`${option}:${existing.count + 1}`] = true;
    } else {
      domainRecord[`${option}:1`] = true;
    }
  }

  /**
   * Toggle the provided roll option (swapping it from true to false or vice versa).
   * @returns the new value if successful or otherwise `null`
   */
  async toggle(newValue = !this.resolveValue(), newSuboption: string | null = null): Promise<boolean | null> {
    if (!this.toggleable) throw Error("Attempted to toggle non-toggleable roll option");

    // Directly update the rule element on the item
    const changeSource = this.effect.toObject().system.changes as foundry.data.fields.SchemaField.AssignmentType<ChangeModelSchema>[];
    const thisSource =
      typeof this.sourceIndex === "number" ? changeSource.at(this.sourceIndex) as Maybe<this['_source']> : null;
    if (!thisSource) return null;
    //@ts-expect-error - FIXME: Not supposed to be a readonly field
    thisSource.state = newValue;

    if (
      newSuboption &&
      Array.isArray(thisSource.suboptions) &&
      thisSource.suboptions.every((o): o is { label: string, value: string, predicate: Predicate, selected: boolean } => isObject(o))
    ) {
      for (const suboption of thisSource.suboptions) {
        suboption.selected = suboption.value === newSuboption;
      }
    }

    const result = await this.effect.update({
      'system.changes': changeSource,
    })

    return result ? newValue : null;
  }
}

interface RollOptionChangeSystem {
  value: string;
}

export default RollOptionChangeSystem;
export type { RollOptionChangeSystem };