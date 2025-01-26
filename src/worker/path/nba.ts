import * as defaultSettings from './defaultSettings.ts';
import { NodeHeap } from './nodeHeap.ts';
import { Graph, Link, Node, NodeId } from '../graph/graph.ts';
import { Actor, GeneratorConfig, PerkNodeData } from '../types.js';
import { duplicate, getStatementType, validatePrerequisites } from '../perk-validator.ts';

/**
 * Creates new instance of NBASearchState. The instance stores information
 * about search state, and is used by NBA* algorithm.
 *
 * @param {Object} node - original graph node
 */

class NBASearchState<N extends Node<PerkNodeData, unknown> = Node<PerkNodeData, unknown>> {
  /**
   * Original graph node.
   */
  node: N;
  /**
   * Parent of this node in forward search
   */
  p1: this | null;
  /**
   * Parent of this node in reverse search
   */
  p2: this | null;
  /**
   * If this is set to true, then the node was already processed
   * and we should not touch it anymore.
   */
  closed: boolean;
  /**
   * Actual distance from this node to its parent in forward search
   */
  g1: number;
  /**
   * Actual distance from this node to its parent in reverse search
   */
  g2: number;
  /**
   * Underestimated distance from this node to the path-finding source.
   */
  f1: number;
  /**
   * Underestimated distance from this node to the path-finding target.
   */
  f2: number;
  /**
   * Index of this node in the forward heap.
   */
  h1: number;
  /**
   * Index of this node in the reverse heap.
   */
  h2: number;
  /**
   * RV Spent from this node to the path-finding source
   */
  rv1: number;
  /**
   * RV Spent from this node to the path-finding target
   */
  rv2: number
  /**
   * The RVs spent on each skill shared between the two paths
   */
  skills1: Map<string, {skill: string, value: number}>;
  /**
   * The RVs spent on each skill shared between the two paths
   */
  skills2: Map<string, {skill: string, value: number}>;

  constructor(node: N) {
    this.node = node;
    this.p1 = null;
    this.p2 = null;
    this.closed = false;
    this.g1 = Number.POSITIVE_INFINITY;
    this.g2 = Number.POSITIVE_INFINITY;
    this.f1 = Number.POSITIVE_INFINITY;
    this.f2 = Number.POSITIVE_INFINITY;
    this.rv1 = 0;
    this.rv2 = 0;
    this.skills1 = new Map();
    this.skills2 = new Map();
    // used to reconstruct heap when fScore is updated. TODO: do I need them both?
    this.h1 = -1;
    this.h2 = -1;
  }
}

/**
 * As path-finding is memory-intensive process, we want to reduce pressure on
 * garbage collector. This class helps us to recycle path-finding nodes and significantly
 * reduces the search time (~20% faster than without it).
 */
class NBASearchStatePool<N extends Node<PerkNodeData, unknown> = Node<PerkNodeData, unknown>> {
  currentInCache: number;
  nodeCache: NBASearchState<N>[];

  constructor() {
    this.currentInCache = 0;
    this.nodeCache = [];
  }

  createNewState(node: N) {
    let cached = this.nodeCache[this.currentInCache];
    if (cached) {
      // TODO: This almost duplicates constructor code. Not sure if
      // it would impact performance if I move this code into a function
      cached.node = node;

      // How we came to this node?
      cached.p1 = null;
      cached.p2 = null;

      cached.closed = false;

      cached.g1 = Number.POSITIVE_INFINITY;
      cached.g2 = Number.POSITIVE_INFINITY;
      cached.f1 = Number.POSITIVE_INFINITY;
      cached.f2 = Number.POSITIVE_INFINITY;

      // used to reconstruct heap when fScore is updated.
      cached.h1 = -1;
      cached.h2 = -1;
    } else {
      cached = new NBASearchState(node);
      this.nodeCache[this.currentInCache] = cached;
    }
    this.currentInCache++;
    return cached;
  }

  reset() {
    this.currentInCache = 0;
  }
  
