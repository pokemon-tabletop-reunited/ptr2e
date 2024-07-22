import { ItemPTR2e } from "@item";
import { MigrationBase } from "../base.ts"
import { ActorPTR2e } from "@actor";
import { sluggify } from "@utils";

export class Migration101Initial extends MigrationBase {
    static override version = 0.101;

    override async updateItem(source: ItemPTR2e["_source"], _actorSource?: ActorPTR2e["_source"]): Promise<void> {
        if(source.img.startsWith("/systems/ptr2e/img/icons/") && source.img.endsWith(".png")) {
            //@ts-expect-error
            source.img = source.img.replace("/icons/", "/svg/").replace(".png", ".svg");
        }

        if(!('actions' in source.system && source.system.actions)) return;
        if(source.type != "move") return;

        if(source.system.description) {
            const slug = source.system.slug || sluggify(source.name);
            const primaryAction = source.system.actions.find(action => action.slug === slug) ?? source.system.actions.find(action => action.type === "attack");
            if(!primaryAction) {
                console.warn(`Item ${source.name} is missing a primary action.`);
                return;
            }

            if(!primaryAction.description) {
                primaryAction.description = source.system.description;
            }

            source.system.description = "";
        }
    }
}