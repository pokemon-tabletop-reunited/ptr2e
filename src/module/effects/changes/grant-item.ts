import { ActorPTR2e } from "@actor";
import { ChangeModel, ChangeModelOptions, ChangeSchema, ChangeSource } from "@data";
import {
  ArrayField,
  BooleanField,
  EmbeddedDataField,
} from "types/foundry/common/data/fields.js";
import { ItemAlteration } from "../alterations/item.ts";
import { ItemPTR2e, ItemSourcePTR2e, ItemSystemPTR } from "@item";
import { isObject, sluggify, tupleHasValue } from "@utils";
import ActiveEffectPTR2e from "../document.ts";
import { EffectSourcePTR2e } from "@effects";
import { ItemGrantDeleteAction } from "@item/data/system.ts";
import * as R from "remeda";
import { UUIDUtils } from "src/util/uuid.ts";

export default class GrantItemChangeSystem extends ChangeModel {
  static override TYPE = "grant-item";

  /** The id of the granted item */
  grantedId: string | null = null;

  /**
   * If the granted item has a `ChoiceSet`, its selection may be predetermined. The key of the record must be the
   * `ChoiceSet`'s designated `flag` property.
   */
  preselectChoices: Record<string, string | number> = {};

  /** Actions taken when either the parent or child item are deleted */
  onDeleteActions: Partial<OnDeleteActions> | null = null;

  constructor(data: GrantItemSource, options: ChangeModelOptions) {
    if (data.inMemoryOnly) data.priority ??= 99;
    super(data, options);
    if (this.invalid) return;

    if (this.inMemoryOnly) {
      this.reevaluateOnUpdate = true;
      this.allowDuplicate = true;
    } else {
      if (this.reevaluateOnUpdate) this.allowDuplicate = false;
    }

    this.onDeleteActions = this.#getOnDeleteActions(data);

    if (this.track) {
      const grantedItem = this.actor?.items.get(this.grantedId ?? "") ?? null;

      this.#trackItem(grantedItem as ItemPTR2e | null);
    }
  }

  static override defineSchema(): GrantItemSchema {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    schema.value.validate = GrantItemChangeSystem.#validateUuid;
    return {
      ...schema,
      reevaluateOnUpdate: new fields.BooleanField({ label: "PTR2E.Effect.FIELDS.ChangeReevaluateOnUpdate.label" }),
      inMemoryOnly: new fields.BooleanField(),
      allowDuplicate: new fields.BooleanField({ initial: true, label: "PTR2E.Effect.FIELDS.ChangeAllowDuplicate.label" }),
      alterations: new fields.ArrayField(new fields.EmbeddedDataField(ItemAlteration)),
      track: new fields.BooleanField(),
    };
  }

