import { ItemPTR2e, PerkPTR2e } from "@item";

type ItemRarity = "common" | "uncommon" | "rare" | "unique";
type ItemGrade = "E" | "E+" | "D-" | "D" | "D+" | "C-" | "C" | "C+" | "B-" | "B" | "B+" | "A-" | "A" | "A+" | "S-" | "S" | "S+";
interface TimeDuration {
    value: number,
    unit: "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years"
}

type IdentificationStatus = "identified" | "unidentified" | "misidentified";
interface IdentificationSource {
    misidentified: Partial<ItemPTR2e>,
    status: IdentificationStatus,
    unidentified: MystifiedData,
}
interface MystifiedData {
    name: string,
    img: ImageFilePath,
    description: string,
}

type ItemCarryType = "held" | "worn" | "stowed" | "dropped";

// Priority & Interrupt are [Traits] so don't need a data field
type ActionCost = "simple" | "complete" | "free";
type ActionType = ActivityType | "attack" | "passive";
type ActivityType = "camping" | "downtime" | "exploration";

type TargetOption = "self" | "ally" | "enemy" | "creature" | "object" | "blast" | "cone" | "line" | "wide-line" | "emanation" | "field" | "aura" | "allied-aura" | "enemy-aura";

export type {
    ItemRarity,
    ItemGrade,
    TimeDuration,
    IdentificationSource,
    MystifiedData,
    ItemCarryType,
    ActionCost,
    ActionType,
    ActivityType,
    TargetOption,
}

//TODO: move elsewhere
export type PTRNode = {
    id: string
    angle: number
    distance: number
    type: "normal" | "root" | "ranked"
    connected: Set<string>
    texture: string
    visible: boolean
    point: {
        x: number,
        y: number,
    }
    color: string
    perk: PerkPTR2e
}