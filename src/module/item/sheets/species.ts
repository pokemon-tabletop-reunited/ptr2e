import { ItemPTR2e, SpeciesPTR2e } from "@item";
import { DocumentSheetConfiguration, Tab } from "./document.ts";
import { SpeciesSystemSource } from "@item/data/index.ts";
import { htmlQueryAll, sluggify } from "@utils";
import { default as ItemSheetPTR2e } from "./base.ts";
import * as R from "remeda";
import { EvolutionData } from "@item/data/species.ts";

export default class SpeciesSheet extends ItemSheetPTR2e<SpeciesPTR2e["system"]> {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["species-sheet"],
            actions: {
                "copy-evolution-tree": SpeciesSheet.#copyEvolutionTree,
                "paste-evolution-tree": SpeciesSheet.#pasteEvolutionTree
            }
        },
        { inplace: false },
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
            evolution: {
                template: "systems/ptr2e/templates/items/species/species-evolution.hbs",
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
        evolution: {
            id: "evolution",
            group: "sheet",
            icon: "fa-solid fa-star",
            label: "PTR2E.SpeciesSheet.Tabs.evolution.label",
        },
    };

    // override changeTab(
    //     tab: string,
    //     group: string,
    //     {
    //         event,
    //         navElement,
    //         force = false,
    //         updatePosition = true,
    //     }: { event?: Event; navElement?: HTMLElement; force: boolean; updatePosition: boolean } = {
    //         force: false,
    //         updatePosition: true,
    //     }
    // ): void {
    //     super.changeTab(tab, group, { event, navElement, force, updatePosition });
    //     if (!updatePosition) return;

    //     if (tab === "details") {
    //         this.setPosition({ height: 1000, width: 870 });
    //     } else {
    //         this.setPosition({ height: 500, width: 550 });
    //     }
    // }

    override async _prepareContext() {
        return {
            ...(await super._prepareContext()),
            copyPresent: !!SpeciesSheet.copyInfo && SpeciesSheet.copyInfo !== this.document.system.evolutions,
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
        if(partId === "evolution") {
            for(const element of htmlQueryAll(htmlElement, ".evolution a[data-action]")) {
                element.addEventListener("click", async (event) => {
                    event.preventDefault();
                    const action = element.dataset.action;
                    switch (action) {
                        case "add-method": {
                            return SpeciesSheet.#addMethod.call(this, event);   
                        }
                        case "delete-method": {
                            return SpeciesSheet.#deleteMethod.call(this, event);
                        }
                        case "delete-evolution": {
                            return SpeciesSheet.#deleteEvolution.call(this, event);
                        }
                        case "open-sheet": {
                            const { uuid } = element.dataset;
                            if(!uuid) return;
                            const item = await fromUuid<ItemPTR2e>(uuid);
                            if(item) item.sheet?.render(true);    
                        }
                    }
                });
            }

            const evoFieldsets = htmlElement.querySelectorAll("fieldset.evos");
            htmlElement.addEventListener("dragover", (event) => {
                event.preventDefault();
                const target = (event.target as HTMLElement).closest("fieldset.evos");
                if (!target) return;
            
                // Remove the dragover class from all fieldset.evos elements
                evoFieldsets.forEach((fieldset) => fieldset.classList.remove("dragover"));
            
                // Add the dragover class to the current target
                target.classList.add("dragover");
            });
                        
            htmlElement.addEventListener("dragleave", (event) => {
                const target = (event.target as HTMLElement).closest("fieldset.evos");
                const relatedTarget = event.relatedTarget as HTMLElement;
                if (!target || target.contains(relatedTarget)) return;
                target.classList.remove("dragover");
            });

            for(const dropTarget of evoFieldsets) {
                dropTarget.addEventListener("drop", (event) => SpeciesSheet.#dropEvolution.call(this, event as DragEvent));
            }
        }
    }

    override _prepareSubmitData(_event: SubmitEvent, _form: HTMLFormElement, formData: FormDataExtended): Record<string, unknown> {
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

    static async #deleteEvolution(this: SpeciesSheet, event: Event): Promise<void> {
        event.preventDefault();
        const { field, index } = (event.currentTarget as HTMLElement).dataset;
        if(!field || !index) return;

        const arrayPath = field.split(".").slice(0, -1).join(".");

        const doc = this.document.toObject();
        const evolutions = doc.system.evolutions;
        const evos = fu.getProperty<EvolutionData[]>(doc, arrayPath) ?? [];
        evos.splice(parseInt(index), 1);
        this.document.update({"system.evolutions": evolutions})
    }

    static async #addMethod(this: SpeciesSheet, event: Event): Promise<void> {
        event.preventDefault();
        const { field } = (event.currentTarget as HTMLElement).dataset;
        if(!field) return;

        const doc = this.document.toObject();
        const evolutions: EvolutionData = doc.system.evolutions;
        const methods = fu.getProperty<EvolutionData['methods']>(doc, field) ?? [];
        methods.push({ type: "level", level: 20, operand: "and"});
        this.document.update({"system.evolutions": evolutions});
    }

    static async #deleteMethod(this: SpeciesSheet, event: Event): Promise<void> {
        event.preventDefault();
        const { field, index } = (event.currentTarget as HTMLElement).dataset;
        if(!field || !index) return;

        const doc = this.document.toObject();
        const evolutions: EvolutionData = doc.system.evolutions;
        const methods = fu.getProperty<EvolutionData['methods']>(doc, field) ?? [];
        methods.splice(parseInt(index), 1);
        this.document.update({"system.evolutions": evolutions});
    }

    static async #dropEvolution(this: SpeciesSheet, event: DragEvent): Promise<void> {
        event.preventDefault();
        const target = (event.target as HTMLElement).closest("fieldset.evos") as HTMLElement
        if (!target) return;
        target.classList.remove("dragover");

        const { path } = target.dataset;
        if(!path) return;

        const data = TextEditor.getDragEventData(event) as Record<string, string>;
        if(data.type !== "Item" || !data.uuid) return;
        const item = await fromUuid<ItemPTR2e>(data.uuid);
        if(!item || !(item instanceof ItemPTR2e)) return;

        const doc = this.document.toObject();
        if(path === "system.evolutions") {
            const newEvo = {
                name: item.name,
                uuid: item.uuid,
                methods: [],
                evolutions: doc.system.evolutions.evolutions
            }
            await this.document.update({"system.evolutions": newEvo});
            return;
        }
        const evolutions: EvolutionData['_source'][] = fu.getProperty(doc, path);
        evolutions.push({
            name: item.name,
            uuid: item.uuid,
            methods: [],
            evolutions: []
        });
        
        await this.document.update({"system.evolutions": doc.system.evolutions});
        return;
    }

    static #copyEvolutionTree(this: SpeciesSheet, event: Event) {
        event.preventDefault();
        const evolutions = this.document.system.evolutions;
        SpeciesSheet.copyInfo = evolutions;
        ui.notifications.info(game.i18n.format(`PTR2E.SpeciesSheet.evolutions.copyPasteTree.copy`,{name: this.document.name}) );

        for(const sheet of foundry.applications.instances.values()) {
            if(!(sheet instanceof SpeciesSheet) || sheet.document.id === this.document.id) continue;
            sheet.render({parts: ["details"]});
        }
    }

    static #pasteEvolutionTree(this: SpeciesSheet, event: Event) {
        event.preventDefault();
        if(SpeciesSheet.copyInfo === null) return;

        const copyInfo = SpeciesSheet.copyInfo;
        foundry.applications.api.DialogV2.confirm({
            window: {
                title: game.i18n.localize(`PTR2E.SpeciesSheet.evolutions.copyPasteTree.paste.title`)
            },
            content: game.i18n.format(`PTR2E.SpeciesSheet.evolutions.copyPasteTree.paste.content`,{thisName: this.document.name, copyName: copyInfo.name}),
            yes: {
                callback: async () => {
                    await this.document.update({"system.evolutions": copyInfo});
                    ui.notifications.info(game.i18n.format(`PTR2E.SpeciesSheet.evolutions.copyPasteTree.paste.success`,{name: copyInfo.name}))
                }
            }
        });
    }

    public static copyInfo: null | EvolutionData = null;
}