import { ActorSystem } from "./system";

export class HumanoidActorSystem extends ActorSystem<ActorSystem.Schema, {}, {asdf: string}> {
  get test() {
    return "";
  }
}