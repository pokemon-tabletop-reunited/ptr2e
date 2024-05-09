import { MovePTR2e } from "@item";
import { ActionPTR2e, AttackPTR2e, HasBase, HasEmbed } from "@module/data/index.ts";
import { sluggify } from "@utils";
import { BaseItemSourcePTR2e, ItemSystemSource } from "./system.ts";

/**
 * @category Item Data Models
 */
export default abstract class MoveSystem extends HasEmbed(HasBase(foundry.abstract.TypeDataModel), "move") {
    /**
     * @internal
     */
    declare parent: MovePTR2e;

    static LOCALIZATION_PREFIXES = ["PTR2E", "PTR2E.MoveSystem"];

    override async toEmbed(_config: foundry.abstract.DocumentHTMLEmbedConfig, options: EnrichmentOptions = {}): Promise<HTMLElement | HTMLCollection | null> {
        return super.toEmbed(_config, options, {attack: this.attack, move: this.parent});
    }

    override async _preCreate(data: this["parent"]["_source"], options: DocumentModificationContext<this["parent"]["parent"]>, user: User): Promise<boolean | void> {
        if(data.system === undefined) {
            //@ts-expect-error
            data.system = {actions: []};
        }
        if(data.system.actions instanceof Map) {
            throw new Error("Actions must be an array.");
        }
        if(Array.isArray(data.system.actions)) {
            const actions = data.system.actions as ActionPTR2e['_source'][];
            if(actions.length === 0) {
                //@ts-expect-error
                data.system.actions = [{
                    name: `${data.name} Attack`,
                    slug: sluggify(`${data.name} Attack`),
                    type: "attack",
                }]
                this.parent.updateSource({"system.actions": data.system.actions});
            }
            else if(!actions.some(action => action.type === "attack")) {
                data.system.actions.unshift({
                    name: `${data.name} Attack`,
                    slug: sluggify(`${data.name} Attack`),
                    type: "attack",
                });
                this.parent.updateSource({"system.actions": data.system.actions});
            }
        }

        if(!data.img || data.img === "icons/svg/item-bag.svg") {
            this.parent.updateSource({
                img: "/systems/ptr2e/img/icons/untyped_icon.png"
            })
        }

        return await super._preCreate(data, options, user);
    }

    override async _preUpdate(changed: DeepPartial<this["parent"]["_source"]>, options: DocumentUpdateContext<this["parent"]["parent"]>, user: User): Promise<boolean | void> {
        if(changed.system?.actions !== undefined) {
            if(Array.isArray(changed.system.actions)) {
                const mainAction = changed.system.actions.find(action => action.type === "attack");
                if(!mainAction) {
                    console.warn("You cannot delete the main attack action.")
                    return false;
                }
            }
        }
        if(changed.system?.description !== undefined) {
            //@ts-expect-error
            const changedActions = changed.system?.actions as ActionPTR2e['_source'][];
            if(changedActions?.length) {
                const mainAttackIndex = changedActions.findIndex(action => action.type === "attack");
                if(mainAttackIndex === -1) {
                    return false;
                }
                changedActions[mainAttackIndex].description = changed.system.description as string;
            }
            else {
                const attacks = this._source.actions;
                const mainAttackIndex = attacks.findIndex(action => action.type === "attack");
                if(mainAttackIndex === -1) {
                    return false;
                }
                attacks[mainAttackIndex].description = changed.system.description as string;
                //@ts-expect-error
                changed.system.actions = attacks;
            }
        }
        if(changed.system?.traits !== undefined) {
            //@ts-expect-error
            const changedActions = changed.system?.actions as ActionPTR2e['_source'][];
            if(changedActions?.length) {
                const mainAttackIndex = changedActions.findIndex(action => action.type === "attack");
                if(mainAttackIndex === -1) {
                    return false;
                }
                //@ts-expect-error
                changedActions[mainAttackIndex].traits = changed.system.traits;
            }
            else {
                const attacks = this._source.actions;
                const mainAttackIndex = attacks.findIndex(action => action.type === "attack");
                if(mainAttackIndex === -1) {
                    return false;
                }
                //@ts-expect-error
                attacks[mainAttackIndex].traits = changed.system.traits;
                //@ts-expect-error
                changed.system.actions = attacks;
            }
        }

        return await super._preUpdate(changed, options, user);
    }

    get attack(): AttackPTR2e {
        const attack = [...this.actions.values()].find(action => action.type === "attack");
        if (!attack) throw new Error("No attack action found on this move.");
        return attack as AttackPTR2e; 
    }
}

export default interface MoveSystem {
    readonly _source: MoveSystemSource;
}

export type MoveSource = BaseItemSourcePTR2e<"move", MoveSystemSource>;

interface MoveSystemSource extends Required<ItemSystemSource> {}