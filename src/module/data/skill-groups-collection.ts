// import { formatSlug, sluggify } from "@utils";
import { Skill } from "./models/skill.ts";
import { SkillGroup } from "./models/skill-group.ts";

export default class PTR2eSkillGroups extends Collection<SkillGroup> {

    constructor() {
        super();
        this.refresh();
    }

    static create() {
        return new PTR2eSkillGroups().refresh();
    }

    groupChain(group: SkillGroup | undefined): Array<SkillGroup> {
        if (!group) return [];
        const chain = [group]
        while (chain[chain.length-1].parentGroup) {
            const nextInChain = this.get(chain[chain.length-1].parentGroup); 
            if (!nextInChain) break;
            chain.push(nextInChain!);
        }
        return chain;
    }

    groupChainFromSkill(skill: Skill): Array<SkillGroup> {
        const group = this.get(skill.group);
        if (!group) return [];
        return this.groupChain(group);
    }

    refresh() {
        this.clear();

        for(const group of Object.values(CONFIG.PTR.data.skillGroups)) {
            this.set(group.slug, group);
        }
    
        // // Allow custom-defined user Skills from the world
        // const settingSkills = game.settings.get<CustomSkill[]>("ptr2e", "skills");
        // if (settingSkills?.length > 0) {
        //     settingSkills.forEach((skill: CustomSkill) => {
        //         if (!skill.slug && !skill.label) return;
        //         skill.slug ??= sluggify(skill.label);
                
        //         const existing = this.get(skill.slug);
        //         if(existing) {
        //             fu.mergeObject(existing, {favourite: skill.favourite ?? existing.favourite, hidden: skill.hidden ?? existing.hidden});
        //             return;
        //         }
                
        //         skill.label ??= formatSlug(skill.slug);
        //         skill.description ??= "";
        //         this.set(skill.slug, skill);
        //     });
        // }
    
        // // Allow modules to add and override Skills
        // const toAdd: CustomSkill[] = [];
        // Hooks.callAll("ptr2e.prepareSkills", toAdd);
    
        // if (toAdd.length > 0) {
        //     toAdd.forEach((skill: CustomSkill) => {
        //         if (!skill.slug && !skill.label) return;
        //         skill.slug ??= sluggify(skill.label);
        //         skill.label ??= formatSlug(skill.slug);
        //         skill.description ??= "";
        //         if(this.has(skill.slug)) {
        //             console.warn(`Module defined slug: ${skill.slug} is already defined in the system. Skipping.`);
        //             return;
        //         }
        //         this.set(skill.slug, skill);
        //     });
        // }
    
        // this.rawModuleSkills = fu.deepClone(toAdd);
    
        return this;
    }
}