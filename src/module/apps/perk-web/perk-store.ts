import { PerkPTR2e } from "@item";
import PerkGraph from "./perk-graph.ts";
import { ActorPTR2e } from "@actor";

export const PerkState = {
  unavailable: 0,
  connected: 1,
  available: 2,
  purchased: 3,
  invalid: 4
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
}

class PerkStore extends Collection<PerkNode> {
  private _graph: PerkGraph;
  private _rootNodes: PerkNode[] | null = null;
  private _initialized = false;

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

  constructor({ perks, nodes }: { perks?: PerkPTR2e[], nodes?: PerkNode[] } = {}) {
    // If nodes are provided, simply map them to the collection
    if (nodes?.length) {
      super(nodes.map((entry => [`${entry.position.x}-${entry.position.y}`, entry])));
    }
    // If perks are provided, convert them to nodes and map them to the collection 
    else if (perks?.length) {
      super(perks.flatMap((perk): PerkNode[] =>
        perk.system.variant === "multi"
          ? perk.system.nodes.flatMap(node => PerkStore.perkNodeToNode(perk, node))
          : PerkStore.perkNodeToNode(perk, perk.system.primaryNode)
      ).map((entry) => [`${entry.position.x}-${entry.position.y}`, entry]));
    }
    // If neither perks nor nodes are provided, initialize the store with all perks loaded in the game
    else {
      if (!game.ptr.perks.initialized) throw new Error("PerkStore must be provided with perks or nodes if global perks are not initialized");
      super(Array.from(game.ptr.perks.perks.values()).flatMap((perk): PerkNode[] => perk.system.variant === "multi"
        ? perk.system.nodes.flatMap(node => PerkStore.perkNodeToNode(perk, node))
        : PerkStore.perkNodeToNode(perk, perk.system.primaryNode)
      ).map((entry) => [`${entry.position.x}-${entry.position.y}`, entry]));
    }

    this._graph = new PerkGraph(this);
  }

  async reinitialize({ perks, nodes, actor }: { perks?: PerkPTR2e[], nodes?: PerkNode[], actor?: ActorPTR2e } = {}) {
    this.clear();
    this._initialized = false;
    this._rootNodes = null;

    // If nodes are provided, simply map them to the collection
    if (nodes?.length) {
      for (const node of nodes) {
        this.set(`${node.position.x}-${node.position.y}`, node);
      }
    }
    // If perks are provided, convert them to nodes and map them to the collection 
    else if (perks?.length) {
      for (const node of perks.flatMap((perk): PerkNode[] =>
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
      for (const node of Array.from(game.ptr.perks.perks.values()).flatMap((perk): PerkNode[] =>
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

    for (const node of this) {
      if (node.node && node.node.x !== null && node.node.y !== null) {
        const isRoot = node.node.type === "root";
        const actorPerk = actor?.perks.get(
          node.perk.system.variant === "multi" 
            ? node.perk.system.mode === "shared"
              ? node.perk.slug
              : node.slug
            : node.slug
        );
        const state = actorPerk ? PerkState.purchased : PerkState.unavailable;

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
    if (purchasedRoots.length) this.updateConnections({ purchasedPerks: purchasedRoots, apAvailable: actor?.system.advancement.advancementPoints.available ?? 0, visited });

    // Any nodes that can't be reached from a purchased root are invalid
    for (const node of purchasedNodes) {
      if (visited.has(node.slug)) continue;
      visited.add(node.slug);
      node.state = PerkState.invalid
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
    apAvailable
  }: {
    purchasedPerks: PerkNode[],
    visited?: Set<string>,
    apAvailable: number
  }) {
    for (const node of purchasedPerks) {
      if (visited.has(node.slug)) continue;
      visited.add(node.slug);

      for (const connected of node.connected) {
        if (visited.has(connected)) continue;
        const connectedNode = this.nodeFromSlug(connected);
        if (connectedNode) {
          if (connectedNode.state >= PerkState.purchased) {
            this.updateConnections({ purchasedPerks: [connectedNode], visited, apAvailable });
          }
          else if (connectedNode.state < PerkState.connected) {
            if (connectedNode.perk.system.nodes[0].type === "root") {
              connectedNode.perk.system.cost = 1;
            }

            connectedNode.state = apAvailable >= connectedNode.perk.system.cost ? PerkState.available : PerkState.connected;
          }
        }
        visited.add(connected);
      }
    }
  }

  nodeFromSlug(slug: string) {
    return this.find((node) => node.slug === slug);
  }

  getUpdatedNode(node: PerkNode | null): PerkNode | null {
    if(!node) return null;

    return this.nodeFromSlug(node.slug) ?? null;
  }
}

export default PerkStore;