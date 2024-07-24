import { ActorPTR2e } from "@actor";
import { ActorSystemPTR2e } from "./index.ts";
import { SpeciesDropSheet } from "@actor/sheets/species-drop-sheet.ts";
import { AbilityPTR2e, ItemPTR2e, MovePTR2e } from "@item";
import { SpeciesSystemModel } from "@item/data/index.ts";
import natureData from "@scripts/config/natures.ts";
import { htmlQuery, ImageResolver, sluggify } from "@utils";
import { AttackPTR2e } from "@data";
import { Progress } from "src/util/progress.ts";
import { LevelUpMoveSchema } from "@item/data/species.ts";

class PokemonActorSystem extends ActorSystemPTR2e {
    declare parent: ActorPTR2e<this>;

    static abilitiesMap: Map<string, AbilityPTR2e> | null = null;

    override async _preCreate(
        data: this["parent"]["_source"],
        options: DocumentModificationContext<this["parent"]["parent"]> & { fail?: boolean },
        user: User
    ) {
        if (!this._source.species) {
            const promise = await new Promise<ItemPTR2e<SpeciesSystemModel> | null>((resolve) => {
                const app = new SpeciesDropSheet(resolve);
                app.render(true);
            });

            if (promise instanceof ItemPTR2e && promise.system instanceof SpeciesSystemModel) {
                this.updateSource({ species: promise.toObject().system });
                if (data.name.includes(game.i18n.localize("TYPES.Actor.pokemon"))) {
                    this.parent.updateSource({ name: promise.name });
                }
                if ((!data.img || data.img === "icons/svg/mystery-man.svg") && promise.img) {
                    this.parent.updateSource({ img: promise.img });
                }
                await this._preCreateGenerateSpeciesData(this._source.species as unknown as NonNullable<this['_source']['species']>);
                return true;
            }

            options.fail = true;
            return false;
        }
        await this._preCreateGenerateSpeciesData(this._source.species);

        return await super._preCreate(data, options, user);
    }

