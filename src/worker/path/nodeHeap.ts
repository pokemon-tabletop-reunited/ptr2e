/**
 * Based on https://github.com/mourner/tinyqueue
 * Copyright (c) 2017, Vladimir Agafonkin https://github.com/mourner/tinyqueue/blob/master/LICENSE
 * 
 * Adapted for PathFinding needs by @anvaka
 * Copyright (c) 2017, Andrei Kashcha
 */

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() { }

function defaultCompare<T>(a: T, b: T) {
  //@ts-expect-error - We are only using this for numbers
  return a - b;
}

export class NodeHeap<T> {
  data: T[];
  length: number;
  compare: (a: T, b: T) => number;
  setNodeId: (node: T, id: number) => void;

  constructor(data: T[], options: NodeHeapOptions<T>) {
    if (!Array.isArray(data)) {
      // assume first argument is our config object;
      options = data;
      data = [];
    }
  
    options = options || {};
  
    this.data = data || [];
    this.length = this.data.length;
    this.compare = options.compare || defaultCompare;
    this.setNodeId = options.setNodeId || noop;
  
    if (this.length > 0) {
      for (let i = (this.length >> 1); i >= 0; i--) this._down(i);
    }
  
    if (options.setNodeId) {
      for (let i = 0; i < this.length; ++i) {
        this.setNodeId(this.data[i], i);
      }
    }
  }

  push(item: T) {
    this.data.push(item);
    this.setNodeId(item, this.length);
    this.length++;
    this._up(this.length - 1);
  }

  pop() {
    if (this.length === 0) return undefined;

    const top = this.data[0];
    this.length--;

    if (this.length > 0) {
      this.data[0] = this.data[this.length];
      this.setNodeId(this.data[0], 0);
      this._down(0);
    }
    this.data.pop();

    return top;
  }

  peek() {
    return this.data[0];
  }

  updateItem(pos: number) {
    this._down(pos);
    this._up(pos);
  }

  _up(pos: number) {
    const data = this.data;
    const compare = this.compare;
    const setNodeId = this.setNodeId;
    const item = data[pos];

    while (pos > 0) {
      const parent = (pos - 1) >> 1;
      const current = data[parent];
      if (compare(item, current) >= 0) break;
      data[pos] = current;

      setNodeId(current, pos);
      pos = parent;
    }

    data[pos] = item;
    setNodeId(item, pos);
  }

  _down(pos: number) {
    const data = this.data;
    const compare = this.compare;
    const halfLength = this.length >> 1;
    const item = data[pos];
    const setNodeId = this.setNodeId;

    while (pos < halfLength) {
      let left = (pos << 1) + 1;
      const right = left + 1;
      let best = data[left];

      if (right < this.length && compare(data[right], best) < 0) {
        left = right;
        best = data[right];
      }
      if (compare(best, item) >= 0) break;

      data[pos] = best;
      setNodeId(best, pos);
      pos = left;
    }

    data[pos] = item;
    setNodeId(item, pos);
  }
}

interface NodeHeapOptions<T> {
  compare?: (a: T, b: T) => number;
  setNodeId?: (node: T, id: number) => void;
}