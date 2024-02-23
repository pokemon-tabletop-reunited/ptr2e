import { ActorPTR2e } from "@actor";
import { ChangeModel } from "./change.ts";

export abstract class BaseChangeSystem extends foundry.abstract.TypeDataModel {
    declare parent: ChangeModel;
    abstract apply(actor: ActorPTR2e, rollOptions?: string[] | Set<string>): unknown;

    get effect() {
        return this.parent.effect;
    }
}