import type { Trait } from "@module/data/index.ts";
import { HasBase, HasEmbed } from "@module/data/index.ts";
import { sluggify } from "@utils";
import type SystemTraitsCollection from "@module/data/system-traits-collection.ts";
import type { HasBaseSchema } from "@module/data/mixins/has-base.ts";

const moveSchema = {
  grade: new foundry.data.fields.StringField({
    required: true,
    initial: "E",
    choices: [
      "E",
      "D",
      "C",
      "B",
      "A",
      "S",
    ].reduce((acc, grade) => ({ ...acc, [grade]: grade }), {}),
  }),
}

export type MoveSchema = typeof moveSchema & HasBaseSchema;

/**
 * @category Item Data Models
 */
export default abstract class MoveSystem extends HasEmbed(
  HasBase(foundry.abstract.TypeDataModel),
  "move"
)<MoveSchema, Item.ConfiguredInstance> {
  /**
   * @internal
   */
  // declare parent: MovePTR2e;

  static override LOCALIZATION_PREFIXES = ["PTR2E", "PTR2E.MoveSystem"];

  static override defineSchema(): MoveSchema {
    return {
      ...super.defineSchema() as HasBaseSchema,
      ...moveSchema,
    };
  }

  //@ts-expect-error - Overriding a property as a getter
  override get description(): string {
    return this.attack.description ?? this._source.description ?? "";
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  override set description(_value: string) {
  }

  //@ts-expect-error - Overriding a property as a getter
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
    _config: TextEditor.DocumentHTMLEmbedConfig,
    options: TextEditor.EnrichmentOptions = {}
  ): Promise<HTMLElement | HTMLCollection | null> {
    const attack = this.attack;
    const variants = this.actions.contents.filter((a) => a.slug !== attack.slug);

    const traits = attack.traits.map((trait) => ({ value: trait.slug, label: trait.label }));

    return super.toEmbed(_config, options, {
      attack: attack, variants: variants.map(v => {
        return {
          ...v,
          traits: v.traits.map((trait) => ({ value: trait.slug, label: trait.label })),
          uuid: v.uuid
        }
      }), move: this.parent, attackTraits: traits
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override async _preCreate(data:  foundry.abstract.TypeDataModel.ParentAssignmentType<MoveSchema, Item.ConfiguredInstance>, options: foundry.abstract.Document.PreCreateOptions<any>, user: User): Promise<boolean | void> {
    if (data.system === undefined) {
      //@ts-expect-error - Actions on source is not a collection but an array
      data.system = { actions: [] };
    }
    if (data.system.actions === undefined) {
      //@ts-expect-error - Actions on source is not a collection but an array
      data.system.actions = [];
    }
    if (data.system.actions instanceof Map) {
      throw new Error("Actions must be an array.");
    }
    if (Array.isArray(data.system.actions)) {
      const actions = data.system.actions as PTR.Models.Action.Source[];
      if (actions.length === 0) {
        //@ts-expect-error - Actions on source is not a collection but an array
        actions = [
          {
            name: `${data.name}`,
            slug: sluggify(`${data.name}`),
            type: "attack",
          },
        ];
        this.parent.updateSource({ "system.actions": data.system.actions });
      } else if (!actions.some((action) => action.type === "attack")) {
        actions.unshift({
          name: `${data.name}`,
          slug: sluggify(`${data.name}`),
          type: "attack",
        } as PTR.Models.Action.Source);
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
    changed: foundry.abstract.TypeDataModel.ParentAssignmentType<MoveSchema, Item.ConfiguredInstance>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: foundry.abstract.Document.PreUpdateOptions<any>,
    user: string
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
      const changedActions = changed.system?.actions as PTR.Models.Action.Source[];
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
        const attacks = foundry.utils.duplicate(this._source.actions)!;
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
      //@ts-expect-error - Traits on source objects are not a collection but an array
      changed.system.traits = [];
    }

    return await super._preUpdate(changed, options, user);
  }

  get attack(): PTR.Models.Action.Models.Attack.Instance {
    const attack = (() => {
      const action = this.actions.get(this.slug);
      if (!action || action.type !== "attack")
        return [...this.actions.values()].find(
          (action) => action.type === "attack"
        ) as unknown as PTR.Models.Action.Models.Attack.Instance;
      return action as unknown as PTR.Models.Action.Models.Attack.Instance;
    })();

    if (!attack) return this.actions.contents[0] as unknown as PTR.Models.Action.Models.Attack.Instance;//throw new Error("No attack action found on this move.");
    return attack;
  }
}