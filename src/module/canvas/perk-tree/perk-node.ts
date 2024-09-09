/* eslint-disable @typescript-eslint/no-unused-vars */
import { ItemPTR2e } from "@item";
import PerkWeb from "./perk-web.ts";
import { PTRNode } from "./perks-store.ts";
import { AdjustmentFilter, GlowFilter, OutlineFilter } from "pixi-filters";

class PerkNode extends PIXI.Container {
    constructor(node: PTRNode, config: Partial<PerkNodeConfig> = {}) {
        super();
        this.node = node;

        this.config = fu.mergeObject(
            fu.mergeObject(
                {
                    alpha: 1,
                    backgroundColor: 0x000000,
                    borderColor: 0x000000,
                    borderWidth: 2,
                    tint: 0xffffff,
                    texture: "",
                    scale: 1,
                },
                node.perk?.system.node?.config ?? {},
                { inplace: false }
            ),
            config,
            { inplace: false }
        );

        // Icon Background
        this.background = this.addChild(new PIXI.Graphics());

        // Icon Sprite
        this.icon = this.addChild(new PIXI.Sprite());
        this.icon.anchor.set(0.5, 0.5);
        this.icon.mask = this.addChild(new PIXI.Graphics());

        // Border Color
        this.border = this.addChild(new PIXI.Graphics());

        // Determine state
        this.state = node.state;

        // Whether the note was clicked in the last 200 ms
        this.wasClicked = false;
    }

    get active() {
        return game.ptr.web.activeNode === this;
    }

    get legal() {
        return this._legal;
    }

    set legal(value: boolean) {
        if (value === this._legal) return;
        this._legal = value;
        this.icon.tint = this.config.tint = value
            ? this.node.perk.system.node.config?.tint || 0xffffff
            : 0x999999;
        this.config.borderColor = value
            ? this.active
                ? 0x00ff00
                : this.node.perk.system.node.config?.tint || 0x000000
            : 0xff0000;
        this._drawBorder();
    }
    private _legal = true;

    get saturation() {
        return this.node.perk.system.hidden
            ? 0
            : (() => {
                  switch (this.state) {
                      case PerkState.unavailable:
                          return 0;
                      case PerkState.connected:
                          return 0.5;
                      case PerkState.available:
                          return 1;
                      case PerkState.purchased:
                          return 1;
                  }
              })() || 0;
    }

    get brightness() {
        return this.node.perk.system.hidden
            ? 0.25
            : (() => {
                  switch (this.state) {
                      case PerkState.unavailable:
                          return 0.5;
                      case PerkState.connected:
                          return 0.75;
                      case PerkState.available:
                          return 1;
                      case PerkState.purchased:
                          return 1;
                  }
              })() || 0;
    }

    get borderColor() {
        return this.node.perk.system.hidden
            ? 0x777777
            : (() => {
                  return null;
                  switch (this.state) {
                      case PerkState.unavailable:
                          return 0xff0000;
                      case PerkState.connected:
                          return 0xff0000;
                      case PerkState.available:
                          return 0x000000;
                      case PerkState.purchased:
                          return 0x00ff00;
                  }
              })() ||
                  this.node.perk.system.node.config?.borderColor ||
                  0x000000;
    }

    async draw(config: Partial<PerkNodeConfig> = {}) {
        if (!this.node.perk?.system.visible) return;
        const { alpha, backgroundColor, texture, tint, scale } = Object.assign(this.config, config);

        // Icon Shape
        this.shape = this._getShape();
        this.background.clear().beginFill(backgroundColor, alpha).drawShape(this.shape).endFill();

        // Draw Icon
        this.icon.texture = texture
            ? (getTexture(texture) as PIXI.Texture) ??
              ((await loadTexture(texture)) as PIXI.Texture) ??
              PIXI.Texture.WHITE
            : PIXI.Texture.WHITE;
        this.icon.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        this.icon.width = this.icon.height = PerkWeb.HEX_SIZE * 2;
        this.icon.alpha = alpha ?? 1;
        this.icon.tint = tint ?? 0x000000;
        this.scale.set(scale ?? 1);

        // const saturationFilter = new ColorMatrixFilter();
        // saturationFilter.saturate(this.saturation, false);
        // const brightnessFilter = new ColorMatrixFilter();
        // brightnessFilter.brightness(this.brightness, false);
        const adjustmentFilter = new AdjustmentFilter({
            saturation: this.saturation,
            brightness: this.brightness,
        });

        const connectedFilter = new GlowFilter({
            distance: 10,
            innerStrength: 1,
            color: 0xad3f3f,
            alpha: 0.7,
        });
        const availableFilter = new GlowFilter({ distance: 15, innerStrength: 1, color: 0xffffff });
        const purchasedFilter = new OutlineFilter(3, 0x9ce7a7, 1, 0.8);

        this.filters = [adjustmentFilter];
        if (this.state === PerkState.connected) this.filters.push(connectedFilter);
        if (this.state === PerkState.available) this.filters.push(availableFilter);
        if (this.state === PerkState.purchased) this.filters.push(purchasedFilter);
        if (
            game.ptr.web.hudNode?.node.position.i == this.node.position.i &&
            game.ptr.web.hudNode?.node.position.j == this.node.position.j
        ) {
            this.addSelectedFilter();
        }

        // Draw Icon Mask
        this._drawMask();

        // Draw Border
        this._drawBorder();

        // Interactive Hit Area
        this.hitArea = this._getShape();

        // Setup interactivity
        this._activateInteractivity();
    }

