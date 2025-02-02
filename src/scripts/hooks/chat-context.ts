import { AttackMessageSystem, CaptureMessageSystem, ChatMessagePTR2e, DamageAppliedMessageSystem, SkillMessageSystem } from "@chat";
import { PTRHook } from "./data.ts";
import { DataInspector } from "@module/apps/data-inspector/data-inspector.ts";
import { TargetSelectorPopup } from "@module/apps/target-selector/target-selector-popup.ts";

export const ChatContext: PTRHook = {
  listen: () => {
    // Luck based rerolling
    //@ts-expect-error - This is valid typing
    Hooks.on("getChatLogEntryContext", (chat: ChatLog, menuItems: ContextMenuEntry[]): void => {
      const options: ContextMenuEntry[] = [
        {
          name: "PTR2E.ChatContext.RerollSkill.label",
          icon: '<i class="fas fa-dice"></i>',
          condition: li => {
            const message = game.messages.get(li.data("messageId"));
            if (!message) return false;
            return ["skill"].includes(message.type) && !(message.system as SkillMessageSystem).rerolled && !(message.system as SkillMessageSystem).luckRoll;
          },
          callback: li => {
            const message = game.messages.get(li.data("messageId")) as ChatMessagePTR2e<SkillMessageSystem>;
            if (!message) return;
            foundry.applications.api.DialogV2.confirm({
              window: {
                title: "PTR2E.ChatContext.RerollSkill.title",
              },
              content: game.i18n.localize("PTR2E.ChatContext.RerollSkill.content"),
              yes: {
                callback: async () => {
                  await message.system.reroll();
                }
              }
            });
          }
        },
        {
          name: "PTR2E.ChatContext.SpendLuckSkill.label",
          icon: '<i class="fas fa-dice"></i>',
          condition: li => {
            const message = game.messages.get(li.data("messageId"));
            if (!message) return false;

            if (["skill"].includes(message.type)) return !(message.system as SkillMessageSystem).luckRoll;
            if (["capture"].includes(message.type)) return true;
            if (["attack"].includes(message.type)) return true;

            return false;
          },
          callback: async li => {
            const message = game.messages.get(li.data("messageId")) as ChatMessagePTR2e;
            if (!message) return;

            // skill
            if (message.type == "skill") {
              const chatMessage = message as ChatMessagePTR2e<SkillMessageSystem>;

              const currentResult = chatMessage.system.context?.roll?.total;
              if (currentResult === undefined) return;

              // Get the amount required to get to the next increment of -10, or 0 if the current result is above 0.
              const amount = Math.abs((currentResult > 0 ? 0 : Math.ceil(currentResult / -10) * -10) - currentResult) || 10
              foundry.applications.api.DialogV2.confirm({
                window: {
                  title: "PTR2E.ChatContext.SpendLuckSkill.title",
                },
                content: game.i18n.format("PTR2E.ChatContext.SpendLuckSkill.content", { amount }),
                yes: {
                  callback: async () => {
                    await chatMessage.system.applyLuckIncrease(amount);
                  }
                }
              });
            }
            else if (message.type == "capture") {
              const captureMessage = message as ChatMessagePTR2e<CaptureMessageSystem>;

              const currentResult = captureMessage.system.rolls.accuracy?.total;
              if (currentResult === undefined) return;

              // Get the amount required to get to the next increment of -10, or 0 if the current result is above 0.
              const amount = Math.abs((currentResult > 0 ? 0 : Math.ceil(currentResult / -10) * -10) - currentResult) || 10
              foundry.applications.api.DialogV2.confirm({
                window: {
                  title: "PTR2E.ChatContext.SpendLuckSkill.title",
                },
                content: game.i18n.format("PTR2E.ChatContext.SpendLuckSkill.content", { amount }),
                yes: {
                  callback: async () => {
                    await captureMessage.system.applyLuckIncrease(amount);
                  }
                }
              });
            }
            else if (message.type == "attack") {
              const attackMessage = message as ChatMessagePTR2e<AttackMessageSystem>;
              // get the valid targets (the ones that have been missed)
              const options = [
                ...attackMessage.system.results.flatMap(r => {
                  const results: { type: string, amount: number, name?: string, index?: number}[] = [];

                  if ((r.accuracy?.total ?? 0) > 0) results.push({ type: 'accuracy', amount: r.accuracy!.total })
                  if ((r.crit?.total ?? 0) > 0) results.push({ type: 'crit', amount: r.crit!.total })

                  let i = 0;
                  for (const data of r.effectRolls?.target || []) {
                    if ((data.roll?.total ?? 0) > 0) results.push({ type: 'target-effect', amount: data.roll!.total, name: data.label, index: i })
                    i++;
                  }

                  i = 0;
                  for (const data of r.effectRolls?.origin || []) {
                    if ((data.roll?.total ?? 0) > 0) results.push({ type: 'origin-effect', amount: data.roll!.total, name: data.label, index: i })
                    i++;
                  }

                  i = 0;
                  for (const data of r.effectRolls?.defensive || []) {
                    if ((data.roll?.total ?? 0) > 0) results.push({ type: 'defensive-effect', amount: data.roll!.total, name: data.label, index: i })
                    i++;
                  }

                  if (!results.length) return [];

                  return {
                    uuid: r.target.uuid,
                    name: r.target.name,
                    img: r.target.img,
                    results,
                    result: r,
                    // description: game.i18n.format("PTR2E.ChatContext.SpendLuckAttack.requires", { amount }),
                  };
                }),
                ...(attackMessage.system.selfEffects
                  ? [
                    attackMessage.system.selfEffects?.rolls.reduce((acc, r, i) => {
                      if ((r.roll?.total ?? 0) > 0) acc.results.push({ type: 'self-effect', amount: r.roll!.total, name: r.label, index: i })
                      return acc;
                    }, {
                      uuid: attackMessage.system.origin.uuid,
                      name: attackMessage.system.origin.name,
                      img: attackMessage.system.origin.img,
                      results: [] as { type: string, amount: number, name?: string, index?: number}[],
                    })]
                  : []
                )
              ]

              // check if there are no targets (and bail early)
              if (options.length == 0) {
                ui.notifications.error("There are no rolls to apply a luck increase to!");
                return;
              }

              // check if there is exactly one relevant target (if there is, no need to disambiguate)
              const selectedRoll = options.length === 1 && options[0].results.length === 1
                ? { entry: options[0], choice: options[0].results[0] }
                : await new TargetSelectorPopup(options).wait();

              if (!selectedRoll) return;

              const target = options.find(r => r.uuid == selectedRoll.entry.uuid);
              if (!target) return;

              foundry.applications.api.DialogV2.confirm({
                window: {
                  title: "PTR2E.ChatContext.SpendLuckAttack.title",
                },
                content: game.i18n.format("PTR2E.ChatContext.SpendLuckAttack.content", { amount: selectedRoll.choice.amount }),
                yes: {
                  callback: async () => {
                    await attackMessage.system.spendLuck(selectedRoll);
                  }
                }
              });
            }
          }
        },
      ]
      menuItems.push(...options);
    });

    // Roll Inspector
    //@ts-expect-error - This is valid typing
    Hooks.on("getChatLogEntryContext", (chat: ChatLog, menuItems: ContextMenuEntry[]): void => {
      const options: ContextMenuEntry[] = [
        {
          name: "PTR2E.ChatContext.RollInspector.label",
          icon: '<i class="fas fa-magnifying-glass"></i>',
          condition: li => {
            const message = game.messages.get(li.data("messageId"));
            if (!message) return false;
            return ["attack", "skill", "capture"].includes(message.type) || (message.type === "damage-applied" && !!(message.system as DamageAppliedMessageSystem).result)
          },
          callback: li => {
            const message = game.messages.get(li.data("messageId")) as ChatMessagePTR2e<SkillMessageSystem>;
            if (!message) return;
            new DataInspector(message, {}).render(true);
          }
        }
      ]
      menuItems.push(...options);
    });
  }
}