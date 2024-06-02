import { ActorPTR2e } from "@actor";
import { ActorSystemPTR2e } from "./index.ts";
import { SpeciesDropSheet } from "@actor/sheets/species-drop-sheet.ts";
import { AbilityPTR2e, ItemPTR2e, MovePTR2e } from "@item";
import { SpeciesSystemModel, SpeciesSystemSource } from "@item/data/index.ts";
import natureData from "@scripts/config/natures.ts";
import { ImageResolver, sluggify } from "@utils";
import { AttackPTR2e } from "@data";

class PokemonActorSystem extends ActorSystemPTR2e {
    declare parent: ActorPTR2e<this>;

    static abilitiesMap: Map<string, AbilityPTR2e> | null = null;

    override async _preCreate(
        data: this["parent"]["_source"],
        options: DocumentModificationContext<this["parent"]["parent"]> & { fail?: boolean },
        user: User
    ): Promise<boolean | void> {
        if (!this._source.species) {
            const promise = await new Promise((resolve, _reject) => {
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
                await this._preCreateGenerateSpeciesData(this._source.species);
                return true;
            }

            options.fail = true;
            return false;
        }
        await this._preCreateGenerateSpeciesData(this._source.species);

        await super._preCreate(data, options, user);
    }

    async _preCreateGenerateSpeciesData(species: SpeciesSystemSource["system"]) {
        const { minLevel, maxLevel, shinyChance, preventEvolution, linkToken } =
            await (async (): Promise<{
                minLevel: number;
                maxLevel: number;
                shinyChance: number;
                preventEvolution: boolean;
                linkToken: boolean;
            }> => {
                // TODO: Prompt for additional info. For now, just return hardcoded values
                return {
                    minLevel: this.advancement.level > 1 ? this.advancement.level : 5,
                    maxLevel: this.advancement.level > 1 ? this.advancement.level : 5,
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
        const evolution = await (async (): Promise<SpeciesSystemSource["system"]> => {
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
            //TODO: Implement
            return {
                hp: {
                    evs: 0
                },
                atk: {
                    evs: 0
                },
                def: {
                    evs: 0
                },
                spa: {
                    evs: 0
                },
                spd: {
                    evs: 0
                },
                spe: {
                    evs: 0
                }
            }
        })();

        const moves: MovePTR2e['_source'][] = await (async () => {
            const levelUpMoves = species.moves.levelUp.filter((move) => move.level <= level);
            
            const moveItems = await Promise.all(levelUpMoves.map(async (move) => fromUuid(move.uuid)));
            return moveItems.reduce((acc, move, index) => {
                if(move && move instanceof ItemPTR2e) {
                    const moveData = move.toObject();
                    if(index < 6) {
                        const actions = moveData.system.actions as AttackPTR2e['_source'][];
                        if(actions.length) {
                            actions[0].slot = index;
                        }
                    }
                    acc.push(moveData);
                }
                return acc;
            }, [] as MovePTR2e['_source'][]);
        })();


        const abilities: AbilityPTR2e['_source'][] = await (async () => {
            const sets = [species.abilities.starting];
            if(level >= 20) sets.push(species.abilities.basic);
            if(level >= 50) sets.push(species.abilities.advanced);
            if(level >= 80) sets.push(species.abilities.master);

            // TODO: Remove this once we have implemented Ability UUIDs
            if(PokemonActorSystem.abilitiesMap === null) {
                const coreAbilities = await game.packs.get("ptr2e.core-abilities")!.getDocuments() as AbilityPTR2e[];
                PokemonActorSystem.abilitiesMap = new Map(coreAbilities.map((ability) => [ability.slug, ability]));
            }

            const abilityItems = await Promise.all(sets.map((set) => {
                // Pick one random ability from this set
                const ability = set[Math.floor(Math.random() * set.length)];
                // TODO: Implement Ability UUIDs   
                return PokemonActorSystem.abilitiesMap!.get(ability);
            }))

            return abilityItems.reduce((acc, ability) => {
                if(ability && ability instanceof ItemPTR2e) acc.push(ability.toObject());
                return acc;
            }, [] as AbilityPTR2e['_source'][]);
        })();

        const items = (() => {
            const items = this.parent.items.map((item) => item.toObject());
            if(moves.length) items.push(...moves);
            if(abilities.length) items.push(...abilities);
            return items;
        })();

        const img = await (async () => {
            const config = game.ptr.data.artMap.get(evolution.slug || sluggify(this.parent.name));
            if(!config) return 'icons/svg/mystery-man.svg';
            const resolver = await ImageResolver.createFromSpeciesData({
                dexId: evolution.number,
                shiny,
                forms: evolution.form ? [evolution.form] : []
            }, config)
            return resolver?.result || 'icons/svg/mystery-man.svg';
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
    }
}

export default PokemonActorSystem;
