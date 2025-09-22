import { SquareGridPTR2e } from "@module/canvas/grid.ts";
import { PTRHook } from "./data.ts";
import { EXPTracker } from "@module/apps/exp-tracker.ts";
import { TypeMatrix } from "@module/apps/type-matrix/sheet.ts";
import { AttackCheck } from "@system/statistics/attack.ts";
import { ActorPTR2e } from "@actor";
import { ModifierPTR2e } from "@module/effects/modifiers.ts";

export const GetSceneControlButtons: PTRHook = {
  listen: () => {
    Hooks.on('getSceneControlButtons', function (hudButtons) {
      const hud = hudButtons["tokens"];
      if (hud) {
        hud.tools["distance-to-target"] = {
          name: "distance-to-target",
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
        }

        hud.tools["fling-calculator"] = {
          name: "fling-calculator",
          title: "PTR2E.FlingCalculator.Hint",
          icon: "fas fa-weight-hanging",
          button: true,
          visible: true,
          onClick: () => {
            const targets = [...game.user.targets];
            if (targets.length === 0) return ui.notifications.error("PTR2E.FlingCalculator.NoTargets", { localize: true });

            const self = canvas.tokens.controlled[0] || game.user.character?.getActiveTokens()?.[0];
            if (!self?.actor) return ui.notifications.error("PTR2E.FlingCalculator.NoSelf", { localize: true });

            const results = targets.flatMap(target => {
              if(!target.actor) return []
              const result = AttackCheck.calculateActorToss([new ModifierPTR2e({label: "Fling Power", type: "power", method: "base", modifier: 25})], self.actor!, target.actor as ActorPTR2e);
              if(!result) return [];
              return {
                target: target.actor.link,
                ...result
              }
            });
            if(!results.length) return ui.notifications.error("PTR2E.FlingCalculator.NoTargets", { localize: true });

            const content = results.map(r => `<ul><li>${r.target}</li><li><b>Power</b>: ${r.power}</li><li><b>Accuracy</b>: ${r.accuracy}</li><li><b>Range</b>: ${r.range}</li></ul>`).join("<br>");
            return ChatMessage.create({
              speaker: ChatMessage.getSpeaker(),
              flavor: "Fling Calculator",
              content: `<p class="hint">The below values are the values that would be used if ${self.actor.link} would Fling those Actors.</p>` + content,
              whisper: [game.user.id]
            })
          },
        }

        hud.tools["exp-tracker"] = {
          name: "exp-tracker",
          title: "PTR2E.ExpTracker.hint",
          icon: "fas fa-book",
          button: true,
          visible: true,
          onClick: () => {
            if (!game.user.isGM) return ui.notifications.error("PTR2E.ExpTracker.NoPermission", { localize: true });
            return new EXPTracker().render(true);
          }
        }

        hud.tools["type-matrix"] = {
          name: "type-matrix",
          title: "PTR2E.TypeMatrix.Hint",
          icon: "fas fa-grid-4",
          button: true,
          visible: true,
          onClick: () => {
            return new TypeMatrix({ settings: false }).render(true);
          }
        }
      }
    });
  },
};
