import { ActiveEffectPTR2e } from "../document.ts";
import { HasChanges } from "@module/data/index.ts";
export abstract class BaseActiveEffectSystem extends HasChanges(foundry.abstract.TypeDataModel) {
    declare parent: ActiveEffectPTR2e;   
}