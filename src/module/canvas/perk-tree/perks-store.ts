import { PerkPTR2e } from "@item";
import { PerkNode } from "./perk-node.ts";
import { CoordinateString } from "./perk-web.ts";
import { sluggify } from "@utils";

type EdgeCoordinateString = `${CoordinateString}-${CoordinateString}`;

type PTRNode = {
    position: {
        i: number;
        j: number;
    };
    element?: PerkNode;
    perk: PerkPTR2e;
    connected: Set<string>;
};

type SluggedEdgeString = `${string}-${string}`;

class PerkStore extends Collection<PTRNode> {
    private edges: Map<SluggedEdgeString, PIXI.Graphics>;

    constructor(entries: PTRNode[] = []) {
        super(entries.map((entry) => [`${entry.position.i},${entry.position.j}`, entry]));
        this.edges = new Map();
    }

    static async create() {
        const perkManager = await game.ptr.perks.initialize();
        const nodes: PTRNode[] = [];
        for (const perk of perkManager.perks.values()) {
            if (perk.system.node && perk.system.node.i !== null && perk.system.node.j !== null) {
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
        this.edges.clear();
        const perkManager = await game.ptr.perks.initialize();
        for (const perk of perkManager.perks.values()) {
            if (perk.system.node && perk.system.node.i !== null && perk.system.node.j !== null) {
                this.set(`${perk.system.node.i},${perk.system.node.j}`, {
                    position: { i: perk.system.node.i, j: perk.system.node.j },
                    perk: perk,
                    connected: new Set(perk.system.node.connected),
                });
            }
        }
    }

    getEdge(node1: PTRNode, node2: PTRNode): PIXI.Graphics | null {
        return this.edges.get(`${node1.perk.slug}-${node2.perk.slug}`) ?? this.edges.get(`${node2.perk.slug}-${node1.perk.slug}`) ?? null;
    }

    registerEdge(node1: PTRNode, node2: PTRNode, edge: PIXI.Graphics) {
        this.edges.set(
            `${node1.perk.slug}-${node2.perk.slug}`,
            edge
        );
        return this;
    }

    unregisterEdge(node1: PTRNode, node2: PTRNode) {
        this.edges.delete(
            `${node1.perk.slug}-${node2.perk.slug}`
        );
        this.edges.delete(
            `${node2.perk.slug}-${node1.perk.slug}`
        );
        return this;
    }

    override get(ij: CoordinateString): PTRNode | undefined {
        return super.get(ij);
    }

    //@ts-expect-error
    override has(ij: CoordinateString): boolean {
        return super.has(ij);
    }

    override getName(
        name: string,
        { strict }: { strict?: boolean | undefined } | undefined = {}
    ): PTRNode | undefined {
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
