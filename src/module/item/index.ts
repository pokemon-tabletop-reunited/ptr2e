import { ItemPTR2e } from "./base/document.ts";
import { GearSystemPTR2e } from "./gear/system.ts";
import { PerkSystemPTR2e } from "./perk/system.ts";
import { SpeciesSystemPTR2e } from "./species/system.ts";

// Base
export * from "./base/document.ts";

// Items
type PerkPTR2e = ItemPTR2e<PerkSystemPTR2e>;
type GearPTR2e = ItemPTR2e<GearSystemPTR2e>;
type SpeciesPTR2e = ItemPTR2e<SpeciesSystemPTR2e>;

export type {
    PerkPTR2e,
    GearPTR2e,
    SpeciesPTR2e
}

// Sheets

// Systems
export * from "./base/system.ts";
export { GearSystemPTR2e } from "./gear/system.ts";
export { PerkSystemPTR2e } from "./perk/system.ts";
export { SpeciesSystemPTR2e } from "./species/system.ts";

// Other Data Models
export { ActionPTR2e, RangePTR2e } from "../action.ts";

export * as data from "./base/data.ts";