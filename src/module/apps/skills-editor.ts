import { ActorPTR2e, Skill } from "@actor";
import { SkillsComponent } from "@actor/components/skills-component.ts";
import SkillPTR2e from "@module/data/models/skill.ts";
import { htmlQueryAll } from "@utils";

export class SkillsEditor extends foundry.applications.api.HandlebarsApplicationMixin(
    foundry.applications.api.ApplicationV2
) {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            tag: "form",
            classes: ["sheet skill-sheet"],
            position: {
                height: 'auto',
                width: 500,
            },
            form: {
                submitOnChange: false,
                closeOnSubmit: true,
                handler: SkillsEditor.#onSubmit,
            },
            window: {
                minimizable: true,
                resizable: false,
            },
            actions: {
                "reset-skills": SkillsEditor.#onResetSkills,
                "change-resources": SkillsEditor.#onChangeResources,
                "change-luck": SkillsEditor.#onChangeLuck,
                "roll-luck": SkillsEditor.#onRollLuck,
            },
        },
        { inplace: false }
    );

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        skills: {
            id: "skills",
            template: "/systems/ptr2e/templates/apps/skills-editor.hbs",
        },
    };

    document: ActorPTR2e;
    skills: (SkillPTR2e["_source"] & { label: string; investment: number })[];

    override get title() {
        return `${this.document.name}'s Skills Editor`;
    }

    constructor(
        document: ActorPTR2e,
        options: Partial<foundry.applications.api.ApplicationConfiguration> = {}
    ) {
        options.id = `Skill-Editor-${document.uuid}`;
        super(options);
        this.document = document;
        this.skills = this.resetSkills();
    }

    resetSkills(): this["skills"] {
        const {skills, hideHiddenSkills} = SkillsComponent.prepareSkillsData(this.document);

        const convertSkill = (skill: Skill) => {
            if (game.i18n.has(`PTR2E.Skills.${skill.group ? `${skill.group}.${skill.slug}` : skill.slug}.label`)) {
                const label = game.i18n.format(
                    `PTR2E.Skills.${
                        skill.group ? `${skill.group}.${skill.slug}` : skill.slug
                    }.label`
                );
                return [{
                    ...skill,
                    label,
                    investment: 0,
                }];
            } else {
                const skillData = game.ptr.data.skills.get(skill.slug);
                if (skillData && game.ptr.data.skills.isCustomSkill(skillData)) {
                    return [{
                        ...skill,
                        label: skillData.label || Handlebars.helpers.formatSlug(skill.slug),
                        investment: 0,
                    }];
                }
            }
            return []
        }
        
        return [
            ...skills.favourites.flatMap((group) => group.skills.flatMap(convertSkill) as unknown as (SkillPTR2e["_source"] & { label: string; investment: number })[]),
            ...skills.normal.flatMap((group) => group.skills.flatMap(convertSkill) as unknown as (SkillPTR2e["_source"] & { label: string; investment: number })[]),
            ...(hideHiddenSkills ? [] : skills.hidden.flatMap((group) => group.skills.flatMap(convertSkill) as unknown as (SkillPTR2e["_source"] & { label: string; investment: number })[])),
        ]
    }

    override async _prepareContext() {
        const points: {
            total: number;
            spent: number;
            available?: number;
        } = {
            total: this.document.system.advancement.rvs.total,
            spent: (() => {
                let spent = this.document.system.advancement.rvs.spent;
                for (const skill of this.skills) {
                    spent += skill.investment;
                }
                return spent;
            })(),
        };
        points.available = points.total - points.spent;
        const levelOne = this.document.system.advancement.level === 1;
        const maxInvestment = Math.clamp(points.available,0, levelOne ? 90 : 100);

        return {
            document: this.document,
            skills: this.skills,
            points,
            maxInvestment,
            isReroll:
                !levelOne || (levelOne && this.document.system.skills.get("luck")!.value! > 1),
            levelOne,
        };
    }

    override _attachPartListeners(
        partId: string,
        htmlElement: HTMLElement,
        options: foundry.applications.api.HandlebarsRenderOptions
    ): void {
        super._attachPartListeners(partId, htmlElement, options);

        for (const input of htmlQueryAll(htmlElement, "skill input")) {
            input.addEventListener("change", this.#onSkillChange.bind(this));
        }
    }

    #onSkillChange(event: Event) {
        const input = event.currentTarget as HTMLInputElement;
        const slug = input.dataset.slug;
        if (!slug) return;
        const value = parseInt(input.value);
        if (isNaN(value)) return;

        const skill = this.skills.find((skill) => skill.slug === slug);
        if (!skill) return;

        skill.investment = value;
        this.render({});
    }

    static #onResetSkills(this: SkillsEditor) {
        const document = this.document;
        const thisRef = this;
        foundry.applications.api.DialogV2.confirm({
            window: {
                title: game.i18n.format("PTR2E.SkillsEditor.ResetSkills.title", {
                    name: document.name,
                }),
            },
            content: game.i18n.format("PTR2E.SkillsEditor.ResetSkills.content", {
                name: document.name,
            }),
            yes: {
                callback: async () => {
                    await document.update({
                        "system.skills": document.system.skills.map((skill) => {
                            if(skill.slug === "resources") return {
                                ...skill,
                                rvs: 0,
                                value: 10,
                            };
                            return {
                                ...skill,
                                rvs: 0,
                            };
                        }),
                    });
                    this.skills = thisRef.resetSkills();
                    thisRef.render({});
                },
            },
        });
    }

    static #onChangeResources(this: SkillsEditor) {
        const document = this.document;
        const resources = document.system.skills.find((skill) => skill.slug === "resources");
        if (!resources) return;

        const thisRef = this;
        foundry.applications.api.DialogV2.prompt({
            window: {
                title: game.i18n.format("PTR2E.SkillsEditor.ChangeResources.title", {
                    name: document.name,
                }),
            },
            content: game.i18n.format("PTR2E.SkillsEditor.ChangeResources.content", {
                name: document.name,
                value: resources.total,
            }),
            ok: {
                action: "submit",
                label: game.i18n.localize("PTR2E.SkillsEditor.ChangeResources.submit"),
                callback: async (event) => {
                    const input = (event.currentTarget as HTMLInputElement).querySelector(
                        "input"
                    ) as HTMLInputElement;
                    if (!input) return;

                    const value = parseInt(input.value);
                    if (isNaN(value) || !value) return;
                    const resources = thisRef.skills.find((skill) => skill.slug === "resources")!;
                    if (resources.value + (resources.rvs ?? 0) + value < 1) {
                        ui.notifications.warn(
                            game.i18n.format("PTR2E.SkillsEditor.ChangeResources.warn", {
                                name: document.name,
                            })
                        );
                        return;
                    }

                    thisRef.skills.find((skill) => skill.slug === "resources")!.rvs =
                        (resources.rvs ?? 0) + value;

                    await document.update({
                        "system.skills": document.system.skills.map((skill) => {
                            return skill.slug === "resources"
                                ? {
                                      ...skill,
                                      rvs: (skill.rvs ?? 0) + value,
                                  }
                                : skill;
                        }),
                    });
                    thisRef.render({});
                },
            },
        });
    }

    static #onChangeLuck(this: SkillsEditor) {
        const document = this.document;
        const luck = document.system.skills.find((skill) => skill.slug === "luck");
        if (!luck) return;

        const thisRef = this;
        foundry.applications.api.DialogV2.prompt({
            window: {
                title: game.i18n.format("PTR2E.SkillsEditor.ChangeLuck.title", {
                    name: document.name,
                }),
            },
            content: game.i18n.format("PTR2E.SkillsEditor.ChangeLuck.content", {
                name: document.name,
                value: luck.total,
            }),
            ok: {
                action: "submit",
                label: game.i18n.localize("PTR2E.SkillsEditor.ChangeLuck.submit"),
                callback: async (event) => {
                    const input = (event.currentTarget as HTMLInputElement).querySelector(
                        "input"
                    ) as HTMLInputElement;
                    if (!input) return;

                    const value = parseInt(input.value);
                    if (isNaN(value) || !value) return;
                    const luck = thisRef.skills.find((skill) => skill.slug === "luck")!;
                    if (luck.value + value <= 0) {
                        ui.notifications.warn(
                            game.i18n.format("PTR2E.SkillsEditor.ChangeLuck.warn", {
                                name: document.name,
                            })
                        );
                        return;
                    }

                    thisRef.skills.find((skill) => skill.slug === "luck")!.value =
                        (luck.value ?? 0) + value;

                    await document.update({
                        "system.skills": document.system.skills.map((skill) => {
                            return skill.slug === "luck"
                                ? {
                                      ...skill,
                                      value: (skill.value ?? 0) + value,
                                  }
                                : skill;
                        }),
                    });
                    thisRef.render({});
                },
            },
        });
    }

    static async #onRollLuck(this: SkillsEditor) {
        const document = this.document;
        const luck = document.system.skills.find((skill) => skill.slug === "luck");
        if (!luck) return;

        const levelOne = this.document.system.advancement.level === 1;
        const isReroll =
            !levelOne || (levelOne && this.document.system.skills.get("luck")!.value! > 1);
        const thisRef = this;

        const rollAndApplyLuck = async (isReroll = false) => {
            const roll = await new Roll("3d6 * 5").roll();
            const flavor = isReroll
                ? game.i18n.format("PTR2E.SkillsEditor.RollLuck.reroll", { name: document.name })
                : game.i18n.format("PTR2E.SkillsEditor.RollLuck.roll", { name: document.name });
            await roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: document }),
                flavor,
                content: `<p>${flavor}</p>${await roll.render()}<p>${game.i18n.format(
                    "PTR2E.SkillsEditor.RollLuck.result",
                    {
                        result: roll.total,
                    }
                )}</p>`,
            });

            thisRef.skills.find((skill) => skill.slug === "luck")!.value = roll.total;
            await document.update({
                "system.skills": document.system.skills.map((skill) => {
                    return skill.slug === "luck"
                        ? {
                              ...skill,
                              value: roll.total,
                          }
                        : skill;
                }),
            });
            thisRef.render({});
        };

        if (!isReroll) {
            await rollAndApplyLuck();
            return;
        }

        await foundry.applications.api.DialogV2.confirm({
            window: {
                title: game.i18n.format("PTR2E.SkillsEditor.RollLuck.title", {
                    name: document.name,
                }),
            },
            content: game.i18n.format("PTR2E.SkillsEditor.RollLuck.content", {
                name: document.name,
            }),
            yes: {
                callback: rollAndApplyLuck.bind(this, true),
            },
        });
    }

    static async #onSubmit(
        this: SkillsEditor,
        _event: SubmitEvent | Event,
        _form: HTMLFormElement,
        formData: FormDataExtended
    ) {
        const data = fu.expandObject<Record<string, { investment: string }>>(formData.object);
        const skills = this.document.system.toObject().skills as SkillPTR2e["_source"][];
        const maxInvestment = this.document.system.advancement.level === 1 ? 90 : 100;

        let resourceMod = 0;
        for (const skill of skills) {
            const skillData = data[skill.slug];
            if (!skillData) continue;
            const investment = parseInt(skillData.investment);
            if (isNaN(investment) || !investment) continue;

            if(skill.slug === "resources" && investment < 0) resourceMod = investment; 
            skill.rvs = Math.clamp((skill.rvs ?? 0) + investment, skill.slug === "resources" ? -maxInvestment : 0, maxInvestment);
            delete data[skill.slug];
        }

        for (const slug in data) {
            const investment = parseInt(data[slug].investment);
            if (isNaN(investment) || !investment) continue;

            const skillData = game.ptr.data.skills.get(slug);
            if (!skillData || !game.ptr.data.skills.isCustomSkill(skillData)) continue;

            if(slug === "resources" && investment < 0) resourceMod = investment;

            skills.push({
                slug,
                value: 1,
                rvs: Math.clamp(investment, slug === "resources" ? -maxInvestment : 0, maxInvestment),
                favourite: skillData.favourite ?? false,
                hidden: skillData.hidden ?? false,
                group: skillData.group || undefined,
            });
        }

        if (this.document.system.advancement.level === 1) {
            const resourceIndex = skills.findIndex((skill) => skill.slug === "resources");
            if (resourceIndex !== -1) {
                const resources = skills[resourceIndex];
                resources.value += (resources.rvs ?? 0) + resourceMod;
                resources.rvs = 0;
            }
        }

        await this.document.update({
            "system.skills": skills,
        });
    }
}
