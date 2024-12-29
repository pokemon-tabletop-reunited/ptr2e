import { AttackPTR2e, HasEmbed, HasMigrations } from "@data";
import { MigrationSchema } from "@module/data/mixins/has-migrations.ts";
import { BaseItemSourcePTR2e } from "./system.ts";
import { CollectionField } from "@module/data/fields/collection-field.ts";
import { Blueprint } from "@module/data/models/blueprint.ts";
import { ItemPTR2e } from "@item/document.ts";
import { SpeciesSystemModel } from "./index.ts";
import { ActorPTR2e } from "@actor";
import { Progress } from "src/util/progress.ts";
import FolderPTR2e from "@module/folder/document.ts";
import natureToStatArray from "@scripts/config/natures.ts";
import SpeciesSystem, { EvolutionData, LevelUpMoveSchema } from "./species.ts";
import { AbilityPTR2e, MovePTR2e, SpeciesPTR2e } from "@item";
import { ImageResolver, NORMINV, sluggify } from "@utils";
import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { getInitialSkillList, partialSkillToSkill } from "@scripts/config/skills.ts";
import { SkillSchema } from "@module/data/models/skill.ts";

export default abstract class BlueprintSystem extends HasEmbed(HasMigrations(foundry.abstract.TypeDataModel), "blueprint") {
  /**
   * All items in the system have the following properties, but since blueprints do not make use of them
   * they are left as null / empty strings.
   */
  get traits() { return null }
  set traits(_) { return; }
  get slug() { return "" }
  set slug(_) { return; }
  get description() { return "" }
  set description(_) { return; }

  static readonly HumanoidHeightWeightData = {
    male: {
      height: {
        average: 1.784,
        deviation: 0.0769
      },
      weight: {
        average: 25.6,
        deviation: 3.32
      }
    },
    female: {
      height: {
        average: 1.638,
        deviation: 0.0717
      },
      weight: {
        average: 23.4,
        deviation: 4.18
      }
    },
    genderless: {
      height: {
        average: 1.711,
        deviation: 0.0743
      },
      weight: {
        average: 24.5,
        deviation: 3.75
      }
    }
  } as const;