  static #validateUuid(value: unknown): void | foundry.data.validation.DataModelValidationFailure {
    if (/{(actor|item|change|effect)\|(.*?)}/g.test(value + '')) return;
    if (!UUIDUtils.isItemUUID(value)) {
      return new foundry.data.validation.DataModelValidationFailure({
        invalidValue: value,
        message: game.i18n.localize("PTR2E.Effect.FIELDS.ChangeUuid.invalid.notAnItemUuid"),
        unresolved: false
      });
    }
    if (game.ready && !fromUuidSync(value)) {
      return new foundry.data.validation.DataModelValidationFailure({
        invalidValue: value,
        message: game.i18n.format("PTR2E.Effect.FIELDS.ChangeUuid.invalid.itemNotFound", { uuid: value }),
        unresolved: false
      });
    }
  }

  static ON_DELETE_ACTIONS = ["cascade", "detach", "restrict"] as const;

  override apply(): void {
    if (!this.invalid) this.#createInMemoryCondition();
  }

  get uuid() {
    return this.value as string;
  }

  get flag() {
    return this.key;
  }
  set flag(value: string) {
    this.key = value;
  }

  static override validateJoint(data: SourceFromSchema<GrantItemSchema>): void {
    super.validateJoint(data);

    if (data.track && !data.key) {
      throw Error("must have explicit flag set if granted item is tracked");
    }

    if (data.reevaluateOnUpdate && data.predicate.length === 0) {
      throw Error("reevaluateOnUpdate: must have non-empty predicate");
    }
  }

  public async getItem(key: string = this.resolveInjectedProperties(this.uuid)): Promise<Maybe<ClientDocument>> {
    try {
      return (await fromUuid(key))?.clone() ?? null
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  override async preCreate(args: ChangeModel.PreCreateParams<ChangeSource>): Promise<void> {
    if (this.inMemoryOnly || this.invalid || !this.actor) return;

    const { effectSource, pendingItems, context } = args;
    const changeSource: GrantItemSource = args.changeSource;

    const uuid = this.resolveInjectedProperties(this.uuid);
    const grantedItem: Maybe<ClientDocument> = await this.getItem(uuid);
    if (!(grantedItem instanceof ItemPTR2e)) return;

    changeSource.key =
      typeof changeSource.key === "string" && changeSource.key.length > 0
        ? sluggify(changeSource.key, { camel: 'dromedary' })
        : ((): string => {
          const defaultFlag = sluggify(grantedItem.slug ?? grantedItem.name, { camel: 'dromedary' });
          const flagPattern = new RegExp(`^${defaultFlag}\\d*$`);
          const itemGrants = effectSource.flags?.ptr2e?.itemGrants ?? {};
          const nthGrant = Object.keys(itemGrants).filter(g => flagPattern.test(g)).length;

          return nthGrant > 0 ? `${defaultFlag}${nthGrant + 1}` : defaultFlag;
        })();
    this.flag = String(changeSource.key);

    if (!this.test()) return;

    // If we shouldn't allow duplicates, check for an existing item with this source ID
    const existingItem = this.actor.items.find((i) => (i as ItemPTR2e).sourceId === uuid) as ItemPTR2e;
    if (!this.allowDuplicate && existingItem) {
      this.#setGrantFlags(effectSource, existingItem);

      ui.notifications.info(
        game.i18n.format("PTR2E.UI.RuleElements.GrantItem.AlreadyHasItem", {
          actor: this.actor.name,
          item: grantedItem.name,
        }),
      );
      return;
    }

    // Set ids and flags on the granting effect and granted item
    effectSource._id ??= fu.randomID();
    const grantedSource = grantedItem.toObject();
    grantedSource._id = fu.randomID();

    // An item may grant another copy of itself, but at least strip the copy of its grant REs
    if (this.item?.sourceId === (grantedSource.flags.core?.sourceId ?? "")) {
      for (const ae of grantedSource.effects) {
        const effect = ae as EffectSourcePTR2e;
        effect.system.changes = effect.system.changes.filter(c => c.type !== GrantItemChangeSystem.TYPE);
      }
    }

    // Guarantee future already-granted checks pass in all cases by re-assigning sourceId
    grantedSource.flags = fu.mergeObject(grantedSource.flags, { core: { sourceId: uuid } });

    // Apply alterations
    try {
      for (const alteration of this.alterations) {
        alteration.applyTo(grantedSource as ItemSourcePTR2e);
      }
    } catch (error) {
      if (error instanceof Error) this.failValidation(error.message);
    }

    const tempGranted = new ItemPTR2e(fu.deepClone(grantedSource), { parent: this.actor });
    // tempGranted.grantedBy = this.effect;

    // TODO: Check for immunity and bail if a match

    // TODO: Check if additional data preperation cycles need to be manually triggered

    this.#applyChoicePreselections(tempGranted);

    if (this.ignored) return;

    args.tempItems.push(tempGranted);

    this.grantedId = grantedSource._id;
    context.keepId = true;

    this.#setGrantFlags(effectSource, grantedSource as ItemSourcePTR2e);
    this.#trackItem(tempGranted);

    // Add to pending items before running pre-creates to preserve creation order
    pendingItems.push(grantedSource as ItemSourcePTR2e);

    // Run the granted item's preCreate callbacks unless this is a pre-actor-update reevaluation
    if (!args.reevaluation) {
      await this.#runGrantedItemPreCreates(args, tempGranted, context);
    }
  }

  /** Grant an item if this rule element permits it and the predicate passes */
  override async preUpdateActor(): Promise<{ create: ItemSourcePTR2e[]; delete: string[]; }> {
    const noAction = { create: [], delete: [] };

    if (this.ignored || !this.reevaluateOnUpdate || this.inMemoryOnly || !this.actor) return noAction;

    if (this.grantedId && this.actor.items.has(this.grantedId)) {
      if (!this.test()) {
        return { create: [], delete: [this.grantedId] };
      }
      return noAction;
    }

    const effectSource = this.effect.toObject() as EffectSourcePTR2e;
    const changeSource: ChangeSource = this.toObject();
    const pendingItems: ItemSourcePTR2e[] = [];
    const pendingEffects: EffectSourcePTR2e[] = [];
    const context = { parent: this.actor, render: false };
    await this.preCreate({ changeSource, pendingItems, effectSource, pendingEffects, tempItems: [], context, reevaluation: true });

    if (pendingItems.length > 0) {
      const updatedGrants = effectSource.flags?.ptr2e?.itemGrants ?? {};
      await this.effect.update({ "flags.ptr2e.itemGrants": updatedGrants }, { render: false });
      return { create: pendingItems, delete: [] };
    }

    return noAction;
  }

  #getOnDeleteActions(data: GrantItemSource): Partial<OnDeleteActions> | null {
    const actions = data.onDeleteActions;
    if (isObject<OnDeleteActions>(actions)) {
      const ACTIONS = GrantItemChangeSystem.ON_DELETE_ACTIONS;
      return tupleHasValue(ACTIONS, actions.granter) || tupleHasValue(ACTIONS, actions.grantee)
        ? R.pick(
          actions,
          ([actions.granter ? "granter" : [], actions.grantee ? "grantee" : []] as const).flat(),
        )
        : null;
    }

    return null;
  }

  /** Apply preselected choices to the granted item's choices sets. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  #applyChoicePreselections(_grantedItem: ItemPTR2e): void {
    return;
    // const source = grantedItem._source;
    // for (const [flag, selection] of Object.entries(this.preselectChoices ?? {})) {
    //     for(const effect of grantedItem.effects) {
    //         const change = (effect as ActiveEffectPTR2e).system.changes.find(c => c.type === "choice-set" && c.key === flag);
    //         if (change) {

    //         }
    //     }
    // }
  }

  /** Set flags on granting and grantee items to indicate relationship between the two */
  #setGrantFlags(granter: PreCreate<EffectSourcePTR2e>, grantee: ItemSourcePTR2e | ItemPTR2e): void {
    const flags = fu.mergeObject(granter.flags ?? {}, { ptr2e: { itemGrants: { [this.flag]: {} } } });
    if (!this.flag) throw new Error("No flag set for granted item");

    flags.ptr2e.itemGrants[this.flag] = {
      // The granting item records the granted item's ID in an array at `flags.ptr2e.itemGrants`
      id: grantee instanceof ItemPTR2e ? grantee.id : grantee._id!,
      // The on-delete action determines what will happen to the granter item when the granted item is deleted:
      // Default to "detach" (do nothing).
      onDelete: this.onDeleteActions?.grantee ?? "detach",
    }

    // The granted item records its granting item's ID at `flags.ptr2e.grantedBy`
    const grantedBy = {
      id: granter._id,
      // The on-delete action determines what will happen to the granted item when the granter is deleted:
      // Default to "cascade" (delete the granted item).
      onDelete:
        this.onDeleteActions?.granter ?? "cascade",
    };

    if (grantee instanceof ItemPTR2e) {
      // This is a previously granted item: update its grantedBy flag
      // Don't await since it will trigger a data reset, possibly wiping temporary roll options
      grantee.update({ "flags.ptr2e.grantedBy": grantedBy }, { render: false });
    } else {
      grantee.flags = fu.mergeObject(grantee.flags ?? {}, { ptr2e: { grantedBy } });
    }
  }

  async #runGrantedItemPreCreates(
    originalArgs: Omit<ChangeModel.PreCreateParams, "changeSource">,
    grantedItem: ItemPTR2e,
    context: DocumentModificationContext<ActorPTR2e | ItemPTR2e | null>,
  ): Promise<void> {
    for (const effect of grantedItem.effects.contents) {
      for (const change of (effect as ActiveEffectPTR2e).system.changes) {
        await change.preCreate?.({
          ...originalArgs,
          changeSource: change,
          effectSource: effect.toObject() as EffectSourcePTR2e,
          context,
        });
      }
    }
  }

  #createInMemoryCondition(): void {
    if (!this.inMemoryOnly || !this.test()) return;

    const uuid = this.resolveInjectedProperties(this.uuid);
    if (!UUIDUtils.isItemUUID(uuid)) {
      this.failValidation("inMemoryOnly: must reference an item");
      return;
    }

    // TODO: Implement in-memory item creation
  }

  /** If this item is being tracked, set an actor flag and add its item roll options to the `all` domain */
  #trackItem(grantedItem: ItemPTR2e | null): void {
    if (!(this.track && this.flag && this.grantedId && grantedItem)) return;

    //TODO: Implement item tracking
  }
}

