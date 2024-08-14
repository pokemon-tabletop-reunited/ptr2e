import { PerkPTR2e } from "@item";
import { PerkNode, PerkPurchaseState, PerkState } from "./perk-node.ts";
import { CoordinateString } from "./perk-web.ts";
import { sluggify } from "@utils";
import PerkGraph from "./perk-graph.ts";
import { ActorPTR2e } from "@actor";
import { PerkManager } from "@module/apps/perk-manager/perk-manager.ts";

type EdgeCoordinateString = `${CoordinateString}-${CoordinateString}`;

interface PTRNode {
    position: {
        i: number;
        j: number;
    };
    element?: PerkNode;
    perk: PerkPTR2e;
    connected: Set<string>;
    state: PerkPurchaseState;
}

type SluggedEdgeString = `${string}-${string}`;

class PerkStore extends Collection<PTRNode> {
    private edges: Map<SluggedEdgeString, PIXI.Graphics>;
    private _graph: PerkGraph;
    private _rootNodes: PTRNode[] | null = null;
    private missingConnections = new Map<string, Set<string>>();

    get rootNodes() {
        return this._rootNodes ??= this.filter(node => node.perk.system.node.type === "root");
    }

    get graph() {
        return this._graph;
    }

    constructor(entries: PTRNode[] = []) {
        super(entries.map((entry) => [`${entry.position.i},${entry.position.j}`, entry]));
        this.edges = new Map();

        this._graph = new PerkGraph(this);
    }

    async initialize(actor: Maybe<ActorPTR2e>) {
        this.clear();
        this.edges.clear();
        this.missingConnections = new Map();
        this._rootNodes = null;
        const perkManager = await game.ptr.perks.initialize();
        let hasRoot = false;
        for (const perk of perkManager.perks.values()) {
            if (perk.system.node && perk.system.node.i !== null && perk.system.node.j !== null) {
                const connected = new Set(perk.system.node.connected);
                const isRoot = perk.system.node.type === "root";
                const actorPerk = actor?.perks.get(perk.slug);
                const state = actorPerk ? PerkState.purchased : PerkState.unavailable
                if(isRoot) {
                    if(actorPerk) perk.system.cost = actorPerk.system.cost;
                    else perk.system.cost = 5;
                }

                this.set(`${perk.system.node.i},${perk.system.node.j}`, {
                    position: { i: perk.system.node.i, j: perk.system.node.j },
                    perk: perk,
                    connected,
                    state
                });
                if(state === PerkState.purchased) this.updatePerkState(perk, actor!, perkManager);
                if(state === PerkState.unavailable) this.tryUpdatePerkState(this.get(`${perk.system.node.i},${perk.system.node.j}`)!, actor, perkManager);
                if(isRoot && state === PerkState.purchased) hasRoot = true;
            }
        }
        for(const rootNode of this.filter(node => node.perk.system.node.type === "root")) {
            if(!hasRoot) rootNode.perk.system.cost = 0;

            if(rootNode.state === PerkState.unavailable && ((actor?.system.advancement.advancementPoints.available ?? 0) >= rootNode.perk.system.cost)) {
                rootNode.state = PerkState.available;
            }
            else if(rootNode.state === PerkState.unavailable) rootNode.state = PerkState.connected;
        }
        if (this.size > 0) this._graph.initialize();
    }

    /**
     * Update all connected perks to mark them connected, and in turn determine their availability.
     * @param currentPerk A perk that has been purchased
     * @param actor 
     * @param manager 
     */
    updatePerkState(currentPerk: PerkPTR2e, actor: ActorPTR2e, manager: PerkManager)  {
        const missingConnections = this.missingConnections.get(currentPerk.slug) ?? [];
        const set = new Set([...currentPerk.system.node.connected, ...missingConnections]);

        for(const connected of set) {
            const connectedPerk = manager.perks.get(connected);
            if(!connectedPerk || connectedPerk.system.node.i === null || connectedPerk.system.node.j === null) continue;
            const isRootPerk = connectedPerk.system.node.type === 'root';
            
            const connectedNode = this.get(`${connectedPerk.system.node.i},${connectedPerk.system.node.j}`);
            if(!connectedNode || connectedNode.state !== PerkState.unavailable) continue;

            if(isRootPerk) connectedPerk.system.cost = 1;
            
            //TODO: Implement proper prerequisite checking
            if(actor.system.advancement.advancementPoints.available >= connectedPerk.system.cost) {
                connectedNode.state = PerkState.available;
                continue;
            }
            
            connectedNode.state = PerkState.connected;
        }
    }

    /**
     * Checks all connected perks to see if this one should be available.
     * @param currentPerk 
     * @param actor 
     * @param manager 
     */
    tryUpdatePerkState(currentNode: PTRNode, actor: Maybe<ActorPTR2e>, manager: PerkManager) {
        const isRootNode = currentNode.perk.system.node.type === "root"

        for(const connected of new Set(currentNode.connected)) {
            const connectedPerk = manager.perks.get(connected);
            if(!connectedPerk || connectedPerk.system.node.i === null || connectedPerk.system.node.j === null) continue;
            
            const connectedNode = this.get(`${connectedPerk.system.node.i},${connectedPerk.system.node.j}`);
            if(!connectedNode) {
                if(!this.missingConnections.has(connected)) this.missingConnections.set(connected, new Set([currentNode.perk.slug]));
                else this.missingConnections.get(connected)!.add(currentNode.perk.slug);
                continue;
            }
            if(connectedNode.state !== PerkState.purchased) continue;

            if(isRootNode) currentNode.perk.system.cost = connectedPerk.system.cost;

            //TODO: Implement proper prerequisite checking
            if(actor && actor.system.advancement.advancementPoints.available >= currentNode.perk.system.cost) {
                currentNode.state = PerkState.available;
            }
            else {
                currentNode.state = PerkState.connected;
            }
            break;
        }
    }

    getEdge(node1: PTRNode, node2: PTRNode): PIXI.Graphics | null {
        return (
            this.edges.get(`${node1.perk.slug}-${node2.perk.slug}`) ??
            this.edges.get(`${node2.perk.slug}-${node1.perk.slug}`) ??
            null
        );
    }

    registerEdge(node1: PTRNode, node2: PTRNode, edge: PIXI.Graphics) {
        this.edges.set(`${node1.perk.slug}-${node2.perk.slug}`, edge);
        return this;
    }

    unregisterEdge(node1: PTRNode, node2: PTRNode) {
        this.edges.delete(`${node1.perk.slug}-${node2.perk.slug}`);
        this.edges.delete(`${node2.perk.slug}-${node1.perk.slug}`);
        return this;
    }

    override get(ij: CoordinateString): PTRNode | undefined {
        return super.get(ij);
    }

    //@ts-expect-error - This is a valid override
    override has(ij: CoordinateString): boolean {
        return super.has(ij);
    }

    override getName(name: string, { strict }: { strict: true; }): PTRNode;
    override getName(name: string): PTRNode | undefined;
    override getName(name: string, { strict }: { strict?: boolean | undefined; } = {}): PTRNode | undefined {
        const entry = this.find((node) => node.perk?.slug === sluggify(name));
        if (strict && entry === undefined) {
            throw new Error(`An entry with name ${name} does not exist in the collection`);
        }
        return entry ?? undefined;
    }

    override toJSON() {
        return this.map((node) =>
            fu.duplicate({
                position: node.position,
                perk: node.perk?.uuid ?? null,
                connected: [...node.connected],
            })
        );
    }
}

export { PerkStore };
export type { PTRNode, EdgeCoordinateString };
