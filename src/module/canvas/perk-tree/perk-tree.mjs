import { ActorPTR2e } from "../../actor/base.ts";
import PTRPerkTreeHUD from "./perk-tree-hud.mjs";
import { PTRPerkTreeNode, PTRPerkTreeNodeData } from "./perk-tree-node.mjs";

/**
 * @extends PTRPerkTreeData
 */
export default class PTRPerkTree extends PIXI.Container {
    constructor() {
        super();
        this._initialize();
    }

    #drawn = false;
    #dragDrop = null;

    _initialize() {
        Object.defineProperty(this, "canvas", {
            value: document.createElement("canvas"),
            writable: false
        });
        this.canvas.id = "perk-tree";
        this.canvas.hidden = true;
        document.body.appendChild(this.canvas);

        // Activate Drop Handling
        this.#dragDrop = new DragDrop({ callbacks: { drop: this._onDrop.bind(this) } }).bind(this.canvas);

        Object.defineProperty(this, "app", {
            value: new PIXI.Application({
                view: this.canvas,
                width: window.innerWidth,
                height: window.innerHeight,
                transparent: true,
                resolution: 1,
                antialias: true,
                background: 0xcccccc,
                backgroundAlpha: 0.35,
                powerPreference: "high-performance"
            }),
            writable: false
        });
        Object.defineProperty(this, "stage", {
            value: this.app.stage,
            writable: false
        });
        Object.defineProperty(this, "controls", { value: new PTRPerkTreeHUD(), writable: false });

        this.stage.addChild(this);

        this.editMode = false;
    }

    /**
     * 
     * @param {ActorPTR2e} actor 
     * @param {object} [options]
     * @param {boolean} [options.resetView] 
     */
    async open(actor, { resetView } = {}) {
        if (!(actor instanceof ActorPTR2e)) throw new Error("PTRPerkTree.open: actor must be an instance of PTRActor");

        await this.draw();

        this.actor = actor;
        await actor.sheet._render(false, { left: 20, top: 20 });
        actor.sheet.minimize();

        this.pan(resetView ? { x: 0, y: 0, scale: 1.0 } : {});
        this.refresh();

        this.app.renderer.enabled = true;
        this.canvas.hidden = false;

        if (this.editMode && !!ui.perks._popout) ui.perks.renderPopout();
    }

    async close() {
        const actor = this.actor;
        this.actor = null;
        await actor?.sheet.render(false);
        actor.sheet.maximize();

        this.controls.close();

        this.app.renderer.enabled = false;
        this.canvas.hidden = true;

        if (this.editMode) ui.perks._popout?.close();
    }

