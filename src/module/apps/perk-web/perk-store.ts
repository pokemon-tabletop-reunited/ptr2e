import { ItemPTR2e, PerkPTR2e, SpeciesPTR2e } from "@item";
import PerkGraph from "./perk-graph.ts";
import { ActorPTR2e } from "@actor";
import { SummonStatistic } from "@system/statistics/summon.ts";
import { Predicate } from "@system/predication/predication.ts";

export const PerkState = {
  unavailable: 0,
  connected: 1,
  available: 2,
  purchased: 3,
  invalid: 4,
  autoUnlocked: 5
} as const;

export type PerkPurchaseState = ValueOf<typeof PerkState>;

export interface PerkNode {
  position: {
    x: number;
    y: number;
  };
  element?: HTMLElement;
  perk: PerkPTR2e;
  node: PerkPTR2e['system']['nodes'][0];
  connected: Set<string>;
  state: PerkPurchaseState;
  web: "global" | string;
  slug: string;
  tierInfo?: { tier: number, perk: PerkPTR2e, maxTier: number, maxTierPurchased?: boolean, lastTier: PerkPTR2e, previousTier: PerkPTR2e | null };
}

class PerkStore extends Collection<PerkNode> {
  private _graph: PerkGraph;
  private _rootNodes: PerkNode[] | null = null;
  private _initialized = false;
  // UUID or 'global'
  private web: "global" | ItemUUID = "global";

  get initialized() {
    return this._initialized;
  }

  get rootNodes() {
    return this._rootNodes ??= this.filter(node => node.perk.system.nodes[0]?.type === "root");
  }

  get graph() {
    return this._graph;
  }

  private static perkNodeToNode(perk: PerkPTR2e, node: PerkPTR2e['system']['nodes'][0] | null) {
    if (!node) return [];
    if (!node.x || !node.y) return [];
    const index = perk.system.variant === "multi" ? perk.system.nodes.indexOf(node) : -1;
    return [{
      position: { x: node.x, y: node.y },
      perk,
      connected: new Set(node.connected),
      state: PerkState.unavailable,
      web: "global",
      node,
      slug: index > 0 ? `${perk.slug}-${index}` : perk.slug
    }]
  }

  private static filterWebNode(node: PerkNode, web: "global" | ItemUUID): boolean {
    return this.filterWeb(node.perk, web);
  }

  private static filterWeb(perk: PerkPTR2e, web: "global" | ItemUUID): boolean {
    if (web === "global") return perk.system.global;
    return perk.system.webs.has(web);
  }

  constructor({ perks, nodes, web }: { perks?: PerkPTR2e[], nodes?: PerkNode[], web?: "global" | ItemUUID } = {}) {
    web ||= "global";

    // If nodes are provided, simply map them to the collection
    if (nodes?.length) {
      super(nodes.filter(node => PerkStore.filterWebNode(node, web!)).map((entry => [`${entry.position.x}-${entry.position.y}`, entry])));
    }
    // If perks are provided, convert them to nodes and map them to the collection 
    else if (perks?.length) {
      super(
        perks.filter(perk => PerkStore.filterWeb(perk, web!)).flatMap((perk): PerkNode[] =>
          perk.system.variant === "multi"
            ? perk.system.nodes.flatMap(node => PerkStore.perkNodeToNode(perk, node))
            : PerkStore.perkNodeToNode(perk, perk.system.primaryNode)
        ).map((entry) => [`${entry.position.x}-${entry.position.y}`, entry])
      );
    }
    // If neither perks nor nodes are provided, initialize the store with all perks loaded in the game
    else {
      if (!game.ptr.perks.initialized) throw new Error("PerkStore must be provided with perks or nodes if global perks are not initialized");
      super(Array.from(game.ptr.perks.perks.values()).filter(perk => PerkStore.filterWeb(perk, web!)).flatMap((perk): PerkNode[] => perk.system.variant === "multi"
        ? perk.system.nodes.flatMap(node => PerkStore.perkNodeToNode(perk, node))
        : PerkStore.perkNodeToNode(perk, perk.system.primaryNode)
      ).map((entry) => [`${entry.position.x}-${entry.position.y}`, entry]));
    }

    this._graph = new PerkGraph(this);
    this.web = web;
  }

