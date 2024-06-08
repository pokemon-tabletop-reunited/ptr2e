import { ActorPTR2e, ActorSheetPTR2e } from "@actor";
import { PTRTour } from "./base.ts";
import StatsForm from "@actor/sheets/stats-form.ts";

export class CharacterCreationTour extends PTRTour {
    protected override async _preStep(): Promise<void> {
        ui.sidebar.activateTab("actors");

        switch (this.currentStep?.id) {
            case "welcome":
                break;
            case "overview":
            case "favourite-skills":
            case "movement":
            case "stats":
            case "sidebar": {
                const sheet = await this.renderSheet();
                sheet.changeTab("overview", "sheet");
                await this.delay(250);
                break;
            }
            case "stats-editor": {
                const sheet = await this.renderSheet();
                sheet.changeTab("overview", "sheet");
                new StatsForm({document: sheet.document}).render(true)
                await this.delay(250);
                break;
            }
            case "actions":
            case "attacks": 
            case "other-attacks": {
                const sheet = await this.renderSheet();
                sheet.changeTab("actions", "sheet");
                sheet.changeTab("actionsCombat", "actions");
                await this.delay(250);
                break;
            }
            case "known-attacks": {
                const sheet = await this.renderSheet();
                sheet.changeTab("actions", "sheet");
                sheet.changeTab("actionsCombat", "actions");
                //@ts-expect-error - Params are unnecessary
                sheet.options.actions["edit-movelist"].call(sheet);
                await this.delay(250);
                break;
            }
            case "generic-actions": {
                const sheet = await this.renderSheet();
                sheet.changeTab("actions", "sheet");
                sheet.changeTab("actionsOther", "actions");
                await this.delay(250);
                break;
            }
            case "inventory": 
            case "inventoryPoints": {
                const sheet = await this.renderSheet();
                sheet.changeTab("inventory", "sheet");
                await this.delay(250);
                break;
            }
            case "skills":
            case "popout-skills":{
                const sheet = await this.renderSheet();
                sheet.changeTab("skills", "sheet");
                await this.delay(250);
                break;
            }
            case "edit-skills": {
                const sheet = await this.renderSheet();
                sheet.changeTab("skills", "sheet");
                //@ts-expect-error - Params are unnecessary
                sheet.options.actions["edit-skills"].call(sheet);
                await this.delay(250);
                break;
            }
            case "perks":
            case "traits": {
                const sheet = await this.renderSheet();
                sheet.changeTab("perks", "sheet");
                await this.delay(250);
                break;
            }
            case "effects": {
                const sheet = await this.renderSheet();
                sheet.changeTab("effects", "sheet");
                await this.delay(250);
                break;
            }
        }

    }

    protected override async _postStep(): Promise<void> {
        if(this.currentStep?.id === "known-attacks") {
            const sheet = foundry.applications.instances.get(`known-attacks-toursantempactor`) as ActorSheetPTR2e | undefined;
            if(sheet) sheet.close();
        }
        if(this.currentStep?.id === "stats-editor") {
            const sheet = foundry.applications.instances.get(`StatsForm-Actor.toursantempactor`) as ActorSheetPTR2e | undefined;
            if(sheet) sheet.close();
        }
        if(this.currentStep?.id === "edit-skills") {
            const sheet = foundry.applications.instances.get(`Skill-Editor-Actor.toursantempactor`) as ActorSheetPTR2e | undefined;
            if(sheet) sheet.close();
        }

        return await super._postStep();
    }

    override async complete(): Promise<void> {
        await this.cleanUp();
        return await super.complete();
    }

    override exit() {
        this.cleanUp();
        
        super.exit();
    }

    async cleanUp() {
        const sheet = foundry.applications.instances.get(`ActorSheetPTR2e-Actor.toursantempactor`) as ActorSheetPTR2e | undefined;
        if(sheet) sheet.close();

        const actorsToDelete = [];

        const tourSan = game.actors.get("toursantempactor") as ActorPTR2e;
        if(tourSan) actorsToDelete.push('toursantempactor')

        await Actor.deleteDocuments(actorsToDelete);
    }

    async renderSheet(): Promise<ActorSheetPTR2e> {
        const sheet = foundry.applications.instances.get(`ActorSheetPTR2e-Actor.toursantempactor`) as ActorSheetPTR2e | undefined;
        if(sheet) return await sheet.render(true);

        const {tourSan} = await this.getDocuments();
        return await tourSan.sheet.render(true) as unknown as ActorSheetPTR2e;
    }

    async getDocuments(): Promise<CharacterCreationTourDocuments> {
        const data = {
            tourSan: await (async () => {
                return game.actors.get("toursantempactor") as ActorPTR2e ?? CONFIG.PTR.Actor.documentClass.create({
                    name: "Tour-san",
                    type: "humanoid",
                    img: "/systems/ptr2e/img/tour-san.png",
                    _id: "toursantempactor",
                    items: [
                        {
                            "name": "Tackle",
                            "type": "move",
                            "img": "/systems/ptr2e/img/icons/normal_icon.png",
                            "system": {
                                "slug": "tackle",
                                "traits": [
                                    "push-1",
                                    "dash",
                                    "basic",
                                    "contact"
                                ],
                                "actions": [
                                    {
                                        "slug": "tackle",
                                        "name": "Tackle",
                                        "type": "attack",
                                        "traits": [
                                            "push-1",
                                            "dash",
                                            "basic",
                                            "contact"
                                        ],
                                        "range": {
                                            "target": "creature",
                                            "distance": 1,
                                            "unit": "m"
                                        },
                                        "cost": {
                                            "activation": "complex",
                                            "powerPoints": 1
                                        },
                                        "category": "physical",
                                        "power": 40,
                                        "accuracy": 100,
                                        "types": [
                                            "normal"
                                        ]
                                    }
                                ],
                                "grade": "E"
                            }
                        },
                        {
                            "name": "Pokeball",
                            "type": "consumable",
                            "img": "/systems/ptr2e/img/icons/item_icon.webp",
                        }
                    ],
                    effects: [
                        {
                            "_id": "faintedcondition",
                            "name": "Fainted",
                            "img": "/systems/ptr2e/img/conditions/fainted.svg",
                            "type": "passive",
                            "description": "<p>When a creature's HP reaches and remains at 0, it is afflicted with Fainted.</p><p>A Fainted creature cannot use Actions, does not benefit from Abilities, and is cured of all @Trait[major-condition], @Trait[minor-condition], @Trait[pseudo-affliction], and @Trait[stat-change] effects they possess.</p><p>Fainted is cured when the afflicted creature's HP is greater than 0.</p><p>The creature's @Affliction[weary] count increases by 1 whenever they are cured of Fainted.</p>",
                            "system": {
                                "changes": [],
                                "removeOnRecall": false,
                                "removeAfterCombat": false,
                                "traits": [],
                                "stacks": 0
                            },
                            "statuses": [
                                "dead"
                            ],
                        }
                    ]
                },  { keepId: true });
            })()
        }
        await this.delay(150);
        return data;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

interface CharacterCreationTourDocuments {
    tourSan: ActorPTR2e;
}