export default interface GrantItemChangeSystem
  extends ChangeModel,
  ModelPropsFromSchema<GrantItemSchema> {
  value: string;
}

type GrantItemSchema = ChangeSchema & {
  // /** The UUID of the item to grant: must be a compendium or world item */
  // uuid: StringField<string, string, true, false, false>;
  // /** A flag for referencing the granted item ID in other rule elements */
  // flag: StringField<string,string,true,true,true>//SlugField<true, true, true>;
  /** Permit this grant to be applied during an actor update--if it isn't already granted and the predicate passes */
  reevaluateOnUpdate: BooleanField<boolean, boolean, false, false, true>;
  /**
   * Instead of creating a new item in the actor's embedded collection, add a "virtual" one. Usable only with
   * conditions
   */
  inMemoryOnly: BooleanField<boolean, boolean, false, false, true>;
  /** Allow multiple of the same item (as determined by source ID) to be granted */
  allowDuplicate: BooleanField<boolean, boolean, false, false, true>;
  /** A list of alterations to make on the item before granting it */
  alterations: ArrayField<EmbeddedDataField<ItemAlteration>>;
  /**
   * Track a granted physical item from roll options: the sluggified `flag` will serve as a prefix for item roll
   * options, which are added to the `all` domain.
   */
  track: BooleanField<boolean, boolean, false, false, false>;
};

