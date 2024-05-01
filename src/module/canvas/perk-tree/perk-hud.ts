import { PerkNode } from "./perk-node.ts";

class PerkHUDV2 extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2
) {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            id: "perk-hud",
            classes: ["placeable-hud"],
            window: {
                frame: false,
                positioned: true,
            },
            position: {
                width: "auto",
                height: "auto",
            },
            actions: {
                "cheapest-path": PerkHUDV2.HighlightCheapestPath,
                "shortest-path": PerkHUDV2.HighlightShortestPath,
                "open-sheet": function(this: PerkHUDV2) {
                    if(!this._object?.node?.perk) return;
                    this._object.node.perk.sheet.render(true);
                }
            }
        },
        { inplace: false }
    );

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        base: {
            id: "base",
            template: "systems/ptr2e/templates/items/perk/perk-web-hud.hbs",
        },
    };

    public get object() {
        return this._object;
    }
    private _object: PerkNode | null = null;

    override async _prepareContext() {
        if(!this._object) return {};

        const document = this._object.node.perk;
        const traits = (() => {
            if ("traits" in document.system) {
                const traits = [];
                for (const trait of document.system.traits.values()) {
                    traits.push({
                        value: trait.slug,
                        label: trait.label,
                    });
                }
                return traits;
            }
            return [];
        })();

        const data = this._object?.node;
        return fu.mergeObject(data, {
            traits
        }, { inplace: false });
    }

    public async activate(object: PerkNode) {
        this._object = object;

        return this.render(true);
    }

    override async _renderHTML(context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.HandlebarsRenderOptions) {
        const rendered = await super._renderHTML(context, options);
        for(const [key, value] of Object.entries(rendered)) {
            rendered[key].innerHTML = await TextEditor.enrichHTML(value.innerHTML);
        }
        return rendered;
    } 

    public clear(): void {
        let states = Application.RENDER_STATES;
        if (this.state <= states.NONE) return;

        // Unbind
        this._object = null;
        this.close({ animate: false });
    }

    override setPosition(): foundry.applications.api.ApplicationPosition {
        if (!this._object) return this.position;

        const options: Partial<foundry.applications.api.ApplicationPosition> = {
            left: this._object.x + this._object.width / 2 + 10,
            top: this._object.y - this._object.height / 2,
            height: "auto",
            width: "auto",
        };
        return super.setPosition(options);
    }

    override _updatePosition(position: foundry.applications.api.ApplicationPosition) {
        const implicitHeight = position.height === "auto";
        const implicitWidth = position.width === "auto";

        const result = super._updatePosition(position);
        if (!this.element) return result;

        result.left = position.left;
        result.top = position.top;
        if (implicitHeight) {
            this.element.style.height = "";
            result.height = "auto";
        }
        if (implicitWidth) {
            this.element.style.width = "";
            result.width = "auto";
        }
        return result;
    }

    override _insertElement(element: HTMLElement): HTMLElement {
        const existing = document.getElementById("perk-hud");
        if (existing) {
            existing.replaceWith(element);
            return existing;
        }
        const hud = document.getElementById("hud");
        hud?.appendChild(element);
        return element;
    }

    static async HighlightCheapestPath(this: PerkHUDV2, _event: PointerEvent) {
        if(!this._object) return;
        game.ptr.web.highlightCheapestPath(this._object);
    }

    static async HighlightShortestPath(this: PerkHUDV2, _event: PointerEvent) {
        if(!this._object) return;
        game.ptr.web.highlightShortestPath(this._object);
    }
}

export { PerkHUDV2 as PerkHUD };
