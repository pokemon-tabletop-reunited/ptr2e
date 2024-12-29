import { RollOptionDomains } from "@module/data/roll-option-manager.ts";
import type { AnyObject, DeepPartial } from "fvtt-types/utils";

interface ItemFlagsPTR2e extends AnyObject {
  ptr2e: {
    choiceSelections: Record<string, string | number | object | null>;
    //itemGrants: Record<string, ItemGrantData>;
    grantedBy: ItemGrantData | null;
    rollOptions: {
      [domain in keyof typeof RollOptionDomains]: Record<string, boolean>;
    }
    [key: string]: unknown;
  };
}

interface ItemSourceFlagsPTR2e extends DeepPartial<AnyObject> {
  ptr2e?: {
    choiceSelections?: Record<string, string | number | object>;
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

export type {
  ItemFlagsPTR2e,
  ItemSourceFlagsPTR2e,
  ItemGrantData,
  ItemGrantSource,
  ItemGrantDeleteAction,
};