interface GrantItemSource extends ChangeSource {
  preselectChoices?: unknown;
  reevaluateOnUpdate?: unknown;
  inMemoryOnly?: unknown;
  allowDuplicate?: unknown;
  onDeleteActions?: unknown;
  alterations?: unknown;
}

interface OnDeleteActions {
  granter: ItemGrantDeleteAction;
  grantee: ItemGrantDeleteAction;
}

export async function processGrantDeletions(effect: ActiveEffectPTR2e<ActorPTR2e | ItemPTR2e<ItemSystemPTR, ActorPTR2e>>, item: Maybe<ItemPTR2e<ItemSystemPTR, ActorPTR2e>>, pendingItems: ItemPTR2e<ItemSystemPTR, ActorPTR2e>[], pendingEffects: ActiveEffectPTR2e[]): Promise<void> {
  const actor = effect.targetsActor() ? effect.parent : (effect.parent as ItemPTR2e<ItemSystemPTR, ActorPTR2e>).actor;

  const granter = actor.effects.get((item ? item.flags.ptr2e.grantedBy?.id : effect.flags.ptr2e.grantedBy?.id) ?? "") as ActiveEffectPTR2e<ActorPTR2e | ItemPTR2e<ItemSystemPTR, ActorPTR2e>>;
  const parentGrant = Object.values(granter?.flags.ptr2e.itemGrants ?? {}).find(g => g.id === effect.id || g.id === item?.id);
  const grants = Object.values(effect.flags.ptr2e.itemGrants ?? {});

  // Handle deletion restrictions, aborting early if found in either this item's granter or any of its grants
  if (granter && parentGrant?.onDelete === "restrict" && !pendingEffects.includes(granter)) {
    ui.notifications.warn(game.i18n.format("PTR2E.UI.Warnings.GrantItem.RemovalPrevented", { item: item?.name ?? effect.name, preventer: granter.name }));
    if (item) pendingItems.splice(pendingItems.indexOf(item), 1);
    else pendingEffects.splice(pendingEffects.indexOf(effect), 1);
    return;
  }

  for (const grant of grants) {
    const grantee = (actor.items.get(grant.id) as Maybe<ItemPTR2e<ItemSystemPTR, ActorPTR2e>>) ?? (actor.effects.get(grant.id) as ActiveEffectPTR2e);
    if (grantee?.flags.ptr2e.grantedBy?.id !== effect.id) continue;

    // @ts-expect-error - Checks will succeed.
    if (grantee.flags.ptr2e.grantedBy.onDelete === "restrict" && !(pendingItems.includes(grantee) || pendingEffects.includes(grantee))) {
      ui.notifications.warn(game.i18n.format("PTR2E.UI.Warnings.GrantItem.RemovalPrevented", { item: item?.name ?? effect.name, preventer: grantee.name }));
      if (item) pendingItems.splice(pendingItems.indexOf(item), 1);
      else pendingEffects.splice(pendingEffects.indexOf(effect), 1);
      return;
    }
  }

  // Handle deletion cascades, pushing additional items onto the `pendingItems` array
  if (granter && parentGrant?.onDelete === "cascade" && !pendingEffects.includes(granter)) {
    pendingEffects.push(granter);
    await processGrantDeletions(granter, item, pendingItems, pendingEffects);
  }

  for (const grant of grants) {
    const grantee = (actor.items.get(grant.id) as Maybe<ItemPTR2e<ItemSystemPTR, ActorPTR2e>>) ?? (actor.effects.get(grant.id) as ActiveEffectPTR2e);
    if (grantee?.flags.ptr2e.grantedBy?.id !== effect.id) continue;

    // @ts-expect-error - Checks will succeed.
    if (grantee.flags.ptr2e.grantedBy.onDelete === "cascade" && !(pendingItems.includes(grantee) || pendingEffects.includes(grantee))) {
      if (grantee instanceof ItemPTR2e) {
        pendingItems.push(grantee);
        await processGrantDeletions(effect, grantee, pendingItems, pendingEffects);
      }
      if (grantee instanceof ActiveEffectPTR2e) {
        pendingEffects.push(grantee);
        await processGrantDeletions(grantee as ActiveEffectPTR2e<ActorPTR2e | ItemPTR2e<ItemSystemPTR, ActorPTR2e>>, item, pendingItems, pendingEffects);
      }
    }
  }

  // Finally, handle detachments, removing the grant data from granters `itemGrants` object
  const [key] = Object.entries(granter?.flags.ptr2e.itemGrants ?? {}).find(([, g]) => g === parentGrant) ?? [null];
  if (granter && key && !pendingEffects.includes(granter)) {
    await granter.update({ [`flags.ptr2e.itemGrants.-=${key}`]: null }, { render: false });
  }

  for (const grant of grants) {
    const grantee = (actor.items.get(grant.id) as Maybe<ItemPTR2e<ItemSystemPTR, ActorPTR2e>>) ?? (actor.effects.get(grant.id) as ActiveEffectPTR2e);
    if (grantee?.flags.ptr2e.grantedBy?.id !== effect.id) continue;

    // Unset the grant flag and leave the granted item on the actor
    // @ts-expect-error - Checks will succeed.
    if (grantee.flags.ptr2e.grantedBy.onDelete === "detach" && !(pendingItems.includes(grantee) || pendingEffects.includes(grantee))) {
      await grantee.update({ "flags.ptr2e.-=grantedBy": null }, { render: false });
    }
  }
}