    addSelectedFilter() {
        if(this.selectedFilter) return;
        this.selectedFilter = new GlowFilter({ distance: 10, innerStrength: 1, color: 0x59b9df, alpha: 0.7 });
        this.filters?.push(this.selectedFilter);
    }

    removeSelectedFilter() {
        if(!this.selectedFilter || !this.filters?.length) return;
        this.filters.splice(this.filters.indexOf(this.selectedFilter), 1);
        this.selectedFilter = null;
    }

    redrawEdges() {
        for (const connected of this.node.connected) {
            const node = game.ptr.web.collection.getName(connected);
            if (node) game.ptr.web.redrawEdge(this.node, node);
        }
    }

    _activateInteractivity() {
        this.removeAllListeners();

        let hoverTimer: NodeJS.Timeout | null = null;

        this.addEventListener("pointerover", () => {
            hoverTimer = setTimeout(() => {
                game.ptr.web.hudNode = this;
            }, 350);
        });

        this.addEventListener("pointerout", () => {
            if (hoverTimer) clearTimeout(hoverTimer as unknown as number);
        });

        this.addEventListener("pointerdown", (event) => {
            event.stopPropagation();

            // Right click
            if (event.button === 2) return this._onClickRight(event);
            // Middle click
            if (event.button === 1) return this._onClickMiddle(event);
            // Left click
            if (event.button === 0) return this._onClickLeft(event);
        });
        this.addEventListener("pointerup", async (event) => {
            event.stopPropagation();

            // Right click
            //if (event.button) return this._onClickRightEnd(event);
            // Left click
            if (event.button === 0) return this._onClickLeftEnd(event);
        });
        this.addEventListener("globalpointermove", (event) => {
            // Check if the HUD is rendered and the pointer is more than 150px away from the HUD
            if (
                game.ptr.web.perkHUD.object === this &&
                !this._isInHoverRange(event.globalX, event.globalY)
            ) {
                game.ptr.web.perkHUD.clear();
            }

            if (game.ptr.web.canvas.hidden) return;
            const doc = document.elementFromPoint(event.globalX, event.globalY);
            if (doc?.id !== "perk-tree") return;
            if (!this.active) return; // Only move active nodes
            if (this.editState !== 1) return; // Only move nodes in position mode (1)

            if (game.ptr.web.perkHUD.object) {
                game.ptr.web.perkHUD.clear();
            }

            // Move node
            const newPosition = event.getLocalPosition(this.parent);
            const { i, j } = game.ptr.web.getHexCoordinates(newPosition.x, newPosition.y);
            const { x, y } = game.ptr.web.getHexPosition(i, j);
            this.position.set(x, y);
            this.redrawEdges();

            // Move all other nodes relative to this dragged node
            const dx = x - this.originalPosition!.x;
            const dy = y - this.originalPosition!.y;
            const nodes = game.ptr.web.controlled.filter((node) => node !== this);
            for (const node of nodes) {
                if (!node) continue;

                node.position.set(node.originalPosition!.x + dx, node.originalPosition!.y + dy);
                node.redrawEdges();
            }

            // If node is in illegal position, mark it as such
            if (!game.ptr.web.isLegalSpot(i, j)) {
                this.legal = false;
            } else {
                this.legal = true;
            }

            // Check if all other nodes are in legal spots
            for (const node of game.ptr.web.controlled) {
                const { i, j } = game.ptr.web.getHexCoordinates(node.position.x, node.position.y);
                if (!game.ptr.web.isLegalSpot(i, j)) {
                    node.legal = false;
                } else {
                    node.legal = true;
                }
            }
        });

        this.eventMode = "static";
        this.cursor = "pointer";
    }

