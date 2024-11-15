import { ItemPTR2e, SummonPTR2e } from "@item";
import { default as ItemSheetPTR2e } from "./base.ts";
import { ActiveEffectPTR2e, ActiveEffectSystem } from "@effects";
import SummonActiveEffectSystem from "@module/effects/data/summon.ts";
import { ActiveEffectSchema } from "types/foundry/common/documents/active-effect.js";

export default class SummonSheet extends ItemSheetPTR2e<SummonPTR2e["system"]> {
  static override DEFAULT_OPTIONS = fu.mergeObject(
    super.DEFAULT_OPTIONS,
    {
      classes: ["summon-sheet"],
    },
    { inplace: false }
  );

  static override readonly overviewTemplate = "systems/ptr2e/templates/items/summon/summon-overview.hbs";
  static override readonly detailsTemplate = "systems/ptr2e/templates/items/summon/summon-details.hbs";
  override noActions = false;

  static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> =
    fu.mergeObject(super.PARTS, {
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

    return ActiveEffectPTR2e.createDialog({}, { parent: this.document, types: ["summon"] });
  }

  override async _onDropActiveEffect(_event: DragEvent, data: object) {
    const effect = await ActiveEffectPTR2e.fromDropData(data);
    if (!this.document.isOwner || !effect) return false;
    if (effect.parent === this.document) return false;

    // Change type to 'Summon' as it's the only type that should be on Summon Items
    return ActiveEffectPTR2e.create(this.updateEffectType(effect.toObject()), { parent: this.document });
  }

  override async _onDropItem(_event: DragEvent, data: object) {
    const item = await ItemPTR2e.fromDropData(data as DropCanvasData);
    if (!item || item.type !== "effect") return;
    // Change type to 'Summon' as it's the only type that should be on Summon Items
    const effects = item.effects.map((effect) => this.updateEffectType((effect as ActiveEffectPTR2e).toObject()));
    if (effects.length === 0) return;
    return ActiveEffectPTR2e.createDocuments(effects, { parent: this.document });
  }

  private updateEffectType(data: SourceFromSchema<ActiveEffectSchema<string, ActiveEffectSystem>>): SourceFromSchema<ActiveEffectSchema<string, SummonActiveEffectSystem>> {
    data.type = "summon";
    return data as SourceFromSchema<ActiveEffectSchema<string, SummonActiveEffectSystem>>;
  }
}