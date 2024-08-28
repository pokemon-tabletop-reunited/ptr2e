import { ActorComponent } from "./base.ts";
import ActorPTR2e from "@actor/base.ts";
import { Skill } from "@actor/data.ts";
import SkillPTR2e from "@module/data/models/skill.ts";
import { htmlQueryAll } from "@utils";

class SkillsComponent extends ActorComponent {
    static override TEMPLATE = "systems/ptr2e/templates/actor/components/actor-skills-component.hbs";
    static override TOOLTIP = "PTR2E.ActorSheet.Components.Skills.tooltip";

    static override ACTIONS = {
        "toggle-hidden-skills": async function (this: SkillsComponent) {
            const appSettings = fu.duplicate(game.user.getFlag("ptr2e", "appSettings") ?? {}) as Record<string, Record<string, unknown>>;
            const appId = `ActorSheetPTRV2-${this.actor.uuid.replaceAll(".", "-")}`;
            if (!appSettings[appId]) appSettings[appId] = {hideHiddenSkills: true};

            appSettings[appId].hideHiddenSkills = !appSettings[appId].hideHiddenSkills;
            await game.user.setFlag("ptr2e", "appSettings", appSettings);
            
            for(const app of Object.values(this.actor.apps)) {
                if(app instanceof foundry.applications.api.ApplicationV2) {
                    const parts = (app as unknown as {parts: Record<string, unknown>}).parts;
                    if('popout' in parts) app.render({parts: ["popout"]})
                    if('skills' in parts) app.render({parts: ["skills"]})
                }
                else app?.render();
            }
        },
    }

    static prepareSkillsData(actor: ActorPTR2e) {
        const skills = (() => {
            const favouriteGroups: SkillCategory = { none: { label: null, slug: null, skills: [], subcategories: [], skillsAndGroups: [] } };
            const hiddenGroups: SkillCategory = { none: { label: null, slug: null, skills: [], subcategories: [], skillsAndGroups: [] } };
            const normalGroups: SkillCategory = { none: { label: null, slug: null, skills: [], subcategories: [], skillsAndGroups: [] } };

            for (const skill of actor.system.skills.contents.sort((a, b) =>
                a.slug.localeCompare(b.slug)
            )) {
                const category = (()=>{
                    if (skill.favourite) {
                        return favouriteGroups;
                    } else if (skill.hidden) {
                        return hiddenGroups;
                    }
                    return normalGroups;
                })();

                const groups = game.ptr.data.skillGroups.groupChainFromSkill(skill).map(g=>g.slug);
                groups.push("none");
                for (const group of groups)
                    if (!category[group])
                        category[group] = { label: group, slug: group, skills: [], subcategories: [], skillsAndGroups: [] };
                category[groups[0]].skills.push(skill);
            }
            // group inheritance
            const allCategories = [favouriteGroups, hiddenGroups, normalGroups]
            for (const category of allCategories) {
                const categoryFlat = {...category};
                for (const [ groupSlug, skillCategory ] of Object.entries(category).sort((a, b) => a[0].localeCompare(b[0]))) {
                    if (groupSlug == "none") continue;
                    const group = game.ptr.data.skillGroups.get(groupSlug);
                    const parentGroup = categoryFlat[group?.parentGroup ?? "none"];
                    if (parentGroup) {
                        parentGroup.subcategories.push(skillCategory);
                        delete category[groupSlug];
                    }
                }


                const populateSkillsAndGroupsField = function (skillCategory:SkillSubCategory) {
                    const depth = game.ptr.data.skillGroups.groupChain(game.ptr.data.skillGroups.get(skillCategory.slug)).length;
                    const sc = skillCategory.subcategories.map(s=>({...s, isGroup: true, depth }));
                    skillCategory.skillsAndGroups = [
                        ...skillCategory.skills.map(s=>({...s, isGroup: false, depth })),
                        ...sc
                    ].sort((a, b) => (a?.slug ?? "").localeCompare(b?.slug ?? ""));
                    sc.forEach(populateSkillsAndGroupsField);
                }
                populateSkillsAndGroupsField(categoryFlat["none"]);
            }

            const sortAndCombineGroups = function (category:SkillCategory) {
                return Object.entries(category)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([, v]) => v);
            };

            return {
                favourites: sortAndCombineGroups(favouriteGroups),
                hidden: sortAndCombineGroups(hiddenGroups),
                normal: sortAndCombineGroups(normalGroups),
            };
        })();