  fullReset() {
    this.currentInCache = 0;
    this.nodeCache = [];
  }
}

const NO_PATH = defaultSettings.NO_PATH;

/**
 * Creates a new instance of pathfinder. A pathfinder has just one method:
 * `find(fromId, toId)`.
 * 
 * This is implementation of the NBA* algorithm described in 
 * 
 *  "Yet another bidirectional algorithm for shortest paths" paper by Wim Pijls and Henk Post
 * 
 * The paper is available here: https://repub.eur.nl/pub/16100/ei2009-10.pdf
 * 
 * @param {ngraph.graph} graph instance. See https://github.com/anvaka/ngraph.graph
 * @param {Object} options that configures search
 * @param {Function(a, b, link)} options.blocked - a function that returns `true` if the link between 
 * nodes `a` and `b` are blocked paths. This function is useful for temporarily blocking routes 
 * while allowing the graph to be reused without rebuilding.
 * @param {Function(a, b)} options.heuristic - a function that returns estimated distance between
 * nodes `a` and `b`. This function should never overestimate actual distance between two
 * nodes (otherwise the found path will not be the shortest). Defaults function returns 0,
 * which makes this search equivalent to Dijkstra search.
 * @param {Function(a, b)} options.distance - a function that returns actual distance between two
 * nodes `a` and `b`. By default this is set to return graph-theoretical distance (always 1);
 * 
 * @returns {Object} A pathfinder with single method `find()`.
 */
export class nba<NodeData extends PerkNodeData = PerkNodeData, LinkData = unknown> {
  graph: Graph<NodeData, LinkData>;
  oriented: boolean;
  quitFast: boolean;
  cameFrom: NBASearchState<Node<NodeData, LinkData>> | undefined;
  pool: NBASearchStatePool<Node<NodeData, LinkData>>;
  blocked: (from: Node<NodeData, LinkData>, to: Node<NodeData, LinkData>, link: Link<LinkData>) => boolean;
  heuristic: (from: Node<NodeData, LinkData>, to: Node<NodeData, LinkData>) => number;
  distance: (from: Node<NodeData, LinkData>, to: Node<NodeData, LinkData>, link: Link<LinkData>) => number;

  constructor(graph: Graph<NodeData, LinkData>, options: PathFinderOptions<NodeData, LinkData>) {
    options = options || {};
    // whether traversal should be considered over oriented graph.
    this.oriented = !!options.oriented;
    this.quitFast = !!options.quitFast;
    this.graph = graph;

    let blocked = options.blocked;
    if (!blocked) blocked = defaultSettings.blocked;
    this.blocked = blocked;

    let heuristic = options.heuristic;
    if (!heuristic) heuristic = defaultSettings.heuristic;
    this.heuristic = heuristic;

    let distance = options.distance;
    if (!distance) distance = defaultSettings.distance;
    this.distance = distance;

    // During stress tests I noticed that garbage collection was one of the heaviest
    // contributors to the algorithm's speed. So I'm using an object pool to recycle nodes.
    this.pool = new NBASearchStatePool();
  }

