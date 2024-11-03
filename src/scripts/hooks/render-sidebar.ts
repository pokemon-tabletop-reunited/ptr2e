import { PTRHook } from "./data.ts";

export const RenderSidebar: PTRHook = {
    listen: () => {
        Hooks.on("renderSidebarTab", function () {
            if (!game.user.isGM) return;
            const sidebarButtons = $("#sidebar #actors .directory-header .action-buttons");

            if (sidebarButtons.find(".award-xp").length > 0) return;
            sidebarButtons.append(`<button class="award-xp"><i class="fas fa-award"></i>Award XP</button>`)

            $("#sidebar #actors .directory-header .action-buttons .award-xp").on("click", async () => {
                new CONFIG.PTR.Applications.ExpApp("Party", await game.ptr.playerCharacters(), { globalCircumstances: true }).render(true)
            });

        });
    }
}