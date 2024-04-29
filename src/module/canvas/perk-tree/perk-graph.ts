import { PerkStore, PTRNode } from "./perks-store.ts";

class PerkGraph {
    private matrix: Record<string, GraphNode>;
    private store: PerkStore;

    constructor(store: PerkStore) {
        this.matrix = {};
        this.store = store;

        this.initialize();
    }

    initialize() {
        this.matrix = {};
        for (const node of this.store) {
            this.matrix[node.perk.slug] = {
                entry: node,
                connections: {
                    [node.perk.slug]: {
                        entry: node,
                        value: 0,
                    }
                },
            };
            for(const innerNode of this.store) {
                if(node.perk.slug === innerNode.perk.slug) continue;

                this.matrix[node.perk.slug].connections[innerNode.perk.slug] = {
                    entry: innerNode,
                    value: node.connected.has(innerNode.perk.slug) ? innerNode.perk.system.cost : 0,
                };
            }
        }
    }

    addEdge(node1: PTRNode, node2: PTRNode) {
        this.matrix[node1.perk.slug].connections[node2.perk.slug] = {
            entry: node2,
            value: node2.perk.system.cost,
        };
        this.matrix[node2.perk.slug].connections[node1.perk.slug] = {
            entry: node1,
            value: node1.perk.system.cost,
        };
    }

    getNeighbors(node: PTRNode): PTRNode[] {
        return (
            Object.values(this.matrix[node.perk.slug]?.connections ?? {}).map(
                (connection) => connection?.entry
            ) ?? []
        );
    }

    hasEdge(node1: PTRNode, node2: PTRNode): boolean {
        return (
            this.matrix[node1.perk.slug].connections[node2.perk.slug].value === 1 &&
            this.matrix[node2.perk.slug].connections[node1.perk.slug].value === 1
        );
    }

    removeEdge(node1: PTRNode, node2: PTRNode) {
        this.matrix[node1.perk.slug].connections[node2.perk.slug].value = 0;
        this.matrix[node2.perk.slug].connections[node1.perk.slug].value = 0;
    }

    getBestPathsToRoot(node: PTRNode): PerkWebPath | null{
        // Get the shortest path to each root node
        const rootNodes = this.store.rootNodes;

        let currentShortest, currentCheapest;
        const paths = rootNodes.flatMap((root) => this.getPath(node, root) ?? []);
        for(const {shortest, cheapest} of paths) {
            if(!currentShortest || shortest.steps < currentShortest.steps) currentShortest = shortest;
            if(!currentCheapest || cheapest.cost < currentCheapest.cost) currentCheapest = cheapest;
        }
        return currentCheapest && currentShortest ? new PerkWebPath({ shortest: currentShortest, cheapest: currentCheapest }) : null;
    }


    getPathToRoot(node: PTRNode, mode: ("shortest" | "cheapest")): Path | null {
        const func = mode === "shortest" ? this.getShortestPath : this.getCheapestPath;

        let currentBest = null;
        for(const root of this.store.rootNodes) {
            const path = func.bind(this)(node, root);
            if(!path) continue;
            if(mode === "shortest") {
                if(!currentBest || path.steps < currentBest.steps) currentBest = path;
            }
            else {
                if(!currentBest || path.cost < currentBest.cost) currentBest = path;
            }
        }
        return currentBest;
    }

    getPath(node1: PTRNode, node2: PTRNode): PerkWebPath | null {
        const shortest = this.getShortestPath(node1, node2);
        const cheapest = this.getCheapestPath(node1, node2);
        return shortest && cheapest ? new PerkWebPath({ shortest, cheapest }) : null;
    }

