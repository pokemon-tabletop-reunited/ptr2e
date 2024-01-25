import PTRPerkTree from "../module/canvas/perk-tree/perk-tree.mjs"

const GamePTR = {
    onInit() {
        const initData = {
            tree: new PTRPerkTree()
        }

        game.ptr = foundry.utils.mergeObject(game.ptr ?? {}, initData)
    },
    onSetup() { },
    onReady() { }
}

export { GamePTR }