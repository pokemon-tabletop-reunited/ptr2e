import { ActionTypes, type ActionType } from "../../constants";

import fields = foundry.data.fields;
import { SlugField } from "../../fields/slug-field";
import { CollectionField } from "../../fields/collection-field";
import { PTRCONSTS } from "../..";
import Trait from "../trait";
import { RangePTR2e } from "../range";
import type { ActorPTR2e } from "../../actor/document";
import { ItemPTR2e } from "../../item/document";
import { formatSlug } from "../../../util/misc";
import SystemTraitsCollection from "../../system-traits-collection";

const actionSchema = (type: (typeof ActionTypes)[keyof typeof ActionTypes]) => ({
  slug: new SlugField({
    required: true,
    label: "PTR2E.FIELDS.slug.label",
    hint: "PTR2E.FIELDS.slug.hint",
  }),
  name: new fields.StringField({
    required: true,
    initial: "New Action",
    label: "PTR2E.FIELDS.actionName.label",
    hint: "PTR2E.FIELDS.actionName.hint",
  }),
  description: new fields.HTMLField({
    required: false,
    nullable: true,
    label: "PTR2E.FIELDS.description.label",
    hint: "PTR2E.FIELDS.description.hint",
  }),
  img: new fields.FilePathField({
    required: true,
    categories: ["IMAGE"],
    initial: () => ActionPTR2e.baseImg,
  }),
  // eslint-disable-next-line @typescript-eslint/unbound-method
  traits: new CollectionField(new fields.StringField({ validate: Trait.isValid }), "slug", {
    label: "PTR2E.FIELDS.actionTraits.label",
    hint: "PTR2E.FIELDS.actionTraits.hint",
  }),
  type: new fields.StringField({
    required: true,
    blank: false,
    initial: type,
    choices: Object.values(PTRCONSTS.ActionTypes).reduce<Record<string, string>>((acc, type) => ({ ...acc, [type]: type }), {}),
    label: "PTR2E.FIELDS.actionType.label",
    hint: "PTR2E.FIELDS.actionType.hint",
  }),
  range: new fields.EmbeddedDataField(RangePTR2e, { required: false, nullable: true }),
  cost: new fields.SchemaField({
    activation: new fields.StringField({
      required: true,
      choices: Object.values(PTRCONSTS.ActivationCost).reduce<Record<string, string>>((acc, activation) => ({ ...acc, [activation]: activation }), {}),
      initial: PTRCONSTS.ActivationCost.SIMPLE,
      label: "PTR2E.FIELDS.activationCost.label",
      hint: "PTR2E.FIELDS.activationCost.hint",
    }),
    powerPoints: new fields.NumberField({
      required: true,
      initial: 0,
      min: 0,
      integer: true,
      label: "PTR2E.FIELDS.powerPoints.label",
      hint: "PTR2E.FIELDS.powerPoints.hint",
    }),
    trigger: new fields.StringField({
      required: false,
      nullable: true,
      label: "PTR2E.FIELDS.trigger.label",
      hint: "PTR2E.FIELDS.trigger.hint",
    }),
    delay: new fields.NumberField({
      required: false,
      nullable: true,
      min: 1,
      max: 3,
      integer: false,
      label: "PTR2E.FIELDS.delay.label",
      hint: "PTR2E.FIELDS.delay.hint",
    }),
    priority: new fields.NumberField({
      required: false,
      nullable: true,
      min: 1,
      max: 7,
      integer: false,
      label: "PTR2E.FIELDS.priority.label",
      hint: "PTR2E.FIELDS.priority.hint",
    }),
  }),
  variant: new SlugField({ required: false, nullable: true })
})

declare namespace ActionPTR2e {
  type Schema = ReturnType<typeof actionSchema>;
}

class ActionPTR2e<TSchema extends ActionPTR2e.Schema = ActionPTR2e.Schema> extends foundry.abstract.DataModel<TSchema, foundry.abstract.DataModel.Any> {
  static TYPE: ActionType = "generic" as const;

  static readonly baseImg = "icons/svg/explosion.svg";

  static override defineSchema(): ActionPTR2e.Schema {
    return actionSchema(this.TYPE);
  }

  get actor(): ActorPTR2e | null {
    //@ts-expect-error - Unsound but intended.
    if (this.parent?.parent instanceof ActorPTR2e) return this.parent.parent;
    //@ts-expect-error - Unsound but intended.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    if (this.parent instanceof SummonSystem) return this.parent.actor;
    if (
      this.parent?.parent instanceof ItemPTR2e &&
      //@ts-expect-error - Unsound but intended.
      this.parent.parent.actor instanceof ActorPTR2e
    ) {
      return this.parent.parent.actor;
    }
    return null;
  }

