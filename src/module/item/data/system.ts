import { ActionPTR2e } from "@data";
import { MigrationRecord } from "@module/data/mixins/has-migrations.ts";
import { RollOptionDomains } from "@module/data/roll-option-manager.ts";

type ItemType =
    | "ability"
    | "consumable"
    | "container"
    | "effect"
    | "equipment"
    | "gear"
    | "move"
    | "perk"
    | "species"
    | "weapon";

type BaseItemSourcePTR2e<
    TType extends ItemType,
    TSystemSource extends Partial<ItemSystemSource> = ItemSystemSource,
> = foundry.documents.ItemSource<TType, TSystemSource> & {
    flags: ItemSourceFlagsPTR2e;
};

interface ItemFlagsPTR2e extends foundry.documents.ItemFlags {
    ptr2e: {
        rulesSelections: Record<string, string | number | object | null>;
        itemGrants: Record<string, ItemGrantData>;
        grantedBy: ItemGrantData | null;
        rollOptions: {
            [domain in keyof typeof RollOptionDomains]: Record<string, boolean>;
        }
        [key: string]: unknown;
    };
}

interface ItemSourceFlagsPTR2e extends DeepPartial<foundry.documents.ItemFlags> {
    ptr2e?: {
        rulesSelections?: Record<string, string | number | object>;
        itemGrants?: Record<string, ItemGrantSource>;
        grantedBy?: ItemGrantSource | null;
        rollOptions: {
            [domain in keyof typeof RollOptionDomains]: Record<string, boolean>;
        }
        [key: string]: unknown;
    };
}

type ItemGrantData = Required<ItemGrantSource>;

interface ItemGrantSource {
    /** The ID of a granting or granted item */
    id: string;
    /** The action taken when the user attempts to delete the item referenced by `id` */
    onDelete?: ItemGrantDeleteAction;
}

type ItemGrantDeleteAction = "cascade" | "detach" | "restrict";

type ItemSystemSource = {
    /**
     * A slug for the item, derived from its name.
     * @defaultValue `slugify(this.name)`
     * @remarks
     * This is a unique identifier for the item within its parent actor.
     * If the item's name changes, the slug should be automatically updated.
     * If the slug is manually set, it should be unique within the actor's items.
     * @example
     * ```typescript
     * const item = new ItemPTR2e({ name: 'Flashlight' });
     * console.log(item.slug); // 'flashlight'
     * ```
     */
    slug: string;

    /**
     * A set of traits that the item has.
     */
    traits: Set<string>;

    /**
     * A set of actions that the item has.
     */
    actions: ActionPTR2e['_source'][];

    /**
     * A description of the item.
     * @defaultValue `''`
     * @remarks
     * This is a description of the item, which can be as long as necessary.
     * It is often used to provide the effects of the item, or to provide a more detailed description of the item's appearance.
     */
    description: string;

    /**
     * The container that the item is in.
     * @remarks
     * This is the container that the item is in, if any.
     * If the item is not in a container, this will be `null`.
     */
    container?: DocumentUUID | null;

    _migration?: MigrationRecord;
};

export type {
    BaseItemSourcePTR2e,
    ItemFlagsPTR2e,
    ItemSourceFlagsPTR2e,
    ItemGrantData,
    ItemGrantSource,
    ItemGrantDeleteAction,
    ItemSystemSource,
    ItemType,
};