        const hideHiddenSkills = (() => {
            const appSettings = game.user.getFlag("ptr2e", "appSettings") as Record<string, Record<string, unknown>>;
            const appId = `ActorSheetPTRV2-${actor.uuid.replaceAll(".", "-")}`;
            if(appSettings?.[appId]) {
                return appSettings[appId].hideHiddenSkills;
            }
            return true;
        })();

        return {
            skills,
            hideHiddenSkills,
        };
    }

    static prepareSkillGroupsData(actor: ActorPTR2e) {
        return {
            skillGroups: actor.system.skillGroups.contents.sort((a, b) =>
                a.slug.localeCompare(b.slug)
            )
        };
    }

    override renderComponent(data: Record<string, unknown>): Promise<string> {
        const {skills, hideHiddenSkills} = SkillsComponent.prepareSkillsData(this.actor);
        data.skills = skills;
        data.hideHiddenSkills = hideHiddenSkills;
        return renderTemplate(this.template, data);
    }

    override renderFrame(close: HTMLElement): void {
        // Add Toggle Hidden button to the header
        const toggleHiddenSkillsLabel = game.i18n.localize("PTR2E.ActorSheet.Components.toggle-hidden-skills");
        const toggleHiddenSkillsButton = `<button type="button" class="header-control fa-solid fa-eye-slash" data-action="toggle-hidden-skills"
                                    data-tooltip="${toggleHiddenSkillsLabel}" aria-label="${toggleHiddenSkillsLabel}"></button>`;
        close.insertAdjacentHTML("beforebegin", toggleHiddenSkillsButton);
    }

    override attachListeners(htmlElement: HTMLElement) {
        return SkillsComponent.attachListeners(htmlElement, this.actor);
    }

    static attachListeners(htmlElement: HTMLElement, actor: ActorPTR2e) {
        const refreshApps = () => {
            for(const app of Object.values(actor.apps)) {
                if(app instanceof foundry.applications.api.ApplicationV2) {
                    const parts = (app as unknown as {parts: Record<string, unknown>}).parts;
                    if('popout' in parts) app.render({parts: ["popout"]})
                    if('skills' in parts) app.render({parts: ["skills"]})
                }
                else app?.render();
            }
        }

        for (const element of htmlQueryAll(htmlElement, ".item-controls .favourite-skill")) {
            element.addEventListener("click", async (event) => {
                const skillSlug = (
                    (event.currentTarget as HTMLElement)?.closest(".skill") as HTMLElement
                )?.dataset.slug;
                if (!skillSlug) return;
                
                const skills = actor.system.toObject().skills as SkillPTR2e["_source"][];
                const index = skills.findIndex((s) => s.slug === skillSlug);
                if (index === -1) return;

                skills[index].favourite = !skills[index].favourite;
                if(skills[index].favourite && skills[index].hidden) skills[index].hidden = false;
                await actor.update({ "system.skills": skills });
                refreshApps();
            });
        }

        for (const element of htmlQueryAll(htmlElement, ".item-controls .hide-skill")) {
            element.addEventListener("click", async (event) => {
                const skillSlug = (
                    (event.currentTarget as HTMLElement)?.closest(".skill") as HTMLElement
                )?.dataset.slug;
                if (!skillSlug) return;

                const skills = actor.system.toObject().skills as SkillPTR2e["_source"][];
                const index = skills.findIndex((s) => s.slug === skillSlug);
                if (index === -1) return;

                skills[index].hidden = !skills[index].hidden;
                if(skills[index].hidden && skills[index].favourite) skills[index].favourite = false;
                await actor.update({ "system.skills": skills });
                refreshApps();
            });
        }

        for (const element of htmlQueryAll(htmlElement, ".skill-icon.rollable")) {
            element.addEventListener("click", async (event) => {
                const skillSlug = (
                    (event.currentTarget as HTMLElement)?.closest(".skill") as HTMLElement
                )?.dataset.slug;
                if (!skillSlug) return;

                const skill = actor.system.skills.get(skillSlug);
                if(!skill) return;

                return skill.roll();
            });
        }
    }
}

class FavouriteSkillsComponent extends SkillsComponent {
    override renderComponent(data: Record<string, unknown>): Promise<string> {
        data.favouriteOnly = true;
        return super.renderComponent(data);
    }

    // Don't add the toggle button
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    override renderFrame(): void {}
}

type SkillSubCategory = { label: string | null; slug: string | null; skills: Skill[]; subcategories: SkillSubCategory[]; skillsAndGroups: SkillOrSubCategory[]};
type SkillOrSubCategory = (Skill | SkillSubCategory) & { isGroup?: boolean, depth?: number; };
export type SkillCategory = { none: SkillSubCategory } & Record<string, SkillSubCategory>;


export { SkillsComponent, FavouriteSkillsComponent }