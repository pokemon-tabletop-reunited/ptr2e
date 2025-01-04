import type { RollOptionDomains } from "@module/data/roll-option-manager.ts";
import type { AnyObject, DeepPartial } from "fvtt-types/utils";

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
  
  ItemSourceFlagsPTR2e,
  ItemGrantData,
  ItemGrantSource,
  ItemGrantDeleteAction,
};