  async reinitialize({ perks, nodes, actor, web }: { perks?: PerkPTR2e[], nodes?: PerkNode[], actor?: ActorPTR2e, web?: "global" | ItemUUID } = {}) {
    this.clear();
    this._initialized = false;
    this._rootNodes = null;
    if (web) this.web = web;

    // If nodes are provided, simply map them to the collection
    if (nodes?.length) {
      for (const node of nodes) {
        if (!PerkStore.filterWebNode(node, this.web)) continue;
        this.set(`${node.position.x}-${node.position.y}`, node);
      }
    }
    // If perks are provided, convert them to nodes and map them to the collection 
    else if (perks?.length) {
      for (const node of perks.filter(perk => PerkStore.filterWeb(perk, this.web)).flatMap((perk): PerkNode[] =>
        perk.system.variant === "multi"
          ? perk.system.nodes.flatMap(node => PerkStore.perkNodeToNode(perk, node))
          : PerkStore.perkNodeToNode(perk, perk.system.primaryNode)
      )) {
        this.set(`${node.position.x}-${node.position.y}`, node);
      }
    }
    // If neither perks nor nodes are provided, initialize the store with all perks loaded in the game
    else {
      if (!game.ptr.perks.initialized) throw new Error("PerkStore must be provided with perks or nodes if global perks are not initialized");
      for (const node of Array.from(game.ptr.perks.perks.values()).filter(perk => PerkStore.filterWeb(perk, this.web)).flatMap((perk): PerkNode[] =>
        perk.system.variant === "multi"
          ? perk.system.nodes.flatMap(node => PerkStore.perkNodeToNode(perk, node))
          : PerkStore.perkNodeToNode(perk, perk.system.primaryNode)
      )) {
        this.set(`${node.position.x}-${node.position.y}`, node);
      }
    }

    if (actor) return this.updateState(actor);
  }

