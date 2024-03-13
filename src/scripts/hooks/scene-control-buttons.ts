import { SquareGridPTR2e } from "@module/canvas/grid.ts";

export const GetSceneControlButtons = {
    listen: () => {
        Hooks.on('getSceneControlButtons', function (hudButtons) {
            const hud = hudButtons.find(val => val.name == "token")
            if (hud) {
                hud.tools.push({
                    name: "PTR2E.DistanceToTarget.Label",
                    title: "PTR2E.DistanceToTarget.Hint",
                    icon: "fas fa-ruler-combined",
                    button: true,
                    visible: true,
                    onClick: () => {
                        const targets = [...game.user.targets];
                        if (targets.length === 0) return ui.notifications.error("PTR2E.DistanceToTarget.NoTargets", { localize: true });

                        const self = canvas.tokens.controlled[0] || game.user.character?.getActiveTokens()?.[0];
                        if (!self) return ui.notifications.error("PTR2E.DistanceToTarget.NoSelf", { localize: true });

                        const grid = game.scenes.viewed?.grid as SquareGridPTR2e;
                        if (!grid) return ui.notifications.error("PTR2E.DistanceToTarget.NoGrid", { localize: true });
                        if (!(grid instanceof SquareGridPTR2e)) return ui.notifications.error("PTR2E.DistanceToTarget.WrongGrid", { localize: true });

                        const results = targets.map(target => {
                            const distance = grid.getDistanceBetweenTokens(self, target);
                            return {
                                target: target.name,
                                distance: distance
                            }
                        });

                        const content = results.map(r => `<b>${r.target}</b>: ${r.distance.toFixed(2)}`).join("<br>");
                        return ChatMessage.create({
                            speaker: ChatMessage.getSpeaker(),
                            content: "<h2>Distance to Targets</h2>" + content,
                            whisper: [game.user.id]
                        })
                    },
                })
            }
        });
    },
};
