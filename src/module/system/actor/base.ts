export class ActorPTR2e extends Actor {
  ofType<Type extends Actor.SubType>(type: Type): this is Actor.OfType<Type> {
    return this.type === type;
  }

  isKnown(): this is Actor.Known {
    return !this.type.includes(".") && !this.type.includes("ptu-actor");
  }

  get asdf() {
    return this.ofType("humanoid")
      ? this.system.asdf
      : this.isKnown()
        ? this.system.value
        : null
  }
}