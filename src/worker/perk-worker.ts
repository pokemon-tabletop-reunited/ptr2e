/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Skill, type Actor, type ActorData, type GeneratorConfig, type Perk, type PerkNodeData, type PriorityOrder, type PriorityOrderType } from "./types.js";
import { Graph, Node, NodeId, PathResult } from "./graph/graph.ts";
import { mergeObject } from "./perk-validator.ts";


const graph = new Graph<PerkNodeData>();

async function initializePerks({ perks }: { perks: Perk[] }) {
  for (const perk of perks) {
    if (!perk.system.global) continue;
    for (const node of perk.system.nodes ?? []) {
      if (!node.x || !node.y) continue
      const index = perk.system.variant === "multi" ? perk.system.nodes.indexOf(node) : -1;

      graph.addNode(index > 0 ? `${perk.slug}-${index}` : perk.slug, {
        perk,
        cost: node.type === "root" ? 1 : perk.system.cost,
        connected: new Set(node.connected ?? []),
        root: node.type === "root"
      })
    }
  }
  for (const node of graph) {
    for (const connection of node.data.connected) {
      if (!graph.getNode(connection) || graph.getLink(connection, node.id) || graph.getLink(node.id, connection)) continue;
      graph.addLink(node.id, connection);
    }
  }
  return [true];
}

async function generate({ config, actor: actorData, options }: { config: GeneratorConfig, actor: ActorData, options: string[] }) {
  const actorSystem = mergeObject(actorData.system, {
    skills: actorData.system.skills.reduce((acc, skill) => {
      acc.set(skill.slug, {
        ...skill,
        total: skill.value + skill.rvs,
        mod: skill.value + skill.rvs
      })
      return acc;
    }, new Map<string, Skill>())
  }, { inplace: false }) as unknown as Actor["system"];
  const actor = mergeObject(actorData, { system: actorSystem }, { inplace: false }) as unknown as Actor;
  actor.skills = Array.from(actor.system.skills.values()).reduce((acc, skill) => {
    acc[skill.slug] = skill;
    return acc;
  }, {} as Record<string, Skill>);
  
  // Give Actor 1 additional AP to account for the free Root, since all roots in the generator are 1 cost.
  config.points.ap += 1;

  // Restart the pathfinder pool between searches; this is necessary to prevent weird caching issues.
  graph.pathfinder.pool.fullReset();

  switch (config.mode) {
    case "species": return generateSpecies(config, actor, options);
    case "order": return generateOrder(config, actor, options);
    default: return [null];
  }
}

//TODO: Add this functionality
async function generateSpecies(config: GeneratorConfig, actor: Actor, options: string[]) {
  if (config.mode !== "species") return [null, actor, options];
  return [null];
}

async function generateOrder(config: GeneratorConfig, actor: Actor, options: string[]) {
  if (config.mode !== "order") return [null];
  config.priority ??= [];

  // Organize priorities
  const priorities = {
    arena: [],
    approach: [],
    archetype: [],
    perk: [],
    trait: [],
  } as {
      [K in PriorityOrderType]: PriorityOrder[K][];
    };

  for (const priority of config.priority) {
    switch (priority.type) {
      case "arena": priorities.arena.push(priority as PriorityOrder["arena"]); break;
      case "approach": priorities.approach.push(priority as PriorityOrder["approach"]); break;
      case "archetype": priorities.archetype.push(priority as PriorityOrder["archetype"]); break;
      case "perk": priorities.perk.push(priority as PriorityOrder["perk"]); break;
      case "trait": priorities.trait.push(priority as PriorityOrder["trait"]); break;
    }
  }

  // Step 1: Check if Priority items contains a perk.
  if (priorities.perk.length === 0) return handleNoPriorityPerks({ config, priorities }, { actor, options });
  else return handlePriorityPerks({ config, priorities }, { actor, options });
}