  /**
   * Finds a path between node `fromId` and `toId`.
   * @returns {Array} of nodes between `toId` and `fromId`. Empty array is returned
   * if no path is found.
   */
  find(fromId: NodeId, toId: NodeId, config: GeneratorConfig, {actor, options}: {actor: Actor, options: string[]}): { path: Node<NodeData, LinkData>[], priority: number, skills: Map<string, {skill: string, value: number}> } {
    // I must apologize for the code duplication. This was the easiest way for me to
    // implement the algorithm fast.
    const from = this.graph.getNode(fromId);
    if (!from) throw new Error('fromId is not defined in this graph: ' + fromId);
    const to = this.graph.getNode(toId);
    if (!to) throw new Error('toId is not defined in this graph: ' + toId);

    this.pool.reset();

    // I must also apologize for somewhat cryptic names. The NBA* is bi-directional
    // search algorithm, which means it runs two searches in parallel. One is called
    // forward search and it runs from source node to target, while the other one
    // (backward search) runs from target to source.

    // Everywhere where you see `1` it means it's for the forward search. `2` is for 
    // backward search.

    // For oriented graph path finding, we need to reverse the graph, so that
    // backward search visits correct link. Obviously we don't want to duplicate
    // the graph, instead we always traverse the graph as non-oriented, and filter
    // edges in `visitN1Oriented/visitN2Oritented`
    const forwardVisitor = this.oriented ? visitN1Oriented.bind(this) : visitN1.bind(this);
    const reverseVisitor = this.oriented ? visitN2Oriented.bind(this) : visitN2.bind(this);

    // Maps nodeId to NBASearchState.
    const nodeState = new Map<NodeId, NBASearchState<Node<NodeData, LinkData>>>();

    // These two heaps store nodes by their underestimated values.
    const open1Set = new NodeHeap<NBASearchState<Node<NodeData, LinkData>>>([], {
      compare: defaultSettings.compareF1Score,
      setNodeId: defaultSettings.setH1
    });
    const open2Set = new NodeHeap<NBASearchState<Node<NodeData, LinkData>>>([], {
      compare: defaultSettings.compareF2Score,
      setNodeId: defaultSettings.setH2
    });

    // This is where both searches will meet.
    let minNode;

    // The smallest path length seen so far is stored here:
    let lMin = Number.POSITIVE_INFINITY;

    // We start by putting start/end nodes to the corresponding heaps
    // If variable names like `f1`, `g1` are too confusing, please refer
    // to makeNBASearchStatePool.js file, which has detailed description.
    const startNode = this.pool.createNewState(from);
    nodeState.set(fromId, startNode);
    startNode.g1 = 0;
    let f1 = this.heuristic(from, to);
    startNode.f1 = f1;
    open1Set.push(startNode);

    const endNode = this.pool.createNewState(to);
    nodeState.set(toId, endNode);
    endNode.g2 = 0;
    let f2 = f1; // they should agree originally
    endNode.f2 = f2;
    open2Set.push(endNode)

    // this is the main algorithm loop:
    while (open2Set.length && open1Set.length) {
      if (open1Set.length < open2Set.length) {
        forwardSearch.bind(this)();
      } else {
        reverseSearch.bind(this)();
      }

      if (this.quitFast && minNode) break;
    }

    return this.reconstructPath(minNode);

    function getDistance(this: nba<NodeData, LinkData>, from: Node<NodeData, LinkData>, to: Node<NodeData, LinkData>, link: Link<LinkData>): number {
      const priority = Graph.getPriority(to, config.priority);
      const cost = this.distance(from, to, link);
      return Number((priority + (cost / 1000)).toFixed(3))
    }

    function forwardSearch(this: nba<NodeData, LinkData>) {
      this.cameFrom = open1Set.pop();
      if (!this.cameFrom || this.cameFrom.closed) {
        return;
      }

      this.cameFrom.closed = true;

      if (this.cameFrom.f1 <= lMin && (this.cameFrom.g1 + f2 - this.heuristic(from!, this.cameFrom.node)) <= lMin) {
        this.graph.forEachLinkedNode(this.cameFrom.node.id, forwardVisitor);
      }

      if (open1Set.length > 0) {
        // this will be used in reverse search
        f1 = open1Set.peek().f1;
      }
    }

    function reverseSearch(this: nba<NodeData, LinkData>) {
      this.cameFrom = open2Set.pop();
      if (!this.cameFrom || this.cameFrom.closed) {
        return;
      }
      this.cameFrom.closed = true;

      if (this.cameFrom.f2 <= lMin && (this.cameFrom.g2 + f1 - this.heuristic(this.cameFrom.node, to!)) <= lMin) {
        this.graph.forEachLinkedNode(this.cameFrom.node.id, reverseVisitor);
      }

      if (open2Set.length > 0) {
        // this will be used in forward search
        f2 = open2Set.peek().f2;
      }
    }

    function visitN1(this: nba<NodeData, LinkData>, otherNode: Node<NodeData, LinkData>, link: Link<LinkData>) {
      let otherSearchState = nodeState.get(otherNode.id);
      if (!otherSearchState) {
        otherSearchState = this.pool.createNewState(otherNode);
        nodeState.set(otherNode.id, otherSearchState);
      }

      if (otherSearchState.closed || !this.cameFrom) return;

      if (this.blocked(this.cameFrom.node, otherNode, link)) return;

      const tentativeDistance = this.cameFrom.g1 + getDistance.bind(this)(this.cameFrom.node, otherNode, link);

      if (tentativeDistance < otherSearchState.g1 || (tentativeDistance == otherSearchState.g1 && tieBreaker(otherNode, this.cameFrom.node))) {
        // Check for SP spent
        otherSearchState.skills1 = new Map(duplicate(Array.from(this.cameFrom.skills1)));
        const result = handleRVs.bind(this)({ otherNode, rvs: otherSearchState.rv1 + otherSearchState.rv2, skills: otherSearchState.skills1 });
        if(result) {
          if(typeof result !== 'boolean') {
            otherSearchState.rv1 += result.requiredPoints;
            const current = otherSearchState.skills1.get(result.skill);
            if(current) {
              current.value += result.requiredPoints;
            }
            else {
              otherSearchState.skills1.set(result.skill, {skill: result.skill, value: result.requiredPoints});
            }
          }

          otherSearchState.g1 = tentativeDistance;
          otherSearchState.f1 = tentativeDistance + this.heuristic(otherSearchState.node, to!);
          otherSearchState.p1 = this.cameFrom;
          if (otherSearchState.h1 < 0) {
            open1Set.push(otherSearchState);
          } else {
            open1Set.updateItem(otherSearchState.h1);
          }
        }
      }

      const potentialMin = otherSearchState.g1 + otherSearchState.g2;
      if (potentialMin < lMin) {
        lMin = potentialMin;
        minNode = otherSearchState;
      }
    }

    function visitN2(this: nba<NodeData, LinkData>, otherNode: Node<NodeData, LinkData>, link: Link<LinkData>) {
      let otherSearchState = nodeState.get(otherNode.id);
      if (!otherSearchState) {
        otherSearchState = this.pool.createNewState(otherNode);
        nodeState.set(otherNode.id, otherSearchState);
      }

      if (otherSearchState.closed || !this.cameFrom) return;

      if (this.blocked(this.cameFrom.node, otherNode, link)) return;

      const tentativeDistance = this.cameFrom.g2 + getDistance.bind(this)(this.cameFrom.node, otherNode, link);

      if (tentativeDistance < otherSearchState.g2 || (tentativeDistance == otherSearchState.g1 && tieBreaker(otherNode, this.cameFrom.node))) {
        // Check for SP spent
        otherSearchState.skills2 = new Map(duplicate(Array.from(this.cameFrom.skills2)));
        const result = handleRVs.bind(this)({ otherNode, rvs: otherSearchState.rv1 + otherSearchState.rv2, skills: otherSearchState.skills2 });
        if(result) {
          if(typeof result !== 'boolean') {
            otherSearchState.rv2 += result.requiredPoints;
            const current = otherSearchState.skills2.get(result.skill);
            if(current) {
              current.value += result.requiredPoints;
            }
            else {
              otherSearchState.skills2.set(result.skill, {skill: result.skill, value: result.requiredPoints});
            }
          }
        
          otherSearchState.g2 = tentativeDistance;
          otherSearchState.f2 = tentativeDistance + this.heuristic(from!, otherSearchState.node);
          otherSearchState.p2 = this.cameFrom;
          if (otherSearchState.h2 < 0) {
            open2Set.push(otherSearchState);
          } else {
            open2Set.updateItem(otherSearchState.h2);
          }
        }
      }

      const potentialMin = otherSearchState.g1 + otherSearchState.g2;
      if (potentialMin < lMin) {
        lMin = potentialMin;
        minNode = otherSearchState;
      }
    }

    function tieBreaker(otherNode: Node<NodeData, LinkData>, currentState: Node<NodeData, LinkData>): boolean {
      const otherPriority = Graph.getPriority(otherNode, config.priority);
      const currentPriority = Graph.getPriority(currentState, config.priority);
      if (otherPriority > currentPriority) return true;
      if (otherPriority < currentPriority) return false;
      switch (config.cost.resolution) {
        case "costliest": {
          return otherNode.data.cost > currentState.data.cost;
        }
        case "cheapest": {
          return otherNode.data.cost < currentState.data.cost;
        }
        case "random":
        default: {
          return Math.random() < 0.5;
        }
      }
    }

    function handleRVs({
      otherNode,
      rvs,
      skills
    }: {
      otherNode: Node<NodeData, LinkData>;
      rvs: number,
      skills: Map<string, {skill: string, value: number}>
    }): { skill: string, requiredPoints: number } | boolean {
      if (config.points.rv <= 0) return true;

      const test = validatePrerequisites(otherNode.data.perk, actor, options);
      if(test.passes) return true;

      let returnVal = false;
      for(const {statement, result} of test.results) {
        if(result) continue;

        const types = getStatementType(statement) as (string | number)[] | void;
        if(!types) continue;
        
        if(types.length === 2 && typeof types[0] === 'string' && types[0].startsWith("skill:") && typeof types[1] === 'number') {
          const skill = types[0].split(":")[1];
          const value = types[1];

          const actorSkill = actor.system.skills.get(skill)
          if(!actorSkill) continue;

          const alreadySpent = skills.get(skill)?.value ?? 0;

          const requiredPoints = value - actorSkill.total - alreadySpent;
          if(requiredPoints <= 0) {
            if(alreadySpent > 0) returnVal = true;
            continue
          };
          if((requiredPoints + rvs) > config.points.rv) continue;

          return {skill, requiredPoints};
        }
      }
      return returnVal;
    }

    function visitN2Oriented(this: nba<NodeData, LinkData>, otherNode: Node<NodeData, LinkData>, link: Link<LinkData>) {
      // we are going backwards, graph needs to be reversed. 
      if (link.toId === this.cameFrom?.node.id) return visitN2.bind(this)(otherNode, link)
    }
    function visitN1Oriented(this: nba<NodeData, LinkData>, otherNode: Node<NodeData, LinkData>, link: Link<LinkData>) {
      // this is forward direction, so we should be coming FROM:
      if (link.fromId === this.cameFrom?.node.id) return visitN1.bind(this)(otherNode, link);
    }
  }

