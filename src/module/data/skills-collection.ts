import { formatSlug, sluggify } from "@utils";
import { CoreSkill, CustomSkill, Skill } from "./models/skill.ts";

export default class PTR2eSkills extends Collection<Skill> {
    rawModuleSkills: CustomSkill[] = [];

    constructor() {
        super();
        this.refresh();
    }

    static create() {
        return new PTR2eSkills().refresh();
    }

    isCoreSkill(skill: Skill): skill is CoreSkill {
        return !!CONFIG.PTR.data.skills[skill.slug];
    }

    isCustomSkill(skill: Skill): skill is CustomSkill {
        return !this.isCoreSkill(skill);
    }

    refresh() {
        this.clear();

        for(const skill of Object.values(CONFIG.PTR.data.skills)) {
            this.set(skill.slug, fu.mergeObject({
                favourite: false,
                hidden: false,
                group: undefined
            }, skill));
        }
    
        // Allow custom-defined user Skills from the world
        const settingSkills = game.settings.get<CustomSkill[]>("ptr2e", "skills");
        if (settingSkills?.length > 0) {
            settingSkills.forEach((skill: CustomSkill) => {
                if (!skill.slug && !skill.label) return;
                skill.slug ??= sluggify(skill.label);
                
                const existing = this.get(skill.slug);
                if(existing) {
                    fu.mergeObject(existing, {favourite: skill.favourite ?? existing.favourite, hidden: skill.hidden ?? existing.hidden});
                    return;
                }
                
                skill.label ??= formatSlug(skill.slug);
                skill.description ??= "";
                this.set(skill.slug, skill);
            });
        }
    
        // Allow modules to add and override Skills
        const toAdd: CustomSkill[] = [];
        Hooks.callAll("ptr2e.prepareSkills", toAdd);
    
        if (toAdd.length > 0) {
            toAdd.forEach((skill: CustomSkill) => {
                if (!skill.slug && !skill.label) return;
                skill.slug ??= sluggify(skill.label);
                skill.label ??= formatSlug(skill.slug);
                skill.description ??= "";
                if(this.has(skill.slug)) {
                    console.warn(`Module defined slug: ${skill.slug} is already defined in the system. Skipping.`);
                    return;
                }
                this.set(skill.slug, skill);
            });
        }
    
        this.rawModuleSkills = fu.deepClone(toAdd);
    
        return this;
    }
}