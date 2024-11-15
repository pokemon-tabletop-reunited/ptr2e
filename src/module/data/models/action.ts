import { ActorPTR2e } from "@actor";
import { ItemPTR2e, ItemSystemsWithActions } from "@item";
import { PTRCONSTS, ActionType, ActionCost, Delay, Priority, Trait } from "@data";
import { RangePTR2e } from "@data";
import { CollectionField } from "../fields/collection-field.ts";
import { SlugField } from "../fields/slug-field.ts";
import SystemTraitsCollection from "../system-traits-collection.ts";
import SummonSystem from "@item/data/summon.ts";
import { ActionEditor } from "@module/apps/action-editor.ts";
import { formatSlug } from "@utils";

class ActionPTR2e extends foundry.abstract.DataModel {
  static TYPE: ActionType = "generic" as const;

  static readonly baseImg = "icons/svg/explosion.svg";

  static override defineSchema(): ActionSchema {
    const fields = foundry.data.fields;
    return {
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
      traits: new CollectionField(new fields.StringField({ validate: Trait.isValid }), "slug", {
        label: "PTR2E.FIELDS.actionTraits.label",
        hint: "PTR2E.FIELDS.actionTraits.hint",
      }),
      type: new fields.StringField({
        required: true,
        blank: false,
        initial: this.TYPE,
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
        }) as foundry.data.fields.StringField<ActionCost, string, true, false, true>,
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
      variant: new SlugField({ required: false, nullable: true }),
    };
  }

  get actor(): ActorPTR2e | null {
    if (this.parent?.parent instanceof ActorPTR2e) return this.parent.parent;
    if (this.parent instanceof SummonSystem) return this.parent.actor;
    if (
      this.parent?.parent instanceof ItemPTR2e &&
      this.parent.parent.actor instanceof ActorPTR2e
    )
      return this.parent.parent.actor;
    return null;
  }

  get item(): ItemPTR2e<ItemSystemsWithActions>  {
    if (this.parent instanceof ItemPTR2e) return this.parent;
    if (this.parent?.parent instanceof ItemPTR2e) return this.parent.parent;
    throw new Error("Action is not a child of an item");
  }

  get original(): ActionPTR2e | null {
    if (!this.variant) return null;
    return this.item.actions.get(this.variant) ?? null;
  }

  get css(): { style: string; class: string; } {
    return {
      style: "",
      class: ""
    };
  }

  get uuid(): string {
    return `${this.item.uuid}.Actions.${this.slug}`
  }

  get link(): string {
    return `@UUID[${this.uuid}]{${this.name}}`;
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
  toAnchor(options: {
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
    const anchorIcon = icon ?? "fas fa-link";
    if ( !classes.includes("content-link") ) classes.unshift("content-link");
    attrs = foundry.utils.mergeObject({ draggable: "true" }, attrs);
    dataset = foundry.utils.mergeObject({
      link: "",
      uuid: this.uuid,
      id: this.id,
      type: this.documentName,
      pack: this.pack,
      tooltip: documentName,
      "tooltipDirection": "LEFT"
    }, dataset);

    classes.unshift("action", this.type);

    name ??= this.name;
    return TextEditor.createAnchor({ attrs, dataset, name, classes, icon: anchorIcon });
  }

  _onClickDocumentLink() {
    return new ActionEditor(
      this.item as ItemPTR2e<ItemSystemsWithActions>,
      this.slug
    ).render(true);
  }

  prepareDerivedData() {
    this.traits = this._source.traits.reduce((acc: SystemTraitsCollection<Trait>, traitSlug: string) => {
      const trait = game.ptr.data.traits.get(traitSlug);
      if (trait) {
        acc.set(traitSlug, trait);
      }
      return acc;
    }, new SystemTraitsCollection());

    if (this.img === ActionPTR2e.baseImg && this.item.img !== this.item.constructor.implementation.DEFAULT_ICON) {
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

  /**
   * Apply an update to the Action through it's parent Item.
   */
  async update(data: DeepPartial<SourceFromSchema<ActionSchema>>) {
    const currentActions = this.prepareUpdate(data);
    return this.item.update({ "system.actions": currentActions });
  }

  prepareUpdate(data: DeepPartial<SourceFromSchema<ActionSchema>>) {
    const currentActions = this.item.system.toObject().actions;
    const actionIndex = currentActions.findIndex((a) => a.slug === this.slug);
    fu.mergeObject(currentActions[actionIndex], data);

    return currentActions;
  }

  toChat() {
    return this.item.toChat();
  }
}
interface ActionPTR2e extends foundry.abstract.DataModel, ModelPropsFromSchema<ActionSchema> {
  _source: SourceFromSchema<ActionSchema>;
  get schema(): foundry.data.fields.SchemaField<ActionSchema>;
}

export interface ActionSchema extends foundry.data.fields.DataSchema {
  slug: SlugField<string, string, true, false, false>
  name: foundry.data.fields.StringField<string, string, true, false, true>;
  description: foundry.data.fields.HTMLField<string, string, false, true>;
  img: foundry.data.fields.FilePathField<ImageFilePath, string, true, false, true>;
  traits: CollectionField<foundry.data.fields.StringField, string[], SystemTraitsCollection<Trait>>;
  type: foundry.data.fields.StringField<string, ActionType, true, false, true>;
  range: foundry.data.fields.EmbeddedDataField<RangePTR2e, false, true>;
  cost: foundry.data.fields.SchemaField<{
    activation: foundry.data.fields.StringField<ActionCost, string, true, false, true>;
    powerPoints: foundry.data.fields.NumberField<number, number, true, false, true>;
    trigger: foundry.data.fields.StringField<string, string, false, true>;
    delay: foundry.data.fields.NumberField<Delay, number, false, true>;
    priority: foundry.data.fields.NumberField<Priority, number, false, true>;
  }, {
    activation: ActionCost;
    powerPoints: number;
    trigger: string;
    delay: Delay;
    priority: Priority;
  }, {
    activation: ActionCost;
    powerPoints: number;
    trigger: string;
    delay: Delay;
    priority: Priority;
  }>;
  variant: SlugField<string, string, false>;
}

export default ActionPTR2e;
