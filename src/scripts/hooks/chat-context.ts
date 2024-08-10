import { ChatMessagePTR2e, DamageAppliedMessageSystem, SkillMessageSystem } from "@chat";
import { PTRHook } from "./data.ts";
import { DataInspector } from "@module/apps/data-inspector/data-inspector.ts";

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
                        if(!message) return false;
                        return ["skill"].includes(message.type) && !(message.system as SkillMessageSystem).rerolled && !(message.system as SkillMessageSystem).luckRoll;
                    },
                    callback: li => {
                        const message = game.messages.get(li.data("messageId")) as ChatMessagePTR2e<SkillMessageSystem>;
                        if(!message) return;
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
                        if(!message) return false;
                        return ["skill"].includes(message.type) && !(message.system as SkillMessageSystem).luckRoll;
                    },
                    callback: li => {
                        const message = game.messages.get(li.data("messageId")) as ChatMessagePTR2e<SkillMessageSystem>;
                        if(!message) return;
                        const currentResult = message.system.context?.roll?.total;
                        if(currentResult === undefined) return;

                        // Get the amount required to get to the next increment of -10, or 0 if the current result is above 0.
                        const amount = Math.abs((currentResult > 0 ? 0 : Math.ceil(currentResult / -10) * -10 ) - currentResult) || 10
                        foundry.applications.api.DialogV2.confirm({
                            window: {
                                title: "PTR2E.ChatContext.SpendLuckSkill.title",
                            },
                            content: game.i18n.format("PTR2E.ChatContext.SpendLuckSkill.content", { amount }),
                            yes: {
                                callback: async () => {
                                    await message.system.applyLuckIncrease(amount);
                                }
                            }
                        });
                    }
                }
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
                      if(!message) return false;
                      return ["attack", "skill", "capture"].includes(message.type) || (message.type === "damage-applied" && !!(message.system as DamageAppliedMessageSystem).result)
                  },
                  callback: li => {
                      const message = game.messages.get(li.data("messageId")) as ChatMessagePTR2e<SkillMessageSystem>;
                      if(!message) return;
                      new DataInspector(message, { }).render(true);
                  }
              }
          ]
          menuItems.push(...options);
      });
    }
}