    async _preCreateGenerateSpeciesData(species: NonNullable<this['_source']['species']>) {
        const progress = new Progress({steps: 5});
        progress.advance(game.i18n.localize("PTR2E.PokemonGeneration.Progress.Prefix")+game.i18n.localize("PTR2E.PokemonGeneration.Progress.Step1"));

        // TODO: Change this into a proper App.
        const { minLevel, maxLevel, shinyChance, preventEvolution, linkToken } =
            await (async (): Promise<{
                minLevel: number;
                maxLevel: number;
                shinyChance: number;
                preventEvolution: boolean;
                linkToken: boolean;
            }> => {
                const {
                    minLevel,
                    maxLevel
                } = await (async (): Promise<{
                    minLevel?: number;
                    maxLevel?: number;
                }> => {
                    try {
                        return await foundry.applications.api.DialogV2.prompt<{
                            minLevel: number;
                            maxLevel: number;
                        }>({
                            window: {
                                title: `Generating ${species.slug || this.parent.name}`,
                            },
                            content: `
                                <header class="mb-2 center-text">Level Range (min-max)</header>
                                <content class="center-text d-flex flex-row align-items-center justify-content-evenly">
                                    <input class="fb-45" type="number" name="min-level" value="5" data-tooltip="Min Level"/>
                                    <input class="fb-45" type="number" name="max-level" value="5" data-tooltip="Max Level"/>
                                </content>
                            `,
                            ok: {
                                action: 'ok',
                                label: "Generate",
                                callback: (_event, _target, element) => {
                                    const form = htmlQuery(element, "form");
                                    if(!form) return null;
                                    const formData = new FormDataExtended(form);
                                    return {
                                        minLevel: formData.object["min-level"],
                                        maxLevel: formData.object["max-level"],
                                    };
                                }
                            }
                        });
                    }
                    catch {
                        return {};
                    }
                })();

                // TODO: Prompt for additional info. For now, just return hardcoded values
                return {
                    minLevel: minLevel || 5,
                    maxLevel: maxLevel || 5,
                    shinyChance: 1,
                    preventEvolution: false,
                    linkToken: false,
                };
            })();

        const level =
            minLevel === maxLevel
                ? minLevel
                : Math.clamp(
                      Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel,
                      0,
                      100
                  );
        const experience = (3 * Math.pow(level, 3)) / 6;

        const shiny = Math.random() < shinyChance / 100;

        const gender =
            species.genderRatio === -1
                ? "genderless"
                : Math.random() < species.genderRatio / 8
                  ? "male"
                  : "female";

        progress.advance(game.i18n.localize("PTR2E.PokemonGeneration.Progress.Prefix")+game.i18n.localize("PTR2E.PokemonGeneration.Progress.Step2"));

        const evolution = await (async (): Promise<NonNullable<this['_source']['species']>> => {
            if (preventEvolution) return species;
            // TODO: Implement evolutions
            return species;
        })();

        const size = (() => {
            switch (species.size.category) {
                case "max":
                    return { width: 6, height: 6 };
                case "titanic":
                    return { width: 5, height: 5 };
                case "gigantic":
                    return { width: 4, height: 4 };
                case "huge":
                    return { width: 3, height: 3 };
                case "large":
                    return { width: 2, height: 2 };
                case "medium":
                    return { width: 1, height: 1 };
                case "small":
                    return { width: 0.75, height: 0.75 };
                case "tiny":
                case "diminutive":
                    return { width: 0.5, height: 0.5 };
                default:
                    return { width: 1, height: 1 };
            }
        })();

        const nature = (() => {
            const natures = Object.keys(natureData);
            return natures[Math.floor(Math.random() * natures.length)] as keyof typeof natureData;
        })();

        const stats = (() => {
            const randomPoints = Math.ceil(Math.random() * 508 * 0.25);

            class weightedBag<T> {
                entries: { entry: T; weight: number }[] = [];
                total = 0;
                addEntry(entry: T, weight: number) {
                    this.total += weight;
                    this.entries.push({ entry, weight: this.total });
                }
                get() {
                    return this.entries.find((entry) => entry.weight >= Math.random() * this.total)!
                        .entry;
                }
            }

            const calculateStats = (points: number, weighted: boolean) => {
                const bag = new weightedBag<keyof typeof stats>();
                const stats = {} as Record<keyof typeof evolution.stats, number>;

                for (const key in evolution.stats) {
                    stats[key as keyof typeof stats] = 0;
                    bag.addEntry(
                        key as keyof typeof stats,
                        weighted ? evolution.stats[key as keyof typeof evolution.stats] as number : 1
                    );
                }

                for (let i = 0; i < points; i++) {
                    stats[bag.get()]++;
                }
                return stats;
            };

            const weightedStats = calculateStats(508 - randomPoints, true);
            const randomStats = calculateStats(randomPoints, false);

            return Object.keys(evolution.stats).reduce(
                (acc, key) => {
                    const stat = key as keyof typeof evolution.stats;
                    acc[stat] = { evs: weightedStats[stat] + randomStats[stat] };
                    return acc;
                },
                {} as Record<keyof typeof evolution.stats, { evs: number }>
            );
        })();

        progress.advance(game.i18n.localize("PTR2E.PokemonGeneration.Progress.Prefix")+game.i18n.localize("PTR2E.PokemonGeneration.Progress.Step3"));

        const moves: MovePTR2e["_source"][] = await (async () => {
            const levelUpMoves = (species.moves.levelUp as ModelPropsFromSchema<LevelUpMoveSchema>[]).filter((move) => move.level <= level);

            const moveItems = await Promise.all(
                levelUpMoves.map(async (move) => fromUuid(move.uuid))
            );
            return moveItems.reduce(
                (acc, move, index) => {
                    if (move && move instanceof ItemPTR2e) {
                        const moveData = move.toObject();
                        if (index < 6) {
                            const actions = moveData.system.actions as AttackPTR2e["_source"][];
                            if (actions.length) {
                                actions[0].slot = index;
                            }
                        }
                        acc.push(moveData);
                    }
                    return acc;
                },
                [] as MovePTR2e["_source"][]
            );
        })();

        progress.advance(game.i18n.localize("PTR2E.PokemonGeneration.Progress.Prefix")+game.i18n.localize("PTR2E.PokemonGeneration.Progress.Step4"));

        const abilities: AbilityPTR2e["_source"][] = await (async () => {
            const sets = [species.abilities.starting];
            if (level >= 20) sets.push(species.abilities.basic);
            if (level >= 50) sets.push(species.abilities.advanced);
            if (level >= 80) sets.push(species.abilities.master);

            // TODO: Remove this once we have implemented Ability UUIDs
            if (PokemonActorSystem.abilitiesMap === null) {
                const coreAbilities = (await game.packs
                    .get("ptr2e.core-abilities")!
                    .getDocuments()) as AbilityPTR2e[];
                PokemonActorSystem.abilitiesMap = new Map(
                    coreAbilities.map((ability) => [ability.slug, ability])
                );
            }

            const abilityItems = await Promise.all(
                sets.map((set) => {
                    // Pick one random ability from this set
                    const ability = set[Math.floor(Math.random() * set.length)];
                    // TODO: Implement Ability UUIDs
                    return PokemonActorSystem.abilitiesMap!.get(ability);
                })
            );

            let i = 0;
            return abilityItems.reduce(
                (acc, ability) => {
                    if (ability && ability instanceof ItemPTR2e) {
                        const abilityData = ability.toObject();
                        abilityData.system.slot = i++;
                        acc.push(abilityData);
                    }
                    return acc;
                },
                [] as AbilityPTR2e["_source"][]
            );
        })();

        const items = (() => {
            const items = this.parent.items.map((item) => item.toObject());
            if (moves.length) items.push(...moves);
            if (abilities.length) items.push(...abilities);
            return items;
        })();

        progress.advance(game.i18n.localize("PTR2E.PokemonGeneration.Progress.Prefix")+game.i18n.localize("PTR2E.PokemonGeneration.Progress.Step5"));

        const img = await (async () => {
            const config = game.ptr.data.artMap.get(evolution.slug || sluggify(this.parent.name));
            if (!config) return "icons/svg/mystery-man.svg";
            const resolver = await ImageResolver.createFromSpeciesData(
                {
                    dexId: evolution.number,
                    shiny,
                    forms: evolution.form ? [evolution.form] : [],
                },
                config
            );
            return resolver?.result || "icons/svg/mystery-man.svg";
        })();
        //TODO: Decouple this.
        const tokenImage = img;

        const foundryDefaultTokenSettings = game.settings.get("core", "defaultToken");
        this.parent.updateSource({
            name: Handlebars.helpers.formatSlug(evolution.slug || sluggify(this.parent.name)),
            img,
            system: {
                attributes: stats,
                shiny,
                advancement: {
                    experience: {
                        current: experience,
                    },
                },
                nature,
                gender,
                species: evolution,
            },
            items,
            prototypeToken: fu.mergeObject(
                foundryDefaultTokenSettings,
                {
                    width: size.width,
                    height: size.height,
                    actorLink: linkToken,
                    displayBars:
                        foundryDefaultTokenSettings.displayBars ??
                        CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
                    displayName:
                        foundryDefaultTokenSettings.displayName ?? CONST.TOKEN_DISPLAY_MODES.OWNER,
                    bar1: { attribute: foundryDefaultTokenSettings.bar1?.attribute || "health" },
                    img: tokenImage,
                    texture: {
                        src: tokenImage,
                    },
                },
                { inplace: false }
            ),
        });

        progress.close(game.i18n.localize("PTR2E.PokemonGeneration.Progress.Prefix")+game.i18n.localize("PTR2E.PokemonGeneration.Progress.Complete"));
    }
}

export default PokemonActorSystem;
