import { Collection } from "../collection.ts";
import { nba } from "../path/nba.ts";
import { Actor, GeneratorConfig, PerkNodeData } from "../types.js";

export interface PathResult<NodeData extends PerkNodeData = PerkNodeData, LinkData = unknown> {
  path: Node<NodeData, LinkData>[];
  from: NodeId;
  to: NodeId;
  length: number;
  cost: number;
  priority: number;
  skills: Map<string, {skill: string, value: number}>;
}

export class Graph<NodeData extends PerkNodeData = PerkNodeData, LinkData = unknown> extends Collection<NodeId, Node<NodeData, LinkData>> {
  private links = new Map<LinkId, Link<LinkData>>();
  private _rootNodes: Node<NodeData, LinkData>[] = [];

  public pathfinder = new nba(this, {
    // blocked: (_from, _to, _link) => {
    //   return false;
    // },
    // heuristic: (_from, _to) => {
    //   return 0;
    // },
    distance: this.calculateDistance.bind(this),
  })

  private distanceFunction: (from: Node<PerkNodeData, LinkData>, to: Node<PerkNodeData, LinkData>) => number;

  private calculateDistance(from: Node<PerkNodeData, LinkData>, to: Node<PerkNodeData, LinkData>): number {
    return this.distanceFunction?.(from, to) ?? 1;
  }

  findPath(from: NodeId, to: NodeId, config: GeneratorConfig, {actor, options, alreadyPurchased}: {actor: Actor, options: string[], alreadyPurchased: Set<NodeId>}): PathResult<NodeData, LinkData> {
    this.distanceFunction = config.cost.priority === "cheapest"
      ? (_from, to) => to.data.root ? 1 : to.data.cost
      : config.cost.priority === "shortest" && config.cost.resolution === "costliest"
        ? (_from, to) => 100 - (to.data.root ? 1 : to.data.cost)
        : () => 1;

    const result = this.pathfinder.find(from, to, config, {actor, options});

    return {
      path: result.path,
      from,
      to,
      length: result.path.length,
      cost: result.path.reduce((acc, node) => acc + (alreadyPurchased.has(node.id) ? 0 : node.data.cost), 0),
      priority: result.priority,
      skills: result.skills,
    }
  }

  get rootNodes() {
    return this._rootNodes?.length ? this._rootNodes : (this._rootNodes = this.filter(node => node.data.root));
  }

  addNode(nodeId: NodeId, data?: NodeData): Node<NodeData> {
    if (nodeId === undefined) {
      throw new Error('Invalid node identifier');
    }

    let node = this.getNode(nodeId);
    if (!node) node = new Node<NodeData, LinkData>(nodeId, data);
    else node.data = data!;

    this.set(nodeId, node);
    return node;
  }

  getNode(nodeId: NodeId): Node<NodeData, LinkData> | undefined {
    return this.get(nodeId);
  }

  removeNode(nodeId: NodeId): boolean {
    const node = this.getNode(nodeId);
    if (!node) return false;

    const prevLinks = node.links;
    if (prevLinks) {
      for (const link of prevLinks) this.removeLinkInstance(link);
      node.links = null;
    }

    this.delete(nodeId);
    return true;
  }

  addLink(fromId: NodeId, toId: NodeId, data?: LinkData): Link<LinkData> {
    const fromNode = this.getNode(fromId) || this.addNode(fromId);
    const toNode = this.getNode(toId) || this.addNode(toId);

    const link = this.createLink(fromId, toId, data);

    this.links.set(link.id, link);
    fromNode.addLink(link);
    if (fromId !== toId) toNode.addLink(link);

    return link;
  }

  getLinks(nodeId: NodeId): Set<Link<LinkData>> | null {
    const node = this.getNode(nodeId);
    return node ? node.links : null;
  }

  removeLink(link: Link<LinkData> | NodeId, otherId?: NodeId): boolean {
    if (otherId !== undefined) {
      link = this.getLink(link as NodeId, otherId)!;
    }
    return this.removeLinkInstance(link as Link<LinkData>);
  }

  private createLink(fromId: NodeId, toId: NodeId, data?: LinkData): Link<LinkData> {
    const linkId = this.makeLinkId(fromId, toId);
    const prevLink = this.links.get(linkId);
    if (prevLink) {
      prevLink.data = data!;
      return prevLink;
    }

    return new Link<LinkData>(fromId, toId, data!, linkId);
  }

