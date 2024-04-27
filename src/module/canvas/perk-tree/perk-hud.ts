import { PerkNode } from "./perk-node.ts";

class PerkHUD extends Application {
    static override get defaultOptions(): ApplicationOptions {
        return fu.mergeObject(super.defaultOptions, {
            id: "perk-hud",
            classes: ["placeable-hud"],
            popOut: false,
            template: "systems/ptr2e/templates/items/perk/perk-web-hud.hbs",
            width: "auto",
            height: "auto",
        });
    }

    public get object() {
        return this._object;
    }
    private _object: PerkNode | null = null;

    protected override _injectHTML(html: JQuery): void {
        const hud = document.getElementById("hud");
        hud?.appendChild(html[0]);
        this._element = html;
    }

    public async activate(object: PerkNode) {
        this._object = object;

        return this._render(true);
    }

    public clear(): void {
        let states = Application.RENDER_STATES;
        if ( this._state <= states.NONE ) return;
        this._state = states.CLOSING;

        // Unbind
        this._object = null;
        this.element.hide();
        //@ts-expect-error
        this._element = null;
        this._state = states.NONE;
    }

    override getData(): object {
        const data = this._object!.node;
        return fu.mergeObject(data, {
            
        });
    }

    override setPosition(): undefined {
        if(!this._object) return;

        const options = {
            left: this._object.x + (this._object.width / 2) + 10,
            top: this._object.y - (this._object.height / 2),
        }
        this.element.css(options);
    }
}

export { PerkHUD }