  updateState(actor: Maybe<ActorPTR2e>) {
    const purchasedRoots: PerkNode[] = [];
    const purchasedNodes: PerkNode[] = [];
    let currentTier = 0;

    for (const node of this) {
      if (node.node && node.node.x !== null && node.node.y !== null) {
        const isRoot = node.node.type === "root";

        if (node.perk.flags.ptr2e?.evolution) {
          if (!actor) continue;
          const evolution = node.perk.flags.ptr2e.evolution as {
            name: string;
            uuid: string;
            tier: number;
          }

          const species = actor.items.get('actorspeciesitem') as SpeciesPTR2e | undefined;
          if (!species) continue;

          if (species.flags.core?.sourceId === evolution.uuid || (species.slug + (species?.system.form ? `-${species.system.form}` : "")) === evolution.name || species.slug === evolution.name) {
            node.state = PerkState.purchased;
            currentTier = Math.max(currentTier, evolution.tier);

            purchasedNodes.push(node);
            purchasedRoots.push(node);
            continue;
          }
        }

        const actorPerk = actor?.perks.get(
          node.perk.system.variant === "multi"
            ? node.perk.system.mode === "shared"
              ? node.perk.slug
              : node.slug
            : node.slug
        );
        const state = actorPerk ? PerkState.purchased : PerkState.unavailable;
        if (actorPerk && node.perk.system.variant === "tiered") {
          node.tierInfo = (() => {
            const tiers = node.perk.system.nodes.flatMap(node => {
              if (!node.tier) return [];
              const perk = fromUuidSync<ItemPTR2e>(node.tier.uuid);
              if (!(perk instanceof ItemPTR2e && perk.type === "perk")) return [];
              return { perk, tier: node.tier.rank }
            }) as { perk: PerkPTR2e, tier: number }[];
            tiers.unshift({ perk: node.perk, tier: 1 });

            const maxTier = tiers.reduce((acc, { tier }) => Math.max(acc, tier), 0);
            const { tier: lastPurchasedTier, item: lastPurchasedPerk } = tiers.reduce((acc, { perk, tier }) => {
              const item = actor!.perks.get(perk.slug);
              if (!item) return acc;
              return { tier: Math.max(acc.tier, tier), item };
            }, { tier: 1, item: actorPerk, previous: null } as { tier: number, item: PerkPTR2e });
            const previousTier = tiers.find(({ tier }) => tier === lastPurchasedTier - 1)?.perk ?? null;

            if (lastPurchasedTier && maxTier === lastPurchasedTier) {
              const tier = tiers.find(({ tier }) => tier === lastPurchasedTier)!;
              return {
                tier: tier.tier,
                perk: tier.perk,
                maxTier,
                maxTierPurchased: true,
                lastTier: lastPurchasedPerk,
                previousTier
              }
            }
            const nextTier = tiers.find(({ tier }) => tier === lastPurchasedTier + 1);
            return nextTier ? {
              tier: nextTier.tier,
              perk: nextTier.perk,
              maxTier,
              lastTier: lastPurchasedPerk,
              previousTier
            } : { tier: 1, perk: node.perk, maxTier, lastTier: lastPurchasedPerk, previousTier };
          })();
        }

        if (isRoot) {
          if (actorPerk) {
            node.perk.system.cost = actorPerk.system.cost;
            purchasedRoots.push(node);
          }
          else node.perk.system.cost = 5;
        }

        node.state = state;
        if (state === PerkState.purchased) purchasedNodes.push(node);

        for (const connected of node.connected) {
          const connectedNode = this.nodeFromSlug(connected);
          if (connectedNode) {
            connectedNode.connected.add(node.slug);
          }
        }
      }
    }

    const visited = new Set<string>();
    // Update connections for all purchased roots
    if (purchasedRoots.length) this.updateConnections({ purchasedPerks: purchasedRoots, apAvailable: actor?.system.advancement.advancementPoints.available ?? 0, visited, currentTier, actor });

    // Any nodes that can't be reached from a purchased root are invalid
    for (const node of purchasedNodes) {
      if (visited.has(node.slug)) continue;
      visited.add(node.slug);

      const autoUnlock = this.isAutoPurchased({ node, actor });
      node.state = autoUnlock ? PerkState.purchased : PerkState.invalid
    }

    // If no roots are purchased, all roots are available for free
    if (!purchasedRoots.length) {
      for (const rootNode of this.rootNodes) {
        rootNode.perk.system.cost = 0;
        rootNode.state = PerkState.available;
      }
    }
    for (const rootNode of this.rootNodes) {
      if (rootNode.state < PerkState.available) {
        rootNode.state = (actor?.system.advancement.advancementPoints.available ?? 0) >= rootNode.perk.system.cost ? PerkState.available : PerkState.connected;
      }
    }

    this._graph.initialize();
    this._initialized = true;
  }

