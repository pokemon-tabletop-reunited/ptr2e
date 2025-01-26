//@ts-nocheck
// We reuse instance of array, but we trie to freeze it as well,
// so that consumers don't modify it. Maybe it's a bad idea.
const NO_PATH: never[] = [];
if (typeof Object.freeze === 'function') Object.freeze(NO_PATH);

export {
  // Path search settings
  blindHeuristic as heuristic,
  constantDistance as distance,
  neverBlocked as blocked,
  compareFScore,
  NO_PATH,

  // heap settings
  setHeapIndex,

  // nba:
  setH1,
  setH2,
  compareF1Score,
  compareF2Score,
}

function blindHeuristic(/* a, b */) {
  // blind heuristic makes this search equal to plain Dijkstra path search.
  return 0;
}

function constantDistance(/* a, b */) {
  return 1;
}

function neverBlocked(/* a, b, c */) {
  return false;
}

function compareFScore(a, b) {
  const result = a.fScore - b.fScore;
  // TODO: Can I improve speed with smarter ties-breaking?
  // I tried distanceToSource, but it didn't seem to have much effect
  return result;
}

function setHeapIndex(nodeSearchState, heapIndex) {
  nodeSearchState.heapIndex = heapIndex;
}

function compareF1Score(a, b) {
  return a.f1 - b.f1;
}

function compareF2Score(a, b) {
  return a.f2 - b.f2;
}

function setH1(node, heapIndex) {
  node.h1 = heapIndex;
}

function setH2(node, heapIndex) {
  node.h2 = heapIndex;
}