  private removeLinkInstance(link: Link<LinkData>): boolean {
    if (!link) {
      return false;
    }
    if (!this.links.get(link.id)) return false;

    this.links.delete(link.id);

    const fromNode = this.getNode(link.fromId);
    const toNode = this.getNode(link.toId);

    if (fromNode) fromNode.links!.delete(link);
    if (toNode) toNode.links!.delete(link);

    return true;
  }

  getLink(fromNodeId: NodeId, toNodeId: NodeId): Link<LinkData> | undefined {
    if (fromNodeId === undefined || toNodeId === undefined) return undefined;
    return this.links.get(this.makeLinkId(fromNodeId, toNodeId));
  }

  override clear() {
    for (const node of this) this.removeNode(node.id);
    super.clear();
  }

  private makeLinkId(fromId: Link<LinkData> | NodeId, toId: NodeId): LinkId {
    return `${fromId.toString()} -> ${toId.toString()}`;
  }

  forEachNode(callbackPerNode: (node: Node<NodeData, LinkData>) => void | undefined | null | boolean): true | void {
    if (typeof callbackPerNode !== 'function') return;

    const valuesIterator = this.values();
    let nextValue = valuesIterator.next();
    while (!nextValue.done) {
      if (callbackPerNode(nextValue.value)) return true;
      nextValue = valuesIterator.next();
    }
  }

  forEachLink(callbackPerLink: (link: Link<LinkData>) => void | undefined | boolean): true | void {
    if (typeof callbackPerLink === 'function') {
      const valuesIterator = this.links.values();
      let nextValue = valuesIterator.next();
      while (!nextValue.done) {
        if (callbackPerLink(nextValue.value)) return true;
        nextValue = valuesIterator.next();
      }
    }
  }

  forEachLinkedNode(nodeId: NodeId, callbackPerNode: (otherNode: Node<NodeData, LinkData>, link: Link<LinkData>) => void | undefined | boolean | null, oriented?: boolean) {
    const node = this.getNode(nodeId);

    if (node && node.links && typeof callbackPerNode === 'function') {
      if (oriented) return this.forEachOrientedLink(node.links, nodeId, callbackPerNode);
      else return this.forEachNonOrientedLink(node.links, nodeId, callbackPerNode);
    }
  }

  private forEachOrientedLink(links: Set<Link<LinkData>>, nodeId: NodeId, callbackPerNode: (otherNode: Node<NodeData, LinkData>, link: Link<LinkData>) => void | undefined | null | boolean): void | true {
    const valuesIterator = links.values();
    let nextValue = valuesIterator.next();
    while (!nextValue.done) {
      const link = nextValue.value;
      if (link.fromId === nodeId) {
        if (callbackPerNode(this.getNode(link.toId)!, link)) return true;
      }
      nextValue = valuesIterator.next();
    }
  }

  private forEachNonOrientedLink(links: Set<Link<LinkData>>, nodeId: NodeId, callbackPerNode: (otherNode: Node<NodeData, LinkData>, link: Link<LinkData>) => void | undefined | null | boolean): void | true {
    const valuesIterator = links.values();
    let nextValue = valuesIterator.next();
    while (!nextValue.done) {
      const link = nextValue.value;
      const linkedNodeId = link.fromId === nodeId ? link.toId : link.fromId;
      if (callbackPerNode(this.getNode(linkedNodeId)!, link)) {
        return true;
      }
      nextValue = valuesIterator.next();
    }
  }

  static getPriority<NodeData extends PerkNodeData = PerkNodeData, LinkData = unknown>(to: Node<NodeData, LinkData>, priority: GeneratorConfig["priorities"]): number {
    for (const p of priority.sort((a, b) => a.priority - b.priority)) {
      switch (p.type) {
        //case "perk": return priority.length + 1;
        case "trait": {
          if (to.data.perk.system.traits.includes(p.slug)) return p.priority;
          break;
        }
        case "approach": {
          if (to.data.perk.system.design.approach == p.slug) return p.priority;
          break;
        }
        case "archetype": {
          if (to.data.perk.system.design.archetype == p.slug) return p.priority;
          break;
        }
        case "arena": {
          if (to.data.perk.system.design.arena == p.slug) return p.priority;
          break;
        }
      }
    }
    return priority.length + 10;
  }
}

export class Node<NodeData extends PerkNodeData = PerkNodeData, LinkData = unknown> {
  constructor(id: NodeId, data?: NodeData) {
    this.id = id;
    this.links = null;
    this.data = data!;
  }

  addLink(link: Link<LinkData>) {
    if (this.links) this.links.add(link);
    else this.links = new Set([link]);
  }
}

