import { ContainerPTR2e, MovePTR2e } from "@item";
import { ActionPTR2e, AttackPTR2e, HasBase, HasEmbed, Trait } from "@module/data/index.ts";
import { sluggify } from "@utils";
import { BaseItemSourcePTR2e, ItemSystemSource } from "./system.ts";
import { HasBaseSchema } from "@module/data/mixins/has-base.ts";
import SystemTraitsCollection from "@module/data/system-traits-collection.ts";
import { SlugField } from "@module/data/fields/slug-field.ts";

/**
 * @category Item Data Models
 */
export default abstract class MoveSystem extends HasEmbed(
  HasBase(foundry.abstract.TypeDataModel),
  "move"
) {
  /**
   * @internal
   */
  declare parent: MovePTR2e;

  static LOCALIZATION_PREFIXES = ["PTR2E", "PTR2E.MoveSystem"];

  static override defineSchema(): MoveSystemSchema {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema() as HasBaseSchema,

      grade: new fields.StringField({
        required: true,
        initial: "E",
        choices: [
          "E",
          "E+",
          "D-",
          "D",
          "D+",
          "C-",
          "C",
          "C+",
          "B-",
          "B",
          "B+",
          "A-",
          "A",
          "A+",
          "S-",
          "S",
          "S+",
        ].reduce((acc, grade) => ({ ...acc, [grade]: grade }), {}),
      }),
      // @ts-expect-error
      tutorLists: new fields.ArrayField<TutorField, foundry.data.fields.SourcePropFromDataField<TutorField>[], foundry.data.fields.SourcePropFromDataField<TutorField>[]>(new fields.SchemaField({
        slug: new SlugField({ required: true, nullable: false }),
        sourceType: new fields.StringField({ required: true}),
      })),
    };
  }

  override get description(): string {
    return this.attack.description ?? this._source.description ?? "";
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  override set description(_value: string) {
  }

  override get traits(): SystemTraitsCollection<Trait> {
    return this.attack.traits;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  override set traits(_value: string[]) {
  }

  override get _traits(): Trait[] {
    return this.attack.traits.contents;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  override set _traits(_value: Trait[]) {
  }

  override prepareBaseData(): void {
    super.prepareBaseData();
    const primaryAction = this.attack;
    if (primaryAction?.slug !== this.slug) {
      console.warn(`Primary action slug does not match move slug. Move: ${this.slug}, Primary Action: ${primaryAction?.slug}`);
    }
  }

  override async toEmbed(
    _config: foundry.abstract.DocumentHTMLEmbedConfig,
    options: EnrichmentOptions = {}
  ): Promise<HTMLElement | HTMLCollection | null> {
    const attack = this.attack;
    const variants = this.actions.contents.filter((a) => a.slug !== attack.slug);


    const traits = attack.traits.map((trait) => ({ value: trait.slug, label: trait.label }));

    return super.toEmbed(_config, options, {
      attack: attack, variants: variants.map(v => {
        return {
          ...v,
          traits: v.traits.map((trait) => ({ value: trait.slug, label: trait.label })),
        }
      }), move: this.parent, attackTraits: traits
    });
  }

  override async _preCreate(
    data: this["parent"]["_source"],
    options: DocumentModificationContext<this["parent"]["parent"]>,
    user: User
  ): Promise<boolean | void> {
    if (data.system === undefined) {
      //@ts-expect-error - Actions on source is not a collection but an array
      data.system = { actions: [] };
    }
    if(data.system.actions === undefined) {
      //@ts-expect-error - Actions on source is not a collection but an array
      data.system.actions = [];
    }
    if (data.system.actions instanceof Map) {
      throw new Error("Actions must be an array.");
    }
    if (Array.isArray(data.system.actions)) {
      const actions = data.system.actions as ActionPTR2e["_source"][];
      if (actions.length === 0) {
        //@ts-expect-error - Actions on source is not a collection but an array
        data.system.actions = [
          {
            name: `${data.name}`,
            slug: sluggify(`${data.name}`),
            type: "attack",
          },
        ];
        this.parent.updateSource({ "system.actions": data.system.actions });
      } else if (!actions.some((action) => action.type === "attack")) {
        data.system.actions.unshift({
          name: `${data.name}`,
          slug: sluggify(`${data.name}`),
          type: "attack",
        });
        this.parent.updateSource({ "system.actions": data.system.actions });
      }
    }

    if (!data.img || data.img === "icons/svg/item-bag.svg") {
      this.parent.updateSource({
        img: "systems/ptr2e/img/svg/untyped_icon.svg",
      });
    }

    return await super._preCreate(data, options, user);
  }

  override async _preUpdate(
    changed: DeepPartial<this["parent"]["_source"]>,
    options: DocumentUpdateContext<this["parent"]["parent"]>,
    user: User
  ): Promise<boolean | void> {
    if (changed.system?.actions !== undefined) {
      if (Array.isArray(changed.system.actions)) {
        const mainAction = changed.system.actions.find(
          (action) => action.type === "attack"
        );
        if (!mainAction) {
          ui.notifications.warn("You cannot delete the main attack action.");
          return false;
        }
      }
    }
    if (changed.system?.traits !== undefined) {
      //@ts-expect-error - Actions on source is not a collection but an array
      const changedActions = changed.system?.actions as ActionPTR2e["_source"][];
      if (changedActions?.length) {
        const mainAttackIndex = changedActions.findIndex(
          (action) => action.slug === this.slug
        )
        if (mainAttackIndex === -1) {
          const retry = changedActions.findIndex((action) => action.type === "attack");
          if (retry === -1) {
            return false;
          }
          //@ts-expect-error - Traits on source objects are not a collection but an array
          changedActions[retry].traits = changed.system.traits;
        }
        else {
          //@ts-expect-error - Traits on source objects are not a collection but an array
          changedActions[mainAttackIndex].traits = changed.system.traits;
        }
      } else {
        const attacks = fu.duplicate(this._source.actions);
        const mainAttackIndex = attacks.findIndex((action) => action.slug === this.slug);
        if (mainAttackIndex === -1) {
          const retry = attacks.findIndex((action) => action.type === "attack");
          if (retry === -1) {
            return false;
          }
          //@ts-expect-error - Traits on source objects are not a collection but an array
          attacks[retry].traits = changed.system.traits;
        }
        else {
          //@ts-expect-error - Traits on source objects are not a collection but an array
          attacks[mainAttackIndex].traits = changed.system.traits;
        }
        //@ts-expect-error - Actions on source is not a collection but an array
        changed.system.actions = attacks;
      }
    }
    if (changed.system) {
      changed.system.description = "";
      changed.system.traits = [];
    }

    return await super._preUpdate(changed, options, user);
  }

  get attack(): AttackPTR2e {
    const attack = (() => {
      const action = this.actions.get(this.slug);
      if (!action || action.type !== "attack")
        return [...this.actions.values()].find(
          (action) => action.type === "attack"
        ) as unknown as AttackPTR2e;
      return action as unknown as AttackPTR2e;
    })();

    if (!attack) return this.actions.contents[0] as AttackPTR2e;//throw new Error("No attack action found on this move.");
    return attack;
  }
}

export default interface MoveSystem extends ModelPropsFromSchema<MoveSystemSchema> {
  container: ContainerPTR2e | null;
  actions: Collection<ActionPTR2e>;

  _source: SourceFromSchema<MoveSystemSchema>;
}

interface TutorField extends foundry.data.fields.DataField {
  slug: SlugField<string, string, true, false, true>;
  sourceType: foundry.data.fields.StringField<string, string, true, false, false>;
}

interface MoveSystemSchema extends foundry.data.fields.DataSchema, HasBaseSchema {
  grade: foundry.data.fields.StringField<string, string, true, false, true>;
  tutorLists: foundry.data.fields.ArrayField<TutorField, foundry.data.fields.SourcePropFromDataField<TutorField>[], foundry.data.fields.SourcePropFromDataField<TutorField>[], true, false, true>;
}


export type MoveSource = BaseItemSourcePTR2e<"move", MoveSystemSource>;

interface MoveSystemSource extends Required<ItemSystemSource> { }
