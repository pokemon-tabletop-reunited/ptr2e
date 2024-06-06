import { ApplicationV2Expanded } from "@module/apps/appv2-expanded.ts";
import { PerkState } from "./perk-node.ts";

export default class PerkTreeHUD extends foundry.applications.api.HandlebarsApplicationMixin(
    ApplicationV2Expanded
) {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            tag: "aside",
            id: "perk-web-hud",
            classes: ["application","sheet"],
            window: {
                frame: false,
                positioned: false,
            },
            actions: {
                "close-hud": () => {
                    game.ptr.web.close();
                },
                refresh: () => {
                    game.ptr.web.refresh({nodeRefresh: true});
                },
                toggleEdit: () => {
                    game.ptr.web.toggleEditMode();
                },
                purchase: async () => {
                    const node = game.ptr.web.hudNode?.node;
                    const actor = game.ptr.web.actor;
                    if(!node || !actor) return;

                    if(node.state !== PerkState.available) {
                        ui.notifications.error("You are unable to currently purchase this perk.");
                        return;
                    }

                    await actor.createEmbeddedDocuments("Item", [node.perk.toObject()]);
                    await game.ptr.web.refresh({nodeRefresh: true});
                    game.ptr.web.hudNode = game.ptr.web.collection.get(`${node.position.i},${node.position.j}`)?.element ?? null;
                    foundry.applications.instances.get("perk-web-hud")!.render({parts: ["actor","perk"]});
                },
            },
        },
        { inplace: false }
    );

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        header: {
            id: "header",
            template: "systems/ptr2e/templates/perk-tree/hud/header.hbs",
        },
        actor: {
            id: "actor",
            template: "systems/ptr2e/templates/perk-tree/hud/actor.hbs",
        },
        perk: {
            id: "perk",
            template: "systems/ptr2e/templates/perk-tree/hud/perk.hbs",
        },
        controls: {
            id: "controls",
            template: "systems/ptr2e/templates/perk-tree/hud/controls.hbs",
        },
    };

    override async _prepareContext() {
        const node = game.ptr.web.hudNode?.node;
        const fields = node?.perk.system.schema.fields;
        const traits = node?.perk.system.traits.map((trait) => ({ value: trait.slug, label: trait.label }));
        const purchasable = node?.state === PerkState.available;

        return {
            actor: game.ptr.web.actor,
            editMode: game.ptr.web.editMode,
            perk: {
                node: node,
                document: node?.perk,
                fields,
                traits,
                purchasable,
            }
        };
    }
}