  reconstructPath(searchState: NBASearchState<Node<NodeData, LinkData>> | undefined) {
    if (!searchState) return { path: NO_PATH, priority: 0, skills: new Map() };

    const skills = new Map<string, {skill: string, value: number}>();
    for(const {skill, value} of searchState.skills1.values()) {
      skills.set(skill, {skill, value});
    }
    for(const {skill, value} of searchState.skills2.values()) {
      const current = skills.get(skill);
      if(current) {
        current.value = Math.max(current.value, value);
      }
      else {
        skills.set(skill, {skill, value});
      }
    }

    const path = [searchState.node];
    let parent = searchState.p1;

    while (parent) {
      path.push(parent.node);
      parent = parent.p1;
    }

    let child = searchState.p2;

    while (child) {
      path.unshift(child.node);
      child = child.p2;
    }

    return {
      path,
      priority: searchState.g1 + searchState.g2,
      skills: skills
    };
  }
}

interface PathFinderOptions<NodeData extends PerkNodeData, LinkData> {
  oriented?: boolean
  quitFast?: boolean
  heuristic?: (from: Node<NodeData, LinkData>, to: Node<NodeData, LinkData>) => number
  distance?: (from: Node<NodeData, LinkData>, to: Node<NodeData, LinkData>, link: Link<LinkData>) => number
  blocked?: (from: Node<NodeData, LinkData>, to: Node<NodeData, LinkData>, link: Link<LinkData>) => boolean
}