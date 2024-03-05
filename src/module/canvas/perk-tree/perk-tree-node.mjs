import { FLAT_HEX_BORDERS } from "../../../scripts/config/hex.ts";
import PTRPerk from "../../item/data/perk.ts";
import PTRPerkTreeIcon from "./perk-tree-icon.mjs";

class PTRPerkTreeNode extends PTRPerkTreeIcon {
    constructor(node, config) {
        super(config)
        this.node = node;
        this.position.set(node.point.x, node.point.y)
    }

    get active() {
        return game.ptr.tree.active === this;
    }

    get editMode() {
        return game.ptr.tree.editNode === this;
    }

    async draw(config = {}) {
        const textureSrc = config.texture ?? this.node.texture ?? "";
        if (textureSrc) {
            config.texture = getTexture(textureSrc);
            config.texture ??= await loadTexture(textureSrc);
        }

        if (this.node.type === "root") {
            config.size = 80;
            config.borderRadius = 80;
        }

        // Temporary
        config.alpha = 1;
        config.borderColor = this.node.color;
        config.borderWidth = 3;

        // Draw Icon
        await super.draw(config);

        // Setup Interactivity
        this._activateInteraction();
    }

    _getShape() {
        const size = this.config.size;
        const halfSize = size / 2;

        // Hexagons are the bestagons
        if (this.node.type === "root") {
            const width = size;
            const height = size * Math.sqrt(3) / 2;
            const points = FLAT_HEX_BORDERS[1].reduce((arr, [ox, oy]) => {
                arr.push((ox * width) - (width / 2));
                arr.push((oy * height) - (height / 2));
                return arr;
            }, []);
            return new PIXI.Polygon(points);
        }

        // Circle
        return new PIXI.Circle(0, 0, halfSize);
    }

    _activateInteraction() {
        this.removeAllListeners();
        this.on("pointerover", this.#onPointerOver.bind(this));
        this.on("pointerout", this.#onPointerOut.bind(this));
        this.on("pointerdown", this.#onClick.bind(this));
        this.on("pointerup", this.#onClickLeftEnd.bind(this));
        this.on("globalpointermove", this.#onPointerMove.bind(this));
        this.eventMode = "static";
        this.cursor = "pointer";
    }

    async _updatePosition({ x, y, visible } = this.position) {
        if (this.originalPosition?.equals({ x, y })) return;

        // Update Ray
        const angle = Math.toDegrees(Math.atan2(y, x));
        const distance = Math.sqrt(x ** 2 + y ** 2);

        // Update position
        const ray = Ray.fromAngle(0, 0, Math.toRadians(angle), distance);
        this.node.point = ray.B;

        // Save changes to perk
        const data = { angle, distance };
        if (visible !== undefined) data.visible = visible;
        await this.node.perk.update({ "system.node": data });

        // Redraw edges
        game.ptr.tree.refresh({ nodeRefresh: true });
    }

    #onClick(event) {
        event.stopPropagation();

        // Right click
        if (event.data.button === 2) return this.#onClickRight(event);
        // Left click
        if (event.data.button === 0) return this.#onClickLeft(event);
    }

    #onClickRight(event) {
        if (!game.ptr.tree.editMode) return;
        if (game.ptr.tree.editNode && game.ptr.tree.editNode !== this) return this.#handleConnectionEdit(event);

        // Toggle connection edit mode
        game.ptr.tree.toggleEditNode(this);

        if (this.editMode) {
            this.scale.set(1.2, 1.2);
            this._drawBorder(0x00FF00);
        }
        else {
            this.scale.set(1.0, 1.0);
            this._drawBorder();
        }
    }

    async #handleConnectionEdit(event) {
        const node = game.ptr.tree.editNode;
        if (!node || node === this) return;

        switch (event.data.button) {
            case 0: { // Left click add connection
                if (this.node.connected.has(node.node)) return; // Already connected
                if (this.node.type === "root" && node.node.type === "root") return; // Can't connect two roots

                const connectNodes = (nodeA, nodeB) => {
                    const connections = new Set(nodeA.node.perk._source.system.node.connected);
                    connections.add(nodeB.node.id);
                    return nodeA.node.perk.update({ "system.node.connected": [...connections] });
                }
                
                if(this.node.type === "root") await connectNodes(node, this);
                else await connectNodes(this, node);

                break;
            }
            case 2: { // Right click remove connection
                if (!this.node.connected.has(node.node)) return; // Not connected

                // Remove ethereal connection
                this.node.connected.delete(node.node);
                node.node.connected.delete(this.node);

                const connections = new Set(this.node.perk._source.system.node.connected);
                // Check if this node is connected to the other node
                if (!connections.has(node.node.id)) { // If not, check if the other node is connected to this node
                    const otherConnections = new Set(node.node.perk._source.system.node.connected);
                    if (!otherConnections.has(this.node.id)) return; // If not, return, something went wrong.

                    // Delete the connection from the other node
                    otherConnections.delete(this.node.id);
                    await node.node.perk.update({ "system.node.connected": [...otherConnections] });
                    break;
                }

                // Delete the connection from this node
                connections.delete(node.node.id);
                await this.node.perk.update({ "system.node.connected": [...connections] });
                break;
            }
        }

        await game.ptr.tree.refresh({ nodeRefresh: true });
    }

    #onClickLeft(event) {
        if (game.ptr.tree.editNode) return this.#handleConnectionEdit(event);

        this.originalPosition = this.position.clone();

        if (this.active) {
            game.ptr.tree.deactivateNode();
            this.#onPointerOut(event)
        }
        else {
            this.#onPointerOver(event);
            game.ptr.tree.activateNode(this);
        }
    }

    #onClickLeftEnd(event) {
        if (game.ptr.tree.editNode) return;

        event.stopPropagation();
        this.#onPointerOut(event);

        if (this.active) {
            game.ptr.tree.deactivateNode();
            this.mouseIgnored = true;

            this._updatePosition();
        }
    }

