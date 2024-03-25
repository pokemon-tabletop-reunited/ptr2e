import { MovePTR2e } from "@item";
import { ActionPTR2e, AttackPTR2e, HasBase } from "@module/data/index.ts";
import { sluggify } from "@utils";
import Tagify from "@yaireo/tagify";
import BaseActor from "types/foundry/common/documents/actor.js";
import BaseUser from "types/foundry/common/documents/user.js";

/**
 * @category Item Data Models
 */
export default abstract class MoveSystem extends HasBase(foundry.abstract.TypeDataModel) {
    /**
     * @internal
     */
    declare parent: MovePTR2e;

    static LOCALIZATION_PREFIXES = ["PTR2E", "PTR2E.MoveSystem"];

    override async toEmbed(_config: foundry.abstract.DocumentHTMLEmbedConfig, options: EnrichmentOptions = {}): Promise<HTMLElement | HTMLCollection | null> {
        options = { ...options, _embedDepth: (options._embedDepth ?? 0) + 1, relativeTo: this };

        const traits = this._traits.map(trait => ({value: trait.slug, label: trait.label}));

        const enrichedMove = await TextEditor.enrichHTML(await renderTemplate("systems/ptr2e/templates/items/embeds/move.hbs", {attack: this.attack, move: this.parent, traits}), options);
        const container = document.createElement("div");
        container.classList.add("embed","move-embed");
        container.innerHTML = enrichedMove;

        for (const input of container.querySelectorAll<HTMLInputElement>(
            "input.ptr2e-tagify"
        )) {
            new Tagify(input, {
                enforceWhitelist: true,
                keepInvalidTags: false,
                editTags: false,
                tagTextProp: "label",
                dropdown: {
                    enabled: 0,
                    mapValueTo: "label",
                },
                templates: {
                    tag: function(tagData): string {
                        return `
                        <tag contenteditable="false" spellcheck="false" tabindex="-1" class="tagify__tag" ${this.getAttributes(tagData)}>
                        <x title="" class="tagify__tag__removeBtn" role="button" aria-label="remove tag"></x>
                        <div>
                            <span class='tagify__tag-text'>
                                <span class="trait" data-tooltip-direction="UP" data-trait="${tagData.value}" data-tooltip="${tagData.label}"><span>[</span><span class="tag">${tagData.label}</span><span>]</span></span>
                            </span>
                        </div>
                        `;
                    },
                },
                whitelist: traits
            });
        }

        return container;
    }

    override async _preCreate(data: this["parent"]["_source"], options: DocumentModificationContext<this["parent"]["parent"]>, user: BaseUser<BaseActor<null>>): Promise<boolean | void> {
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
            }
            else if(!actions.some(action => action.type === "attack")) {
                //@ts-expect-error
                data.system.actions.unshift({
                    name: `${data.name} Attack`,
                    slug: sluggify(`${data.name} Attack`),
                    type: "attack",
                });
            }
        }

        return await super._preCreate(data, options, user);
    }

    override async _preUpdate(changed: DeepPartial<this["parent"]["_source"]>, options: DocumentUpdateContext<this["parent"]["parent"]>, user: BaseUser<BaseActor<null>>): Promise<boolean | void> {
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
                changedActions[mainAttackIndex].description = changed.system.description;
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