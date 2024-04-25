import { PerkPTR2e } from "@item";
import { PerkNode } from "./perk-node.ts";
import { CoordinateString } from "./perk-web.ts";

type EdgeCoordinateString = `${CoordinateString}-${CoordinateString}`;

type PTRNode = {
    position: {
        i: number;
        j: number;
    };
    element?: PerkNode;
    perk: PerkPTR2e | null;
    connected: Set<CoordinateString>;
};

class PerkStore extends Collection<PTRNode> {
    private edges: Map<EdgeCoordinateString, PIXI.Graphics>;

    constructor(entries: PTRNode[] = []) {
        super(entries.map((entry) => [`${entry.position.i},${entry.position.j}`, entry]));
        this.edges = new Map();
    }

    static async create() {
        const perkManager = await game.ptr.perks.initialize();
        const nodes: PTRNode[] = [];
        for (const perk of perkManager.perks.values()) {
            if (perk.system.node) {
                nodes.push({
                    position: { i: perk.system.node.i, j: perk.system.node.j },
                    perk: perk,
                    connected: new Set(perk.system.node.connected),
                });
            }
        }
        return new PerkStore(nodes);
    }

    async initialize() {
        this.clear();
        const perkManager = await game.ptr.perks.initialize();
        for (const perk of perkManager.perks.values()) {
            if (perk.system.node) {
                this.set(`${perk.system.node.i},${perk.system.node.j}`, {
                    position: { i: perk.system.node.i, j: perk.system.node.j },
                    perk: perk,
                    connected: new Set(perk.system.node.connected),
                });
            }
        }
    }

    getEdge(node1: CoordinateString, node2: CoordinateString): PIXI.Graphics | null;
    getEdge(node1: { i: number; j: number }, node2: { i: number; j: number }): PIXI.Graphics | null;
    getEdge(node1: PTRNode, node2: PTRNode): PIXI.Graphics | null;
    getEdge(
        node1: PTRNode | { i: number; j: number } | CoordinateString,
        node2: PTRNode | { i: number; j: number } | CoordinateString
    ): PIXI.Graphics | null {
        const { ij, ij2 } = ((): { ij: CoordinateString; ij2: CoordinateString } => {
            if (typeof node1 === "string")
                return { ij: node1 as CoordinateString, ij2: node2 as CoordinateString };
            if ("i" in node1)
                return {
                    ij: `${node1.i},${node1.j}`,
                    ij2: `${(node2 as { i: number }).i},${(node2 as { j: number }).j}`,
                };
            return {
                ij: `${(node1 as PTRNode).position.i},${(node1 as PTRNode).position.j}`,
                ij2: `${(node2 as PTRNode).position.i},${(node2 as PTRNode).position.j}`,
            };
        })();
        return this.edges.get(`${ij}-${ij2}`) ?? this.edges.get(`${ij2}-${ij}`) ?? null;
    }

    registerEdge(node1: PTRNode, node2: PTRNode, edge: PIXI.Graphics) {
        this.edges.set(
            `${node1.position.i},${node1.position.j}-${node2.position.i},${node2.position.j}`,
            edge
        );
        return this;
    }

    unregisterEdge(node1: PTRNode, node2: PTRNode) {
        this.edges.delete(
            `${node1.position.i},${node1.position.j}-${node2.position.i},${node2.position.j}`
        );
        this.edges.delete(
            `${node2.position.i},${node2.position.j}-${node1.position.i},${node1.position.j}`
        );
        return this;
    }

    override getName(
        name: string,
        { strict }: { strict?: boolean | undefined } | undefined = {}
    ): PTRNode | undefined {
        const entry = this.find((node) => node.perk?.name === name);
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
