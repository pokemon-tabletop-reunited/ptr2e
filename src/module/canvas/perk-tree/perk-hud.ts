import { ApplicationPosition } from "types/foundry/common/applications/api.js";
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
        
        const data = this._object?.node;
        return fu.mergeObject(data, {}, { inplace: false });
    }

    public async activate(object: PerkNode) {
        this._object = object;

        return this.render(true);
    }

    public clear(): void {
        let states = Application.RENDER_STATES;
        if (this.state <= states.NONE) return;

        // Unbind
        this._object = null;
        this.close({ animate: false });
    }

    override setPosition(): ApplicationPosition {
        if (!this._object) return this.position;

        const options = {
            left: this._object.x + this._object.width / 2 + 10,
            top: this._object.y - this._object.height / 2,
        };
        return super.setPosition(options);
    }

    override _updatePosition(position: ApplicationPosition) {
        const result = super._updatePosition(position);
        if (!this.element) return result;

        result.left = position.left;
        result.top = position.top;
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
}

export { PerkHUDV2 as PerkHUD };
