import { ItemPTR2e, PerkPTR2e, SpeciesPTR2e } from "@item";
import { default as ItemSheetPTR2e } from "./base.ts";
import { sluggify } from "@utils";

export default class PerkSheet extends ItemSheetPTR2e<PerkPTR2e["system"]> {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["ability-sheet"],
      actions: {
        "add-node": async function (this: PerkSheet, event: MouseEvent) {
          event.preventDefault();
          const nodes = this.document.system.toObject().nodes as Required<DeepPartial<PerkPTR2e['system']['nodes']>>
          nodes.push(this.document.system.variant === "tiered" ? {
            tier: {
              rank: nodes.length + 1,
              uuid: ""
            }
          } : {});
          await this.document.update({ "system.nodes": nodes });
        },
        "delete-node": async function (this: PerkSheet, event: MouseEvent) {
          event.preventDefault();
          const index = Number((event.target as HTMLElement)?.dataset?.index);
          if (isNaN(index)) return;
          const nodes = this.document.system.toObject().nodes;
          nodes.splice(index, 1);
          await this.document.update({ "system.nodes": nodes });
        },
        "delete-web": async function (this: PerkSheet, event: MouseEvent) {
          event.preventDefault();
          const uuid = (event.target as HTMLElement).parentElement?.dataset?.key;
          if (!uuid || !this.document.system.webs.has(uuid)) return;
          const webs = this.document.system.toObject().webs;
          webs.splice(webs.indexOf(uuid), 1);
          await this.document.update({ "system.webs": webs });
        }
      },
    },
    { inplace: false }
  );

  static override readonly overviewTemplate = "systems/ptr2e/templates/items/perk/perk-overview.hbs";
  static override readonly detailsTemplate = "systems/ptr2e/templates/items/perk/perk-details.hbs";
  override noActions = false;

  override async _prepareContext() {
    return {
      ...(await super._prepareContext()),
      prerequisites: this.document.system.getPredicateStrings(),
      debug: game.user.isGM && !!game.settings.get("ptr2e", "dev-mode"),
    }
  }

  override async _onDropItem(event: DragEvent, data: object) {
    const item = await ItemPTR2e.fromDropData(data as DropCanvasData);
    if (!item || item.type !== "species") return super._onDropItem(event, data);

    if (this.document.system.webs.has(item.uuid)) return;

    const species = await fromUuid<SpeciesPTR2e>(item.uuid);
    if (!species) return;

    const uuid = species.system.evolutions?.uuid ?? item.uuid;
    if (this.document.system.webs.has(uuid)) return;

    const webs = this.document.system.toObject().webs;
    webs.push(uuid);
    return void await this.document.update({ "system.webs": webs });
  }

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> =
    fu.mergeObject(super.PARTS, {
      overview: {
        template: PerkSheet.overviewTemplate,
      },
      details: {
        template: PerkSheet.detailsTemplate,
      },
    }, { inplace: false });

  override _prepareSubmitData(
    _event: SubmitEvent,
    _form: HTMLFormElement,
    formData: FormDataExtended
  ) {
    const data = fu.expandObject(formData.object) as {
      [key: string]: unknown;
      system?: {
        prerequisites?: string | [];
      }
    }

    if (data?.system?.prerequisites) {
      const prereqs = data.system.prerequisites;
      if (typeof prereqs === "string") {
        if (prereqs.trim() === "") delete data.system.prerequisites;
        else {
          try {
            data.system.prerequisites = JSON.parse(prereqs);
          } catch (error) {
            if (error instanceof Error) {
              ui.notifications.error(
                game.i18n.format("PTR2E.EffectSheet.ChangeEditor.Errors.ChangeSyntax", { message: error.message }),
              );
              throw error; // prevent update, to give the user a chance to correct, and prevent bad data
            }
          }
        }
      } else data.system.prerequisites = [];
    }

    if (
      "system" in data &&
      data.system &&
      typeof data.system === "object" &&
      "traits" in data.system &&
      Array.isArray(data.system.traits)
    ) {
      // Traits are stored as an array of objects, but we only need the values
      data.system.traits = data.system.traits.map((trait: { value: string }) =>
        sluggify(trait.value)
      );
    }

    return data;
  }
}