    /**
     * Use Dijkstra's algorithm to find the cheapest path between two nodes
     */
    getCheapestPath(node1: PTRNode, node2: PTRNode): Path | null{
        const startNode = this.matrix[node1.perk.slug];
        const endNode = this.matrix[node2.perk.slug];
        if(!startNode || !endNode) return null;

        const unvisited: Record<string, PathStep> = {};
        const visited: Record<string, PathStep> = {};

        // Initialize the start node
        unvisited[startNode.entry.perk.slug] = {
            node: startNode,
            previous: null,
            next: null,
            total: 0,
            cost: 0,
        };

        // Iterate over all unvisited nodes
        while (Object.keys(unvisited).length > 0) {
            // Get the current node
            const currentSlug = Object.keys(unvisited).reduce((a, b) =>
                unvisited[a].cost < unvisited[b].cost ? a : b
            );
            const current = unvisited[currentSlug];

            // If we've reached the end node, return the path
            if (currentSlug === endNode.entry.perk.slug) {
                const steps: PathStep[] = [];
                let step: PathStep | null = current;
                while (step) {
                    step.next = steps.at(-1) ?? null;
                    steps.push(step);
                    step = step.previous;
                }
                return {
                    startStep: steps.pop()!,
                    endStep: steps[0],
                    steps: steps.length,
                    cost: current.total,
                };
            }

            // Move the current node to the visited list
            delete unvisited[currentSlug];
            visited[currentSlug] = current;

            // Iterate over all connections
            for (const [slug, connection] of Object.entries(current.node.connections)) {
                if (visited[slug]) continue;
                // If the connection value is 0, it means there is no connection.
                if(connection.value === 0) continue;

                // Calculate the cost to this node
                const total = current.total + connection.value;

                // If the node is unvisited or the new cost is less than the existing cost
                if (!unvisited[slug] || total < unvisited[slug].total) {
                    unvisited[slug] = {
                        node: this.matrix[slug],
                        previous: current,
                        next: null,
                        total: total,
                        cost: connection.value,
                    };
                }
            }
        }

        return null;
    }

    /**
     * Use Dijkstra's algorithm to find the shortest path between two nodes
     */
    getShortestPath(node1: PTRNode, node2: PTRNode): Path | null{
        const startNode = this.matrix[node1.perk.slug];
        const endNode = this.matrix[node2.perk.slug];
        if(!startNode || !endNode) return null;

        const unvisited: Record<string, PathStep> = {};
        const visited: Record<string, PathStep> = {};

        // Initialize the start node
        unvisited[startNode.entry.perk.slug] = {
            node: startNode,
            previous: null,
            next: null,
            total: 0,
            cost: 0,
        };

        // Iterate over all unvisited nodes
        while (Object.keys(unvisited).length > 0) {
            // Get the current node
            const currentSlug = Object.keys(unvisited).reduce((a, b) =>
                unvisited[a].cost < unvisited[b].cost ? a : b
            );
            const current = unvisited[currentSlug];

            // If we've reached the end node, return the path
            if (currentSlug === endNode.entry.perk.slug) {
                const steps: PathStep[] = [];
                let step: PathStep | null = current;
                while (step) {
                    step.next = steps.at(-1) ?? null;
                    steps.push(step);
                    step = step.previous;
                }
                return {
                    startStep: steps.pop()!,
                    endStep: steps[0],
                    steps: steps.length,
                    cost: steps.reduce((acc, step) => acc + step.cost, 0)
                };
            }

            // Move the current node to the visited list
            delete unvisited[currentSlug];
            visited[currentSlug] = current;

            // Iterate over all connections
            for (const [slug, connection] of Object.entries(current.node.connections)) {
                if (visited[slug]) continue;
                // If the connection value is 0, it means there is no connection.
                if(connection.value === 0) continue;

                // Calculate the cost to this node
                const total = current.total + 1;

                // If the node is unvisited or the new cost is less than the existing cost
                if (!unvisited[slug] || total < unvisited[slug].total) {
                    unvisited[slug] = {
                        node: this.matrix[slug],
                        previous: current,
                        next: null,
                        total: total,
                        cost: connection.value,
                    };
                }
            }
        }

        return null;
    }
}

class PerkWebPath {
    constructor({ shortest, cheapest }: { shortest: Path; cheapest: Path }) {
        this.shortest = shortest;
        this.cheapest = cheapest;
    }

    get pathStrings() {
        function getPathString(path: Path) {
            const steps = [];
            let step: PathStep | null = path.startStep;
            while (step) {
                steps.push(`${step.node.entry.perk.slug} (${step.cost})`);
                step = step.next;
            }
            return steps.join(" -> ");
        }
        return {
            shortest: this.shortest ? getPathString(this.shortest) : null,
            cheapest: this.cheapest ? getPathString(this.cheapest) : null,
        };
    }
}

interface PerkWebPath {
    shortest: Path;
    cheapest: Path;
}

type Path = {
    startStep: PathStep;
    endStep: PathStep;
    steps: number;
    cost: number;
};

type PathStep = {
    node: GraphNode;
    previous: PathStep | null;
    next: PathStep | null;
    cost: number;
    total: number;
};

type GraphNode = {
    entry: PTRNode;
    connections: Record<
        string,
        {
            entry: PTRNode;
            /**
             * The cost to move from this node to the connected node
             * 0 means there is no connection
             */
            value: number;
        }
    >;
};

export default PerkGraph;
export {
    PerkWebPath
}
export type {
    Path,
    PathStep,
    GraphNode,
}