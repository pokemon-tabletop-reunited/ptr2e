export default class PTRPerkTreeIcon extends PIXI.Container {
    constructor(config) {
        super();

        this.config = Object.assign({
            alpha: 0.8,
            backgroundColour: 0x000000,
            size: 50,
            tint: 0xFFFFFF
        }, config);

        // Icon Background
        this.background = this.addChild(new PIXI.Graphics());

        // Icon Sprite
        this.icon = this.addChild(new PIXI.Sprite());
        this.icon.anchor.set(0.5, 0.5);
        this.icon.mask = this.addChild(new PIXI.Graphics());

        // Border Color
        this.border = this.addChild(new PIXI.Graphics());

        // Number
        this.number = this.addChild(new PreciseText("", PreciseText.getTextStyle({ fontSize: 26 })));
        this.number.anchor.set(0.5, 0.5);
        
    }

    async draw(config = {}) {
        const { backgroundColour, alpha, size, borderRadius, texture, tint, text } = Object.assign(this.config, config);

        // Icon Shape
        this.shape = this._getShape(size, borderRadius);
        this.background.clear().beginFill(backgroundColour, alpha).drawShape(this.shape).endFill();

        // Draw Icon
        this.icon.texture = texture;
        this.icon.width = this.icon.height = size;
        this.icon.alpha = alpha ?? 1;
        this.icon.tint = tint ?? 0x000000;

        // Draw Icon Mask
        this._drawMask();

        // Draw Border
        this._drawBorder();

        // Draw Number
        this.number.text = text ?? "";
        this.number.visible = !!text;

        // Interactive Hit Area
        this.hitArea = new PIXI.Rectangle(size / -2, size / -2, size, size);
    }

    _getShape(size = this.config.size, borderRadius = this.borderRadius.size) {
        return new PIXI.RoundedRectangle(size / -2, size / -2, size, size, borderRadius);
    }

    _drawMask() {
        this.icon.mask.clear().beginFill(0xFFFFFF).drawShape(this.shape).endFill();
    }

    _drawBorder(borderColor = this.config.borderColor, borderWidth = this.config.borderWidth) {
        this.border.clear().lineStyle({ width: borderWidth, color: borderColor, alignment: 1 }).drawShape(this.shape);
    }
}