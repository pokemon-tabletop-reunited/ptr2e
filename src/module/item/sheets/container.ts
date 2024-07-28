import { ContainerPTR2e } from "@item";
import { default as ItemSheetPTR2e } from "./base.ts";

export default class ContainerSheet extends ItemSheetPTR2e<ContainerPTR2e["system"]> {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["ability-sheet"],
        },
        { inplace: false }
    );

    static override readonly overviewTemplate= "systems/ptr2e/templates/items/container/container-overview.hbs";
    static override readonly detailsTemplate= "systems/ptr2e/templates/items/container/container-details.hbs";
    override noActions = true;

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = 
        fu.mergeObject(super.PARTS, {
            overview: {
                template: ContainerSheet.overviewTemplate,
            },
            details: {
                template: ContainerSheet.detailsTemplate,
            },
        }, { inplace: false });
}