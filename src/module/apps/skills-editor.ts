import { ActorPTR2e, Skill } from "@actor";
import { SkillsComponent } from "@actor/components/skills-component.ts";
import SkillPTR2e from "@module/data/models/skill.ts";
import { htmlQueryAll } from "@utils";


type SkillBeingEdited = SkillPTR2e["_source"] & { label: string; max: number; min: number, total: number };

export class SkillsEditor extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {
  static override DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["sheet skill-sheet"],
    position: {
      height: 'auto' as const,
      width: 550,
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
      "toggle-sort": async function (this: SkillsEditor) {
        this.sort = this.sort === "a" ? "v" : "a";
        this.render({ parts: ["skills"] });
      },
      "toggle-override": async function (this: SkillsEditor) {
        if (!game.user.isGM) return void ui.notifications.warn("Only GMs can use the Override Submit feature.");
        await this.document.setFlag("ptr2e", "overrideSkillValidation", !this.document.flags.ptr2e?.overrideSkillValidation);
        this.render({ parts: ["skills"] });
      }
    },
  };

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
    skills: {
      id: "skills",
      template: "systems/ptr2e/templates/apps/skills-editor.hbs",
    }
  };

  document: ActorPTR2e;
  // skills: SkillBeingEdited[];
  filter: SearchFilter;
  sort: "a" | "v" = "a";

  override get title() {
    return `${this.document.name}'s Skills Editor`;
  }

  skills: SkillBeingEdited[];

  constructor(
    document: ActorPTR2e,
    options: Partial<foundry.applications.api.ApplicationConfiguration> = {}
  ) {
    options.id = `Skill-Editor-${document.uuid}`;
    super(options);
    this.document = document;
    this.skills = this.resetSkills();
    this.filter = new foundry.applications.ux.SearchFilter({
      inputSelector: "input[name='filter']",
      contentSelector: "fieldset.skills .scroll",
      callback: this._onSearchFilter.bind(this),
    });
  }

  resetSkills(): this["skills"] {
    const { skills, hideHiddenSkills } = SkillsComponent.prepareSkillsData(this.document);

    const convertSkill = (skill: Skill) => {
      if (game.i18n.has(`PTR2E.Skills.${skill.group ? `${skill.group}.${skill.slug}` : skill.slug}.label`)) {
        const label = game.i18n.format(
          `PTR2E.Skills.${skill.group ? `${skill.group}.${skill.slug}` : skill.slug
          }.label`
        );
        return [{
          ...skill,
          label,
          max: 70,
          min: skill?.slug === 'resources' ? -((skill?.value ?? 0) - 10 - ((skill?.rvs ?? 0) < 0 ? -skill.rvs! : 0)) : -(skill?.rvs ?? 0),
        }];
      } else {
        const skillData = game.ptr.data.skills.get(skill.slug);
        if (skillData && game.ptr.data.skills.isCustomSkill(skillData)) {
          return [{
            ...skill,
            label: skillData.label || Handlebars.helpers.formatSlug(skill.slug),
            max: 70,
            min: skill?.slug === 'resources' ? -((skill?.value ?? 0) - 10 - ((skill?.rvs ?? 0) < 0 ? -skill.rvs! : 0)) : -(skill?.rvs ?? 0),
          }];
        }
      }
      return []
    }

    return [
      ...skills.favourites.flatMap((group) => group.skills.flatMap(convertSkill) as unknown as SkillBeingEdited[]),
      ...skills.normal.flatMap((group) => group.skills.flatMap(convertSkill) as unknown as SkillBeingEdited[]),
      ...(hideHiddenSkills ? [] : skills.hidden.flatMap((group) => group.skills.flatMap(convertSkill) as unknown as SkillBeingEdited[])),
    ]
  }

  override async _prepareContext() {
    const points: {
      total: number;
      spent: number;
      available: number;
    } = {
      total: this.document.system.advancement.rvs.total,
      spent: this.document.system.advancement.rvs.spent,
      available: 0
    };
    Object.defineProperty(points, "available", {
      get: () => points.total - points.spent,
      enumerable: true,
    });
    const levelOne = this.document.system.advancement.level === 1 || !this.document.flags.ptr2e?.editedSkills;

    // clamp the max to not exceed the available points
    const skills = this.skills.map((s) => ({
      ...s,
      max: Math.max(s.min, Math.min(s.max, points.available!)),
    })).sort((a, b) => {
      if (a.slug === "luck") return -1;
      if (b.slug === "luck") return 1;
      if (a.slug === "resources") return -1;
      if (b.slug === "resources") return 1;
      function alphaSort(a: SkillBeingEdited, b: SkillBeingEdited) {
        if (a.group === b.group) return a.label.localeCompare(b.label);
        if (!a.group) return -1;
        if (!b.group) return 1;
        return a.group.localeCompare(b.group);
      }
      if (this.sort === "a") {
        return alphaSort(a, b);
      }
      else {
        if (a.total === b.total) {
          return (b.value === a.value ? alphaSort(a, b) : b.value - a.value);
        }
        return b.total - a.total;
      }
    })

    // check if this configuration is valid, and can pass validation
    // const valid = points.available >= 0 && !skills.some((skill) => (skill.slug === "resources" ? (skill.investment <= -skill.value) : (skill.investment < skill.min)) || skill.investment > skill.max);

    return {
      document: this.document,
      skills,
      points,
      isReroll:
        !levelOne || (levelOne && this.document.system.skills["luck"]!.value! > 1),
      levelOne,
      valid: points.available >= 0,
      overrideValidation: !!this.document.flags.ptr2e?.overrideSkillValidation,
      sort: this.sort === "a",
      hasLuck: this.document.traits.has("ace"),
    };
  }

  override async render(options: boolean | foundry.applications.api.ApplicationRenderOptions, _options?: foundry.applications.api.ApplicationRenderOptions): Promise<this> {
    const scrollTop = this.element?.querySelector(".scroll")?.scrollTop;
    const renderResult = await super.render(options, _options);
    // set the scroll location
    if (scrollTop) {
      const scroll = this.element.querySelector(".scroll");
      if (scroll !== null) scroll.scrollTop = scrollTop;
    }
    return renderResult;
  }

  override _attachPartListeners(
    partId: string,
    htmlElement: HTMLElement,
    options: foundry.applications.api.HandlebarsRenderOptions
  ): void {
    super._attachPartListeners(partId, htmlElement, options);
    if (partId !== "skills") return;
    const availableLabel = htmlElement.querySelector<HTMLElement>("#points-available-label"),
      spentLabel = htmlElement.querySelector<HTMLElement>("#points-spent-label");
    if (!availableLabel || !spentLabel) return void ui.notifications.error("Something went wrong trying to render the Skills Editor.");
    const shouldOverrideValidation = this.document.flags.ptr2e?.overrideSkillValidation ?? false;

    for (const input of htmlQueryAll<HTMLInputElement>(htmlElement, ".skill input")) {
      input.addEventListener("focus", () => {

        const slug = input.dataset.slug;
        const skill = this.skills.find((skill) => skill.slug === slug);
        if (!slug || !skill) return;

        input.dataset.prevValue = input.value;
        input.value = "";
        input.placeholder = `${skill.min} / +${shouldOverrideValidation ? "∞" : (skill.max - (skill.rvs ?? 0))}`;
        async function handleBlur(this: SkillsEditor) {
          const newValue = parseInt(input.value);
          if (isNaN(newValue) || newValue === 0) {
            input.value = input.dataset.prevValue || "0";
            delete input.dataset.prevValue;
            return;
          }

          if (!skill || !slug) {
            input.value = input.dataset.prevValue || "0";
            delete input.dataset.prevValue;
            return;
          }

          const newRvs = Math.clamp((skill.rvs ?? 0) + newValue, skill.min, shouldOverrideValidation ? Infinity : skill.max);
          if (newRvs === skill.rvs) {
            if (skill.rvs === skill.max) {
              ui.notifications.warn(`Woops! The maximum investment for ${skill.label} is ${skill.max}, you cannot invest more.`);
            }
            else if (skill.rvs === skill.min) {
              ui.notifications.warn(`Woops! The minimum investment for ${skill.label} is ${skill.min}, you cannot reduce it further.`);
            }
            input.value = String(skill.rvs);
            delete input.dataset.prevValue;
            return;
          }

          skill.rvs = newRvs;
          input.value = String(skill.rvs);
          delete input.dataset.prevValue;

          await this.document.update({
            "system.skills": {
              [slug]: {
                ...this.document.system.skills[slug],
                rvs: skill.rvs,
              }
            }
          })
          if (spentLabel) spentLabel.textContent = `${this.document.system.advancement.rvs.spent} / ${this.document.system.advancement.rvs.total}`;
          if (availableLabel) {
            availableLabel.textContent = this.document.system.advancement.rvs.available.toString();
            if( this.document.system.advancement.rvs.available < 0 ) {
              availableLabel.classList.add("invalid");
            } else {
              availableLabel.classList.remove("invalid");
            }
          }
        }
        input.addEventListener("blur", handleBlur.bind(this), { once: true });
      });
    }

    this.filter.bind(this.element);
  }

  _onSearchFilter(_event: KeyboardEvent, query: string, rgx: RegExp, html: HTMLElement) {
    for (const entry of html.querySelectorAll<HTMLAnchorElement>("div.skill")) {
      if (!query) {
        entry.classList.remove("hidden");
        continue;
      }
      const { slug, group } = entry.dataset;
      const match = (slug && rgx.test(foundry.applications.ux.SearchFilter.cleanQuery(slug))) || (group && rgx.test(foundry.applications.ux.SearchFilter.cleanQuery(group)));
      entry.classList.toggle("hidden", !match);
    }
  }

  static #onResetSkills(this: SkillsEditor) {
    const document = this.document;

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
          await document.update({"system.==skills": {}});
          this.skills = this.resetSkills();
          this.render({});
        },
      },
    });
  }

  static #onChangeResources(this: SkillsEditor) {
    const document = this.document;
    const resources = document.system.skills.resources
    if (!resources) return;

    foundry.applications.api.DialogV2.prompt({
      window: {
        title: game.i18n.format("PTR2E.SkillsEditor.ChangeResources.title", {
          name: document.name,
        }),
      },
      content: (() => {
        const htmlString = game.i18n.format("PTR2E.SkillsEditor.ChangeResources.content", {
          name: document.name,
          value: resources.total,
        });
        const html = globalThis.document.createElement("div");
        html.innerHTML = htmlString;
        return html;
      })(),
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
          const resources = this.skills.find((skill) => skill.slug === "resources")!;
          if (resources.value + (resources.rvs ?? 0) + value < 1) {
            ui.notifications.warn(
              game.i18n.format("PTR2E.SkillsEditor.ChangeResources.warn", {
                name: document.name,
              })
            );
            return;
          }

          this.skills.find((skill) => skill.slug === "resources")!.rvs =
            (resources.rvs ?? 0) + value;

          await document.update({
            "system.skills.resources": {
              ...document.system.skills.resources,
              rvs: (document.system.skills.resources.rvs ?? 0) + value,
            }
          })
          this.render({});
        },
      },
    });
  }

  static #onChangeLuck(this: SkillsEditor) {
    const document = this.document;
    const luck = document.system.skills.luck
    if (!luck) return;

    foundry.applications.api.DialogV2.prompt({
      window: {
        title: game.i18n.format("PTR2E.SkillsEditor.ChangeLuck.title", {
          name: document.name,
        }),
      },
      content: (() => {
        const htmlString = game.i18n.format("PTR2E.SkillsEditor.ChangeLuck.content", {
          name: document.name,
          value: luck.total,
        });
        const html = globalThis.document.createElement("div");
        html.innerHTML = htmlString;
        return html;
      })(),
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
          const luck = this.skills.find((skill) => skill.slug === "luck")!;
          if (luck.value + value <= 0) {
            ui.notifications.warn(
              game.i18n.format("PTR2E.SkillsEditor.ChangeLuck.warn", {
                name: document.name,
              })
            );
            return;
          }

          this.skills.find((skill) => skill.slug === "luck")!.value =
            (luck.value ?? 0) + value;

          await document.update({
            "system.skills.luck": {
              ...document.system.skills.luck,
              value: (document.system.skills.luck.value ?? 0) + value,
            }
          });
          this.render({});
        },
      },
    });
  }

  static async #onRollLuck(this: SkillsEditor) {
    const document = this.document;
    const luck = document.system.skills.luck
    if (!luck) return;

    const levelOne = this.document.system.advancement.level === 1;
    const isReroll =
      !levelOne || (levelOne && this.document.system.skills.luck!.value! > 1);

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

      this.skills.find((skill) => skill.slug === "luck")!.value = roll.total;
      await document.update({
        "system.skills.luck": {
          ...document.system.skills.luck,
          value: roll.total,
        }
      });
      this.render({});
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
      content: (() => {
        const htmlString = game.i18n.format("PTR2E.SkillsEditor.RollLuck.content", {
          name: document.name,
        })
        const html = globalThis.document.createElement("div");
        html.innerHTML = htmlString;
        return html;
      })(),
      yes: {
        callback: rollAndApplyLuck.bind(this, true),
      },
    });
  }
}
