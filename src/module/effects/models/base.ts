import { HasChanges } from "@module/data/index.ts";
import { ActiveEffectPTR2e } from "../document.ts";
import { ActorPTR2e } from "@actor";
import { ChangeModel } from "@module/data/models/change.ts";

export abstract class BaseActiveEffectSystem extends HasChanges(foundry.abstract.TypeDataModel) {
    declare parent: ActiveEffectPTR2e;
    abstract apply(actor: ActorPTR2e, change: ChangeModel, rollOptions?: string[]): unknown;
}