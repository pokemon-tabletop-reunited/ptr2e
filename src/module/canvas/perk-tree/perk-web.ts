import { ActorPTR2e } from "@actor";
import PTRPerkTreeHUD from "./perk-web-hud.ts";
import { Hexagon } from "./hexagon.ts";
import { PerkEditState, PerkNode } from "./perk-node.ts";
import { PerkStore, PTRNode } from "./perks-store.ts";
import { PerkHUD } from "./perk-hud.ts";
import { ItemPTR2e } from "@item";
import { Path, PathStep } from "./perk-graph.ts";
import { TilingSprite } from "pixi.js";

class PerkWeb extends PIXI.Container {
    get activeNode() {
        return this.#active;
    }
    private set activeNode(node: PerkNode | null) {
        this.#active = node;
    }

    #active: PerkNode | null = null;
    // @ts-ignore
    #dragDrop: DragDrop;

    #lastUpdate: {
        i: number;
        j: number;
        node: PerkNode;
    } | null = null;

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

        // Enable Drag & Drop handling
        this.#dragDrop = new DragDrop({ callbacks: { drop: this._onDrop.bind(this) } }).bind(
            this.canvas
        );

        // Setup easy access to the stage
        Object.defineProperty(this, "stage", {
            value: this.app.stage,
            writable: false,
        });
        this.stage.addChild(this);

        // Setup controls
        Object.defineProperty(this, "controls", {
            value: new PTRPerkTreeHUD({}),
            writable: false,
        });

        Object.defineProperty(this, "perkHUD", {
            value: new PerkHUD({}),
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

    public static readonly HEX_SIZE = 60 as const;
    public static readonly GRID_RADIUS = 50 as const;
    #drawn = false;

    private readonly DEBUG = false;

    async open(actor?: ActorPTR2e, { resetView = true } = {}) {
        if (!actor && !this.actor) return this;
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
        canvas.hud.element[0].style.zIndex = "100";

        return this;
    }

    async close() {
        if (this.editMode) await this.toggleEditMode();

        const actor = this.actor;
        this.actor = null;
        actor?.sheet.render(false);
        await actor?.sheet.maximize();

        // Deactive UI
        this.perkHUD.clear();
        this.controls.close({ animate: false });

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

        this.background = this.backgroundLayer.addChild(await this._drawBackground());
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

    protected async _drawBackground() {
        const backgroundSize = 50000;

        // Load the texture
        const texture = (getTexture("/ui/denim075.png") as PIXI.Texture) ?? ((await loadTexture("/ui/denim075.png")) as PIXI.Texture);

        // Create a tiling sprite with the texture
        const background = new TilingSprite(texture, backgroundSize * 2, backgroundSize * 2);

        // Position the sprite at the center of the background
        background.x = -backgroundSize;
        background.y = -backgroundSize;

        return background;

        // const background = new PIXI.Graphics();
        // background
        //     .beginFill(0x000000, 0.1)
        //     .drawRect(
        //         -backgroundSize,
        //         -backgroundSize,
        //         backgroundSize + backgroundSize,
        //         backgroundSize + backgroundSize
        //     )
        //     .endFill();

        // const sprite = background.addChild(new PIXI.Sprite());
        // sprite.texture =
        //     (getTexture("/ui/denim075.png") as PIXI.Texture) ??
        //     ((await loadTexture("/ui/denim075.png")) as PIXI.Texture);
        
        // return background;
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
            this.edges.removeChildren();
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
            const target = this.collection.getName(connected);
            if (!target) {
                console.warn(`Could not find node with name ${connected}`);
                continue;
            }
            this._drawEdge(node, target);
        }
    }

    private _drawEdge(
        node1: PTRNode,
        node2: PTRNode,
        styling?: { color?: number; width?: number; alpha?: number }
    ) {
        if (!node1.element) this._drawNode(node1);
        if (!node2.element) this._drawNode(node2);

        // If either node ain't visible, return
        if (!node1.perk.system.visible || !node2.perk.system.visible) return;
        const isHidden = node1.perk.system.hidden || node2.perk.system.hidden;

        // If the edge has already been drawn, return
        if (this.collection.getEdge(node1, node2)) return;
        // Make sure the nodes are connected bi-directionally
        if (!node1.connected.has(node2.perk.slug)) {
            node1.connected.add(node2.perk.slug);
        }
        if (!node2.connected.has(node1.perk.slug)) {
            node2.connected.add(node1.perk.slug);
        }

        const color = styling?.color ?? (isHidden ? 0x888888 : 0x000000);
        const width = styling?.width ?? 3;
        const alpha = styling?.alpha ?? (isHidden ? 0.5 : 1);

        // Draw the edge
        const edge = new PIXI.Graphics();
        edge.lineStyle(width, color, alpha);
        edge.moveTo(node1.element!.x, node1.element!.y);
        edge.lineTo(node2.element!.x, node2.element!.y);
        this.collection.registerEdge(node1, node2, edge);
        this.edges.addChild(edge);
    }

    // Redraw an edge between two nodes
    public redrawEdge(
        node1: PTRNode,
        node2: PTRNode,
        styling?: { color?: number; width?: number; alpha?: number }
    ) {
        const edge = this.collection.getEdge(node1, node2);
        if (!edge) {
            console.warn(`Could not find edge between ${node1.perk?.name} and ${node2.perk?.name}`);
            return;
        }
        const isHidden = node1.perk.system.hidden || node2.perk.system.hidden;
        const color = styling?.color ?? (isHidden ? 0x888888 : 0x000000);
        const width = styling?.width ?? 3;
        const alpha = styling?.alpha ?? (isHidden ? 0.5 : 1);

        edge.clear();
        edge.lineStyle(width, color, alpha);
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

    public onUndo(context: KeyboardEventContext) {
        if (!this.editMode || !this.#lastUpdate) return;
        context.event?.preventDefault();
        context.event?.stopPropagation();
        const { i, j, node } = this.#lastUpdate;
        this.updateHexPosition(node, { i, j });
        ui.notifications.info(`Restored previous position for ${node.node.perk?.name}`);
        return true;
    }

    public onDelete(context: KeyboardEventContext) {
        if (!this.editMode || !this.activeNode) return;
        context.event?.preventDefault();
        context.event?.stopPropagation();

        const node = this.activeNode.node;
        foundry.applications.api.DialogV2.confirm({
            window: {
                title: `Delete ${node.perk.name}`,
            },
            content: `<p>Are you sure you want to delete ${node.perk.name} from the web?</p>`,
            yes: {
                callback: async () => {
                    await node.perk.update({ "system.node": { i: null, j: null } });
                    return this.refresh({ nodeRefresh: true });
                },
            },
        });
        if (this.activeNode.originalPosition) {
            this.updateHexPosition(
                this.activeNode,
                {
                    x: this.activeNode.originalPosition.x,
                    y: this.activeNode.originalPosition.y,
                },
                true
            );
        }
        return true;
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
        function updateItems() {
            const updates: Record<string, { updates: Record<string, unknown>[]; pack?: string }> = {
                world: {
                    updates: [],
                },
            };
            if (node1.node.perk) {
                const connections = new Set(node1.node.connected);
                if (node1.node.perk.pack) {
                    updates[node1.node.perk.pack] ??= { updates: [], pack: node1.node.perk.pack };
                    updates[node1.node.perk.pack].updates.push({
                        _id: node1.node.perk._id,
                        "system.node.connected": Array.from(connections),
                    });
                } else {
                    updates.world.updates.push({
                        _id: node1.node.perk._id,
                        "system.node.connected": Array.from(connections),
                    });
                }
            }
            if (node2.node.perk) {
                const connections = new Set(node2.node.connected);
                if (node2.node.perk.pack) {
                    updates[node2.node.perk.pack] ??= { updates: [], pack: node2.node.perk.pack };
                    updates[node2.node.perk.pack].updates.push({
                        _id: node2.node.perk._id,
                        "system.node.connected": Array.from(connections),
                    });
                } else {
                    updates.world.updates.push({
                        _id: node2.node.perk._id,
                        "system.node.connected": Array.from(connections),
                    });
                }
            }
            if (Object.keys(updates).length > 1) {
                for (const pack in updates) {
                    const { updates: docs, pack: packName } = updates[pack];
                    Item.updateDocuments(docs, { pack: packName });
                }
            } else if (updates.world.updates.length > 0) {
                Item.updateDocuments(updates.world.updates);
            }
        }

        const existing = this.collection.getEdge(node1.node, node2.node);
        if (existing) {
            node1.node.connected.delete(node2.node.perk.slug);
            node2.node.connected.delete(node1.node.perk.slug);
            this.edges.removeChild(existing);
            this.collection.unregisterEdge(node1.node, node2.node);
            updateItems();
            return;
        }

        this._drawEdge(node1.node, node2.node);
        updateItems();
    }

    /**
     * A hex cannot be within a radius of 1 hex of another hex.
     */
    public isLegalSpot(i: number, j: number) {
        // Calculate all adjacent hex coordinates based on input
        const spotsToCheck = [
            [i, j],
            [i, j + 1],
            [i, j - 1],
            [i + 1, j],
            [i - 1, j],
            [i + 1, j - 1],
            [i - 1, j + 1],
        ];

        // Check if any of the adjacent hexes are already occupied
        for (const [i, j] of spotsToCheck) {
            const node = this.collection.get(`${i},${j}`);
            if (node && node.element !== this.activeNode) return false;
        }

        return true;
    }

    public async updateHexPosition(
        node: PerkNode,
        point?: { x: number; y: number } | { i: number; j: number },
        ignoreOriginal = false
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
            if (
                node.originalPosition?.x === node.position.x &&
                node.originalPosition?.y === node.position.y
            )
                return { x: node.x, y: node.y };

            const { i, j } = this.getHexCoordinates(node.x, node.y);
            return this.getHexPosition(i, j);
        })();
        if (!ignoreOriginal && node.originalPosition?.x === x && node.originalPosition?.y === y)
            return true;
        const { i, j } = this.getHexCoordinates(x, y);
        if (!this.isLegalSpot(i, j)) {
            ui.notifications.error("A node cannot be placed within 1 hex of another node.");
            return false;
        }

        try {
            await node.node.perk?.update({ "system.node": { i, j } });

            const { i: oldI, j: oldJ } = fu.duplicate(node.node.position);
            this.#lastUpdate = { i: oldI, j: oldJ, node };

            node.node.position = { i, j };
            this.collection.set(`${i},${j}`, node.node);
            this.collection.delete(`${oldI},${oldJ}`);

            node.position.set(x, y);
            node.originalPosition = null;
            node.redrawEdges();
        } catch {
            if (node.originalPosition) {
                node.position.set(node.originalPosition.x, node.originalPosition.y);
                node.redrawEdges();
            }
        } finally {
            if (this.activeNode === node) {
                this.deactivateNode();
            }
        }

        return true;
    }

    public async toggleNodeVisibility(node: PerkNode) {
        await node.node.perk?.update({
            "system.node.hidden": !node.node.perk.system.hidden,
        });
        return this.refresh({ nodeRefresh: true });
    }

    public toggleEditMode() {
        this.editMode = !this.editMode;
        if (this.editMode) {
            this.perkHUD?.clear();
            if (!ui.perksTab.popout || ui.perksTab.popout._minimized) ui.perksTab.renderPopout();

            if (game.settings.get("ptr2e", "dev-mode")) {
                const pack = game.packs.get("ptr2e.core-perks");
                if (pack) {
                    pack.configure({ locked: false });
                    pack.render(true, { top: 0, left: window.innerWidth - 310 - 350 });
                }
            }

            this.app.renderer.background.color = 0x851a1a;
            this.app.renderer.background.alpha = 0.35;
        } else {
            ui.perksTab.popout?.close();

            if (game.settings.get("ptr2e", "dev-mode")) {
                const pack = game.packs.get("ptr2e.core-perks");
                if (pack) {
                    pack.configure({ locked: true });
                    pack.apps.forEach((app) => app.close());
                }
            }

            this.app.renderer.background.color = 0xcccccc;
            this.app.renderer.background.alpha = 0.35;
        }
        if (this.activeNode) this.deactivateNode();
        return this.refresh({ nodeRefresh: true });
    }

    private alignHUD() {
        const hud = canvas.hud.element[0];
        if (!hud.style.zIndex) hud.style.zIndex = "100";
        const { x, y } = this.getGlobalPosition();
        const scale = this.stage.scale.x;
        hud.style.left = `${x}px`;
        hud.style.top = `${y}px`;
        hud.style.transform = `scale(${scale})`;
    }

    protected async _onDrop(event: DragEvent): Promise<this> {
        event.preventDefault();
        if (!this.editMode) return this;
        const data = TextEditor.getDragEventData<
            DropCanvasData<string, ItemPTR2e> & { i: number; j: number }
        >(event);
        if (!data?.type) return this;

        // Acquire the cursor position transformed to Canvas coordinates
        const [x, y] = [event.clientX, event.clientY];
        const t = this.stage.worldTransform;
        const { i, j } = this.getHexCoordinates(
            (x - t.tx) / this.stage.scale.x,
            (y - t.ty) / this.stage.scale.y
        );
        data.i = i;
        data.j = j;

        /**
         * A hook event that fires when some useful data is dropped onto the
         * Canvas.
         * @function dropCanvasData
         * @memberof hookEvents
         * @param {Canvas} canvas The Canvas
         * @param {object} data   The data that has been dropped onto the Canvas
         */
        const allowed = Hooks.call("dropPerkWebCanvasData", this, data);
        if (allowed === false) return this;

        // Handle the drop
        switch (data.type) {
            case "Item": {
                const item = await ItemPTR2e.fromDropData(data);
                // If no item or the type isn't perk return
                if (!item || item.type !== "perk") return this;

                const existing = this.collection.getName(item.slug);
                if (existing) {
                    this.updateHexPosition(existing.element!, { i, j });
                    return this;
                }

                await item.update({
                    "system.node": {
                        i,
                        j,
                    },
                });
                return await this.refresh({ nodeRefresh: true });
            }
        }
        return this;
    }

    public highlightCheapestPath(node1: PerkNode, node2?: PerkNode): void {
        if (node2) {
            const path = this.collection.graph.getCheapestPath(node1.node, node2.node);
            if (path) this.highlightPath(path);
            return;
        }

        const path = this.collection.graph.getPathToRoot(node1.node, "cheapest");
        if (path) this.highlightPath(path);
    }

    public highlightShortestPath(node1: PerkNode, node2?: PerkNode): void {
        if (node2) {
            const path = this.collection.graph.getShortestPath(node1.node, node2.node);
            if (path) this.highlightPath(path);
            return;
        }

        const path = this.collection.graph.getPathToRoot(node1.node, "shortest");
        if (path) this.highlightPath(path);
    }

    public highlightPath(path: Path): void {
        let current: PathStep | null = path.startStep;
        while (current) {
            const element = current.node.entry.element;
            if (element) {
                const isRoot = element.node.perk.system.node.type === "root";
                element.scale.set(isRoot ? 1.8 : 1.2);
                element._drawBorder(0x008800, isRoot ? 7 : 3);
                if (current.next) {
                    const edge = this.collection.getEdge(
                        current.node.entry,
                        current.next.node.entry
                    );
                    if (edge)
                        this.redrawEdge(current.node.entry, current.next.node.entry, {
                            color: 0x008800,
                            width: 4,
                            alpha: 1,
                        });
                }
            }
            current = current.next;
        }
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

    background: TilingSprite;
    grid: PIXI.Graphics;

    nodes: PIXI.Container;
    edges: PIXI.Container;

    interactionManager: MouseInteractionManager;

    collection: PerkStore;

    editMode: boolean;
}
export type { CoordinateString };
export default PerkWeb;
