import { CheckModifier, ModifierPTR2e } from "@module/effects/modifiers.ts";
import { CheckRollContext } from "@system/rolls/data.ts";
import { ModifierPopup } from "./modifier-popup.ts";

export class AttackModifierPopup extends ModifierPopup {

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        modifiers: {
            id: "modifiers",
            template: "/systems/ptr2e/templates/apps/modifier-popup.hbs",
        },
    };

    sharedModifiers: Collection<ModifierPTR2e>;

    constructor(
        check: CheckModifier,
        sharedModifiers: Collection<ModifierPTR2e>,
        context: CheckRollContext,
        options: Partial<foundry.applications.api.ApplicationConfiguration> = {}
    ) {
        super(check, context, options);

        this.sharedModifiers = sharedModifiers;
    }

    override async _prepareContext() {

        const modifiers = (() => {
            this.check.modifiers.map((m) => ({
                ...m,
                hideIfDisabled: !this.originallyEnabled.has(m) && m.hideIfDisabled,
            }))
        })()
        
        return {
            modifiers,
            rollModes: CONFIG.Dice.rollModes,
            rollMode:
                this.context.rollMode === "roll"
                    ? game.settings.get("core", "rollMode")
                    : this.context.rollMode,
        };
    }

    override _attachPartListeners(
        partId: string,
        htmlElement: HTMLElement,
        options: foundry.applications.api.HandlebarsRenderOptions
    ): void {
        super._attachPartListeners(partId, htmlElement, options);

    }
}

export type ModifierPopupResult = {
    modifiers: ModifierPTR2e[];
    rollMode: RollMode;
};

// @ts-ignore
globalThis.ModifierPopup = AttackModifierPopup;
