import { ChatMessagePTR2e } from "@chat";
import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { htmlQueryAll } from "@utils";

class UserVisibilityPTR2e {
    /** Edits HTML live based on permission settings. Used to hide certain blocks and values */
    static process(html: HTMLElement, options: ProcessOptions = {}): void {
        const visibilityElements = htmlQueryAll(html, "[data-visibility]");

        // Remove all visibility=none elements
        for (const element of visibilityElements.filter((e) => e.dataset.visibility === "none")) {
            element.remove();
        }

        // Process all other visibility elements according to originating document ownership
        const { message } = options;
        const document = options.document ?? message?.actor ?? message ?? null;
        if (document) {
            const ownerElements = visibilityElements.filter((e) => e.dataset.visibility === "owner");
            for (const element of ownerElements) {
                // "owner" is generally applicable only to `data-action` buttons and anchors in chat messages
                if (element.dataset.action) {
                    if (!document.isOwner) element.remove();
                    delete element.dataset.visibility;
                    continue;
                }

                const whoseData = element.dataset.whose ?? "self";
                if (whoseData === "self") {
                    element.dataset.visibility = document.hasPlayerOwner ? "all" : "gm";
                    continue;
                }
            }
        }

        const hasOwnership = document?.isOwner ?? game.user.isGM;
        for (const element of htmlQueryAll(html, "[data-owner-title]")) {
            if (hasOwnership) {
                const value = element.dataset.ownerTitle ?? "";
                element.title = value;
            } else {
                element.removeAttribute("data-owner-title");
            }
        }

        // Remove visibility=gm elements if the user is not a GM
        if (!game.user.isGM) {
            for (const element of visibilityElements.filter((e) => e.dataset.visibility === "gm")) {
                element.remove();
            }
        }
    }

    static processMessageSender(message: ChatMessagePTR2e, html: HTMLElement): void {
        // Hide the sender name from the card if it can't be seen from the canvas
        const token =
            message.token ?? (message.actor ? new TokenDocumentPTR2e(message.actor.prototypeToken.toObject()) : null);
        if (token) {
            const sender = html.querySelector<HTMLElement>("h4.message-sender");
            const nameToHide = token.name.trim();
            const shouldHideName = !token.playersCanSeeName && sender?.innerText.includes(nameToHide);
            if (sender && shouldHideName) {
                if (game.user.isGM) {
                    sender.dataset.visibility = "gm";
                } else {
                    sender.innerText = message.user?.name ?? "Gamemaster";
                }
            }
        }
    }
}

const USER_VISIBILITIES = new Set(["all", "owner", "gm", "none"] as const);
type UserVisibility = SetElement<typeof USER_VISIBILITIES>;

interface ProcessOptions {
    document?: ClientDocument | null;
    message?: ChatMessagePTR2e | null;
}

export { USER_VISIBILITIES, UserVisibilityPTR2e, type UserVisibility };