function handlePriorityPerks({
  config,
  priorities,
  currentPath,
  purchasedPerks,
  _depth = 0
}: {
  config: GeneratorConfig,
  priorities: { [K in PriorityOrderType]: PriorityOrder[K][] },
  currentPath?: PathResult<PerkNodeData>[],
  purchasedPerks?: Node<PerkNodeData>[],
  _depth?: number
}, { actor, options }: { actor: Actor, options: string[] }) {
  if (_depth > 500) return currentPath?.length ? [currentPath] : [null];

  // Step 2: Set highest priority perk as the starting point
  const startingPerk = (() => {
    while (priorities.perk.length) {
      const perk = graph.getNode(priorities.perk.at(0)!.slug);
      if (perk) return perk;
      priorities.perk.shift();
    }
    return null;
  })()
  if (!startingPerk) return handleNoPriorityPerks({ config, priorities, currentPath, purchasedPerks, _depth: _depth + 1 }, { actor, options });

  switch (config.entry.mode) {
    case "choice": {
      const entryRoot = graph.get(config.entry.choice);
      if (!entryRoot) return [null];
      const baseNodes = purchasedPerks?.length ? purchasedPerks : [entryRoot];
      const path = (() => {
        const path = baseNodes.reduce(reducePath(graph, startingPerk, config, actor, options), undefined);
        if (!path) {
          // No valid path was found to this node period. It is impossible to reach this node.
          if (path !== null) return null;

          // Otherwise; there where paths, but they cost too much AP.
          const visited = new Set<NodeId>();
          const alternatives = Array.from(startingPerk.data.connected).flatMap(c => graph.getNode(c) ?? []);
          while (alternatives.length) {
            const alternative = alternatives.shift();
            if (!alternative) continue;
            visited.add(alternative.id);
            const path = baseNodes.reduce(reducePath(graph, alternative, config, actor, options), undefined);
            if (path) return path

            alternatives.push(...Array.from(alternative.data.connected).flatMap(c => graph.getNode(c) ?? []).filter(n => !visited.has(n.id)));
          }
        }
        return path ?? null;
      })()
      if (path?.from === startingPerk.id) {
        const leftoverAP = config.points.ap - path.cost;

        const skills = Array.from(path.skills.values());
        const leftoverRV = config.points.rv - skills.reduce((acc, { value }) => acc + value, 0);
        if (skills.length) {
          for (const { skill, value } of skills) {
            actor.skills[skill].rvs += value;
            actor.skills[skill].mod = actor.skills[skill].total += value;
          }
        }

        if (leftoverAP > 0) {
          const newConfig = Object.assign({}, config, { points: { ap: leftoverAP, rv: leftoverRV } } satisfies Partial<GeneratorConfig>);
          const newPerkPriorities = priorities.perk.slice(1);
          return handlePriorityPerks({ config: newConfig, priorities: { ...priorities, perk: newPerkPriorities }, currentPath: currentPath?.length ? [...currentPath, path] : [path], purchasedPerks: purchasedPerks?.length ? [...purchasedPerks, ...path.path] : path.path, _depth: 0 }, { actor, options });
        }
      }
      return currentPath?.length ? [[...currentPath, path ?? []].flat()] : [path ? [path] : null];
    }
    case "best": {
      const path = (() => {
        const baseNodes = purchasedPerks?.length ? purchasedPerks : graph.rootNodes;
        const path = baseNodes.reduce(reducePath(graph, startingPerk, config, actor, options), undefined);
        if (!path) {
          // No valid path was found to this node period. It is impossible to reach this node.
          if (path !== null) return null;

          // Otherwise; there where paths, but they cost too much AP.
          const visited = new Set<NodeId>();
          const alternatives = Array.from(startingPerk.data.connected).flatMap(c => graph.getNode(c) ?? []);
          while (alternatives.length) {
            const alternative = alternatives.shift();
            if (!alternative) continue;
            visited.add(alternative.id);
            const path = baseNodes.reduce(reducePath(graph, alternative, config, actor, options), undefined);
            if (path) return path

            alternatives.push(...Array.from(alternative.data.connected).flatMap(c => graph.getNode(c) ?? []).filter(n => !visited.has(n.id)));
          }
        }
        return path ?? null;
      })()
      if (path?.from === startingPerk.id) {
        const leftoverAP = config.points.ap - path.cost;

        const skills = Array.from(path.skills.values());
        const leftoverRV = config.points.rv - skills.reduce((acc, { value }) => acc + value, 0);
        if (skills.length) {
          for (const { skill, value } of skills) {
            actor.skills[skill].rvs += value;
            actor.skills[skill].mod = actor.skills[skill].total += value;
          }
        }

        if (leftoverAP > 0) {
          const newConfig = Object.assign({}, config, { points: { ap: leftoverAP, rv: leftoverRV } } satisfies Partial<GeneratorConfig>);
          const newPerkPriorities = priorities.perk.slice(1);
          return handlePriorityPerks({ config: newConfig, priorities: { ...priorities, perk: newPerkPriorities }, currentPath: currentPath?.length ? [...currentPath, path] : [path], purchasedPerks: purchasedPerks?.length ? [...purchasedPerks, ...path.path] : path.path, _depth: _depth + 1 }, { actor, options });
        }
      }

      return currentPath?.length ? [[...currentPath, path ?? []].flat()] : [path ? [path] : null];
    }
  }

  return [null];
}

