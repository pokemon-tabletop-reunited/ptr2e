import { ActorSystem } from "./system";

export class PokemonActorSystem extends ActorSystem {
  foo() {
    return this.advancement.experience.current;
  }
}