export class Link<LinkData = unknown> {
  constructor(fromId: NodeId, toId: NodeId, data: LinkData, id: LinkId) {
    this.fromId = fromId;
    this.toId = toId;
    this.data = data;
    this.id = id;
  }
}

export type NodeId = string | number
export type LinkId = string

/**
 * A single link (edge) of the graph
 */
export interface Link<LinkData = unknown> {
  /**
   * Unique identifier of this link
   */
  id: LinkId,

  /**
   * Node identifier where this links starts
   */
  fromId: NodeId,

  /**
   * Node identifier where this link points to
   */
  toId: NodeId,
  /**
   * Arbitrary data associated with this link
   */
  data: LinkData
}

/**
 * A single node of a graph.
 */
export interface Node<NodeData extends PerkNodeData = PerkNodeData, LinkData = unknown> {
  /**
   * Unique identifier of this node
   */
  id: NodeId,

  /**
   * Set of incoming/outgoing links (edges) to/from this node.
   * 
   * For the sake of memory consumption preservation, this property
   * is null when this node has no links.
   * 
   * Link instance is referentially equal throughout the API.
   */
  links: Set<Link<LinkData>> | null,

  /**
   * Associated data connected to this node.
   */
  data: NodeData
}

/**
 * A graph data structure
 */
export interface Graph<NodeData extends PerkNodeData = PerkNodeData, LinkData = unknown> {
  /**
   * Adds a new node to the graph. If node with such id already exists
   * its data is overwritten with the new data
   */
  addNode: (node: NodeId, data?: NodeData) => Node<NodeData>

  /**
   * Adds a new link to the graph. If link already exists and the graph
   * is not a multigraph, then link's data is overwritten with a new data.
   * 
   * When graph is a multigraph, then a new link is always added between the
   * nodes.
   */
  addLink: (from: NodeId, to: NodeId, data?: LinkData) => Link<LinkData>

  /**
   * Removes a link from the graph. You'll need to pass an actual link instance
   * to remove it. If you pass two arguments, the function assumes they represent
   * from/to node ids, and removes the corresponding link.
   * 
   * Returns true if link is found and removed. False otherwise.
   */
  removeLink: (link: Link<LinkData> | NodeId, otherId?: NodeId) => boolean

  /**
   * Removes node by node id. Returns true if node was removed,
   * false otherwise (e.g. no such node exists in the graph)
   */
  removeNode: (nodeId: NodeId) => boolean

  /**
   * Returns a node by its identifier. Undefined value is returned if node
   * with such identifer does not exist.
   */
  getNode: (nodeId: NodeId) => Node<NodeData, LinkData> | undefined

  /**
   * Returns a link between two nodes
   */
  getLink: (fromNodeId: NodeId, toNodeId: NodeId) => Link<LinkData> | undefined

  // /**
  //  * Returns number of nodes in the graph
  //  */
  // getNodesCount: () => number

  // /**
  //  * Returns number of nodes in the graph
  //  */
  // getNodeCount: () => number

  // /**
  //  * Returns number of links (edges) in the graph
  //  */
  // getLinksCount: () => number

  // /**
  //  * Returns number of links (edges) in the graph
  //  */
  // getLinkCount: () => number

  /**
   * Returns all links associated with this node
   */
  getLinks: (nodeId: NodeId) => Set<Link<LinkData>> | null

  /** 
   * Iterates over every single node in the graph, passing the node to a callback.
   * 
   * If callback function returns "true"-like value, enumeration stops.
   **/
  forEachNode: (callbackPerNode: (node: Node<NodeData, LinkData>) => void | undefined | null | boolean) => void | true

  /**
   * Iterates over every single link in the graph, passing the link to a callback.
   * If callback function returns "true"-like value, enumeration stops.
   */
  forEachLink: (callbackPerLink: (link: Link<LinkData>) => void | undefined | boolean) => void | true

  /**
   * Iterates over other node connected to the `nodeId`. If `oriented` is set to true,
   * the callback will receive nodes on the `link.toId` end. Otherwise callback will
   * receive nodes on either `.fromId` or `.toId`, depending on the `nodeId` argument.
   */
  forEachLinkedNode: (nodeId: NodeId, callbackPerNode: (otherNode: Node<NodeData, LinkData>, link: Link<LinkData>) => void | undefined | null | boolean, oriented?: boolean) => void | true

  /**
   * Removes all nodes and links from the graph.
   */
  clear: () => void
}