    async draw() {
        if (this.#drawn) return;
        this.backgroundLayer = this.addChild(new PIXI.Container());
        this.foregroundLayer = this.addChild(new PIXI.Container());

        // Draw Background
        this.background = this.backgroundLayer.addChild(await this._drawBackground());

        // Setup connection background
        this.edges = this.backgroundLayer.addChild(new PIXI.Graphics());
        this.edges.lineStyle({ width: 5, color: 0xffffff, alpha: 0.40 });

        // Setup active connections
        this.connections = this.backgroundLayer.addChild(new PIXI.Graphics());

        // Draw Nodes & Edges
        this.nodes = this.backgroundLayer.addChild(new PIXI.Container());
        const seen = new Set();
        for (const origin of PTRPerkTreeNodeData.origins) {
            if (!seen.has(origin.id)) {
                await this._drawNode(origin);
                seen.add(origin.id);
            }
            await this._drawNodes(origin.connected, seen);
        }

        // Enable Interactivity
        this.#activateInteractivity();

        // Draw HUD
        canvas.hud.render(true);

        // Draw initial cycle
        this.refresh();
        this.#drawn = true;
    }

    async _drawBackground() {
        const backgroundSize = 10000;
        const background = new PIXI.Graphics();
        background.beginFill(0x000000, 0.1).drawRect(-backgroundSize, -backgroundSize, backgroundSize + backgroundSize, backgroundSize + backgroundSize).endFill();
        return background;
    }

    _drawConnections(node, seen) {
        for (const connection of node.connected) {
            if (seen.has(connection.id)) continue;
            if (!connection.visible) continue;
            this.connections.lineStyle({ color: connection.color, width: 5, alpha: 1 })
                .moveTo(node.point.x, node.point.y)
                .lineTo(connection.point.x, connection.point.y);
        }
    }

    async _drawNodes(nodes, seen = new Set()) {
        const next = [];
        for (const node of nodes) {
            if (seen.has(node.id)) continue;
            if (!node.visible) continue;
            await this._drawNode(node);
            seen.add(node.id);
            next.push(...node.connected);
        }
        if (next.length) await this._drawNodes(next, seen);
    }

    async _drawNode(node) {
        const icon = node.icon = new PTRPerkTreeNode(node, { borderColor: node.color });
        this.nodes.addChild(icon);
    }

    async refresh({ nodeRefresh = false } = {}) {
        if (!this.actor) return;

        if (nodeRefresh) {
            this.editNode = null;
            this.nodes.removeChildren();
            const seen = new Set();
            for (const origin of PTRPerkTreeNodeData.origins) {
                if (!seen.has(origin.id)) {
                    if (!origin.visible) continue;
                    await this._drawNode(origin);
                    seen.add(origin.id);
                }
                await this._drawNodes(origin.connected, seen);
            }

            if(this.editMode) {
                // Render all unconnected nodes
                for(const node of PTRPerkTreeNodeData.nodes.values()) {
                    if(!node.visible) continue;
                    if(node.connected.length) continue;
                    if(node.icon?.visible) continue;
                    await this._drawNode(node);
                }
            }

            return this.refresh();
        }

        this.connections.clear();
        this.edges.clear();

        const seen = new Set();
        for (const node of PTRPerkTreeNodeData.nodes.values()) {
            if (!node.visible) continue;
            node.icon?.draw({ text: [...node.id].at(-1) });
            this._drawConnections(node, seen);
            seen.add(node.id);
        }

        this.controls.render(true);
    }

    pan({ x, y, scale } = {}) {
        x ??= this.stage.pivot.x;
        y ??= this.stage.pivot.y;
        scale ??= this.stage.scale.x;
        this.stage.pivot.set(x, y);
        this.stage.scale.set(scale, scale);
    }

    /* -------------------------------------------- */
    /*  Node & State Management                     */
    /* -------------------------------------------- */

    activateNode(node) {
        if (this.active) this.deactivateNode();
        this.active = node;
    }

    deactivateNode() {
        if (!this.active) return;
        this.active.scale.set(1.0, 1.0);
        this.active = null;
    }

    toggleEditNode(node) {
        if (this.editNode === node) this.editNode = null;
        else this.editNode = node;
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        if (this.editMode) {
            if(!ui.perks._popout || ui.perks._popout_minimized) ui.perks.renderPopout();
            this.app.renderer.backgroundColor = 0x851a1a;
            this.app.renderer.backgroundAlpha = 0.35;
        }
        else {
            ui.perks._popout?.close();
            this.app.renderer.backgroundColor = 0xcccccc;
            this.app.renderer.backgroundAlpha = 0.35;
        }
        this.refresh();
    }

    /**
     * Event handler for the drop portion of a drag-and-drop event.
     * @param {DragEvent} event  The drag event being dropped onto the canvas
     * @private
     */
    async _onDrop(event) {
        event.preventDefault();
        const data = TextEditor.getDragEventData(event);
        if (!data.type) return;

        // Acquire the cursor position transformed to Canvas coordinates
        const [x, y] = [event.clientX, event.clientY];
        const t = this.stage.worldTransform;
        data.x = (x - t.tx) / this.stage.scale.x;
        data.y = (y - t.ty) / this.stage.scale.y;

        /**
         * A hook event that fires when some useful data is dropped onto the
         * Canvas.
         * @function dropCanvasData
         * @memberof hookEvents
         * @param {Canvas} canvas The Canvas
         * @param {object} data   The data that has been dropped onto the Canvas
         */
        const allowed = Hooks.call("dropPerkWebCanvasData", this, data);
        if (allowed === false) return;

        // Handle different data types
        switch (data.type) {
            case "Item": {
                const item = await Item.fromDropData(data);
                // If no item or the type isn't perk return
                if (!item || item.type !== "perk") return;

                if (item.system.node?.icon?.visible) {
                    return await item.system.node.icon._updatePosition({ x: data.x, y: data.y });
                }
                else if (item.system.node?.icon?.visible === false) {
                    return await item.system.node.icon._updatePosition({ x: data.x, y: data.y, visible: true });
                }
                else {
                    if(!data.uuid) return console.warn("PTR | No UUID found on dropped item, therefore unable to edit node.");

                    // Calculate angle and distance
                    const angle = Math.toDegrees(Math.atan2(data.y, data.x));
                    const distance = Math.sqrt(data.x ** 2 + data.y ** 2);

                    // Update the item
                    await item.update({"system.node": {angle, distance, visible: true}});
                    
                    // Refresh the tree
                    this.refresh({nodeRefresh: true});
                }
            }
        }
    }

    /* -------------------------------------------- */
    /*  Event Listeners and Handlers                */
    /* -------------------------------------------- */

    #activateInteractivity() {
        this.backgroundLayer.eventMode = "passive";
        this.backgroundLayer.children.forEach(c => c.eventMode = "none");
        this.nodes.eventMode = "passive";       // Capture hover/click events on nodes
        this.background.eventMode = "static";     // Capture drag events on the background

        this.interactionManager = new MouseInteractionManager(this, this, {}, {
            clickLeft: this.#onClickLeft,
            dragRightStart: null,
            dragRightMove: this.#onDragRightMove,
            dragRightDrop: null,
            dragRightCancel: null
        }, {
            application: this.app,
            dragResistance: 30
        }).activate();

        // Window Events
        window.addEventListener("resize", this.#onResize.bind(this));
        window.addEventListener("wheel", this.#onWheel.bind(this), { passive: false });
        this.#onResize();  // set initial dimensions
    }

    #onClickLeft(event) {
        event.stopPropagation();
        this.deactivateNode();
    }

    /**
     * Handle right-mouse drag events occurring on the Canvas.
     * @param {PIXI.FederatedEvent} event
     */
    #onDragRightMove(event) {
        const DRAG_SPEED_MODIFIER = 0.8;
        const { origin, destination } = event.interactionData;
        const dx = destination.x - origin.x;
        const dy = destination.y - origin.y;
        this.pan({
            x: this.stage.pivot.x - (dx * DRAG_SPEED_MODIFIER),
            y: this.stage.pivot.y - (dy * DRAG_SPEED_MODIFIER)
        });
    }

    /**
     * Handle window resize events.
     */
    #onResize() {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        const { width, height } = this.app.renderer.screen;
        this.stage.position.set(width / 2, height / 2);
        this.pan(this.stage.pivot);
    }

    /**
     * Handle mousewheel events on the Talent Tree canvas.
     * @param {WheelEvent} event      The mousewheel event
     */
    #onWheel(event) {
        if (this.canvas.hidden || (event.target?.id !== "perk-tree")) return;
        const deltaZ = (event.delta < 0) ? 1.05 : 0.95;
        this.pan({ scale: deltaZ * this.stage.scale.x });
    }
}