import { ItemPTR2e, PerkPTR2e, SpeciesPTR2e } from "@item";
import { default as ItemSheetPTR2e } from "./base.ts";

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
          if(!uuid || !this.document.system.webs.has(uuid)) return;
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
    const [itemNames, itemLinks] = await (async () => {
      const result = await Promise.all(this.document.system.prerequisites.map(async prereq => {
        const item = await fromUuid<PerkPTR2e>(prereq);
        if (!item) return [prereq, prereq];

        return [item.name, await TextEditor.enrichHTML(item.link)]
      }));

      return [result.map(r => r[0]), result.map(r => r[1])];
    })();

    return {
      ...(await super._prepareContext()),
      prerequisites: {
        names: itemNames,
        links: itemLinks,
      },
      debug: game.user.isGM && !!game.settings.get("ptr2e", "dev-mode"),
    }
  }

  override async _onDropItem(event: DragEvent, data: object) {
    const item = await ItemPTR2e.fromDropData(data as DropCanvasData);
    if (!item || item.type !== "species") return super._onDropItem(event, data);

    if(this.document.system.webs.has(item.uuid)) return;

    const species = await fromUuid<SpeciesPTR2e>(item.uuid);
    if(!species) return;

    const uuid = species.system.evolutions?.uuid ?? item.uuid;
    if(this.document.system.webs.has(uuid)) return;

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
}