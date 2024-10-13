import { CheckModifier, ModifierPTR2e } from "@module/effects/modifiers.ts";
import { CheckRollContext } from "@system/rolls/data.ts";
import { htmlQuery, htmlQueryAll, tupleHasValue } from "@utils";

export class ModifierPopup extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2
) {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["sheet modifier-popup"],
            position: {
                height: "auto",
                width: 400,
            },
            form: {
                closeOnSubmit: true,
                submitOnChange: false,
                handler: ModifierPopup.#onSubmit,
            },
            tag: "form",
        },
        { inplace: false }
    );

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        modifiers: {
            id: "modifiers",
            template: "systems/ptr2e/templates/apps/modifier-popup.hbs",
        },
    };

    check: CheckModifier;
    context: CheckRollContext;
    protected originallyEnabled: Set<ModifierPTR2e>;

    get origin() {
        return this.context.actor!;
    }

    override get title() {
        return `Modifiers: ${this.context.title?.trim() || this.check.slug} (${this.check.signedTotal})`;
    }

    constructor(
        check: CheckModifier,
        context: CheckRollContext,
        options: Partial<foundry.applications.api.ApplicationConfiguration> = {}
    ) {
        if (!context.actor) throw new Error("ModifierPopup requires an actor in the context");
        if (!context.type) throw new Error("ModifierPopup requires a type in the context");

        const title = context.title?.trim() || check.slug;

        options.id = `ModifierPopup-${context.actor.uuid}-${context.type}-${title}`;
        super(options);

        this.check = check;
        this.context = context;

        if(!["luck-check", "attack-roll", "pokeball-check"].includes(this.context.type!) && !check.modifiers.find(s => s.slug === "challenge-rating")) {
            check.push(new ModifierPTR2e({ label: "Challenge Rating", modifier: 10, slug: "challenge-rating", hidden: true, method: 'flat'}));
        }

        this.originallyEnabled = new Set(check.modifiers.filter((m) => !m.ignored));
    }

    private readonly challengeRatings = {
        effortless: "Effortless +640",
        trivial: "Trivial +30",
        easy: "Easy +40",
        simple: "Simple +30",
        routine: "Routine +20",
        ordinary: "Ordinary +10",
        demanding: "Demanding +0",
        taxing: "Taxing -10",
        challenging: "Challenging -20",
        difficult: "Difficult -30",
        intense: "Intense -40",
        insane: "Insane -50",
        impossible: "Impossible -60",
    } as const;

    override async _prepareContext(): Promise<Record<string, unknown>> {
        const challengeRating = (() => {
            if(this.context.type === "luck-check") return null;
            const value = this.check.modifiers.find(s => s.slug === "challenge-rating")?.value;
            switch(value) {
                case 60: return "effortless";
                case 50: return "trivial";
                case 40: return "easy";
                case 30: return "simple";
                case 20: return "routine";
                case 10: return "ordinary";
                case 0: return "demanding";
                case -10: return "taxing";
                case -20: return "challenging";
                case -30: return "difficult";
                case -40: return "intense";
                case -50: return "insane";
                case -60: return "impossible";
                default: return "ordinary";
            }
        })();

        return {
            modifiers: this.check.modifiers.map((m) => ({
                ...m,
                hideIfDisabled: !this.originallyEnabled.has(m) && m.hideIfDisabled,
            })),
            totalModifier: this.check.totalModifier,
            rollModes: CONFIG.Dice.rollModes,
            rollMode:
                this.context.rollMode === "roll"
                    ? game.settings.get("core", "rollMode")
                    : this.context.rollMode,
            challengeRatings: this.challengeRatings,
            challengeRating
        };
    }

    override _attachPartListeners(
        partId: string,
        htmlElement: HTMLElement,
        options: foundry.applications.api.HandlebarsRenderOptions
    ): void {
        super._attachPartListeners(partId, htmlElement, options);

        for (const element of htmlQueryAll(htmlElement, "div.modifier")) {
            const index = Number(element.dataset.index);
            const modifier = this.check.modifiers[index];
            if (!modifier) continue;

            const checkbox = htmlQuery<HTMLInputElement>(element, "input[type=checkbox]");

            checkbox?.addEventListener("click", () => {
                modifier.ignored = !checkbox.checked;
                this.check.calculateTotal();
                this.render({window: {title: this.title}});
            })
        }

        const addModifierButton = htmlQuery<HTMLButtonElement>(htmlElement, "button.add-modifier");
        addModifierButton?.addEventListener("click", () => {
            const parent = addModifierButton.parentElement as HTMLDivElement
            const value = Number(parent.querySelector<HTMLInputElement>(".add-modifier-value")?.value || 1);
            let name = String(parent.querySelector<HTMLInputElement>(".add-modifier-name")?.value);
            const errors: string[] = [];
            if (Number.isNaN(value)) {
                errors.push("Modifier value must be a number.");
            } else if (value === 0) {
                errors.push("Modifier value must not be zero.");
            }
            if (!name || !name.trim()) {
                name = game.i18n.localize(value < 0 ? `Penalty` : `Bonus`);
            }
            if (errors.length > 0) {
                ui.notifications.error(errors.join(" "));
            } else {
                this.check.push(new ModifierPTR2e({ label: name, modifier: value, method: 'flat'}));
                this.render({window: {title: this.title}});
            }
        })

        const challengeRatingInput = htmlQuery<HTMLSelectElement>(htmlElement, "select[name='challenge-rating']");
        challengeRatingInput?.addEventListener("change", () => {
            const challengeRating = challengeRatingInput.value;
            if (!tupleHasValue(Object.keys(this.challengeRatings), challengeRating)) {
                throw Error("Unexpected challenge rating");
            }
            const challengeRatingModifier = this.check.modifiers.find(s => s.slug === "challenge-rating");
            if (!challengeRatingModifier) {
                throw Error("Challenge rating modifier not found");
            }

            challengeRatingModifier.modifier = (() => {
                switch (challengeRating) {
                    case "effortless": return 60;
                    case "trivial": return 50;
                    case "easy": return 40;
                    case "simple": return 30;
                    case "routine": return 20;
                    case "ordinary": return 10;
                    case "demanding": return 0;
                    case "taxing": return -10;
                    case "challenging": return -20;
                    case "difficult": return -30;
                    case "intense": return -40;
                    case "insane": return -50;
                    case "impossible": return -60;
                    default: throw Error("Unexpected challenge rating");
                }
            })()
            this.check.calculateTotal();
            this.render({window: {title: this.title}});
        });

        const rollModeInput = htmlQuery<HTMLSelectElement>(htmlElement, "select[name='rollmode']");
        rollModeInput?.addEventListener("change", () => {
            const rollMode = rollModeInput.value;
            if (!tupleHasValue(Object.values(CONST.DICE_ROLL_MODES), rollMode)) {
                throw Error("Unexpected roll mode");
            }
            this.context.rollMode = rollMode;
        });
    }

    promise: Promise<Maybe<ModifierPopupResult>> | null = null;
    resolve?: (value: Maybe<ModifierPopupResult>) => void;

    async wait() {
        return (this.promise ??= new Promise((resolve) => {
            this.resolve = resolve;

            this.addEventListener(
                "close",
                () => {
                    resolve(null);
                    this.promise = null;
                    this.resolve = undefined;
                },
                { once: true }
            );
            this.render(true);
        }));
    }

    static async #onSubmit(
        this: ModifierPopup,
        event: SubmitEvent | Event,
        _form: HTMLFormElement,
        formData: FormDataExtended
    ) {
        if (!this.resolve) return;
        if (!event) {
            this.resolve(null);
            this.promise = null;
            this.resolve = undefined;
            return;
        }
        const result = formData.object;
        const rollMode = result.rollmode as RollMode;

        this.resolve({ rollMode });
        this.promise = null;
        this.resolve = undefined;
    }
}

export interface ModifierPopupResult {
    rollMode: RollMode;
}