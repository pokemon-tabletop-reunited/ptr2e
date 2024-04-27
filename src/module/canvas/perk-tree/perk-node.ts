import PerkWeb from "./perk-web.ts";
import { PTRNode } from "./perks-store.ts";

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
                    borderWidth: 1,
                    tint: 0xffffff,
                    texture: "",
                    scale: 1,
                },
                node.perk?.system.node?.config ?? {},
                {inplace: false}
            ),
            config,
            {inplace: false}
        );

        // Icon Background
        this.background = this.addChild(new PIXI.Graphics());

        // Icon Sprite
        this.icon = this.addChild(new PIXI.Sprite());
        this.icon.anchor.set(0.5, 0.5);
        this.icon.mask = this.addChild(new PIXI.Graphics());

        // Border Color
        this.border = this.addChild(new PIXI.Graphics());
    }

    get active() {
        return game.ptr.web.activeNode === this;
    }

    get legal() {
        return this._legal;
    }
    set legal(value: boolean) {
        if(value === this._legal) return;
        this._legal = value;
        this.icon.tint = this.config.tint = value ? 0xffffff : 0x999999;
        this.config.borderColor = value ? (this.active ? 0x00ff00 : 0x000000) : 0xff0000;
        this._drawBorder();
    }
    private _legal = true;

    async draw(config: Partial<PerkNodeConfig> = {}) {
        if(!this.node.perk?.system.visible) return;
        const { alpha, backgroundColor, texture, tint, scale} = Object.assign(this.config, config);

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
        this.scale.set(scale ?? 1)

        if(this.node.perk.system.hidden) {
            this.icon.tint = 0x999999;
            this.icon.alpha = 0.5;
            this.config.borderColor = 0x777777;
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

    redrawEdges() {
        for (const connected of this.node.connected) {
            const node = game.ptr.web.collection.getName(connected);
            if (node) game.ptr.web.redrawEdge(this.node, node);
        }
    }

    _activateInteractivity() {
        this.removeAllListeners();

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
            if (game.ptr.web.canvas.hidden) return;
            const doc = document.elementFromPoint(event.globalX, event.globalY);
            if (doc?.id !== "perk-tree") return;
            if (!this.active) return; // Only move active nodes
            if (this.state !== 1) return; // Only move nodes in position mode (1)

            // Move node
            const newPosition = event.getLocalPosition(this.parent);
            const { i, j } = game.ptr.web.getHexCoordinates(newPosition.x, newPosition.y);
            const { x, y } = game.ptr.web.getHexPosition(i, j);
            this.position.set(x, y);
            this.redrawEdges();

            // If node is in illegal position, mark it as such
            if(!game.ptr.web.isLegalSpot(i, j)) {
                this.legal = false;
            }
            else {
                this.legal = true;
            }
        });

        this.eventMode = "static";
        this.cursor = "pointer";
    }

    async _onClickLeft(_event: PIXI.FederatedPointerEvent) {
        if (!game.ptr.web.editMode) {
            game.ptr.web.perkHUD.activate(this);
        } else {
            if (this.active) {
                const result = await game.ptr.web.updateHexPosition(this);
                if(!result) return;
                if (this.active) {
                    game.ptr.web.deactivateNode();
                }
            } else {
                if (game.ptr.web.activeNode?.state === 2) {
                    game.ptr.web.connectNodes(game.ptr.web.activeNode, this);
                } else {
                    this.originalPosition = this.position.clone();
                    game.ptr.web.activateNode(this, 1);
                }
            }
        }
    }

    async _onClickLeftEnd(_event: PIXI.FederatedPointerEvent) {
        if (game.ptr.web.editMode) {
            if (this.active) {
                await game.ptr.web.updateHexPosition(this);
            }
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

    _drawBorder(borderColor = this.config.borderColor, borderWidth = this.config.borderWidth) {
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
        this.state = mode;
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
        this.config.borderColor = 0x000000;
        this._drawBorder();
        return this;
    }
}

type PerkNodeConfig = {
    alpha: number;
    backgroundColor: number;
    borderColor: number;
    borderWidth: number;
    texture: FilePath;
    tint: number;
    scale: number;
};

type PerkEditState = {
    position: 1;
    connection: 2;
};

interface PerkNode {
    config: PerkNodeConfig;
    node: PTRNode;

    background: PIXI.Graphics;
    icon: PIXI.Sprite;
    border: PIXI.Graphics;
    shape: PIXI.Polygon;

    originalPosition: PIXI.Point | null;

    state: ValueOf<PerkEditState>;
}

export { PerkNode };
export type { PerkNodeConfig, PerkEditState };
