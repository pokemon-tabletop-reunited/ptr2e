import type { ChangeModelOptions, ChangeSource } from "@data";
import { ChangeModel } from "@data";
import { ItemAlteration } from "../alterations/item.ts";
import { isObject, sluggify, tupleHasValue } from "@utils";
import * as R from "remeda";
import { UUIDUtils } from "src/util/uuid.ts";
import type { ChangeModelSchema } from "./change.ts";
import type { ItemGrantDeleteAction } from "@item/data/data.ts";
import type { InexactPartial } from "fvtt-types/utils";

const ON_DELETE_ACTIONS = ["cascade", "detach", "restrict"] as const;

const grantItemChangeSchema = {
  reevaluateOnUpdate: new foundry.data.fields.BooleanField({ label: "PTR2E.Effect.FIELDS.ChangeReevaluateOnUpdate.label" }),
  inMemoryOnly: new foundry.data.fields.BooleanField(),
  allowDuplicate: new foundry.data.fields.BooleanField({ initial: true, label: "PTR2E.Effect.FIELDS.ChangeAllowDuplicate.label" }),
  alterations: new foundry.data.fields.ArrayField(new foundry.data.fields.EmbeddedDataField(ItemAlteration)),
  track: new foundry.data.fields.BooleanField(),
  replaceSelf: new foundry.data.fields.BooleanField({ label: "PTR2E.Effect.FIELDS.ChangeReplaceSelf.label" }),
  onDeleteActions: new foundry.data.fields.SchemaField({
    grantee: new foundry.data.fields.StringField({ required: true, choices: ON_DELETE_ACTIONS, initial: "detach" }),
    granter: new foundry.data.fields.StringField({ required: true, choices: ON_DELETE_ACTIONS, initial: "cascade" }),
  }, {
    required: true,
    nullable: true,
    initial: null
  })
}

export type GrantItemChangeSchema = typeof grantItemChangeSchema & ChangeModelSchema;

class GrantItemChangeSystem extends ChangeModel<GrantItemChangeSchema> {
  static override TYPE = "grant-item";

  get grantedId(): string | null {
    return this._grantedId || this.effect.flags?.ptr2e?.itemGrants?.[this.flag]?.id || null;
  }

  /** The id of the granted item */
  _grantedId: string | null = null;

  /**
   * If the granted item has a `ChoiceSet`, its selection may be predetermined. The key of the record must be the
   * `ChoiceSet`'s designated `flag` property.
   */
  preselectChoices: Record<string, string | number> = {};

  // /** Actions taken when either the parent or child item are deleted */
  // override onDeleteActions: Partial<OnDeleteActions> | null = null;

