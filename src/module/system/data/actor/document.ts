import type { ActionsCollections } from "../actions-collection";

declare namespace ActorPTR2e {
  type Any = ActorPTR2e<Actor.SubType>;
}

class ActorPTR2e<SubType extends Actor.SubType> extends Actor<SubType> {

  ofType<Type extends Actor.SubType>(type: Type): this is Actor.OfType<Type> {
    return this.type === type;
  }

  isKnown(): this is Actor.Known {
    return !this.type.includes(".") && !this.type.includes("ptu-actor");
  }

  declare rollOptions: unknown;
  declare actions: ActionsCollections
}

export { ActorPTR2e };