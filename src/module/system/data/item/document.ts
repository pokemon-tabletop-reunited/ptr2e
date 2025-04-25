import type { ActionsCollections } from "../actions-collection";

export class ItemPTR2e extends Item {
  ofType<Type extends Item.SubType>(type: Type): this is Item.OfType<Type> {
    return this.type === type;
  }

  isKnown(): this is Item.Known {
    return !this.type.includes(".");
  }

  declare actions: ActionsCollections
}