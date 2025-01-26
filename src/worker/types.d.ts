export interface ActorData {
  name: string;
  system: {
    skills: SkillData[]
    advancement: {
      level: number
    }
    [key: string]: unknown;
  }
}

export interface Actor {
  name: string;
  system: {
    skills: Map<string, Skill>
    advancement: {
      level: number
    }
    [key: string]: unknown;
  }
  skills: Record<string, Skill>;
}

export interface Skill extends SkillData {
  total: number;
  mod: number
}

export interface SkillData {
  slug: string;
  value: number;
  rvs: number;
}

export interface Perk {
  slug: string;
  name: string;
  system: {
    prerequisites: string[];
    autoUnlock: string[];
    cost: number;
    nodes: PerkNode[];
    design: {
      arena: "physical" | "mental" | "social";
      approach: "power" | "finesse" | "resilience";
      archetype: string;
    }
    variant: "multi" | "tiered";
    mode: "shared" | "individual" | "replace" | "coexist";
    global: boolean;
    webs: Set<string>;
    traits: string[];
  }
}

export interface PerkNode {
  x: number;
  y: number;
  connected: Set<string>;
  hidden: boolean;
  type: "normal" | "root" | "entry";
  tier: {
    rank: number;
    uuid: string;
  }
}

export interface PerkNodeData {
  perk: Perk;
  cost: number;
  connected: Set<string>;
  /**
   * Whether this node is a root node
   */
  root: boolean;
}

export interface GeneratorConfig {
  mode: PriorityMode;
  priority: PriorityOrder[keyof PriorityOrder][];
  cost: {
    priority: PriorityCostPriority;
    resolution: PriorityCostResolution;
  }
  entry: {
    mode: EntryMode;
    choice?: string
  }
  randomness: number;
  points: {
    ap: number;
    rv: number
  }
}

export interface PriorityOrder {
  "arena": PriorityOrderArenaData;
  "approach": PriorityOrderApproachData;
  "archetype": PriorityOrderArchetypeData;
  "trait": PriorityOrderTraitData;
  "perk": PriorityOrderPerkData;
}

export interface PriorityOrderBase<Type extends PriorityOrderType = PriorityOrderType> {
  slug: string;
  priority: number;
  type: Type;
}

export interface PriorityOrderArenaData extends PriorityOrderBase<"arena"> {
  arena: "physical" | "mental" | "social";
}

export interface PriorityOrderApproachData extends PriorityOrderBase<"approach"> {
  approach: "power" | "finesse" | "resilience";
}

export interface PriorityOrderArchetypeData extends PriorityOrderBase<"archetype"> {
  archetype: string;
}

export interface PriorityOrderTraitData extends PriorityOrderBase<"trait"> {
  trait: string;
}

export interface PriorityOrderPerkData extends PriorityOrderBase<"perk"> {
  data?: Perk;
}

export type PriorityOrderType = "arena" | "approach" | "archetype" | "trait" | "perk";

export type PriorityMode = "species" | "order"
export type PriorityCostPriority = "cheapest" | "shortest" | "random";
export type PriorityCostResolution = "cheapest" | "costliest" | "random";
export type EntryMode = "best" | "random" | "choice";