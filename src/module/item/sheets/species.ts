import { SpeciesPTR2e } from "@item";
import { DocumentSheetConfiguration, Tab } from "./document.ts";
import { SpeciesSystemSource } from "@item/data/index.ts";
import { sluggify } from "@utils";
import { default as ItemSheetPTR2e } from "./base.ts";
import * as R from "remeda";

export default class SpeciesSheet extends ItemSheetPTR2e<SpeciesPTR2e["system"]> {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["species-sheet"],
        },
        { inplace: false }
    );

    static override readonly overviewTemplate= "systems/ptr2e/templates/items/species/species-overview.hbs";
    static override readonly detailsTemplate= "systems/ptr2e/templates/items/species/species-details.hbs";
    override noActions: boolean = true;

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = R.omit(
        fu.mergeObject(super.PARTS, {
            overview: {
                template: SpeciesSheet.overviewTemplate,
            },
            details: {
                template: SpeciesSheet.detailsTemplate,
            },
        }, { inplace: false }),
        ["actions", "effects"]
    );

    override tabs: Record<string, Tab> = {
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

    override _attachPartListeners(
        partId: string,
        htmlElement: HTMLElement,
        options: DocumentSheetConfiguration<SpeciesPTR2e>
    ): void {
        super._attachPartListeners(partId, htmlElement, options);

        if (partId === "details") {
            const document = this.document;
            for (const element of htmlElement.querySelectorAll<HTMLElement>(
                ".item-controls a.item-control"
            )) {
                element.addEventListener("click", async (event) => {
                    event.preventDefault();
                    const action = element.dataset.action;
                    switch (action) {
                        case "add": {
                            const { field, subField } = element.dataset;

                            if (field === "movement") {
                                const movementArr = fu.deepClone(
                                    document.system.movement[
                                        subField as keyof typeof document.system.movement
                                    ]
                                );
                                movementArr.push({ type: "", value: 0 });
                                document.update({
                                    system: {
                                        movement: {
                                            [subField as keyof typeof document.system.movement]:
                                                movementArr,
                                        },
                                    },
                                });
                            }
                            break;
                        }
                        case "delete": {
                            const { field, subField, index } = element.dataset;
                            if (field === "movement" && subField && index) {
                                const movementArr = fu.deepClone(
                                    document.system.movement[
                                        subField as keyof typeof document.system.movement
                                    ]
                                );
                                movementArr.splice(parseInt(index ?? ""), 1);
                                document.update({
                                    system: {
                                        movement: {
                                            [subField as keyof typeof document.system.movement]:
                                                movementArr,
                                        },
                                    },
                                });
                            }
                            if (field === "skills" && index) {
                                document.update({
                                    system: {
                                        skills: {
                                            [`-=${index}`]: null,
                                        },
                                    },
                                });
                            }
                            break;
                        }
                    }
                });
            }
        }
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
            data.system.traits = data.system.traits.map((trait: { value: string }) => sluggify(trait.value));

            const skills: Record<string, number | null> = {};
            for (const [skill, skillData] of Object.entries( // @ts-expect-error
                data.system.skills as Record<string, { name: string; value: number }>
            )) {
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
}