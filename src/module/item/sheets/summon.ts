import { ItemPTR2e } from "@item";
import { default as ItemSheetPTR2e } from "./base.ts";
import type { AnyObject } from "fvtt-types/utils";

export default class SummonSheet extends ItemSheetPTR2e<AnyObject> {
  static override DEFAULT_OPTIONS = foundry.utils.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["summon-sheet"],
    },
    { inplace: false }
  );

  static override readonly overviewTemplate = "systems/ptr2e/templates/items/summon/summon-overview.hbs";
  static override readonly detailsTemplate = "systems/ptr2e/templates/items/summon/summon-details.hbs";
  override noActions = false;

  static override PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> =
    foundry.utils.mergeObject(super.PARTS, {
      overview: {
        template: SummonSheet.overviewTemplate,
      },
      details: {
        template: SummonSheet.detailsTemplate,
      },
    }, { inplace: false });

  protected override async _onCreate(event: Event) {
    const type = (event.currentTarget as HTMLElement).dataset.type;
    if (!type) return;

    // Items only support effects
    if (type !== "effect") return;

    return CONFIG.ActiveEffect.documentClass.createDialog({}, { parent: this.document, types: ["summon"] });
  }

  override async _onDropActiveEffect(_event: DragEvent, data: object) {
    const effect = await CONFIG.ActiveEffect.documentClass.fromDropData(data);
    if (!this.document.isOwner || !effect) return false;
    if (effect.parent === this.document) return false;

    // Change type to 'Summon' as it's the only type that should be on Summon Items
    return CONFIG.ActiveEffect.documentClass.create(this.updateEffectType(effect.toObject()), { parent: this.document });
  }

  override async _onDropItem(_event: DragEvent, data: object) {
    const item = await ItemPTR2e.fromDropData(data as foundry.abstract.Document.DropData<Item.ConfiguredInstance>);
    if (!item || item.type !== "effect") return;
    // Change type to 'Summon' as it's the only type that should be on Summon Items
    const effects = item.effects.map((effect) => this.updateEffectType((effect as ActiveEffect.ConfiguredInstance).toObject()));
    if (effects.length === 0) return;
    return CONFIG.ActiveEffect.documentClass.createDocuments(effects, { parent: this.document });
  }

  private updateEffectType(data: ActiveEffect.ConstructorData): ActiveEffect.ConfiguredInstance {
    data.type = "summon";
    return data
  }
}