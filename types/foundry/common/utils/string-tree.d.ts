/**
 * A string tree node consists of zero-or-more string keys, and a leaves property that contains any objects that
 * terminate at the current node.
 */
type StringTreeNode<T = any> = Record<symbol, T>;

/**
 * A data structure representing a tree of string nodes with arbitrary object leaves.
 */
export default class StringTree<TType = any, TNode extends StringTreeNode = StringTreeNode<TType>> {
    /**
     * The key symbol that stores the leaves of any given node.
     * @type {symbol}
     */
    static get leaves(): symbol;
  
    static #leaves: symbol;
  
    /* -------------------------------------------- */
  
    /**
     * The tree's root.
     * @type {TNode}
     */
    #root: TNode;
  
    /* -------------------------------------------- */
  
    /**
     * Insert an entry into the tree.
     * @param {string[]} strings  The string parents for the entry.
     * @param {any} entry         The entry to store.
     * @returns {TNode}  The node the entry was added to.
     */
    addLeaf(strings: string[], entry: any): TNode;
  
    /* -------------------------------------------- */
  
    /**
     * Traverse the tree along the given string path and return any entries reachable from the node.
     * @param {string[]} strings        The string path to the desired node.
     * @param {object} [options]
     * @param {number} [options.limit]  The maximum number of items to retrieve.
     * @returns {any[]}
     */
    lookup(strings: string[], options?: {limit?: number}): any[];
  
    /* -------------------------------------------- */
  
    /**
     * Returns the node at the given path through the tree.
     * @param {string[]} strings                    The string path to the desired node.
     * @param {object} [options]
     * @param {boolean} [options.hasLeaves=false]   Only return the most recently visited node that has leaves, otherwise
     *                                              return the exact node at the prefix, if it exists.
     * @returns {TNode|void}
     */
    nodeAtPrefix(strings: string[], options?: {hasLeaves: boolean}): TNode | void;
  
    /* -------------------------------------------- */
  
    /**
     * Perform a breadth-first search starting from the given node and retrieving any entries reachable from that node,
     * until we reach the limit.
     * @param {TNode} node     The starting node.
     * @param {any[]} entries           The accumulated entries.
     * @param {TNode[]} queue  The working queue of nodes to search.
     * @param {object} [options]
     * @param {number} [options.limit]  The maximum number of entries to retrieve before stopping.
     * @protected
     */
    _breadthFirstSearch(node: TNode, entries: any[], queue: TNode[], options?: {limit?: number}): void;
  }
  