import type { Tab } from "@item/sheets/document.ts";
import type { CustomSkill, Skill } from "@module/data/models/skill.ts";
import { sluggify } from "@utils";
import type { AnyObject, DeepPartial } from "fvtt-types/utils";

class SkillsSettingsMenu extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
)<AnyObject> {
  newCounter = 0;

  static override DEFAULT_OPTIONS = {
    id: "skills-settings",
    classes: ["sheet", "default-sheet"],
    tag: "form",
    window: {
      title: "PTR2E.Settings.Skills.Title",
    },
    position: {
      width: 600,
      height: 700,
    },
    form: {
      closeOnSubmit: true,
      submitOnChange: false,
      handler: SkillsSettingsMenu.#onSubmit,
    },
  }

  static override PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    header: {
      id: "header",
      template: "systems/ptr2e/templates/apps/settings/skills-settings-header.hbs",
    },
    systemSkills: {
      id: "system-skills",
      template: "systems/ptr2e/templates/apps/settings/skills-settings.hbs",
      scrollable: [".scroll"],
    },
    userSkills: {
      id: "user-skills",
      template: "systems/ptr2e/templates/apps/settings/skills-settings.hbs",
      scrollable: [".scroll"],
    },
    moduleSkills: {
      id: "module-skills",
      template: "systems/ptr2e/templates/apps/settings/skills-settings.hbs",
      scrollable: [".scroll"],
    },
    footer: {
      id: "footer",
      template: "systems/ptr2e/templates/apps/settings/skills-settings-footer.hbs",
    },
  };

  skills: (CustomSkill & { type: "custom" | "core" })[];

  constructor(options: DeepPartial<foundry.applications.api.ApplicationV2.Configuration> = {}) {
    super(options);

    this.skills = [];
    for (const skill of game.ptr.data.skills) {
      if (game.ptr.data.skills.isCustomSkill(skill)) {
        this.skills.push({
          ...skill,
          type: "custom",
        });
      } else {
        this.skills.push({
          ...skill,
          label: game.i18n.localize(
            `PTR2E.Skills.${skill.group ? `${skill.group}.${skill.slug}` : skill.slug
            }.label`
          ),
          description: game.i18n.localize(
            `PTR2E.Skills.${skill.group ? `${skill.group}.${skill.slug}` : skill.slug
            }.hint`
          ),
          type: "core",
        });
      }
    }
  }

  override tabGroups: Record<string, string> = {
    type: "userSkills",
  };

  tabs: Record<string, Tab & { hint: string }> = {
    systemSkills: {
      id: "systemSkills",
      group: "type",
      icon: "fa-solid fa-cogs",
      label: "PTR2E.Settings.Skills.systemSkills.Label",
      hint: "PTR2E.Settings.Skills.systemSkills.Hint",
    },
    userSkills: {
      id: "userSkills",
      group: "type",
      icon: "fa-solid fa-user",
      label: "PTR2E.Settings.Skills.userSkills.Label",
      hint: "PTR2E.Settings.Skills.userSkills.Hint",
    },
    moduleSkills: {
      id: "moduleSkills",
      group: "type",
      icon: "fa-solid fa-cogs",
      label: "PTR2E.Settings.Skills.moduleSkills.Label",
      hint: "PTR2E.Settings.Skills.moduleSkills.Hint",
    },
  };

  _getTabs(parts: string[]) {
    for (const v of Object.values(this.tabs)) {
      v.active = this.tabGroups[v.group] === v.id;
      v.cssClass = v.active ? "active" : "";
    }
    return Object.fromEntries(Object.entries(this.tabs).filter(([k]) => parts.includes(k)));
  }

  override async _prepareContext(options: foundry.applications.api.HandlebarsApplicationMixin.HandlebarsRenderOptions) {
    const systemSkills = [];
    const userSkills = [];
    const moduleSkills = game.ptr.data.skills.rawModuleSkills;
    for (const skill of this.skills) {
      if (skill.type === "core") {
        systemSkills.push(skill);
      } else {
        userSkills.push(skill);
      }
    }

    return {
      options,
      skills: {
        systemSkills,
        userSkills,
        moduleSkills,
      },
      tabs: this._getTabs(options.parts),
    };
  }

  override async _preparePartContext(
    partId: string,
    context: AnyObject,
    options: foundry.applications.api.HandlebarsApplicationMixin.HandlebarsRenderOptions
  ): Promise<AnyObject> {
    const preparedContext = await super._preparePartContext(partId, context, options) as AnyObject & { partId: string }
    preparedContext.partId = partId;
    return preparedContext;
  }

  override _configureRenderOptions(options: foundry.applications.api.HandlebarsApplicationMixin.HandlebarsRenderOptions): void {
    super._configureRenderOptions(options);
    if (game.ptr.data.skills.rawModuleSkills.length === 0) {
      options.parts = options.parts?.filter((part) => part !== "moduleSkills");
    }
  }

  override _attachPartListeners(
    partId: string,
    htmlElement: HTMLElement,
    options: foundry.applications.api.HandlebarsApplicationMixin.HandlebarsRenderOptions
  ): void {
    super._attachPartListeners(partId, htmlElement, options);

    if (!["header", "footer"].includes(partId)) {
      for (const create of htmlElement.querySelectorAll<HTMLElement>(
        ".skill-controls .item-control.create-skill"
      )) {
        create.addEventListener("click", SkillsSettingsMenu.#createSkill.bind(this));
      }
      for (const del of htmlElement.querySelectorAll<HTMLElement>(
        ".skill-controls .item-control.delete-skill"
      )) {
        del.addEventListener("click", SkillsSettingsMenu.#deleteSkill.bind(this));
      }
      for (const del of htmlElement.querySelectorAll<HTMLElement>(
        ".skill-controls .item-control.favourite-skill"
      )) {
        del.addEventListener("click", SkillsSettingsMenu.#favouriteSkill.bind(this));
      }
      for (const del of htmlElement.querySelectorAll<HTMLElement>(
        ".skill-controls .item-control.hide-skill"
      )) {
        del.addEventListener("click", SkillsSettingsMenu.#hideSkill.bind(this));
      }
    }
  }

  static async #onSubmit(
    this: SkillsSettingsMenu,
    _event: SubmitEvent | Event,
    _form: HTMLFormElement,
    formData: FormDataExtended
  ) {
    const skillsData = (foundry.utils.expandObject(formData.object) as { skill?: Record<string, Partial<Skill>> }).skill ?? {};

    const skills = new Map<string, Skill>();

    for (const [key, skill] of Object.entries(skillsData)) {
      if (key.startsWith("new-")) {
        const s = skill as CustomSkill;
        if (!s.label) continue;
        const localSkill = this.skills.find((s) => s.slug === key);
        const newSkill: CustomSkill = {
          label: s.label,
          slug: sluggify(s.label),
          description: s.description || "",
          hidden: localSkill?.hidden ?? false,
          favourite: localSkill?.favourite ?? false,
          group: s.group ? sluggify(s.group) : undefined,
        };
        skills.set(newSkill.slug!, newSkill);
        continue;
      }
      if (skill.slug) {
        const existingSkill = game.ptr.data.skills.get(skill.slug);
        if (!existingSkill) continue;

        if (game.ptr.data.skills.isCustomSkill(existingSkill)) {
          const s = skill as CustomSkill;
          const update = foundry.utils.deepClone(existingSkill);
          update.label = s.label ?? existingSkill.label;
          update.slug = sluggify(s.label ?? existingSkill.label);
          update.group = sluggify(s.group ?? existingSkill.group!) || undefined;
          update.description = s.description ?? existingSkill.description;
          skills.set(update.slug, update);
        }
        else if (game.ptr.data.skills.isCoreSkill(existingSkill)) {
          const localSkill = this.skills.find((s) => s.slug === skill.slug);
          if (localSkill) {
            skills.set(skill.slug, {
              slug: skill.slug,
              favourite: localSkill.favourite,
              hidden: localSkill.hidden,
              group: existingSkill.group
            })
          }
        }
      }
    }

    for (const skill of this.skills) {
      if (skill.type === "core") {
        if ((skill.favourite && !["luck", "resources"].includes(skill.slug)) || skill.hidden || (!skill.favourite && ["luck", "resources"].includes(skill.slug))) {
          skills.set(skill.slug, {
            slug: skill.slug,
            favourite: skill.favourite,
            hidden: skill.hidden,
            group: skill.group
          });
        }
      }
    }

    game.settings.set("ptr2e", "skills", Array.from(skills.values()) as CustomSkill[]);
  }

  static async #createSkill(this: SkillsSettingsMenu) {
    this.skills.push({
      label: "New Skill",
      description: "",
      slug: `new-${this.newCounter++}`,
      type: "custom",
      group: undefined,
      favourite: false,
      hidden: false,
    });
    this.render({ parts: ["userSkills"] });
  }

  static async #deleteSkill(this: SkillsSettingsMenu, event: Event) {
    if (!event.currentTarget) return;

    const { slug } = ((event.currentTarget as HTMLElement).closest(".form-group[data-slug]") as HTMLElement).dataset;
    if (!slug) return;

    const index = this.skills.findIndex((s) => s.slug === slug);
    if (index === -1) return;

    foundry.applications.api.DialogV2.confirm({
      //@ts-expect-error - fvtt-types are incomplete
      window: {
        title: game.i18n.format("PTR2E.Settings.Skills.deleteSkill.Title", { name: this.skills[index].label }),
      },
      content: game.i18n.format("PTR2E.Settings.Skills.deleteSkill.Content", { name: this.skills[index].label }),
      //@ts-expect-error - fvtt-types are incomplete
      yes: {
        callback: () => {
          const index = this.skills.findIndex((s) => s.slug === slug);
          if (index === -1) return;

          this.skills.splice(index, 1);
          this.render({ parts: ["userSkills"] })
        }
      }
    });
  }

  static async #favouriteSkill(this: SkillsSettingsMenu, event: Event) {
    if (!event.currentTarget) return;

    const formGroup = (event.currentTarget as HTMLElement).closest(".form-group[data-slug]") as HTMLElement;

    const { slug } = formGroup?.dataset ?? {};
    if (!slug) return;

    const index = this.skills.findIndex((s) => s.slug === slug);
    if (index === -1) return;

    const inputs = formGroup.querySelectorAll<HTMLInputElement>("input, textarea");
    for (const input of inputs) {
      const key = input.name.split(".").pop();
      if (key && key in this.skills[index]) {
        this.skills[index][key] = input.value ?? this.skills[index][key];
      }
    }

    this.skills[index].favourite = !this.skills[index].favourite;
    if (this.skills[index].favourite && this.skills[index].hidden) {
      this.skills[index].hidden = false;
    }
    this.render({});
  }

  static async #hideSkill(this: SkillsSettingsMenu, event: Event) {
    if (!event.currentTarget) return;

    const formGroup = (event.currentTarget as HTMLElement).closest(".form-group[data-slug]") as HTMLElement;
    const { slug } = formGroup?.dataset ?? {};
    if (!slug) return;

    const index = this.skills.findIndex((s) => s.slug === slug);
    if (index === -1) return;

    const inputs = formGroup.querySelectorAll<HTMLInputElement>("input, textarea");
    for (const input of inputs) {
      const key = input.name.split(".").pop();
      if (key && key in this.skills[index]) {
        this.skills[index][key] = input.value ?? this.skills[index][key];
      }
    }

    this.skills[index].hidden = !this.skills[index].hidden;
    if (this.skills[index].hidden && this.skills[index].favourite) {
      this.skills[index].favourite = false;
    }
    this.render({});
  }
}

export { SkillsSettingsMenu };
