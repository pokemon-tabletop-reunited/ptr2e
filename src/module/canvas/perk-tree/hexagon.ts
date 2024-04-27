import PerkWeb from "./perk-web.ts";

export class Hexagon {
    i: number;
    j: number;
    web: PerkWeb;
    graphics: PIXI.Graphics;
    text: PIXI.Text;

    constructor(i: number, j: number, web: PerkWeb) {
        this.i = i;
        this.j = j;
        this.web = web;

        const { x, y } = web.getHexPosition(i, j);

        // Create a new hexagon
        const hex = new PIXI.Graphics();
        hex.beginFill(0x999999);
        hex.lineStyle(1, 0xAAAAAA, 1);
        hex.drawPolygon([
            0, -PerkWeb.HEX_SIZE,
            PerkWeb.HEX_SIZE * Math.sqrt(3)/2, -PerkWeb.HEX_SIZE/2,
            PerkWeb.HEX_SIZE * Math.sqrt(3)/2, PerkWeb.HEX_SIZE/2,
            0, PerkWeb.HEX_SIZE,
            -PerkWeb.HEX_SIZE * Math.sqrt(3)/2, PerkWeb.HEX_SIZE/2,
            -PerkWeb.HEX_SIZE * Math.sqrt(3)/2, -PerkWeb.HEX_SIZE/2
        ]);
        hex.endFill();

        // Create a new text object with the coordinates
        const text = new PIXI.Text(`(${i}, ${j})`, { fontSize: 10, fill: 0xDEDEDE });
        text.anchor.set(0.5, 0.5);
        text.position.set(x, y);

        // Set the position of the hexagon and add it to the grid
        hex.position.set(x, y);

        this.graphics = hex;
        this.text = text;
    }
}