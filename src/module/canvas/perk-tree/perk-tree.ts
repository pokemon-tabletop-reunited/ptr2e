//@ts-nocheck
import { ActorPTR2e } from "@actor";
import PTRPerkTreeHUD from "./perk-tree-hud.mjs";

class PerkTree extends PIXI.Container {

    private readonly canvas!: HTMLCanvasElement;
    private readonly app!: PIXI.Application;
    private readonly stage!: PIXI.Container;
    private readonly dragDrop!: DragDrop;
    private readonly controls!: PTRPerkTreeHUD;
    private backgroundLayer?: PIXI.Container;
    private foregroundLayer?: PIXI.Container;
    private background?: PIXI.Graphics;
    private edges?: PIXI.Graphics;
    private connections?: PIXI.Container;
    private nodes?: PIXI.Container;

    editMode: boolean;
    actor: ActorPTR2e | null;
    #drawn: boolean;

    constructor() {
        super();
        // Create the canvas
        Object.defineProperty(this, "canvas", {
            value: document.createElement("canvas"),
            writable: false,
        })
        this.canvas.id = "perk-tree";
        this.canvas.hidden = true;
        document.body.appendChild(this.canvas);

        // Activate Drop Handler
        Object.defineProperty(this, "dragDrop", {
            value: new DragDrop({
                callbacks: {
                    drop: this._onDrop.bind(this)
                }
            }),
            writable: false
        });
        this.dragDrop.bind(this.canvas);

        // Setup the PIXI Application
        Object.defineProperty(this, "app", {
            value: new PIXI.Application({
                view: this.canvas,
                width: window.innerWidth,
                height: window.innerHeight,
                //transparent: true,
                resolution: 1,
                antialias: true,
                background: 0xcccccc,
                backgroundAlpha: 0.35,
                powerPreference: "high-performance"
            }),
            writable: false
        });

        // Setup easy access to the stage
        Object.defineProperty(this, "stage", {
            value: this.app.stage,
            writable: false
        });

        this.stage.addChild(this);

        // Setup controls
        Object.defineProperty(this, "controls", {
            value: new PTRPerkTreeHUD(),
            writable: false
        });

        this.editMode = false;
        this.actor = null;
        this.#drawn = false;
    }

    async open(actor: ActorPTR2e, { resetView }: { resetView?: boolean } = {}) {
        await this.draw();

        this.actor = actor;
        actor.sheet.setPosition({ left: 20, top: 20, });
        await actor.sheet.minimize();

        this.pan(
            resetView
                ? { x: 0, y: 0, scale: 1.0 }
                : {}
        ).refresh();

        this.canvas.hidden = false;

        if (this.editMode) ui.perks.renderPopout();
        return this;
    }

    async close() {
        const actor = this.actor;
        this.actor = null;
        actor?.sheet.render(false);
        await actor?.sheet.maximize();

        this.controls.close();

        this.canvas.hidden = true;

        if (this.editMode) ui.perks.close();
        return this;
    }

    private async draw() {
        if (this.#drawn) return this;

        this.backgroundLayer = this.addChild(new PIXI.Container());
        this.foregroundLayer = this.addChild(new PIXI.Container());

        // Draw background
        this.background = this.backgroundLayer.addChild(this._drawBackground());

        // Setup connection background
        this.edges = this.backgroundLayer.addChild(new PIXI.Graphics());
        this.edges.lineStyle({ width: 5, color: 0x000000, alpha: 0.4 });

        // Setup active connections
        this.connections = this.backgroundLayer.addChild(new PIXI.Container());

        // Draw nodes & edges
        this.nodes = this.backgroundLayer.addChild(new PIXI.Container());
        // const seen = new Set();
        // const perks = (await game.ptr.perks.initialize()).perks;
        // for (const perk of perks.values()) {
        //     if (!seen.has(origin.id)) {
        //         await this._drawNode(origin);
        //         seen.add(origin.id);
        //     }
        //     await this._drawNodes(origin.connected, seen);
        // }   

        // Enable Interactivity
        this.enableInteractivity();

        // Draw HUD
        canvas.hud.render(true);

        // Draw initial cycle
        this.refresh();
        this.#drawn = true;

        return this;
    }

    private _drawBackground() {
        const backgroundSize = 10000;
        const background = new PIXI.Graphics();
        background.beginFill(0x000000, 0.1).drawRect(-backgroundSize, -backgroundSize, backgroundSize + backgroundSize, backgroundSize + backgroundSize).endFill();
        return background;
    }

    private pan({ x, y, scale }: { x?: number, y?: number, scale?: number } = {}) {
        x ??= this.stage.pivot.x;
        y ??= this.stage.pivot.y;
        scale ??= this.stage.scale.x;
        this.stage.pivot.set(x, y);
        this.stage.scale.set(scale, scale);

        return this;
    }

    private refresh() {
        if (!this.actor) return this;


        // Render the HUD
        this.controls.render(true);

        return this;
    }

    private enableInteractivity() {
        return this;
    }

    private _onDrop(event: DragEvent) {
        throw new Error("Method not implemented.");
    }
}

export { PerkTree }