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
import { LevelUpMoveSchema } from "./species.ts";
import { AbilityPTR2e, MovePTR2e } from "@item";
import { ImageResolver, sluggify } from "@utils";
import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";

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

  static override defineSchema(): BlueprintSchema {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema() as MigrationSchema,
      id: new fields.DocumentIdField({ initial: fu.randomID(), required: true, nullable: false }),
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
      fu.mergeObject(child, update, { inplace: true })
    }

    return this.parent.update({ "system.blueprints": children });
  }

  async createChildren(children: (RollTable | ItemPTR2e<BlueprintSystem | SpeciesSystemModel> | ActorPTR2e)[]) {
    const existing = this.toObject().blueprints;
    const newChildren = children.flatMap((c: RollTable | ItemPTR2e<BlueprintSystem | SpeciesSystemModel> | ActorPTR2e): Partial<Blueprint['_source']>[] => {
      if (c instanceof ItemPTR2e && c.system instanceof BlueprintSystem) {
        return c.system.blueprints.map(b => ({
          ...b.toObject(),
          id: fu.randomID()
        }));
      }
      return [{
        species: c.uuid,
        id: fu.randomID(),
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
  } | null) {
    // Safe generate
    try {
      return await this._generate(options);
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
  } | null) {
    if (!canvas.scene) return void ui.notifications.warn("Cannot generate Actors from Blueprint without an active scene");

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
    if (!options.folder?.id) {
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
          return blueprint.doc.system;
        }
        const table = blueprint.doc as RollTable;
        const tableResult = await table.drawMany(3, { displayChat: false });
        for (const result of tableResult.results) {
          if (result.type === CONST.TABLE_RESULT_TYPES.TEXT) continue;
          const uuid = (result.type === CONST.TABLE_RESULT_TYPES.COMPENDIUM ? "Compendium." : "") + result.documentCollection + "." + result.documentId;
          const doc = await fromUuid<ItemPTR2e | ActorPTR2e>(uuid);
          if (doc && doc instanceof ItemPTR2e && doc.system instanceof SpeciesSystemModel) return doc.system;
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
      const species = speciesOrActor.toObject();

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
      const experience = (3 * Math.pow(level, 3)) / 6;

      const nature = await (async () => {
        // Get nature from rolltable result, or static value

        // If nature ain't set, generate a random one
        if (!blueprint.nature) return this.randomFromList(Object.keys(natureToStatArray));

        // If nature is a valid string, return it
        if (typeof blueprint.nature === "string" && Object.keys(natureToStatArray).includes(blueprint.nature.toLowerCase())) return blueprint.nature.toLowerCase();

        // If nature is a rolltable, draw a result
        const table = await fromUuid<RollTable>(blueprint.nature);
        if (!table || !(table instanceof RollTable)) return this.randomFromList(Object.keys(natureToStatArray));

        const tableResult = await table.drawMany(3, { displayChat: false });
        for (const result of tableResult.results) {
          if (result.type !== CONST.TABLE_RESULT_TYPES.TEXT) continue;
          const text = result.text + ""; // Ensure it's a string
          if (Object.keys(natureToStatArray).includes(text)) return text;
        }

        // If no valid result is found, generate a random nature
        return this.randomFromList(Object.keys(natureToStatArray));
      })();

      // TODO: Implement these options
      const { shinyChance, preventEvolution, linkToken } = {
        shinyChance: 1,
        preventEvolution: false,
        linkToken: false,
      }

      const shiny = this.randomInteger(1, 100) <= shinyChance;

      const gender = species.genderRatio === -1
        ? "genderless"
        : Math.random() < species.genderRatio / 8
          ? "male"
          : "female";

      const evolution = await (async (): Promise<NonNullable<SpeciesSystemModel['_source']>> => {
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

      // TODO: Add stat settings
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

      const abilities: AbilityPTR2e["_source"][] = await (async () => {
        const sets = [species.abilities.starting];
        if (level >= 20) sets.push(species.abilities.basic);
        if (level >= 50) sets.push(species.abilities.advanced);
        if (level >= 80) sets.push(species.abilities.master);

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
        const items = [];
        if (moves.length) items.push(...moves);
        if (abilities.length) items.push(...abilities);
        return items;
      })();

      const img = await (async () => {
        const config = game.ptr.data.artMap.get(evolution.slug || sluggify(blueprint.name));
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

      const data = {
        name: Handlebars.helpers.formatSlug(evolution.slug) || blueprint.name,
        img,
        type: evolution?.traits?.includes("humanoid") ? "humanoid" : "pokemon",
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
          species: evolution,
          party: {
            ownerOf: blueprint.owner ? options.folder?.id : undefined,
            partyMemberOf: hasOwner ? blueprint.owner ? null : options.folder?.id : null,
            teamMemberOf: options.team ? [options.folder?.id] : [],
          }
        },
        items,
        prototypeToken: fu.mergeObject(foundryDefaultTokenSettings, {
          width: size.width,
          height: size.height,
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
      data.system!.health = {value: actor.system.health.max, max: actor.system.health.max};
      data.system!.powerPoints = {value: actor.system.powerPoints.max, max: actor.system.powerPoints.max};

      toBeCreated.push(data);
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

  randomFromList<T>(list: T[]): T {
    return list[Math.floor(Math.random() * list.length)];
  }
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