  constructor(data: foundry.abstract.DataModel.ConstructorData<GrantItemChangeSchema>, options: ChangeModelOptions) {
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

      this.#trackItem(grantedItem as Item.ConfiguredInstance | null);
    }
  }

  static override defineSchema(): GrantItemChangeSchema {
    const schema = super.defineSchema();
    schema.value.validate = GrantItemChangeSystem.#validateUuid;
    return {
      ...schema,
      ...grantItemChangeSchema
    };
  }

  static #validateUuid(value: unknown): undefined | foundry.data.validation.DataModelValidationFailure {
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
    return undefined;
  }

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

  static override validateJoint(data: foundry.data.fields.SchemaField.AssignmentType<GrantItemChangeSchema>): void {
    super.validateJoint(data!);

    if (data!.track && !data!.key) {
      throw Error("must have explicit flag set if granted item is tracked");
    }

    if (data!.reevaluateOnUpdate && data!.predicate.length === 0) {
      throw Error("reevaluateOnUpdate: must have non-empty predicate");
    }

    if (data!.reevaluateOnUpdate && data!.allowDuplicate) {
      throw Error("reevaluateOnUpdate: cannot allow duplicates");
    }
  }

  public async getItem(key: string = this.resolveInjectedProperties(this.uuid)): Promise<Maybe<ClientDocument>> {
    try {
      return (await fromUuid(key + ""))?.clone() ?? null
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  override async preCreate(args: ChangeModel.PreCreateParams<ChangeSource>): Promise<void> {
    if (this.inMemoryOnly || this.invalid || !this.actor) return;

    const { effectSource, pendingItems, context, pendingEffects } = args;
    const changeSource: GrantItemSource = args.changeSource;

    const uuid = this.resolveInjectedProperties(this.uuid);
    const grantedDocument: Maybe<ClientDocument> = await this.getItem(uuid);
    if (!(grantedDocument instanceof CONFIG.Item.documentClass || grantedDocument instanceof CONFIG.ActiveEffect.documentClass)) return;

    changeSource.key =
      typeof changeSource.key === "string" && changeSource.key.length > 0
        ? sluggify(changeSource.key, { camel: 'dromedary' })
        : ((): string => {
          const defaultFlag = sluggify(grantedDocument.slug ?? grantedDocument.name, { camel: 'dromedary' });
          const flagPattern = new RegExp(`^${defaultFlag}\\d*$`);
          const itemGrants = effectSource.flags?.ptr2e?.itemGrants ?? {};
          const nthGrant = Object.keys(itemGrants).filter(g => flagPattern.test(g)).length;

          return nthGrant > 0 ? `${defaultFlag}${nthGrant + 1}` : defaultFlag;
        })();
    this.flag = String(changeSource.key);

    if (!this.test()) return;

    // If we shouldn't allow duplicates, check for an existing item with this source ID
    const existingItem = this.type === "grant-effect"
      ? this.actor.effects.find(e => (e as ActiveEffect.ConfiguredInstance).slug === grantedDocument.slug) as ActiveEffect.ConfiguredInstance
      : this.actor.items.find((i) => (i as Item.ConfiguredInstance)?.flags?.core?.sourceId === uuid) as Item.ConfiguredInstance;
    if (!this.allowDuplicate && existingItem) {
      this.#setGrantFlags(effectSource, existingItem);

      if (!this.reevaluateOnUpdate) ui.notifications.info(
        game.i18n.format("PTR2E.UI.RuleElements.GrantItem.AlreadyHasItem", {
          actor: this.actor.name,
          item: grantedDocument.name,
        }),
      );
      return;
    }

    // Set ids and flags on the granting effect and granted item
    effectSource._id ??= foundry.utils.randomID();
    const grantedSource = grantedDocument.toObject();
    grantedSource._id = foundry.utils.randomID();

    // An item may grant another copy of itself, but at least strip the copy of its grant CMs
    if (this.item?.flags?.core?.sourceId === (grantedSource.flags.core?.sourceId ?? "")) {
      if (this.type === "grant-effect") {
        grantedSource.system.changes = grantedSource.system.changes.filter(c => c.type !== GrantItemChangeSystem.TYPE);
      }
      else {
        for (const ae of (grantedSource as Item.ConstructorData).effects) {
          const effect = ae as PTR.ActiveEffect.Source;
          effect.system.changes = effect.system.changes.filter(c => c.type !== GrantItemChangeSystem.TYPE);
        }
      }
    }

    // Guarantee future already-granted checks pass in all cases by re-assigning sourceId
    grantedSource.flags = foundry.utils.mergeObject(grantedSource.flags, { core: { sourceId: uuid } });

    // Apply alterations
    try {
      for (const alteration of this.alterations) {
        alteration.applyTo(grantedSource as Item.ConstructorData);
      }
    } catch (error) {
      if (error instanceof Error) this.failValidation(error.message);
    }

    const tempGranted = this.type === "grant-effect" ? new CONFIG.ActiveEffect.documentClass(foundry.utils.deepClone(grantedSource), { parent: this.actor }) : new CONFIG.Item.documentClass(foundry.utils.deepClone(grantedSource), { parent: this.actor });
    // tempGranted.grantedBy = this.effect;

    // TODO: Check for immunity and bail if a match

    // TODO: Check if additional data preperation cycles need to be manually triggered

    // this.#applyChoicePreselections(tempGranted);

    if (this.ignored) return;

    if (this.type !== "grant-effect") args.tempItems.push(tempGranted as Item.ConfiguredInstance);

    this._grantedId = grantedSource._id;
    context.keepId = true;

    this.#setGrantFlags(effectSource, grantedSource);
    if (this.type !== "grant-effect") this.#trackItem(tempGranted as Item.ConfiguredInstance);

    // Add to pending items before running pre-creates to preserve creation order
    if (this.replaceSelf) {
      pendingEffects.findSplice(i => i._id === this.effect._id);
      pendingItems.findSplice(i => i._id === this.effect.parent?._id);
    }

    if (this.type === "grant-effect") pendingEffects.push(grantedSource as PTR.ActiveEffect.Source);
    else pendingItems.push(grantedSource);

    // Run the granted item's preCreate callbacks unless this is a pre-actor-update reevaluation
    if (!args.reevaluation) {
      if (this.type === "grant-effect") await this.#runGrantedEffectPreCreates(args, tempGranted as ActiveEffect.ConfiguredInstance, context);
      else await this.#runGrantedItemPreCreates(args, tempGranted as Item.ConfiguredInstance, context);
    }
  }

  /** Grant an item if this rule element permits it and the predicate passes */
  override async preUpdateActor(): Promise<{ create: Item.ConstructorData[]; delete: string[]; } | { createEffects: ActiveEffect.ConstructorData[]; deleteEffects: string[]; }> {
    const noAction = { create: [], delete: [] };

    if (this.ignored || !this.reevaluateOnUpdate || this.inMemoryOnly || !this.actor) return noAction;

    if (this.grantedId && (this.actor.items.has(this.grantedId) || this.actor.effects.has(this.grantedId))) {
      if (!this.test()) {
        if (this.type === "grant-effect") return { createEffects: [], deleteEffects: [this.grantedId] };
        return { create: [], delete: [this.grantedId] };
      }
      return noAction;
    }

    const effectSource = this.effect.toObject() as ActiveEffect.ConstructorData;
    const changeSource = this.toObject() as foundry.data.fields.SchemaField.AssignmentType<ChangeModelSchema>;
    const pendingItems: Item.ConstructorData[] = [];
    const pendingEffects: ActiveEffect.ConstructorData[] = [];
    const context = { parent: this.actor, render: false };
    await this.preCreate({ changeSource!, pendingItems, effectSource, pendingEffects, tempItems: [], context, reevaluation: true });

    if (pendingItems.length > 0) {
      const updatedGrants = effectSource.flags?.ptr2e?.itemGrants ?? {};
      const updatedKey = Object.keys(updatedGrants).find(k => (updatedGrants[k as keyof typeof updatedGrants] as { id: string }).id === this.grantedId);
      if (updatedKey) {
        const changes = this.parent.toObject().changes;
        const index = this.parent.changes.findIndex(c => c === this);
        if (index >= 0) {
          changes[index].key = updatedKey;
        }
        await this.effect.update({ "flags.ptr2e.itemGrants": updatedGrants, "system.changes": changes }, { render: false });
      }
      else {
        await this.effect.update({ "flags.ptr2e.itemGrants": updatedGrants }, { render: false });
      }
      return { create: pendingItems, delete: [] };
    }
    if (pendingEffects.length > 0) {
      const updatedGrants = effectSource.flags?.ptr2e?.itemGrants ?? {};
      const updatedKey = Object.keys(updatedGrants).find(k => (updatedGrants[k as keyof typeof updatedGrants] as { id: string }).id === this.grantedId);
      if (updatedKey) {
        const changes = this.parent.toObject().changes;
        const index = this.parent.changes.findIndex(c => c === this);
        if (index >= 0) {
          changes[index].key = updatedKey;
        }
        await this.effect.update({ "flags.ptr2e.itemGrants": updatedGrants, "system.changes": changes }, { render: false });
      }
      else {
        await this.effect.update({ "flags.ptr2e.itemGrants": updatedGrants }, { render: false });
      }
      return { createEffects: pendingEffects, deleteEffects: [] };
    }

    return noAction;
  }

  #getOnDeleteActions(data: GrantItemSource): Partial<OnDeleteActions> | null {
    const actions = data.onDeleteActions;
    if (isObject<OnDeleteActions>(actions)) {
      return tupleHasValue(ON_DELETE_ACTIONS, actions.granter) || tupleHasValue(ACTIONS, actions.grantee)
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
  // #applyChoicePreselections(_grantedItem: CONFIG.Item.documentClass): void {
  //   return;
  // const source = grantedItem._source;
  // for (const [flag, selection] of Object.entries(this.preselectChoices ?? {})) {
  //     for(const effect of grantedItem.effects) {
  //         const change = (effect as ActiveEffect.ConfiguredInstance).system.changes.find(c => c.type === "choice-set" && c.key === flag);
  //         if (change) {

  //         }
  //     }
  // }
  // }

  /** Set flags on granting and grantee items to indicate relationship between the two */
  #setGrantFlags(granter: ActiveEffect.ConstructorData, grantee: Item.ConstructorData | Item.ConfiguredInstance | ActiveEffect.ConfiguredInstance): void {
    const flags = foundry.utils.mergeObject(granter.flags ?? {}, { ptr2e: { itemGrants: { [this.flag]: {} } } });
    if (!this.flag) throw new Error("No flag set for granted item");

    flags.ptr2e ??= {};
    flags.ptr2e.itemGrants ??= {};
    flags.ptr2e.itemGrants[this.flag] = {
      // The granting item records the granted item's ID in an array at `flags.ptr2e.itemGrants`
      id: grantee instanceof CONFIG.Item.documentClass ? grantee.id : grantee._id!,
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

    if (grantee instanceof CONFIG.Item.documentClass) {
      // This is a previously granted item: update its grantedBy flag
      // Don't await since it will trigger a data reset, possibly wiping temporary roll options
      grantee.update({ "flags.ptr2e.grantedBy": grantedBy }, { render: false });
    } else {
      grantee.flags = foundry.utils.mergeObject(grantee.flags ?? {}, { ptr2e: { grantedBy } });
      if (this.type === "grant-effect") {
        grantee.flags = foundry.utils.mergeObject(grantee.flags ?? {}, { ptr2e: { grantedBy } });
      }
    }
  }

  async #runGrantedItemPreCreates(
    originalArgs: Omit<ChangeModel.PreCreateParams, "changeSource">,
    grantedItem: Item.ConfiguredInstance,
    context: InexactPartial<Omit<foundry.abstract.Document.DatabaseOperationsFor<"Item", "create">, "ids">>,
  ): Promise<void> {
    for (const effect of grantedItem.effects.contents) {
      for (const change of (effect as ActiveEffect.ConfiguredInstance).system.changes) {
        await change.preCreate?.({
          ...originalArgs,
          changeSource: change,
          effectSource: effect.toObject() as PTR.ActiveEffect.Source,
          context,
        });
      }
    }
  }

  async #runGrantedEffectPreCreates(
    originalArgs: Omit<ChangeModel.PreCreateParams, "changeSource">,
    effect: ActiveEffect.ConfiguredInstance,
    context: InexactPartial<Omit<foundry.abstract.Document.DatabaseOperationsFor<"ActiveEffect", "create">, "ids">>,
  ): Promise<void> {
    for (const change of effect.system.changes) {
      await change.preCreate?.({
        ...originalArgs,
        changeSource: change,
        effectSource: effect.toObject() as PTR.ActiveEffect.Source,
        context,
      });
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
  #trackItem(grantedItem: Item.ConfiguredInstance | null): void {
    if (!(this.track && this.flag && this.grantedId && grantedItem)) return;

    //TODO: Implement item tracking
  }
}

interface GrantItemChangeSystem {
  value: string;
}

export default GrantItemChangeSystem;
export { type GrantItemChangeSystem };

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

export async function processGrantDeletions(effect: ActiveEffect.ConfiguredInstance, item: Maybe<Item.ConfiguredInstance>, pendingItems: Item.ConfiguredInstance[], pendingEffects: ActiveEffect.ConfiguredInstance[], ignoreRestricted: boolean): Promise<void> {
  const actor = effect.targetsActor() ? effect.target : effect.parent.actor;

  const granter = actor.effects.get((item ? item.flags.ptr2e.grantedBy?.id : effect.flags.ptr2e.grantedBy?.id) ?? "") as ActiveEffect.ConfiguredInstance;
  const parentGrant = Object.values(granter?.flags.ptr2e.itemGrants ?? {}).find(g => g.id === effect.id || g.id === item?.id);
  const grants = Object.values(effect.flags.ptr2e.itemGrants ?? {});

  // Handle deletion restrictions, aborting early if found in either this item's granter or any of its grants
  if (!ignoreRestricted && granter && parentGrant?.onDelete === "restrict" && !pendingEffects.includes(granter)) {
    ui.notifications.warn(game.i18n.format("PTR2E.UI.Warnings.GrantItem.RemovalPrevented", { item: item?.name ?? effect.name, preventer: granter.name }));
    if (item) pendingItems.splice(pendingItems.indexOf(item), 1);
    else pendingEffects.splice(pendingEffects.indexOf(effect), 1);
    return;
  }

  for (const grant of grants) {
    const grantee = (actor.items.get(grant.id) as Maybe<Item.ConfiguredInstance>) ?? (actor.effects.get(grant.id) as ActiveEffect.ConfiguredInstance) ?? (item?.effects.get(grant.id) as ActiveEffect.ConfiguredInstance);
    if (grantee?.flags.ptr2e.grantedBy?.id !== effect.id) continue;

    if (!ignoreRestricted && grantee.flags.ptr2e.grantedBy.onDelete === "restrict" && !(pendingItems.includes(grantee) || pendingEffects.includes(grantee))) {
      ui.notifications.warn(game.i18n.format("PTR2E.UI.Warnings.GrantItem.RemovalPrevented", { item: item?.name ?? effect.name, preventer: grantee.name }));
      if (item) pendingItems.splice(pendingItems.indexOf(item), 1);
      else pendingEffects.splice(pendingEffects.indexOf(effect), 1);
      return;
    }
  }

  // Handle deletion cascades, pushing additional items onto the `pendingItems` array
  if (granter && parentGrant?.onDelete === "cascade" && !pendingEffects.includes(granter)) {
    pendingEffects.push(granter);
    await processGrantDeletions(granter, item, pendingItems, pendingEffects, ignoreRestricted);
  }

  for (const grant of grants) {
    const grantee = (actor.items.get(grant.id) as Maybe<Item.ConfiguredInstance>) ?? (actor.effects.get(grant.id) as ActiveEffect.ConfiguredInstance) ?? (item?.effects.get(grant.id) as ActiveEffect.ConfiguredInstance);
    if (grantee?.flags.ptr2e.grantedBy?.id !== effect.id) continue;

    if (grantee.flags.ptr2e.grantedBy.onDelete === "cascade" && !(pendingItems.includes(grantee) || pendingEffects.includes(grantee))) {
      if (grantee instanceof CONFIG.Item.documentClass) {
        pendingItems.push(grantee);
        await processGrantDeletions(effect, grantee, pendingItems, pendingEffects, ignoreRestricted);
      }
      if (grantee instanceof CONFIG.ActiveEffect.documentClass) {
        pendingEffects.push(grantee);
        await processGrantDeletions(grantee as ActiveEffect.ConfiguredInstance, item, pendingItems, pendingEffects, ignoreRestricted);
      }
    }
  }

  // Finally, handle detachments, removing the grant data from granters `itemGrants` object
  const [key] = Object.entries(granter?.flags.ptr2e.itemGrants ?? {}).find(([, g]) => g === parentGrant) ?? [null];
  if (granter && key && !pendingEffects.includes(granter)) {
    await granter.update({ [`flags.ptr2e.itemGrants.-=${key}`]: null }, { render: false });
  }

  for (const grant of grants) {
    const grantee = (actor.items.get(grant.id) as Maybe<Item.ConfiguredInstance>) ?? (actor.effects.get(grant.id) as ActiveEffect.ConfiguredInstance) ?? (item?.effects.get(grant.id) as ActiveEffect.ConfiguredInstance);
    if (grantee?.flags.ptr2e.grantedBy?.id !== effect.id) continue;

    // Unset the grant flag and leave the granted item on the actor
    if (grantee.flags.ptr2e.grantedBy.onDelete === "detach" && !(pendingItems.includes(grantee) || pendingEffects.includes(grantee))) {
      await grantee.update({ "flags.ptr2e.-=grantedBy": null }, { render: false });
    }
  }
}