function handleNoPriorityPerks({ config, priorities, currentPath, purchasedPerks, oldNodesByArchetype, triedArchetypes, _depth = 0 }: {
  config: GeneratorConfig,
  priorities: { [K in PriorityOrderType]: PriorityOrder[K][] },
  currentPath?: PathResult<PerkNodeData>[],
  purchasedPerks?: Node<PerkNodeData>[],
  oldNodesByArchetype?: Record<string, Node<PerkNodeData>[]>,
  triedArchetypes?: Set<string>,
  _depth?: number
}, { actor, options }: { actor: Actor, options: string[] }): (PathResult<PerkNodeData>[] | null)[] {
  if (_depth > 500) return currentPath?.length ? [currentPath] : [null];
  // If there are any perk priorities, we need to handle them first.
  if (priorities.perk.length) return handlePriorityPerks({ config, priorities, currentPath, purchasedPerks, _depth: _depth + 1 }, { actor, options });
  // If there aren't, and there are no other priorities, stop generating.
  if (!priorities.arena.length && !priorities.approach.length && !priorities.archetype.length && !priorities.trait.length) return currentPath?.length ? [currentPath] : [null];

  // Generate based on the next priority
  const nextHighestPriority = (() => {
    const combined = [priorities.arena ?? [], priorities.approach ?? [], priorities.archetype ?? [], priorities.trait ?? []].flat();
    if (!combined.length) return null;
    const lowestPriority = combined.reduce((acc, p) => acc.priority < p.priority ? acc : p);
    return lowestPriority;
  })();
  const filterOutPriority = () => {
    if (!nextHighestPriority) return;
    //@ts-expect-error - This is impossible to type.
    priorities[nextHighestPriority.type] = priorities[nextHighestPriority.type].filter(p => p.slug !== nextHighestPriority.slug)
  }
  if (!nextHighestPriority) {
    filterOutPriority();
    return currentPath?.length ? [currentPath] : [null];
  }

  const baseNodes = purchasedPerks?.length ? purchasedPerks : graph.rootNodes;

  const bestNodesByArchetype = oldNodesByArchetype ?? graph.reduce((best, node) => {
    if (baseNodes.includes(node)) return best;

    const priority = Graph.getPriority(node, [nextHighestPriority]);
    if (priority < best.priority) return { nodes: [node], priority };
    if (priority > best.priority) return best;
    return { nodes: [...best.nodes, node], priority };
  }, { nodes: [], priority: Number.POSITIVE_INFINITY } as { nodes: Node<PerkNodeData>[], priority: number }).nodes.reduce((nodes, node) => {
    const archetype = (["mobility", "stat ace"].includes(node.data.perk.system.design.archetype?.toLowerCase()) ? "none" : node.data.perk.system.design.archetype) || "none";
    if (triedArchetypes?.has(archetype)) return nodes;
    nodes[archetype] ??= [];
    nodes[archetype].push(node);
    return nodes;
  }, {} as Record<string, Node<PerkNodeData>[]>);

  const bestNodes: { archetype: Node<PerkNodeData>[], none: Node<PerkNodeData>[] } = Object.entries(bestNodesByArchetype).reduce((acc, [archetype, nodes]) => {
    if (!acc.archetype?.length) {
      if (archetype === "none") return { archetype: acc.archetype, none: nodes ?? [] };
      return { archetype: nodes ?? acc.archetype, none: acc.none };
    }
    if (archetype === "none") return { archetype: acc.archetype, none: nodes ?? [] };
    if (nodes?.length > acc.archetype.length) return { archetype: nodes, none: acc.archetype };

    return acc;
  }, { archetype: [], none: [] } as { archetype: Node<PerkNodeData>[], none: Node<PerkNodeData>[] });

  if (!bestNodes.archetype.length && !bestNodes.none.length) {
    filterOutPriority();
    return handleNoPriorityPerks({ config, priorities, currentPath, purchasedPerks, _depth: _depth + 1 }, { actor, options });
  }

  const nodes = bestNodes.archetype.length ? bestNodes.archetype : bestNodes.none;

  const paths = nodes.flatMap(node => {
    const path = baseNodes.reduce(reducePath(graph, node, config, actor, options), undefined);
    return path ? path : [];
  });
  if (!paths.length || paths.every(p => p.length === 0)) {
    const oldNodesByArchetype = bestNodesByArchetype;
    const archetype = bestNodes.archetype.length ? bestNodes.archetype[0].data.perk.system.design.archetype : "none";
    delete oldNodesByArchetype[archetype];
    return handleNoPriorityPerks({ config, priorities, currentPath, purchasedPerks, oldNodesByArchetype, triedArchetypes: new Set([...(triedArchetypes ?? []), archetype]), _depth: _depth + 1 }, { actor, options });
  }

  const bestPath = paths.reduce((bestPath, path) => {
    if(path.length === 0) return bestPath;
    if (!bestPath) {
      if (config.points.ap) {
        if (path.cost > config.points.ap) return bestPath ?? null;
      }
      return path;
    }
    else {
      if (config.points.ap) {
        if (path.cost > config.points.ap) return bestPath;
      }
      if (path.priority < bestPath.priority) return path;
      if (path.priority > bestPath.priority) return bestPath;
      switch (config.cost.priority) {
        // The path with the lowest cost is the best path
        case "cheapest": {
          if (path.cost < bestPath.cost) return path;
          // If the cost is the same...
          else if (path.cost === bestPath.cost) {
            // ...should we prioritize the shortest path?
            if (config.cost.resolution === "cheapest") {
              if (path.length < bestPath.length) return path;
            }
            /// ...or the longest path?
            else if (config.cost.resolution === "costliest") {
              if (path.length > bestPath.length) return path;
            }
            // ...or should we just pick a random path?
            else if (config.cost.resolution === "random") {
              if (Math.random() < 0.5) return path;
            }
          }
          break;
        }
        // The path with the highest cost is the best path
        case "shortest": {
          if (path.length < bestPath.length) return path;
          // If the cost is the same...
          else if (path.length === bestPath.length) {
            // ...should we prioritize the cheapest path?
            if (config.cost.resolution === "cheapest") {
              if (path.cost < bestPath.cost) return path;
            }
            // ...or the costliest path?
            else if (config.cost.resolution === "costliest") {
              if (path.cost > bestPath.cost) return path;
            }
            // ...or should we just pick a random path?
            else if (config.cost.resolution === "random") {
              if (Math.random() < 0.5) return path;
            }
          }
          break;
        }
        // Literally just pick a random path
        case "random": {
          if (Math.random() < 0.5) return path;
          break;
        }
      }
      return bestPath;
    }
  }, undefined as PathResult<PerkNodeData> | undefined | null);
  if (!bestPath?.length) {
    filterOutPriority();
    return handleNoPriorityPerks({ config, priorities, currentPath, purchasedPerks, _depth: _depth + 1 }, { actor, options });
  }

  const leftoverAP = config.points.ap - bestPath.cost;
  const skills = Array.from(bestPath.skills.values());
  const leftoverRV = config.points.rv - skills.reduce((acc, { value }) => acc + value, 0);
  if (skills.length) {
    for (const { skill, value } of skills) {
      actor.skills[skill].rvs += value;
      actor.skills[skill].mod = actor.skills[skill].total += value;
    }
  }

  if (leftoverAP > 0) {
    const newConfig = Object.assign({}, config, { points: { ap: leftoverAP, rv: leftoverRV } } satisfies Partial<GeneratorConfig>);
    const oldNodesByArchetype = bestNodesByArchetype;
    for (const perk of bestPath.path) {
      const archetype = perk.data.perk.system.design.archetype || "none";
      oldNodesByArchetype[archetype] = oldNodesByArchetype[archetype]?.filter(n => n.id !== perk.id);
    }

    return handleNoPriorityPerks({ config: newConfig, priorities, currentPath: currentPath?.length ? [...currentPath, bestPath] : [bestPath], purchasedPerks: purchasedPerks?.length ? [...purchasedPerks, ...bestPath.path] : bestPath.path, oldNodesByArchetype, _depth: 0 }, { actor, options });
  }

  return currentPath?.length ? [[...currentPath, bestPath]] : [[bestPath]];
}