    _isInHoverRange(x: number, y: number) {
        const hud = game.ptr.web.perkHUD;

        /**
         * The hud's position is relative to the overall Foundry HUD
         * Which has been re-alligned based on the Perk web's canvas
         * @see {PerkWeb#alignHUD}
         *
         * Therefore offset the perkHUD's x and y by the canvas HUD's position
         **/
        const webHUD = canvas.hud.element[0];

        const scale = parseFloat(webHUD.style.transform.replace("scale(", ""));
        const hudXOffset = Math.round(hud.position.left * scale) + webHUD.offsetLeft;
        const hudYOffset = Math.round(hud.position.top * scale) + webHUD.offsetTop;

        // Get the width and height of the HUD
        const hudWidth = hud.element.offsetWidth * scale;
        const hudHeight = hud.element.offsetHeight * scale;

        // Create a virtual boundary around the HUD
        const boundaryXStart = hudXOffset - 200 * scale;
        const boundaryXEnd = hudXOffset + hudWidth * 2.5 + 200 * scale * 2.5;
        const boundaryYStart = hudYOffset - 200 * scale;
        const boundaryYEnd = hudYOffset + hudHeight * 2.5 + 200 * scale * 2.5;

        // Check if the pointer is within the boundary
        if (x >= boundaryXStart && x <= boundaryXEnd && y >= boundaryYStart && y <= boundaryYEnd) {
            return true;
        } else {
            return false;
        }
    }

    async _onClickLeft(_event: PIXI.FederatedPointerEvent) {
        if (!game.ptr.web.editMode) {
            game.ptr.web.hudNode = this;

            if (!this.wasClicked) {
                // I don't love having to do this, but it looks like the detail field doesn't actually get populated on these events
                this.wasClicked = true;
                setInterval(()=>{this.wasClicked = false}, 500);
            } else {
                const node = this?.node;
                const actor = game.ptr.web.actor;
                if (!node || !actor) return;

                if (node.state !== PerkState.available) {
                    if (node.state === PerkState.purchased) {
                        ui.notifications.error("You've already purchased this perk!");
                        return;
                    }
                    ui.notifications.error("You are unable to currently purchase this perk.");
                    return;
                }
                node.state = PerkState.purchased;
                await actor.createEmbeddedDocuments("Item", [node.perk.clone({ system: { cost: node.perk.system.cost } })]);
                this.wasClicked = false;
            }
        } else {
            if (this.active) {
                await this.savePosition();
            } else {
                if (game.ptr.web.activeNode?.editState === 2) {
                    game.ptr.web.connectNodes(game.ptr.web.activeNode, this);
                } else {
                    // Save original position
                    this.originalPosition = this.position.clone();
                    // Save original position of all other controlled nodes
                    for (const node of game.ptr.web.controlled) {
                        node.originalPosition = node.position.clone();
                    }

                    game.ptr.web.activateNode(this, 1);
                }
            }
        }
    }

    async _onClickLeftEnd(_event: PIXI.FederatedPointerEvent) {
        if (game.ptr.web.editMode) {
            if (this.active) {
                await this.savePosition();
                if (game.ptr.web.activeNode === this) {
                    game.ptr.web.deactivateNode();
                }
            }
        }
    }

    async savePosition() {
        // Check if any node will be in an illegal position
        const otherNodes = game.ptr.web.controlled.filter((node) => node !== this);
        for (const node of otherNodes) {
            if (!node.legal) return;
        }
        if (!this.legal) return;

        // Prepare all updates
        const nodeUpdates = [];
        const worldUpdates = [];
        const packUpdates: Record<
            string,
            { _id: string; "system.node": { i: number; j: number } }[]
        > = {};

        // Get update for this node
        const thisUpdate = await game.ptr.web.updateHexPosition(this, { updateDataOnly: true });
        if (typeof thisUpdate === "boolean") return;
        if (thisUpdate.options?.pack) {
            packUpdates[thisUpdate.options.pack] ??= [];
            packUpdates[thisUpdate.options.pack].push(thisUpdate.itemUpdate);
        } else {
            worldUpdates.push(thisUpdate.itemUpdate);
        }
        nodeUpdates.push(thisUpdate.nodeUpdate);

        // Update all others
        for (const node of otherNodes) {
            const update = await game.ptr.web.updateHexPosition(node, { updateDataOnly: true });
            if (typeof update === "boolean") return;
            if (update.options?.pack) {
                packUpdates[update.options.pack] ??= [];
                packUpdates[update.options.pack].push(update.itemUpdate);
            } else {
                worldUpdates.push(update.itemUpdate);
            }
            nodeUpdates.push(update.nodeUpdate);
        }

        try {
            const updated: string[] = [];
            const r = await ItemPTR2e.updateDocuments(worldUpdates);
            if (r) updated.push(...r.map((u) => u.id));
            for (const pack in packUpdates) {
                const p = game.packs.get(pack);
                if (!p) continue;
                const r = await ItemPTR2e.updateDocuments(packUpdates[pack], { pack });
                if (r) updated.push(...r.map((u) => u.id));
            }
            const { updates, failedUpdates } = (() => {
                const updates = [];
                const failedUpdates = [];
                for (const nodeUpdate of nodeUpdates) {
                    if (updated.includes(nodeUpdate.node.node.perk.id)) updates.push(nodeUpdate);
                    else failedUpdates.push(nodeUpdate);
                }
                return { updates, failedUpdates };
            })();
            game.ptr.web.updateNewNodePositions(updates);
            game.ptr.web.resetFailedUpdateNodePositions(failedUpdates.map((n) => n.node));
        } catch {
            game.ptr.web.resetFailedUpdateNodePositions(nodeUpdates.map((n) => n.node));
        }

        this.releaseControl();
        for (const node of otherNodes) {
            node.releaseControl();
        }
    }

