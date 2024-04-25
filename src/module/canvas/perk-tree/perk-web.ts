import { ActorPTR2e } from "@actor";
import PTRPerkTreeHUD from "./perk-tree-hud.mjs";
import { Hexagon } from "./hexagon.ts";
import { PerkEditState, PerkNode } from "./perk-node.ts";
import { PerkStore, PTRNode } from "./perks-store.ts";
import { PerkHUD } from "./perk-hud.ts";

class PerkWeb extends PIXI.Container {
    get activeNode() {
        return this.#active;
    }
    private set activeNode(node: PerkNode | null) {
        this.#active = node;
    }

    #active: PerkNode | null = null;

    constructor() {
        super();

        // Create the canvas
        Object.defineProperty(this, "canvas", {
            value: document.createElement("canvas"),
            writable: false,
        });
        this.canvas.id = "perk-tree";
        this.canvas.hidden = true;
        document.body.appendChild(this.canvas);

        // Setup the PIXI Application
        Object.defineProperty(this, "app", {
            value: new PIXI.Application({
                view: this.canvas,
                width: window.innerWidth,
                height: window.innerHeight,
                antialias: false,
                background: 0xcccccc,
                backgroundAlpha: 0.35,
                powerPreference: "high-performance",
            }),
            writable: false,
        });

        // Setup easy access to the stage
        Object.defineProperty(this, "stage", {
            value: this.app.stage,
            writable: false,
        });
        this.stage.addChild(this);

        // Setup controls
        Object.defineProperty(this, "controls", {
            value: new PTRPerkTreeHUD(),
            writable: false,
        });

        Object.defineProperty(this, "perkHUD", {
            value: new PerkHUD(),
            writable: false,
        });

        Object.defineProperty(this, "collection", {
            value: new PerkStore(),
            writable: false,
        });

        this.actor = null;
        this.#drawn = false;
        this.hexes = new Map();
        this.editMode = false;
    }

    public static readonly HEX_SIZE = 40 as const;
    public static readonly GRID_RADIUS = 50 as const;
    #drawn = false;

    private readonly DEBUG = false;

    async open(actor?: ActorPTR2e, { resetView = true } = {}) {
        if(!actor && !this.actor) return this;
        await this.draw();

        this.actor = actor ?? null;
        if (actor) {
            actor.sheet.setPosition({ left: 20, top: 20 });
            await actor.sheet.minimize();
        }

        this.pan(resetView ? { x: 0, y: 0, scale: 1.0 } : {}).refresh();

        canvas.stage.eventMode = "none";
        this.stage.eventMode = "static";
        this.stage.interactiveChildren = true;
        this.canvas.hidden = false;
        canvas.hud.element[0].style.zIndex = "9999";

        return this;
    }

    async close() {
        const actor = this.actor;
        this.actor = null;
        actor?.sheet.render(false);
        await actor?.sheet.maximize();

        // Deactive UI
        this.perkHUD.clear();
        this.controls.close();

        this.canvas.hidden = true;
        this.stage.eventMode = "none";
        this.stage.interactiveChildren = false;
        canvas.stage.eventMode = "static";
        canvas.hud.element[0].style.zIndex = "";
        canvas.hud.align();

        return this;
    }

