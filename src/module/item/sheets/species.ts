import { SpeciesPTR2e } from "@item";
import { DocumentSheetConfiguration, DocumentSheetV2 } from "./document.ts";
import Tagify from "@yaireo/tagify";
import GithubManager from "@module/apps/github.ts";
import { SpeciesSystemSource } from "@item/data/index.ts";
import { sluggify } from "@utils";

type Tab = {
    id: string;
    group: string;
    icon: string;
    label: string;
    active?: boolean;
    cssClass?: string;
};

export default class SpeciesSheetPTR2eV2 extends foundry.applications.api.HandlebarsApplicationMixin(
    DocumentSheetV2<SpeciesPTR2e>
) {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["species-sheet"],
            position: {
                height: 450,
                width: 550,
            },
            actions: {
                toChat: this.#toChat,
                toGithub: GithubManager.commitItemToGithub,
            },
            form: {
                submitOnChange: true,
                closeOnSubmit: false,
            },
        },
        { inplace: false }
    );

    #allTraits: { value: string; label: string }[] | undefined;

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        header: {
            id: "header",
            template: "/systems/ptr2e/templates/items/parts/item-header.hbs",
        },
        tabs: {
            id: "tabs",
            template: "/systems/ptr2e/templates/items/parts/item-tabs.hbs",
        },
        traits: {
            id: "traits",
            template: "/systems/ptr2e/templates/items/parts/item-traits.hbs",
        },
        overview: {
            id: "overview",
            template: "/systems/ptr2e/templates/items/species/species-overview.hbs",
        },
        details: {
            id: "details",
            template: "/systems/ptr2e/templates/items/species/species-details.hbs",
            scrollable: [".scroll"]
        },
    };

    tabGroups: Record<string, string> = {
        sheet: "overview",
    };

    tabs: Record<string, Tab> = {
        overview: {
            id: "overview",
            group: "sheet",
            icon: "fa-solid fa-house",
            label: "PTR2E.SpeciesSheet.Tabs.overview.label",
        },
        details: {
            id: "details",
            group: "sheet",
            icon: "fa-solid fa-cogs",
            label: "PTR2E.SpeciesSheet.Tabs.details.label",
        },
    };

    _getTabs() {
        for (const v of Object.values(this.tabs)) {
            v.active = this.tabGroups[v.group] === v.id;
            v.cssClass = v.active ? "active" : "";
        }
        return this.tabs;
    }

    override changeTab(
        tab: string,
        group: string,
        {
            event,
            navElement,
            force = false,
            updatePosition = true,
        }: { event?: Event; navElement?: HTMLElement; force: boolean; updatePosition: boolean } = {
            force: false,
            updatePosition: true,
        }
    ): void {
        super.changeTab(tab, group, { event, navElement, force, updatePosition });
        if (!updatePosition) return;

        if (tab === "details") {
            this.setPosition({ height: 1000, width: 870 });
        } else {
            this.setPosition({ height: 450, width: 550 });
        }
    }

    override async _prepareContext() {
        const traits = await (async () => {
            const traits = [];
            for (const trait of this.document.system.traits.values()) {
                traits.push({
                    value: trait.slug,
                    label: trait.label,
                });
            }
            return traits;
        })();

        if (!this.#allTraits) {
            this.#allTraits = [];
            for (const trait of game.ptr.data.traits.values()) {
                this.#allTraits.push({
                    value: trait.slug,
                    label: trait.label,
                });
            }
        }

        return {
            ...((await super._prepareContext()) as Record<string, unknown>),
            item: this.document,
            source: this.document.toObject(),
            fields: this.document.system.schema.fields,
            tabs: this._getTabs(),
            traits,
        };
    }

    override async _renderFrame(options: DocumentSheetConfiguration<SpeciesPTR2e>) {
        const frame = await super._renderFrame(options);

        // Add send to chat button
        const toChatLabel = game.i18n.localize("PTR2E.SpeciesSheet.SendToChatLabel");
        const toChat = `<button type="button" class="header-control fa-solid fa-arrow-up-right-from-square" data-action="toChat"
                                data-tooltip="${toChatLabel}" aria-label="${toChatLabel}"></button>`;
        this.window.controls.insertAdjacentHTML("afterend", toChat);

        if (game.settings.get("ptr2e", "dev-mode")) {
            // Add send to chat button
            const commitToGithubLabel = game.i18n.localize("PTR2E.UI.DevMode.CommitToGithub.Label");
            const commitToGithub = `<button type="button" class="header-control fa-solid fa-upload" data-action="toGithub"
                                    data-tooltip="${commitToGithubLabel}" aria-label="${commitToGithubLabel}"></button>`;
            this.window.controls.insertAdjacentHTML("afterend", commitToGithub);
        }

        return frame;
    }

    override _attachPartListeners(
        partId: string,
        htmlElement: HTMLElement,
        options: DocumentSheetConfiguration<SpeciesPTR2e>
    ): void {
        super._attachPartListeners(partId, htmlElement, options);

        if (partId === "traits") {
            for (const input of htmlElement.querySelectorAll<HTMLInputElement>(
                "input.ptr2e-tagify"
            )) {
                new Tagify(input, {
                    enforceWhitelist: false,
                    keepInvalidTags: false,
                    editTags: false,
                    tagTextProp: "label",
                    dropdown: {
                        enabled: 0,
                        mapValueTo: "label",
                    },
                    templates: {
                        tag: function (tagData): string {
                            return `
                            <tag contenteditable="false" spellcheck="false" tabindex="-1" class="tagify__tag" ${this.getAttributes(
                                tagData
                            )}>
                            <x title="" class="tagify__tag__removeBtn" role="button" aria-label="remove tag"></x>
                            <div>
                                <span class='tagify__tag-text'>
                                    <span class="trait" data-tooltip-direction="UP" data-trait="${
                                        tagData.value
                                    }" data-tooltip="${
                                        tagData.label
                                    }"><span>[</span><span class="tag">${
                                        tagData.label
                                    }</span><span>]</span></span>
                                </span>
                            </div>
                            `;
                        },
                    },
                    whitelist: this.#allTraits,
                });
            }
        }

        if(partId === "details") {
            const document = this.document;
            for(const element of htmlElement.querySelectorAll<HTMLElement>(".item-controls a.item-control")) {
                element.addEventListener("click", async (event) => {
                    event.preventDefault();
                    const action = element.dataset.action;
                    switch(action) {
                        case "add": {
                            const {field, subField} = element.dataset;

                            if(field === "movement") {
                                const movementArr = fu.deepClone(document.system.movement[subField as keyof typeof document.system.movement]);
                                movementArr.push({ type: "", value: 0 });
                                document.update({
                                    system: {
                                        movement: {
                                            [subField as keyof typeof document.system.movement]: movementArr
                                        }
                                    }
                                })
                            }
                            break;
                        }
                        case "delete": {
                            const {field, subField, index} = element.dataset;
                            if(field === "movement" && subField && index) {
                                const movementArr = fu.deepClone(document.system.movement[subField as keyof typeof document.system.movement]);
                                movementArr.splice(parseInt(index??""), 1);
                                document.update({
                                    system: {
                                        movement: {
                                            [subField as keyof typeof document.system.movement]: movementArr
                                        }
                                    }
                                })
                            }
                            if(field === "skills" && index) {
                                document.update({
                                    system: {
                                        skills: {
                                            [`-=${index}`]: null
                                        }
                                    }
                                })
                            }
                            break;
                        }
                    }
                });
            }
        }
    }

    override _onRender(): void {
        for(const stringTags of this.element.querySelectorAll<HTMLElement>("string-tags")) {
            const path = stringTags.getAttribute("name");
            const validate = (() => {
                if(path?.startsWith("system.")) {
                    const systemPath = path.split(".");
                    if(systemPath.length === 2) {
                        const field = this.document.system.schema.fields[systemPath[1]] as foundry.data.fields.SetField<foundry.data.fields.StringField>;
                        return field.element.validate.bind(field.element);
                    }
                    let current = this.document.system.schema.fields;
                    const pathParts = systemPath.slice(1);
                    for(let i = 0; i < pathParts.length; i++) {
                        let field = current[pathParts[i]] as foundry.data.fields.SetField<foundry.data.fields.StringField> | foundry.data.fields.SchemaField<foundry.data.fields.DataSchema>;
                        if(!field) return;
                        if(field instanceof foundry.data.fields.SchemaField) {
                            current = field.fields;
                            continue;
                        }
                        if(field instanceof foundry.data.fields.SetField) {
                            return field.element.validate.bind(field.element);
                        }
                        return null;
                    }
                }
                return null;
            })();

            for(const button of stringTags.querySelectorAll("button.icon.fa-solid.fa-tag, a.button.remove.fa-solid.fa-times")) {
                button.addEventListener("click", (_event) => {
                    setTimeout(() => {
                        this.element.dispatchEvent(new Event("submit"));
                    }, 100);
                })
            }
            //@ts-expect-error
            stringTags._validateTag = (tag: string): boolean => {
                if(validate) {
                    const result = validate(tag);
                    if(result) throw result.asError();
                }
                return true;
            }
        }
    }

    protected override async _onSubmitForm(event: Event | SubmitEvent): Promise<void> {
        if (event.target) {
            const target = event.target as HTMLElement;
            if (target.parentElement?.nodeName === "STRING-TAGS") {
                event.stopImmediatePropagation();
                return;
            }
        }
        return super._onSubmitForm(event);
    }

    override _prepareSubmitData(formData: FormDataExtended): Record<string, unknown> {
        const data = fu.expandObject(formData.object);
        function isSystem(system: unknown): system is SpeciesSystemSource["system"] {
            return (
                typeof system === "object" &&
                system !== null &&
                "traits" in system &&
                "abilities" in system
            );
        }

        if (
            "system" in data &&
            data.system &&
            typeof data.system === "object" &&
            isSystem(data.system)
        ) {
            // Traits are stored as an array of objects, but we only need the values
            // @ts-expect-error
            data.system.traits = data.system.traits.map((trait: { value: string }) => trait.value);

            data.system.abilities = {
                starting: (data.system.abilities.starting ?? []).map((ability) =>
                    sluggify(ability)
                ),
                basic: (data.system.abilities.basic ?? []).map((ability) => sluggify(ability)),
                advanced: (data.system.abilities.advanced ?? []).map((ability) =>
                    sluggify(ability)
                ),
                master: (data.system.abilities.master ?? []).map((ability) => sluggify(ability)),
            };

            data.system.diet = (data.system.diet ?? []).map((diet) => sluggify(diet));
            data.system.habitat = (data.system.habitat ?? []).map((habitat) => sluggify(habitat));
            data.system.eggGroups = (data.system.eggGroups ?? []).map((eggGroup) =>
                sluggify(eggGroup)
            );

            const skills: Record<string, number | null> = {};
            // @ts-expect-error
            for (const [skill, skillData] of Object.entries(data.system.skills as Record<string, { name: string; value: number }>)) {
                if (skill === "new") {
                    if (skillData.name) {
                        skills[sluggify(skillData.name)] = skillData.value;
                    }
                    continue;
                }
                if (skill === sluggify(skillData.name)) {
                    skills[skill] = skillData.value;
                    continue;
                } else {
                    skills[sluggify(skillData.name)] = skillData.value;
                    skills["-=" + skill] = null;
                }
            }
            // set data.system.skills equal to skills but sort it by key first
            data.system.skills = skills as Record<string, number>;
        }

        return data;
    }

    static async #toChat(this: SpeciesSheetPTR2eV2, _event: Event) {
        return this.document.toChat();
    }
}
