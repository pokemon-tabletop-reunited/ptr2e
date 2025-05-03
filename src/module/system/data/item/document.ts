import type { ActionsCollections } from "../actions-collection";

declare namespace ItemPTR2e {
  type Any = ItemPTR2e<Item.SubType>;
}

class ItemPTR2e<SubType extends Item.SubType> extends Item<SubType> {

  ofType<Type extends Item.SubType>(type: Type): this is Item.OfType<Type> {
    return this.type === type;
  }

  isKnown(): this is Item.Known {
    return !this.type.includes(".");
  }

  declare actions: ActionsCollections

  async toChat() {
    return ChatMessage.create({
      content: `<span>@Embed[${this.uuid} caption=false classes=no-tooltip]</span>`,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    });
  }
}

export { ItemPTR2e };