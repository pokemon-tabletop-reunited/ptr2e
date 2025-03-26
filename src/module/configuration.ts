import type { EmptyObject } from "fvtt-types/utils";
import type { ActorPTR2e } from "./system/actor/base";
import type { HumanoidActorSystem } from "./system/actor/data/humanoid";
import type { PokemonActorSystem } from "./system/actor/data/pokemon";

// If you are writing a system then this file will be of use of you.
// Otherwise you can delete it.
declare global {
  // foundry-vtt-types needs to know what documents you register with Foundry at runtime.
  // You can configure every document class here.
  //
  // Tip 1: Make sure you import the document class and make sure the key is spelled right.
  // Tip 2: If you want to make sure it's working, try writing `type TestConfiguration = ConfiguredDocumentClassForName<"Actor">;`
  //        replacing `"Actor"` with the document type you're working with.
  //        If hovering `TestConfiguration` says `typeof MyActor`, congratulations! It's working.
  // Tip 2: If `MyActor` has generic parameters without defaults, you need to provide them here.
  //        For example `typeof Actor<"npc" | "character">`. Make sure that the generic parameters are as wide as possible.
  interface DocumentClassConfig {
    Actor: typeof ActorPTR2e
  }

  // foundry-vtt-types needs to know what data models you register with Foundry at runtime.
  interface DataModelConfig {
    Actor: {
      humanoid: typeof HumanoidActorSystem;
      pokemon: typeof PokemonActorSystem;
    };
  }
}

type TestConfiguration = foundry.abstract.Document.ImplementationClassFor<"Actor">;