    private async draw() {
        if (this.#drawn) return;

        // Load perks and initialize the collection
        await this.collection.initialize();

        // Set the pivot point to the center of the viewport
        const { width, height } = this.app.renderer.screen;
        this.stage.pivot.set(width / 2, height / 2);
        this.stage.position.set(width / 2, height / 2);

        this.backgroundLayer = this.addChild(new PIXI.Container());
        this.foregroundLayer = this.addChild(new PIXI.Container());

        this.background = this.backgroundLayer.addChild(this._drawBackground());
        // DEBUG Grid
        if (this.DEBUG) {
            this.grid = this.backgroundLayer.addChild(this._drawGrid());
        }

        this.edges = this.foregroundLayer.addChild(new PIXI.Container());
        this.nodes = this.foregroundLayer.addChild(new PIXI.Container());

        // Enable Interactivity
        this.enableInteractivity();

        // Draw HUD
        await canvas.hud.render(true);

        // Draw initial cycle
        this.refresh();
        this.#drawn = true;

        return this;
    }

    protected _drawBackground() {
        const backgroundSize = 10000;
        const background = new PIXI.Graphics();
        background
            .beginFill(0x000000, 0.1)
            .drawRect(
                -backgroundSize,
                -backgroundSize,
                backgroundSize + backgroundSize,
                backgroundSize + backgroundSize
            )
            .endFill();
        return background;
    }

    protected _drawGrid() {
        const hexContainer = new PIXI.Container();

        for (let i = -PerkWeb.GRID_RADIUS; i <= PerkWeb.GRID_RADIUS; i++) {
            for (let j = -PerkWeb.GRID_RADIUS; j <= PerkWeb.GRID_RADIUS; j++) {
                const hex = new Hexagon(i, j, this);
                hexContainer.addChild(hex.graphics);
                hexContainer.addChild(hex.text);
            }
        }
        // Generate a texture from the container
        const texture = this.app.renderer.generateTexture(hexContainer);

        // Create a new sprite using the texture and add it to the stage
        const sprite = new PIXI.Sprite(texture);
        sprite.anchor.set(0.5, 0.5);
        sprite.position.set(0, 0);

        const grid = new PIXI.Graphics();
        grid.addChild(sprite);
        return grid;
    }

    public getHexPosition(i: number, j: number) {
        const x = PerkWeb.HEX_SIZE * Math.sqrt(3) * (i + j / 2);
        const y = ((PerkWeb.HEX_SIZE * 3) / 2) * j;
        return { x, y };
    }

    /**
     * Get the hex coordinates for a given point.
     * Hex coordinates are always whole numbers.
     */
    public getHexCoordinates(x: number, y: number) {
        const q = ((Math.sqrt(3) / 3) * x - (1 / 3) * y) / PerkWeb.HEX_SIZE;
        const r = ((2 / 3) * y) / PerkWeb.HEX_SIZE;
        const s = -q - r;

        const roundQ = Math.round(q);
        const roundR = Math.round(r);
        const roundS = Math.round(s);

        const qDiff = Math.abs(roundQ - q);
        const rDiff = Math.abs(roundR - r);
        const sDiff = Math.abs(roundS - s);

        if (qDiff > rDiff && qDiff > sDiff) {
            return { i: -roundR - roundS, j: roundR };
        } else if (rDiff > sDiff) {
            return { i: roundQ, j: -roundQ - roundS };
        } else {
            return { i: roundQ, j: roundR };
        }
    }

    private pan({ x, y, scale }: { x?: number; y?: number; scale?: number } = {}) {
        x ??= this.stage.pivot.x;
        y ??= this.stage.pivot.y;
        scale ??= this.stage.scale.x;
        this.stage.pivot.set(x, y);
        this.stage.scale.set(scale, scale);
        this.perkHUD.setPosition();
        this.alignHUD();

        return this;
    }

    public async refresh({ nodeRefresh } = { nodeRefresh: false }) {
        // Render the HUD
        this.controls.render(true);

        if (nodeRefresh) {
            this.nodes.removeChildren();
            await this.collection.initialize();
        }

        for (const node of this.collection) {
            if (nodeRefresh || !node.element) {
                this._drawNode(node);
            }
        }

        if (!this.#drawn || nodeRefresh) this.alignHUD();

        return this;
    }

    private _drawNode(node: PTRNode) {
        if (node.element) {
            this.nodes.removeChild(node.element);
        }
        node.element = new PerkNode(node);
        const { x, y } = this.getHexPosition(node.position.i, node.position.j);
        node.element.position.set(x, y);
        node.element.draw();
        this.nodes.addChild(node.element);

        for (const connected of node.connected) {
            const target = this.collection.get(connected);
            if (!target) {
                console.warn(`Could not find node with name ${connected}`);
                continue;
            }
            this._drawEdge(node, target);
        }
    }

    private _drawEdge(node1: PTRNode, node2: PTRNode) {
        if (!node1.element) this._drawNode(node1);
        if (!node2.element) this._drawNode(node2);

        // If the edge has already been drawn, return
        if (this.collection.getEdge(node1, node2)) return;
        // Make sure the nodes are connected bi-directionally
        if (!node1.connected.has(`${node2.position.i},${node2.position.j}`)) {
            node1.connected.add(`${node2.position.i},${node2.position.j}`);
        }
        if (!node2.connected.has(`${node1.position.i},${node1.position.j}`)) {
            node2.connected.add(`${node1.position.i},${node1.position.j}`);
        }

        // Draw the edge
        const edge = new PIXI.Graphics();
        edge.lineStyle(2, 0x000000, 1);
        edge.moveTo(node1.element!.x, node1.element!.y);
        edge.lineTo(node2.element!.x, node2.element!.y);
        this.collection.registerEdge(node1, node2, edge);
        this.edges.addChild(edge);
    }

    // Redraw an edge between two nodes
    public redrawEdge(node1: PTRNode, node2: PTRNode) {
        const edge = this.collection.getEdge(node1, node2);
        if (!edge) {
            console.warn(`Could not find edge between ${node1.perk?.name} and ${node2.perk?.name}`);
            return;
        }
        edge.clear();
        edge.lineStyle(2, 0x000000, 1);
        edge.moveTo(node1.element!.x, node1.element!.y);
        edge.lineTo(node2.element!.x, node2.element!.y);
    }

    private enableInteractivity() {
        this.backgroundLayer.eventMode = "passive";
        this.backgroundLayer.children.forEach((c) => (c.eventMode = "none"));
        this.background.eventMode = "static";

        this.background.addEventListener("pointerdown", (event) => {
            if (this.activeNode) this.deactivateNode();
            if (event.button === 0 && this.perkHUD.object) this.perkHUD.clear();
        });

        this.interactionManager = new MouseInteractionManager(
            this as any,
            this as any,
            {},
            {
                dragRightMove: this.onDragRightMove,
            },
            {
                application: this.app,
                dragResistance: 30,
            }
        ).activate();

        // Window Events
        window.addEventListener("resize", this.onResize.bind(this));
        window.addEventListener("wheel", this.onWheel.bind(this), { passive: false });
        this.onResize(); // set initial dimensions
    }

    private onDragRightMove(event: {
        interactionData: {
            origin: { x: number; y: number };
            destination: { x: number; y: number };
        };
    }) {
        const DRAG_SPEED_MODIFIER = 0.8;
        const { origin, destination } = event.interactionData;
        const dx = destination.x - origin.x;
        const dy = destination.y - origin.y;
        this.pan({
            x: this.stage.pivot.x - dx * DRAG_SPEED_MODIFIER,
            y: this.stage.pivot.y - dy * DRAG_SPEED_MODIFIER,
        });
    }

    /**
     * Handle window resize events.
     */
    private onResize() {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        const { width, height } = this.app.renderer.screen;
        this.stage.position.set(width / 2, height / 2);
        this.pan(this.stage.pivot);
    }

    /**
     * Handle mousewheel events on the Talent Tree canvas.
     * @param {WheelEvent} event      The mousewheel event
     */
    private onWheel(event: WheelEvent) {
        if (this.canvas.hidden || (event.target as HTMLElement)?.id !== "perk-tree") return;
        const deltaZ =
            ("delta" in event ? (event.delta as number) : event.deltaX) < 0 ? 1.05 : 0.95;
        this.pan({ scale: deltaZ * this.stage.scale.x });
    }

    public activateNode(node: PerkNode, mode: ValueOf<PerkEditState>) {
        if (this.activeNode) this.activeNode.deactivate();
        this.activeNode = node.activate(mode);
    }

    public deactivateNode() {
        if (this.activeNode) this.activeNode.deactivate();
        this.activeNode = null;
    }

    public connectNodes(node1: PerkNode, node2: PerkNode) {
        const existing = this.collection.getEdge(node1.node, node2.node);
        if (existing) {
            node1.node.connected.delete(`${node2.node.position.i},${node2.node.position.j}`);
            node2.node.connected.delete(`${node1.node.position.i},${node1.node.position.j}`);
            this.edges.removeChild(existing);
            this.collection.unregisterEdge(node1.node, node2.node);
            return;
        }

        this._drawEdge(node1.node, node2.node);
    }

    public updateHexPosition(
        node: PerkNode,
        point?: { x: number; y: number } | { i: number; j: number }
    ) {
        const { x, y } = ((): { x: number; y: number } => {
            if (point) {
                if ("x" in point && "y" in point) {
                    const { i, j } = this.getHexCoordinates(point.x, point.y);
                    return this.getHexPosition(i, j);
                }
                if ("i" in point && "j" in point) {
                    return this.getHexPosition(point.i, point.j);
                }
            }
            if (node.originalPosition === node.position) return { x: node.x, y: node.y };

            const { i, j } = this.getHexCoordinates(node.x, node.y);
            return this.getHexPosition(i, j);
        })();
        if (node.position.x === x && node.position.y === y) return;
        node.position.set(x, y);
        node.redrawEdges();

        if (this.activeNode === node) {
            this.deactivateNode();
        }
    }

    public toggleEditMode() {
        if (!this.editMode) {
            this.app.renderer.background.color = 0x851a1a;
            this.app.renderer.background.alpha = 0.35;
        } else {
            this.app.renderer.background.color = 0xcccccc;
            this.app.renderer.background.alpha = 0.35;
        }
        this.editMode = !this.editMode;
        if (this.activeNode) this.deactivateNode();
    }

    private alignHUD() {
        const hud = canvas.hud.element[0];
        if (!hud.style.zIndex) hud.style.zIndex = "9999";
        const { x, y } = this.getGlobalPosition();
        const scale = this.stage.scale.x;
        hud.style.left = `${x}px`;
        hud.style.top = `${y}px`;
        hud.style.transform = `scale(${scale})`;
    }
}
type CoordinateString = `${number},${number}`;
interface PerkWeb {
    actor: ActorPTR2e | null;
    hexes: Map<CoordinateString, Hexagon>;

    canvas: HTMLCanvasElement;
    app: PIXI.Application;
    stage: PIXI.Container;
    controls: PTRPerkTreeHUD;
    perkHUD: PerkHUD;

    backgroundLayer: PIXI.Container;
    foregroundLayer: PIXI.Container;

    background: PIXI.Graphics;
    grid: PIXI.Graphics;

    nodes: PIXI.Container;
    edges: PIXI.Container;

    interactionManager: MouseInteractionManager;

    collection: PerkStore;

    editMode: boolean;
}
export type { CoordinateString };
export default PerkWeb;
