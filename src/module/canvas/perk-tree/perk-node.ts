import PerkWeb from "./perk-web.ts";
import { PTRNode } from "./perks-store.ts";

class PerkNode extends PIXI.Container {
    constructor(node: PTRNode, config: Partial<PerkNodeConfig> = {}) {
        super();
        this.node = node;

        this.config = fu.mergeObject(
            fu.mergeObject(
                {
                    alpha: 0.8,
                    backgroundColor: 0x000000,
                    borderColor: 0x000000,
                    borderWidth: 1,
                    tint: 0xffffff,
                    texture: "",
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
        return game.ptr.tree.activeNode === this;
    }

    async draw(config: Partial<PerkNodeConfig> = {}) {
        const { alpha, backgroundColor, texture, tint } = Object.assign(this.config, config);

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
            const node = game.ptr.tree.collection.get(connected);
            if (node) game.ptr.tree.redrawEdge(this.node, node);
        }
    }

    _activateInteractivity() {
        this.removeAllListeners();

        this.addEventListener("pointerdown", (event) => {
            event.stopPropagation();

            // Right click
            if (event.button) return this._onClickRight(event);
            // Left click
            if (event.button === 0) return this._onClickLeft(event);
        });
        this.addEventListener("pointerup", (event) => {
            event.stopPropagation();

            // Right click
            //if (event.button) return this._onClickRightEnd(event);
            // Left click
            if (event.button === 0) return this._onClickLeftEnd(event);
        });
        this.addEventListener("globalpointermove", (event) => {
            if (game.ptr.tree.canvas.hidden) return;
            const doc = document.elementFromPoint(event.globalX, event.globalY);
            if (doc?.id !== "perk-tree") return;
            if (!this.active) return; // Only move active nodes
            if (this.state !== 1) return; // Only move nodes in position mode (1)

            // Move node
            const newPosition = event.data.getLocalPosition(this.parent);
            this.position.set(newPosition.x, newPosition.y);
            this.redrawEdges();
        });

        this.eventMode = "static";
        this.cursor = "pointer";
    }

    _onClickLeft(_event: PIXI.FederatedPointerEvent) {
        if (!game.ptr.tree.editMode) {
            game.ptr.tree.perkHUD.activate(this);
        } else {
            this.originalPosition = this.position.clone();

            if (this.active) {
                game.ptr.tree.updateHexPosition(this);
                if (this.active) {
                    game.ptr.tree.deactivateNode();
                }
            } else {
                if (game.ptr.tree.activeNode?.state === 2) {
                    game.ptr.tree.connectNodes(game.ptr.tree.activeNode, this);
                } else {
                    game.ptr.tree.activateNode(this, 1);
                }
            }
        }
    }

    _onClickLeftEnd(_event: PIXI.FederatedPointerEvent) {
        if (game.ptr.tree.editMode) {
            if (this.active) {
                game.ptr.tree.updateHexPosition(this);
            }
        }
    }

    _onClickRight(_event: PIXI.FederatedPointerEvent) {
        if (game.ptr.tree.editMode) {
            if (this.active) {
                game.ptr.tree.deactivateNode();
            } else {
                game.ptr.tree.activateNode(this, 2);
            }
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

    originalPosition: PIXI.Point;

    state: ValueOf<PerkEditState>;
}

export { PerkNode };
export type { PerkNodeConfig, PerkEditState };
