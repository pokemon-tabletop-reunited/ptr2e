import { ActorPTR2e } from "@actor";
import { Change } from "../document.ts";
import { ActiveEffectPTR2e } from "@module/effects/document.ts";

export abstract class BaseChangeSystem<TParent extends ActiveEffectPTR2e = ActiveEffectPTR2e> extends foundry.abstract.TypeDataModel {
    declare parent: Change<TParent>;
    abstract apply(actor: ActorPTR2e, change: Change<TParent>, rollOptions?: string[]): unknown;
}