    /* -------------------------------------------- */

    #onPointerOver(event) {
        if (this.editMode) return;
        if (!game.ptr.tree.app.renderer.enabled) return;
        if (document.elementFromPoint(event.globalX, event.globalY)?.id !== "perk-tree") return;
        if (this.mouseIgnored) return; // Don't hover a node that was just clicked
        this.scale.set(1.2, 1.2);
    }

    /* -------------------------------------------- */

    #onPointerOut(event) {
        if (this.editMode) return;
        if (!game.ptr.tree.app.renderer.enabled) return;
        if (document.elementFromPoint(event.globalX, event.globalY)?.id !== "perk-tree") return;
        if (this.active) return; // Don't un-hover an active node
        this.scale.set(1.0, 1.0);
        this.mouseIgnored = false;
    }

    #onPointerMove(event) {
        if (!game.ptr.tree.app.renderer.enabled) return;
        if (document.elementFromPoint(event.globalX, event.globalY)?.id !== "perk-tree") return;
        if (!this.active) return; // Only move active nodes

        // Move node
        const newPosition = event.data.getLocalPosition(this.parent);
        this.position.set(newPosition.x, newPosition.y);
    }
}

class PTRPerkTreeNodeData {
    constructor({ id, texture, type = "node", angle = 0, distance = 200, connected = [], visible = true } = {}, perk) {
        if (PTRPerkTreeNodeData.#nodes.has(id)) return console.warn(`PTRPerkTreeNode: node with id ${id} already exists: ignoring`);

        // Create ray
        const ray = Ray.fromAngle(0, 0, Math.toRadians(angle), distance);
        Object.defineProperties(this, {
            id: { value: id, writable: false, enumerable: true },
            point: { value: ray.B, writable: true, enumerable: true },
            texture: { value: texture, writable: true, enumerable: true },
            type: { value: type, writable: false, enumerable: true },
            visible: { value: visible, writable: true, enumerable: true },
            perk: { value: perk, writable: false, enumerable: false },
        });

        // Connected nodes
        for (const node of connected) {
            const connectedNode = PTRPerkTreeNodeData.#nodes.get(node);
            if (!connectedNode) {
                this.retryInfo = { id, type, texture, angle, distance, connected };
                return this.addFailedConnection();
            }
            connectedNode.connect(this)
        }

        // Add to nodes
        PTRPerkTreeNodeData.#nodes.set(id, this);

        // Check failed nodes
        const failedNode = PTRPerkTreeNodeData.#failedNodes.get(id);
        if (!failedNode || !failedNode.linked) return;

        for (const linked of failedNode.linked) {
            const linkedFailedNode = PTRPerkTreeNodeData.#failedNodes.get(linked);
            if (!linkedFailedNode) {
                console.warn(`PTRPerkTreeNodeData: failed node ${linked} does not exist`)
                continue;
            }

            // Remove this requirement from the failed node
            linkedFailedNode.required.delete(id);

            // If the failed node has no more requirements, attempt to connect it
            if (!linkedFailedNode.required.size) {
                new PTRPerkTreeNodeData(linkedFailedNode.retryInfo);
                if (PTRPerkTreeNodeData.#nodes.has(linkedFailedNode.retryInfo.id)) {
                    PTRPerkTreeNodeData.#failedNodes.delete(linkedFailedNode.retryInfo.id);
                }
            }
        }
        if (!failedNode.failed) PTRPerkTreeNodeData.#failedNodes.delete(id);
    }

    static #nodes = new Map();
    static #failedNodes = new Map();

    static get nodes() {
        return PTRPerkTreeNodeData.#nodes;
    }

    /**
     * @returns {PTRPerkTreeNode}
     */
    static get origin() {
        return this.#nodes.get("node0") ?? this.origins.at(0);
    }

    static get origins() {
        return [...this.#nodes.values()].filter(node => node.type == "root");
    }

    connected = new Set();

    connect(node) {
        this.connected.add(node);
        node.connected.add(this);
    }

    addFailedConnection() {
        for (const node of this.retryInfo.connected) {
            const connectedNode = PTRPerkTreeNodeData.#nodes.get(node);
            if (connectedNode) continue;
            const failedNode = PTRPerkTreeNodeData.#failedNodes.get(node);
            if (!failedNode) {
                PTRPerkTreeNodeData.#failedNodes.set(node, {
                    failed: false,
                    linked: new Set([this.retryInfo.id])
                });
                continue;
            }
            if (!failedNode.linked) {
                // This node also failed initialization, check if it can now be initialized
                for (const linked of failedNode.required) {
                    const linkedNote = PTRPerkTreeNodeData.#nodes.get(linked);
                    if (!linkedNote) continue;

                    // Remove this requirement from the failed node
                    failedNode.required.delete(linked);

                    // If the failed node has no more requirements, attempt to connect it
                    if (!failedNode.required.size) {
                        new PTRPerkTreeNodeData(failedNode.retryInfo);
                        if (PTRPerkTreeNodeData.#nodes.has(failedNode.retryInfo.id)) {
                            PTRPerkTreeNodeData.#failedNodes.delete(failedNode.retryInfo.id);
                        }
                    }
                }
                if (PTRPerkTreeNodeData.#failedNodes.has(failedNode.retryInfo.id)) {
                    failedNode.linked = new Set([this.retryInfo.id]);
                    continue;
                }
            }
            failedNode.linked.add(this.retryInfo.id);
        }
        PTRPerkTreeNodeData.#failedNodes.set(this.retryInfo.id, {
            failed: true,
            required: new Set(this.retryInfo.connected),
            retryInfo: this.retryInfo
        });
    }

    /**
     * @param {PTRPerk} perk 
     */
    static fromPerk(perk) {
        const node = perk._source?.node;
        if (!node) return node;

        if (PTRPerkTreeNodeData.#nodes.has(node.id)) {
            if (PTRPerkTreeNodeData.#nodes.get(node.id)?.perk?.id === perk.parent.id) {
                const oldConnections = PTRPerkTreeNodeData.#nodes.get(node.id).connected?.map(node => node.id) ?? [];
                for (const connected of oldConnections) {
                    const connectedNode = PTRPerkTreeNodeData.#nodes.get(connected);
                    if (!connectedNode) continue;
                    connectedNode.connected.delete(PTRPerkTreeNodeData.#nodes.get(node.id));
                }
                PTRPerkTreeNodeData.#nodes.delete(node.id);

                const updatedNodeData = foundry.utils.duplicate(node);
                updatedNodeData.connected = [...new Set([...oldConnections, ...node.connected])];
                return new PTRPerkTreeNodeData(updatedNodeData, perk.parent);
            }
            return PTRPerkTreeNodeData.#nodes.get(node.id);
        }

        return new PTRPerkTreeNodeData(node, perk.parent);
    }
}

export { PTRPerkTreeNode, PTRPerkTreeNodeData }

globalThis.PTRPerkTreeNodeData = PTRPerkTreeNodeData;