    _onClickRight(_event: PIXI.FederatedPointerEvent) {
        if (game.ptr.web.editMode) {
            if (this.active) {
                game.ptr.web.deactivateNode();
            } else {
                game.ptr.web.activateNode(this, 2);
            }
        }
    }

    _onClickMiddle(_event: PIXI.FederatedPointerEvent) {
        if (game.ptr.web.editMode) {
            game.ptr.web.toggleNodeVisibility(this);
        }
    }

    _drawMask() {
        (this.icon.mask as PIXI.Graphics)
            .clear()
            .beginFill(0xffffff)
            .drawShape(this.shape)
            .endFill();
    }

    _drawBorder(borderColor = this.borderColor, borderWidth = this.config.borderWidth) {
        this.border
            .clear()
            .lineStyle({ width: borderWidth, color: borderColor, alignment: 1 })
            .drawShape(this.shape);
    }

    // Create hexagon shape from PerkWeb
    protected _getShape() {
        return new PIXI.Polygon([
            0,
            -PerkWeb.HEX_SIZE,
            (PerkWeb.HEX_SIZE * Math.sqrt(3)) / 2,
            -PerkWeb.HEX_SIZE / 2,
            (PerkWeb.HEX_SIZE * Math.sqrt(3)) / 2,
            PerkWeb.HEX_SIZE / 2,
            0,
            PerkWeb.HEX_SIZE,
            (-PerkWeb.HEX_SIZE * Math.sqrt(3)) / 2,
            PerkWeb.HEX_SIZE / 2,
            (-PerkWeb.HEX_SIZE * Math.sqrt(3)) / 2,
            -PerkWeb.HEX_SIZE / 2,
        ]);
    }

    public activate(mode: ValueOf<PerkEditState> = 1) {
        this.editState = mode;
        this.config.borderColor = (() => {
            switch (mode) {
                case 1:
                    return 0x00ff00;
                case 2:
                    return 0xff0000;
            }
        })();
        this._drawBorder();
        return this;
    }

    public deactivate() {
        this.config.borderColor = this.borderColor;
        this._drawBorder();
        return this;
    }

    public control() {
        this.config.borderColor = 0xff9829;
        this.config.borderWidth = 3;
        this.scale.set((this.node.perk.system.node.config?.scale ?? 1) * 1.2 || 1.2);
        this._drawBorder();
        game.ptr.web.controlled.push(this);
    }

    public releaseControl() {
        this.config.borderColor = this.node.perk.system.node.config?.borderColor || 0x000000;
        this.config.borderWidth = this.node.perk.system.node.config?.borderWidth || 1;
        this._drawBorder();
        this.scale.set(this.node.perk.system.node.config?.scale || 1);
        game.ptr.web.controlled = game.ptr.web.controlled.filter((node) => node !== this);
    }
}

interface PerkNodeConfig {
    alpha: number;
    backgroundColor: number;
    borderColor: number;
    borderWidth: number;
    texture: FilePath;
    tint: number;
    scale: number;
}

interface PerkEditState {
    position: 1;
    connection: 2;
}

const PerkState = {
    unavailable: 0,
    connected: 1,
    available: 2,
    purchased: 3,
} as const;

type PerkPurchaseState = ValueOf<typeof PerkState>;

interface PerkNode {
    config: PerkNodeConfig;
    node: PTRNode;

    background: PIXI.Graphics;
    icon: PIXI.Sprite;
    border: PIXI.Graphics;
    shape: PIXI.Polygon;

    originalPosition: PIXI.Point | null;

    state: PerkPurchaseState;

    wasClicked: boolean;

    editState: ValueOf<PerkEditState>;

    selectedFilter: GlowFilter | null;
}

export { PerkNode, PerkState };
export type { PerkNodeConfig, PerkEditState, PerkPurchaseState };
