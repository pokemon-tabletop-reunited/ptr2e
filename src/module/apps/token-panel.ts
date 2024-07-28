import { ActorPTR2e } from "@actor";
import { SkillsComponent } from "@actor/components/skills-component.ts";
import { AttackPTR2e } from "@data";
import { Tab } from "@item/sheets/document.ts";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import { htmlQuery, htmlQueryAll } from "@utils";

export default class TokenPanel extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2
) {
    get token(): TokenPTR2e | null {
        return this._token;
    }
    set token(value: TokenPTR2e | null) {
        if (this._token === value) return;
        this.updateAppListeners(value);
        this._token = value;
        this.refresh(true);
    }

    public refresh = fu.debounce(this.render, 100);

    private _token: TokenPTR2e | null;

    constructor(
        token: TokenPTR2e | null,
        options: Partial<foundry.applications.api.ApplicationConfiguration> = {}
    ) {
        super(options);
        this._token = token;
    }

    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["token-panel"],
            tag: "aside",
            window: {
                minimizable: false,
                frame: false,
                positioned: false,
            },
        },
        { inplace: false }
    );

    static override PARTS = {
        info: {
            id: "info",
            template: "/systems/ptr2e/templates/apps/token-panel/info.hbs",
        },
        party: {
            id: "party",
            template: "/systems/ptr2e/templates/apps/token-panel/party.hbs",
        },
        nav: {
            id: "nav",
            template: "/systems/ptr2e/templates/apps/token-panel/nav.hbs",
        },
        "attack-slots": {
            id: "attack-slots",
            template: "/systems/ptr2e/templates/apps/token-panel/attack-slots.hbs",
        },
        "other-attacks": {
            id: "other-attacks",
            template: "/systems/ptr2e/templates/apps/token-panel/attack-other.hbs",
        },
        passives: {
            id: "passives",
            template: "/systems/ptr2e/templates/apps/token-panel/passives.hbs",
        },
        generic: {
            id: "generic",
            template: "/systems/ptr2e/templates/apps/token-panel/generic-actions.hbs",
        },
        skills: {
            id: "skills",
            template: "/systems/ptr2e/templates/apps/token-panel/favourite-skills.hbs",
        },
        effects: {
            id: "effects",
            template: "/systems/ptr2e/templates/apps/token-panel/effects.hbs",
        }
    };

    tabGroups: Record<string, string> = {
        sheet: "attack-slots",
    };

    tabs: Record<string, Tab> = {
        "attack-slots": {
            id: "attack-slots",
            group: "sheet",
            icon: "fa-solid fa-burst",
            label: "PTR2E.TokenPanel.Tabs.attack-slots.label",
        },
        "other-attacks": {
            id: "other-attacks",
            group: "sheet",
            icon: "fa-solid fa-burst",
            label: "PTR2E.TokenPanel.Tabs.attack-other.label",
        },
        passives: {
            id: "passives",
            group: "sheet",
            icon: "fa-solid fa-burst",
            label: "PTR2E.TokenPanel.Tabs.passives.label",
        },
        generic: {
            id: "generic",
            group: "sheet",
            icon: "fa-solid fa-burst",
            label: "PTR2E.TokenPanel.Tabs.generic-actions.label",
        },
        skills: {
            id: "skills",
            group: "sheet",
            icon: "fa-solid fa-burst",
            label: "PTR2E.TokenPanel.Tabs.skills.label",
        },
        effects: {
            id: "effects",
            group: "sheet",
            icon: "fa-solid fa-star",
            label: "PTR2E.TokenPanel.Tabs.effects.label",
        }
    };

    _getTabs() {
        for (const v of Object.values(this.tabs)) {
            v.active = this.tabGroups[v.group] === v.id;
            v.cssClass = v.active ? "active" : "";
        }
        return this.tabs;
    }

    override _configureRenderOptions(options: foundry.applications.api.HandlebarsRenderOptions): void {
        super._configureRenderOptions(options);
    }

    override async _renderHTML(
        context: foundry.applications.api.ApplicationRenderContext,
        options: foundry.applications.api.HandlebarsRenderOptions
    ): Promise<Record<string, HTMLElement>> {
        if (this.token?.actor) return super._renderHTML(context, options);

        return options.parts.reduce(
            (acc, partId) => {
                const t = document.createElement("template");
                t.dataset.applicationPart = partId;
                acc[partId] = t;
                return acc;
            },
            {} as Record<string, HTMLElement>
        );
    }

    override async _prepareContext(
        options?: foundry.applications.api.HandlebarsRenderOptions | undefined
    ) {
        const context = await super._prepareContext(options);
        if (!this.token) return context;

        const actor = this.token.actor;
        if (!actor) return false;
        
        const actions = {
            passives: actor.actions.passive,
            generic: [...actor.actions.generic, ...actor.actions.pokeball],
            slots: Object.values(actor.attacks.actions),
            other: actor.actions.attack.filter(a => a.free),
        };

        const party = actor.party;
        const isOwner = party?.owner == this.token.actor;

        const {skills} = SkillsComponent.prepareSkillsData(actor);

        return {
            ...context,
            token: this.token,
            actor: this.token.actor,
            effects: this.token.actor?.effects.contents ?? [],
            party,
            isOwner,
            actions,
            skills: skills.favourites.flatMap(s => s.skills),
            tabs: this._getTabs(),
        };
    }

    override _attachPartListeners(
        partId: string,
        htmlElement: HTMLElement
    ): void {
        function registerActorEvents(element: HTMLElement) {
            let _clickActorTimeout: number | null = null;

            element.addEventListener("click", async (event) => {
                const uuid = (event.currentTarget as HTMLElement).dataset.uuid;
                if(!uuid) return;

                const actor = await fromUuid<ActorPTR2e>(uuid);
                if(!actor) return;

                const token = actor.getActiveTokens(false)[0];
                if(!token) return;

                if(_clickActorTimeout) clearTimeout(_clickActorTimeout);
                _clickActorTimeout = setTimeout(() => {
                    token.control({ releaseOthers: true });
                    canvas.animatePan({ x: token.x, y: token.y });
                }, 200) as unknown as number;
            });

            element.addEventListener("dblclick", async (event) => {
                if(_clickActorTimeout) clearTimeout(_clickActorTimeout);

                const uuid = (event.currentTarget as HTMLElement).dataset.uuid;
                if(!uuid) return;

                const actor = await fromUuid(uuid);
                return actor?.sheet?.render(true);
            });

            let highlights: Token[] = [];
            element.addEventListener("mouseover", async (event) => {
                event.preventDefault();
                if(!canvas.ready) return;

                const uuid = (event.currentTarget as HTMLElement).dataset.uuid;
                if(!uuid) return;

                const actor = await fromUuid<ActorPTR2e>(uuid);
                if(!actor) return;

                const tokens = actor.getActiveTokens(false);
                if(!tokens?.length) return;

                if(tokens.every(t => t.isVisible)) {
                    //@ts-expect-error ignore protected clause.
                    tokens.forEach(t => t._onHoverIn(event));
                    highlights = tokens;
                }
            });

            element.addEventListener("mouseout", async (event) => {
                event.preventDefault();
                if(!canvas.ready) return;

                if(!highlights.length) return;

                //@ts-expect-error ignore protected clause.
                highlights.forEach(t => t._onHoverOut(event));
                highlights = [];
            });

            htmlQuery(element, 'img')?.addEventListener("dragstart", event => {
                const uuid = ((event.currentTarget as HTMLElement).parentElement as HTMLElement).dataset.uuid;
                if(!uuid) return;
                console.log("dragstart", uuid)

                event.dataTransfer!.setData("text/plain", JSON.stringify({
                    type: "Actor",
                    uuid,
                }));
            })
        }
        if(partId === "info") {
            const element = htmlQuery(htmlElement, ".actor");
            if(element) {
                registerActorEvents(element);
            }
        }
        if(partId === "party") {
            for(const member of htmlQueryAll(htmlElement, ".icon")) {
                registerActorEvents(member);
            }
        }
        if (partId === "attack-slots" || partId === "other-attacks") {
            for (const element of htmlQueryAll(htmlElement, ".attack")) {
                const rollable = htmlQuery(element, ".rollable");
                if (rollable) {
                    rollable.addEventListener("click", async (event) => {
                        const slug = (
                            (event.currentTarget as HTMLElement).closest(
                                ".attack[data-action]"
                            ) as HTMLElement
                        )?.dataset?.action;
                        if (!slug) return;

                        const attack = this.token!.actor!.actions.attack.get(slug) as AttackPTR2e;
                        if (!attack) return;

                        return attack.roll();
                    });
                }

                element.addEventListener("contextmenu", async (event) => {
                    event.preventDefault();
                    const slug = (
                        (event.currentTarget as HTMLElement).closest(
                            ".attack[data-action]"
                        ) as HTMLElement
                    )?.dataset?.action;
                    if (!slug) return;

                    const attack = this.token!.actor!.actions.attack.get(slug) as AttackPTR2e;
                    if (!attack) return;

                    return attack.item.toChat();
                });
            }
        }
        if(partId === "skills") {
            for(const element of htmlQueryAll(htmlElement, ".skill .rollable")) {
                element.addEventListener("click", async (event) => {
                    const slug = ((event.currentTarget as HTMLElement).parentElement as HTMLElement).dataset.slug;
                    if(!slug) return;

                    const skill = this.token!.actor!.system.skills.get(slug);
                    if(!skill) return;

                    return skill.roll();
                });
            }
        }
    }

    updateAppListeners(token: TokenPTR2e | null) {
        if(this.token?.actor) {
            //@ts-expect-error - AppV1 Compatibility
            delete this.token.actor.apps[this.id];
        }

        if(!token?.actor) return;
        //@ts-expect-error - AppV1 Compatibility
        token.actor.apps[this.id] = this;
    }
}
