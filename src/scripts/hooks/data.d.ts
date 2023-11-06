interface PTRHook {
    listen: function(): void;
}

var canvas: InitializedCanvas;

interface InitializedCanvas {
    tokens: TokenLayer
}