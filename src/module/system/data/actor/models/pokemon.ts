import { ActorSystem } from "./system";

export class PokemonActorSystem extends ActorSystem {
  foo(this: PokemonActorSystem) {
    return this.advancement.experience.current;

  }
}