  get item(): ItemPTR2e {
    if (this.parent instanceof ItemPTR2e) return this.parent;
    if (this.parent?.parent instanceof ItemPTR2e) return this.parent.parent;
    throw new Error("Action is not a child of an item");
  }

  get original(): ActionPTR2e | null {
    if (!this.variant) return null;
    return this.item.actions.get((this as ActionPTR2e).variant!) ?? null;
  }

  get css(): { style: string; class: string; } {
    return {
      style: "",
      class: ""
    };
  }

  get uuid(): string {
    const self = this as ActionPTR2e;
    // This is a temporary item, this might be due to this being a delayed action
    // In which case, link to the original item if possible.
    if(!this.item.id && this.actor?.id) {
      const originalAction = this.actor.actions.get(self.slug);
      return originalAction?.uuid ?? "";
    }

    return `${this.item.uuid}.Actions.${self.slug}`
  }

  get link(): string {
    return `@UUID[${this.uuid}]{${(this as ActionPTR2e).name}}`;
  }

  get documentName(): string {
    return "Action";
  }

  /**
     * Create a content link for this Document.
     * @param [options] Additional options to configure how the link is constructed.
     * @param [options.attrs]   Attributes to set on the link.
     * @param [options.dataset] Custom data- attributes to set on the link.
     * @param [options.classes] Classes to add to the link.
     * @param [options.name]    A name to use for the Document, if different from the Document's name.
     * @param [options.icon]    A font-awesome icon class to use as the icon, if different to the Document's configured sidebarIcon.
     */
  toAnchor(this: ActionPTR2e, options: {
    attrs?: Record<string, string>;
    dataset?: Record<string, string>;
    classes?: string[];
    name?: string;
    icon?: string;
  } = {}): HTMLAnchorElement {
    let {attrs = {}, dataset = {} as Record<string, string>, name} = options;
    const {classes = [], icon} = options;
    // Build dataset
    const documentName = `${formatSlug(this.type)} ${this.name}`;
    const anchorIcon = icon ?? "fas fa-burst";
    if ( !classes.includes("content-link") ) classes.unshift("content-link");
    attrs = foundry.utils.mergeObject({ draggable: "true" }, attrs);
    dataset = foundry.utils.mergeObject({
      link: "",
      uuid: this.uuid,
      // id: this.id,
      type: this.documentName,
      // pack: this.pack,
      tooltip: documentName,
      "tooltipDirection": "LEFT"
    }, dataset);

    classes.unshift(this.type, "action");

    name ??= this.name;
    return TextEditor.createAnchor({ attrs, dataset, name, classes, icon: anchorIcon });
  }

  // _onClickDocumentLink() {
  //   return void new ActionEditor(
  //     this.item as ItemPTR2e<ItemSystemsWithActions>,
  //     this.slug
  //   ).render(true);
  // }

  prepareDerivedData(this: ActionPTR2e): void {
    this.traits = this._source.traits.reduce((acc: SystemTraitsCollection, traitSlug: string) => {
      //@ts-expect-error - Have yet to add global types for game.ptr.data.traits
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const trait: Trait = game.ptr.data.traits.get(traitSlug);
      if (trait) {
        acc.set(traitSlug, trait);
      }
      return acc;
    }, new SystemTraitsCollection());

    if (this.img === ActionPTR2e.baseImg && this.item.img !== (this.item.constructor as typeof Item).implementation.DEFAULT_ICON) {
      this.img = this.item.img;
    }
  }

  /**
   * Serialize salient information about this Action's owning Document when dragging it.
   */
  toDragData(): Record<string, unknown> {
    const dragData: Record<string, unknown> = {
      type: this.item.documentName,
      action: {
        slug: this.slug,
        type: this.type,
      }
    }
    if (this.item.id) dragData.uuid = this.item.uuid;
    else dragData.data = this.item.toObject();
    return dragData;
  }

  getRollOptions(this: ActionPTR2e, prefix = ""): Set<string> {
    return new Set([`action:${this.slug}`]).map(key => prefix ? `${prefix}:${key}` : key);
  }

  /**
   * Apply an update to the Action through it's parent Item.
   */
  async update(this: ActionPTR2e, data: foundry.data.fields.SchemaField.UpdateData<TSchema>) {
    const currentActions = this.prepareUpdate(data);
    return this.item.update({ "system.actions": currentActions });
  }

  prepareUpdate(this: ActionPTR2e, data: foundry.data.fields.SchemaField.UpdateData<TSchema>) {
    const currentActions = this.item.system.toObject().actions as foundry.data.fields.SchemaField.SourceData<TSchema>[];
    const actionIndex = currentActions.findIndex((a) => a.slug === this.slug);
    fu.mergeObject(currentActions[actionIndex], data);

    return currentActions;
  }

  toChat(this: ActionPTR2e) {
    return this.item.toChat();
  }
}

export default ActionPTR2e;