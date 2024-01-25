abstract class PTRPerkTreeData extends PIXI.Container {
    #drawn: boolean;
    canvas: HTMLCanvasElement;
    app: PIXI.Application;
    actor: PTRActor | null;
    stage: PIXI.Container;
    controls: PTRPerkTreeHUD;

    _initialize(): void;
    async _loadTextures(): Promise<void>;
    async _drawBackground(): Promise<void>;
    async _drawNodes(): Promise<void>;
    async _drawEdges(): Promise<void>;
    
    async draw(): Promise<void>;
    async open(actor: PTRActor, {resetView}: {resetView?: boolean} = {}): Promise<void>;
    async close(): Promise<void>;
    refresh(): void;
    pan({x,y,scale}: {x: number, y: number, scale: number}): void;
    
}