  static override defineSchema(): BlueprintSchema {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema() as MigrationSchema,
      id: new fields.DocumentIdField({ initial: foundry.utils.randomID(), required: true, nullable: false }),
      blueprints: new CollectionField(new fields.EmbeddedDataField(Blueprint), "id"),
    }
  }

  async updateChildren(updates: Record<string, unknown>[]) {
    if (!updates.every(u => u._id)) {
      throw new Error("Cannot update children without an id");
    }

    const children = this.toObject().blueprints;
    const map = new Map(children.map(c => [c.id, c]));
    for (const update of updates) {
      const child = map.get(update._id as string);
      if (!child) {
        throw new Error(`Could not find child with id ${update._id}`);
      }
      delete update._id;
      foundry.utils.mergeObject(child, update, { inplace: true })
    }

    return this.parent.update({ "system.blueprints": children });
  }

  async createChildren(children: (RollTable | ItemPTR2e<BlueprintSystem | SpeciesSystemModel> | ActorPTR2e)[]) {
    const existing = this.toObject().blueprints;
    const newChildren = children.flatMap((c: RollTable | ItemPTR2e<BlueprintSystem | SpeciesSystemModel> | ActorPTR2e): Partial<Blueprint['_source']>[] => {
      if (c instanceof ItemPTR2e && c.system instanceof BlueprintSystem) {
        return c.system.blueprints.map(b => ({
          ...b.toObject(),
          id: foundry.utils.randomID()
        }));
      }
      return [{
        species: c.uuid,
        id: foundry.utils.randomID(),
      }]
    });

    return this.parent.update({ "system.blueprints": existing.concat(newChildren) });
  }

  async deleteChildren(ids: string[]) {
    const children = this.toObject().blueprints.filter(c => !ids.includes(c.id as string));
    return this.parent.update({ "system.blueprints": children });
  }

  async generate(options: {
    x: number;
    y: number;
    canvas: Canvas;
    folder?: FolderPTR2e | null;
    parent?: ActorPTR2e;
    team: boolean;
  } | null, dataOnly = false) {
    // Safe generate
    try {
      return await this._generate(options, dataOnly);
    }
    catch (error) {
      ui.notifications.error("An error occurred while generating Pokemon from Blueprint");
      console.error(error);
    }
  }

  protected async _generate(options: {
    x: number;
    y: number;
    canvas: Canvas;
    folder?: FolderPTR2e | null;
    parent?: ActorPTR2e;
    team: boolean;
  } | null, dataOnly: boolean): Promise<Partial<ActorPTR2e['_source']>[] | void> {
    if (!canvas.scene && !dataOnly) return void ui.notifications.warn("Cannot generate Actors from Blueprint without an active scene");

    if (dataOnly && !options) {
      options = {} as unknown as typeof options;
    }

    // If no options, then we're generating from a blueprint window instead of a drag-and-drop
    // Thus ask for a location where to spawn the Actor(s)
    if (!options) {
      const notification = ui.notifications.notify("Please hover over the Canvas and press 'S' to select Blueprint Spawn Location (press 'esc' to cancel)", "info", { permanent: true })

      options = await new Promise((resolve) => {
        const keyListener = (event: KeyboardEvent) => {
          if (event.code === "KeyS") {
            if (!canvas.scene) return void ui.notifications.warn("Cannot generate Actors from Blueprint without an active scene");
            const x = Math.floor(canvas.mousePosition.x / canvas.scene.grid.size) * canvas.scene.grid.size
            const y = Math.floor(canvas.mousePosition.y / canvas.scene.grid.size) * canvas.scene.grid.size
            resolve({ x, y, canvas, team: this.blueprints.size > 1 && !this.blueprints.some(b => b.owner) });
            ui.notifications.remove(notification);
            window.removeEventListener("keydown", keyListener);
          }
          if (event.code === "Escape") {
            ui.notifications.remove(notification);
            window.removeEventListener("keydown", keyListener);
            resolve(null);
          }
        };
        window.addEventListener("keydown", keyListener);
      });
    }
    if (!options) return;

    if (options.parent) {
      if (options.parent.folder) {
        options.folder = options.parent.folder;
      }
      else {
        const folder = await Folder.create({
          name: options.parent.name,
          type: "Actor"
        });
        if (!folder) return;
        await options.parent.update({ folder: folder.id });
        options.folder = folder as FolderPTR2e;
      }
    }

    const owner = options.parent || this.blueprints.find(b => b.owner);
    const hasOwner = !!owner;

    // Find or Create a folder as necessary
    if (!options.folder?.id && !dataOnly) {
      options.folder = await (async () => {
        const folderName = hasOwner ? `${owner.name}'s Party` : canvas.scene!.name;

        if (!hasOwner) {
          const folder = game.actors.folders.getName(folderName);
          if (folder) return folder as FolderPTR2e;
        }
        return await Folder.create({
          name: folderName,
          type: "Actor"
        }) as FolderPTR2e;
      })()
    }

    const progress = new Progress({ steps: this.blueprints.size + 2 });
    progress.advance(game.i18n.localize("PTR2E.PokemonGeneration.Progress.Prefix"));

    const toBeCreated: Partial<ActorPTR2e['_source']>[] = [];
    for (const blueprint of this.blueprints) {
      await blueprint.prepareAsyncData();
      progress.advance(game.i18n.localize("PTR2E.PokemonGeneration.Progress.Prefix") + game.i18n.format("PTR2E.PokemonGeneration.Progress.Step", {
        name: blueprint.name
      }));

      if (!blueprint.doc) throw new Error("Blueprint does not have a species");
      if (blueprint.doc instanceof ActorPTR2e) {
        const actor = blueprint.doc.toObject();
        if (options.folder) {
          actor.folder = options.folder.id;
          actor.system.party = {
            ownerOf: blueprint.owner ? options.folder.id : undefined,
            partyMemberOf: hasOwner ? blueprint.owner ? undefined : options.folder.id : undefined,
            teamMemberOf: options.team ? [options.folder.id] : [],
          }
        }
        toBeCreated.push(actor);
        continue;
      }

      const speciesOrActor = await (async () => {
        // Get rolltable result or species data
        if (blueprint.doc instanceof ItemPTR2e) {
          return blueprint.doc;
        }
        const table = blueprint.doc as RollTable;
        const tableResult = await table.drawMany(3, { displayChat: false });
        for (const result of tableResult.results) {
          if (result.type === CONST.TABLE_RESULT_TYPES.TEXT) continue;
          const uuid = (result.type === CONST.TABLE_RESULT_TYPES.COMPENDIUM ? "Compendium." : "") + result.documentCollection + "." + result.documentId;
          const doc = await fromUuid<ItemPTR2e | ActorPTR2e>(uuid);
          if (doc && doc instanceof ItemPTR2e && doc.system instanceof SpeciesSystemModel) return doc;
          if (doc && doc instanceof ActorPTR2e) return doc;
        }
        throw new Error("No valid species found in rolltable");
      })()

      if (speciesOrActor instanceof ActorPTR2e) {
        const actor = speciesOrActor.toObject();
        if (options.folder) {
          actor.folder = options.folder.id;
          actor.system.party = {
            ownerOf: blueprint.owner ? options.folder.id : undefined,
            partyMemberOf: hasOwner ? blueprint.owner ? undefined : options.folder.id : undefined,
            teamMemberOf: options.team ? [options.folder.id] : [],
          }
        }
        toBeCreated.push(actor);
        continue;
      }
      const species = speciesOrActor.toObject() as SpeciesPTR2e['_source'] & {
        system: SpeciesSystemModel['_source'];
      };

      const level = await (async () => {
        // Get level from rolltable result, or range

        // If no level is specified, default to 1-100
        if (blueprint.level == null) return this.randomInteger(1, 100);

        // If level is a number, return it
        if (!Number.isNaN(Number(blueprint.level))) return Number.parseInt(blueprint.level);

        // If level is a range, return a random number within that range
        if (typeof blueprint.level === "string" && blueprint.level.match(/^\d+-\d+$/)) {
          const [min, max] = blueprint.level.split("-").map(Number);
          return this.randomInteger(min, max);
        }

        // If none of the above is true, it must be a rolltable
        const table = await fromUuid<RollTable>(blueprint.level);

        // If the table is not found, default to 1-100
        if (!table || !(table instanceof RollTable)) return this.randomInteger(1, 100);

        // Draw a result from the table
        const tableResult = await table.drawMany(3, { displayChat: false });
        for (const result of tableResult.results) {
          if (result.type !== CONST.TABLE_RESULT_TYPES.TEXT) continue;
          const text = result.text + ""; // Ensure it's a string
          if (text.match(/^\d+-\d+$/)) {
            const [min, max] = text.split("-").map(Number);
            return this.randomInteger(min, max);
          }
          const number = Number(text);
          if (!Number.isNaN(number)) return Number.parseInt(text);
        }
        // If no valid result is found, default to 1-100
        return this.randomInteger(1, 100);
      })();

      // TODO: Implement proper exp for Characters
      const experience = (1 * Math.pow(level, 3)) / 1;

      const nature = await (async () => {
        // Get nature from rolltable result, or static value

        // If nature ain't set, generate a random one
        if (!blueprint.nature) return randomFromList(Object.keys(natureToStatArray));

        // If nature is a valid string, return it
        if (typeof blueprint.nature === "string" && Object.keys(natureToStatArray).includes(blueprint.nature.toLowerCase())) return blueprint.nature.toLowerCase();

        // If nature is a rolltable, draw a result
        const table = await fromUuid<RollTable>(blueprint.nature);
        if (!table || !(table instanceof RollTable)) return randomFromList(Object.keys(natureToStatArray));

        const tableResult = await table.drawMany(3, { displayChat: false });
        for (const result of tableResult.results) {
          if (result.type !== CONST.TABLE_RESULT_TYPES.TEXT) continue;
          const text = result.text + ""; // Ensure it's a string
          if (Object.keys(natureToStatArray).includes(text)) return text;
        }

        // If no valid result is found, generate a random nature
        return randomFromList(Object.keys(natureToStatArray));
      })();

      // TODO: Implement these options
      const { shinyChance, preventEvolution, linkToken } = {
        shinyChance: blueprint.shiny,
        preventEvolution: blueprint.preventEvolution ?? false,
        linkToken: false,
      }

      const shiny = this.randomInteger(1, 100) <= shinyChance;

      const gender = species.system.genderRatio === -1
        ? "genderless"
        : Math.random() > species.system.genderRatio / 8
          ? "male"
          : "female";

      const evolution = await (async (): Promise<NonNullable<SpeciesPTR2e['_source'] & {
        system: SpeciesSystemModel['_source'];
      }>> => {
        if (preventEvolution) return species;

        function getEvolution(evolution: EvolutionData): EvolutionData {
          if (!evolution?.evolutions) return evolution;

          const evolutions = evolution.evolutions.filter((e) => {
            const andCases = e.methods.filter(m => m.operand === "and");
            const orCases = e.methods.filter(m => m.operand === "or");

            function validateEvolution(method: typeof e['methods'][number]): boolean {
              switch (method.type) {
                case "level": {
                  return level >= method.level;
                }
                case "item": {
                  return false;
                }
                case "move": {
                  return false; //TODO: Implement move evolutions
                }
                case "gender": {
                  return gender === method.gender;
                }
              }
            }

            return andCases.length && orCases.length
              ? andCases.every(validateEvolution) && orCases.some(validateEvolution)
              : andCases.length
                ? andCases.every(validateEvolution)
                : orCases.length
                  ? orCases.some(validateEvolution)
                  : false;
          });

          if (!evolutions.length) return evolution;
          if (evolutions.length > 1) {
            // Pick a random evolution path to follow
            return getEvolution(randomFromList(evolutions));
          }
          return getEvolution(evolutions[0]);
        }
        const evolution = getEvolution(species.system.evolutions as unknown as EvolutionData)
        if (!evolution?.uuid) return species;

        return ((await fromUuid<ItemPTR2e<SpeciesSystem>>(evolution.uuid))?.toObject() as SpeciesPTR2e['_source'] & {
          system: SpeciesSystemModel['_source'];
        } | undefined) ?? species;
      })();

      const { weight, height } = await (async (): Promise<{ weight: number, height: number }> => {
        const isHumanoid = evolution.system.traits.includes("humanoid");

        const randomH = (await new Roll(isHumanoid ? "1d10000000000" : "2d20000").evaluate()).total;
        const randomW = (await new Roll(isHumanoid ? "1d10000000000" : "2d20000").evaluate()).total;

        const height = isHumanoid
          ? NORMINV(randomH / 10000000000, BlueprintSystem.HumanoidHeightWeightData[gender].height.average, BlueprintSystem.HumanoidHeightWeightData[gender].height.deviation)
          : ((randomH / 40000) * 0.8 + 0.6) * (evolution.system.size.height ?? 1);

        const weight = isHumanoid
          ? NORMINV(randomW / 10000000000, BlueprintSystem.HumanoidHeightWeightData[gender].weight.average, BlueprintSystem.HumanoidHeightWeightData[gender].weight.deviation) * Math.pow(height, 2)
          : ((randomW / 40000) * 0.4 + 8) * ((randomH / 40000) * 0.8 + 0.6) * (evolution.system.size.weight ?? 1);

        return { height, weight };
      })();

      // TODO: Add stat settings
      const stats = (() => {
        const randomPoints = (() => {
          const points = Math.ceil(Math.random() * 508 * 0.25);
          return points % 4 === 0 ? points : points + (4 - (points % 4));
        })()

        class WeightedBag<T> {
          private entries: { entry: T; weight: number }[] = [];
          private totalWeight = 0;

          addEntry(entry: T, weight: number) {
            this.entries.push({ entry, weight });
            this.totalWeight += weight;
          }

          get() {
            const rand = Math.random() * this.totalWeight;
            let cumulativeWeight = 0;

            for (const { entry, weight } of this.entries) {
              cumulativeWeight += weight;
              if (rand < cumulativeWeight) {
                return entry;
              }
            }

            return null; // In case there are no entries
          }
        }

        const calculateStats = (points: number, weighted: boolean) => {
          const bag = new WeightedBag<keyof typeof stats>();
          const stats = {} as Record<keyof typeof evolution.system.stats, number>;

          for (const key in evolution.system.stats) {
            stats[key as keyof typeof stats] = 0;
            bag.addEntry(
              key as keyof typeof stats,
              weighted ? evolution.system.stats[key as keyof typeof evolution.system.stats] as number : 1
            );
          }

          for (let i = 0; i < points; i += 4) {
            stats[bag.get()!] += 4;
          }
          return stats;
        };

        const weightedStats = calculateStats(508 - randomPoints, true);
        const randomStats = calculateStats(randomPoints, false);

        return Object.keys(evolution.system.stats).reduce(
          (acc, key) => {
            const stat = key as keyof typeof evolution.system.stats;
            acc[stat] = { evs: weightedStats[stat] + randomStats[stat] };
            return acc;
          },
          {} as Record<keyof typeof evolution.system.stats, { evs: number }>
        );
      })();

      // TODO: Add skill settings
      const skills = (() => {
        const totalPoints = (evolution.system.traits.includes("ace") ? 400 : 110) + 10 * (level - 1);

        const speciesPoints = Math.floor(totalPoints * 0.65);
        const leftOverPoints = totalPoints - speciesPoints;

        const randomSpeciesPoints = Math.ceil(Math.random() * speciesPoints * 0.30)
        const randomPoints = Math.ceil(Math.random() * leftOverPoints * 0.50)

        class WeightedBag<T> {
          private entries: { entry: T; weight: number }[] = [];
          private totalWeight = 0;

          addEntry(entry: T, weight: number) {
            this.entries.push({ entry, weight });
            this.totalWeight += weight;
          }

          get() {
            const rand = Math.random() * this.totalWeight;
            let cumulativeWeight = 0;

            for (const { entry, weight } of this.entries) {
              cumulativeWeight += weight;
              if (rand < cumulativeWeight) {
                return entry;
              }
            }

            return null; // In case there are no entries
          }
        }

        const skills = new Map(getInitialSkillList().map((skill) => [skill.slug, skill]));

        const calculateSkills = (points: number, weighted: boolean, speciesOnly: boolean) => {
          const bag = new WeightedBag<SourceFromSchema<SkillSchema>>();

          const pool = speciesOnly ? evolution.system.skills : Array.from(skills.values());

          for (const skillData of pool) {
            const skill = skills.get(skillData.slug) ?? (() => {
              const skill = (game.ptr.data.skills.get(skillData.slug) ?? partialSkillToSkill({ slug: skillData.slug })) as SourceFromSchema<SkillSchema>;
              skills.set(skillData.slug, skill);
              return skill;
            })();
            if(skill.hidden) continue;
            bag.addEntry(
              skill,
              weighted
                ? speciesOnly
                  ? skill.value
                  : (skill.rvs ?? 1) >= 45
                    ? 1
                    : (skill.rvs ?? skill.value)
                : 1
            );
          }

          let invested = 0;
          let retry = 0;
          while (invested < points) {
            const result = bag.get();
            if (result && (result.rvs ?? 0) < 70) {
              result.rvs = (result.rvs ?? 0) + 1;
              invested++;
              retry = 0;
            }
            else {
              retry++;
              if (retry > 10) {
                console.warn("Skill generation failed to allocate points");
                break;
              }
            }
          }
        };

        calculateSkills(speciesPoints - randomSpeciesPoints, true, true);
        calculateSkills(randomSpeciesPoints, false, true);
        calculateSkills(randomPoints, false, false);
        calculateSkills(leftOverPoints - randomPoints, true, false);

        return Array.from(skills.values());
      })();

      const moves: MovePTR2e["_source"][] = await (async () => {
        const levelUpMoves = (evolution.system.moves.levelUp as ModelPropsFromSchema<LevelUpMoveSchema>[]).filter((move) => move.level <= level);

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

      const abilities: AbilityPTR2e["_source"][] = await (async () => {
        const sets = [evolution.system.abilities.starting];
        if (level >= 20) sets.push(evolution.system.abilities.basic);
        if (level >= 50) sets.push(evolution.system.abilities.advanced);
        if (level >= 80) sets.push(evolution.system.abilities.master);

        const abilityItems = await Promise.all(
          sets.map((set) => {
            // Pick one random ability from this set
            const ability = set[Math.floor(Math.random() * set.length)];
            return fromUuid(ability?.uuid);
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
        const items: Record<string, unknown>[] = [];
        if (moves.length) items.push(...moves);
        if (abilities.length) items.push(...abilities);
        return items;
      })();

      const { portrait: img, token: tokenImage } = await (async () => {
        const config = game.ptr.data.artMap.get(evolution.system.slug || sluggify(blueprint.name));
        if (!config) return { portrait: "icons/svg/mystery-man.svg", token: "icons/svg/mystery-man.svg" };
        const resolver = await ImageResolver.createFromSpeciesData(
          {
            dexId: evolution.system.number,
            shiny,
            forms: evolution.system.form ? [evolution.system.form] : [],
          },
          config
        );
        if (!resolver?.result) return { portrait: "icons/svg/mystery-man.svg", token: "icons/svg/mystery-man.svg" };

        const tokenResolver = await ImageResolver.createFromSpeciesData(
          {
            dexId: evolution.system.number,
            shiny,
            forms: evolution.system.form ? [evolution.system.form, "token"] : ["token"],
          },
          config
        );
        return {
          portrait: resolver.result,
          token: tokenResolver?.result ?? resolver.result
        }
      })();

      // Add species item
      items.push({
        name: evolution.system.slug ? Handlebars.helpers.formatSlug(evolution.system.slug) : evolution.name,
        type: 'species',
        img: img,
        system: evolution.system,
        _id: "actorspeciesitem",
        effects: evolution.effects
      })

      const foundryDefaultTokenSettings = game.settings.get("core", "defaultToken");

      const data = {
        name: Handlebars.helpers.formatSlug(evolution.system.slug) || blueprint.name,
        img,
        type: evolution.system.traits?.includes("humanoid") ? "humanoid" : "pokemon",
        folder: options.folder?.id,
        ownership: options.parent ? options.parent.ownership : {},
        system: {
          attributes: stats,
          shiny,
          advancement: {
            experience: {
              current: experience
            }
          },
          nature,
          gender,
          party: {
            ownerOf: blueprint.owner ? options.folder?.id : undefined,
            partyMemberOf: hasOwner ? blueprint.owner ? null : options.folder?.id : null,
            teamMemberOf: options.team ? [options.folder?.id] : [],
          },
          details: {
            size: {
              weight,
              height
            }
          },
          skills
        },
        items,
        prototypeToken: foundry.utils.mergeObject(foundryDefaultTokenSettings, {
          actorLink: linkToken,
          displayBars: foundryDefaultTokenSettings.displayBars ?? CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
          displayName: foundryDefaultTokenSettings.displayName ?? CONST.TOKEN_DISPLAY_MODES.OWNER,
          bar1: { attribute: foundryDefaultTokenSettings.bar1?.attribute || "health" },
          img: tokenImage,
          texture: {
            src: tokenImage,
          },
        }, { inplace: false }),
      } as unknown as Partial<ActorPTR2e['_source']>;
      const actor = new ActorPTR2e(data);
      data.system!.health = { value: actor.system.health.max, max: actor.system.health.max };
      data.system!.powerPoints = { value: actor.system.powerPoints.max, max: actor.system.powerPoints.max };

      toBeCreated.push(data);
    }

    if (dataOnly) {
      progress.close(game.i18n.localize("PTR2E.PokemonGeneration.Progress.Prefix") + game.i18n.localize("PTR2E.PokemonGeneration.Progress.Complete"));
      return toBeCreated;
    }

    progress.advance(game.i18n.localize("PTR2E.PokemonGeneration.Progress.Prefix") + game.i18n.localize("PTR2E.PokemonGeneration.Progress.GenerationStep"));
    //@ts-expect-error - This is valid actor data
    const actors = await ActorPTR2e.createDocuments(toBeCreated);

    progress.advance(game.i18n.localize("PTR2E.PokemonGeneration.Progress.Prefix" + game.i18n.localize("PTR2E.PokemonGeneration.Progress.TokenGenerationStep")));

    const { x, y } = options;
    const tokensToCreate: TokenDocumentPTR2e[] = [];
    for (const actor of actors) {
      // TODO: Spread out actors in case there's multiple
      const tokenData = await actor.getTokenDocument({ x, y });
      tokensToCreate.push(tokenData);
    }
    //@ts-expect-error - This is valid token data
    await canvas.scene.createEmbeddedDocuments("Token", tokensToCreate);

    progress.close(game.i18n.localize("PTR2E.PokemonGeneration.Progress.Prefix") + game.i18n.localize("PTR2E.PokemonGeneration.Progress.Complete"));
  }

  randomInteger(min: number, max: number) {
    const fromCeiled = Math.ceil(min);
    const toFloored = Math.floor(max);

    if (toFloored < fromCeiled) {
      throw new RangeError(
        `randomInteger: The range [${min.toString()},${max.toString()}] contains no integer`,
      );
    }

    return Math.floor(
      Math.random() * (toFloored - fromCeiled + 1) + fromCeiled,
    );
  }

}

function randomFromList<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export default interface BlueprintSystem extends ModelPropsFromSchema<BlueprintSchema> {
  _source: SourceFromSchema<BlueprintSchema>;
}

interface BlueprintSchema extends foundry.data.fields.DataSchema, MigrationSchema {
  id: foundry.data.fields.DocumentIdField<string, true, false, true>;
  blueprints: CollectionField<foundry.data.fields.EmbeddedDataField<Blueprint>>;
}

export type BlueprintSource = BaseItemSourcePTR2e<"blueprint", BlueprintSystemSource>;

interface BlueprintSystemSource {
  slug: string;
}