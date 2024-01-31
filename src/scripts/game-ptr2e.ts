import PTRPerkTree from "@module/canvas/perk-tree/perk-tree.mjs"

const GamePTR = {
    onInit() {
        const initData = {
            tree: new PTRPerkTree()
        }

        game.ptr = fu.mergeObject(game.ptr ?? {}, initData)
    },
    onSetup() { },
    onReady() { }
}

export { GamePTR }