  updateConnections({
    purchasedPerks,
    visited = new Set<string>(),
    apAvailable,
    currentTier = 0,
    highestTier = currentTier,
    actor
  }: {
    purchasedPerks: PerkNode[],
    visited?: Set<string>,
    apAvailable: number,
    currentTier?: number,
    highestTier?: number,
    actor?: Maybe<ActorPTR2e>
  }) {
    // Look through perks that are purchased and update their connections
    for (const node of purchasedPerks) {
      if (visited.has(node.slug)) continue;
      visited.add(node.slug);

      for (const connected of node.connected) {
        // Skip if the connected node has already been visited, and thus handled
        if (visited.has(connected)) continue;

        const connectedNode = this.nodeFromSlug(connected);
        if (connectedNode) {
          // If the connected node is already purchased, also update its connections
          if (connectedNode.state >= PerkState.purchased) {
            this.updateConnections({ purchasedPerks: [connectedNode], visited, apAvailable, currentTier, highestTier, actor });

            // If the connected node is a tiered perk, handle the tier info
            if (connectedNode.tierInfo && !connectedNode.tierInfo.maxTierPurchased) {
              if(apAvailable >= connectedNode.tierInfo.perk.system.cost) {
                connectedNode.state = this.isAvailableOrConnected({
                  node: connectedNode,
                  perk: connectedNode.tierInfo.perk,
                  apAvailable,
                  actor,
                })
              }
            }
          }
          // If the connected node is not purchased, update its state as appropriate
          else if (connectedNode.state < PerkState.connected) {
            if (connectedNode.perk.system.nodes[0].type === "root") {
              connectedNode.perk.system.cost = 1;
            }

            if (connectedNode.perk.flags.ptr2e?.evolution) {
              const evolution = connectedNode.perk.flags.ptr2e.evolution as {
                name: string;
                uuid: string;
                tier: number;
              }

              if (evolution.tier < currentTier) {
                connectedNode.state = PerkState.purchased;
                if(evolution.tier === 0) {
                  for(const connection of connectedNode.connected) {
                    if(connection.startsWith("evolution")) visited.add(connection);
                  }
                }
                this.updateConnections({ purchasedPerks: [connectedNode], visited, apAvailable, currentTier: evolution.tier, highestTier, actor });
              }
              else if (highestTier === currentTier && evolution.tier === currentTier + 1) {
                connectedNode.state = this.isAvailableOrConnected({
                  node: connectedNode,
                  perk: connectedNode.tierInfo?.perk,
                  apAvailable,
                  actor,
                })
              }
              else {
                connectedNode.state = PerkState.unavailable;
              }
            }
            else {
              const autoPurchase = this.isAutoPurchased({ node: connectedNode, actor });
              if (autoPurchase) {
                connectedNode.state = PerkState.autoUnlocked;
                this.updateConnections({ purchasedPerks: [connectedNode], visited, apAvailable, currentTier, highestTier, actor });
              }
              else {
                connectedNode.state = this.isAvailableOrConnected({
                  node: connectedNode,
                  perk: connectedNode.tierInfo?.perk,
                  apAvailable,
                  actor,
                });
              }
            }
          }
        }
        visited.add(connected);
      }
    }
  }

  isAutoPurchased({
    node,
    actor
  }: {
    node: PerkNode,
    actor: Maybe<ActorPTR2e>
  }) {
    if (!actor) return false;

    const predicate = new Predicate(SummonStatistic.resolveValue(
      node.perk.system.autoUnlock,
      node.perk.system.autoUnlock,
      { actor, item: node.perk },
      { evaluate: true, resolvables: { actor, item: node.perk } }
    ) as unknown as Predicate);

    if (predicate.length === 0) return false;

    return predicate.test(actor.getRollOptions());
  }

  isAvailableOrConnected({
    node,
    actor,
    apAvailable,
    perk
  }: {
    node: PerkNode,
    actor: Maybe<ActorPTR2e>,
    apAvailable: number,
    perk?: PerkPTR2e
  }) {
    if (apAvailable < node.perk.system.cost) return PerkState.connected;

    if (!actor) return PerkState.available;

    const predicate = new Predicate(SummonStatistic.resolveValue(
      perk?.system.prerequisites ?? node.perk.system.prerequisites,
      perk?.system.prerequisites ?? node.perk.system.prerequisites,
      { actor, item: perk ?? node.perk },
      { evaluate: true, resolvables: { actor, item: perk ?? node.perk } }
    ) as unknown as Predicate);
    if (!predicate.test(actor.getRollOptions())) {
      return PerkState.connected;
    }

    return PerkState.available;
  }

  nodeFromSlug(slug: string) {
    return this.find((node) => node.slug === slug);
  }

  getUpdatedNode(node: PerkNode | null): PerkNode | null {
    if (!node) return null;

    return this.nodeFromSlug(node.slug) ?? null;
  }
}

export default PerkStore;