function reducePath<NodeData extends PerkNodeData = PerkNodeData, LinkData = unknown>(graph: Graph<PerkNodeData, LinkData>, from: Node<NodeData, LinkData>, config: GeneratorConfig, actor: Actor, options: string[]) {
  function pathReducer(bestPath: PathResult<NodeData, LinkData> | undefined | null, to: Node<NodeData, LinkData>): PathResult<NodeData, LinkData> | null | undefined {
    const path = graph.findPath(from.id, to.id, config, { actor, options }) as PathResult<NodeData, LinkData>;
    if (!bestPath) {
      if (config.points.ap) {
        if (path.cost > config.points.ap) return bestPath ?? null;
      }
      return path;
    }
    else {
      if (config.points.ap) {
        if (path.cost > config.points.ap) return bestPath;
      }
      if (path.priority < bestPath.priority) return path;
      if (path.priority > bestPath.priority) return bestPath;
      switch (config.cost.priority) {
        // The path with the lowest cost is the best path
        case "cheapest": {
          if (path.cost < bestPath.cost) return path;
          // If the cost is the same...
          else if (path.cost === bestPath.cost) {
            // ...should we prioritize the shortest path?
            if (config.cost.resolution === "cheapest") {
              if (path.length < bestPath.length) return path;
            }
            /// ...or the longest path?
            else if (config.cost.resolution === "costliest") {
              if (path.length > bestPath.length) return path;
            }
            // ...or should we just pick a random path?
            else if (config.cost.resolution === "random") {
              if (Math.random() < 0.5) return path;
            }
          }
          break;
        }
        // The path with the highest cost is the best path
        case "shortest": {
          if (path.length < bestPath.length) return path;
          // If the cost is the same...
          else if (path.length === bestPath.length) {
            // ...should we prioritize the cheapest path?
            if (config.cost.resolution === "cheapest") {
              if (path.cost < bestPath.cost) return path;
            }
            // ...or the costliest path?
            else if (config.cost.resolution === "costliest") {
              if (path.cost > bestPath.cost) return path;
            }
            // ...or should we just pick a random path?
            else if (config.cost.resolution === "random") {
              if (Math.random() < 0.5) return path;
            }
          }
          break;
        }
        // Literally just pick a random path
        case "random": {
          if (Math.random() < 0.5) return path;
          break;
        }
      }
    }

    return bestPath;
  }
  return pathReducer;
}

self.initializePerks = initializePerks;
self.generate = generate;

declare global {
  interface Window {
    initializePerks: typeof initializePerks;
    generate: typeof generate;
  }
}