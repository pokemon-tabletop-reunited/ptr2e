// import type { ActorPTR2e, ActorSystemPTR2e } from "@actor";
// import { MockActor } from "./actor.ts";
// import { MockItem } from "./item.ts";
// import type { ItemPTR2e, PTR.Item.ItemSystemPTR } from "@item";

// /** In Foundry this is actually a subclass of Map, but it incompatibly extends it at several points. */
// export class MockCollection<V> {
//     #map: Map<string, V>;

//     constructor(entries: [string, V][] = []) {
//         this.#map = new Map(entries);
//     }

//     [Symbol.iterator](): IterableIterator<V> {
//         return this.#map.values();
//     }

//     get size(): number {
//         return this.#map.size;
//     }

//     get contents(): V[] {
//         return Array.from(this.#map.values());
//     }

//     get(key: string): V | null {
//         return this.#map.get(key) ?? null;
//     }

//     set(key: string, value: V): MockCollection<V> {
//         this.#map.set(key, value);
//         return this;
//     }

//     has(key: string): boolean {
//         return this.#map.has(key);
//     }

//     find(predicate: (value: V) => boolean): V | undefined {
//         return this.contents.find(predicate);
//     }

//     some(predicate: (value: V) => boolean): boolean {
//         return this.contents.some(predicate);
//     }

//     filter(predicate: (value: V) => boolean): V[] {
//         return this.contents.filter(predicate);
//     }

//     map<T>(callback: (value: V) => T): T[] {
//         return this.contents.map(callback);
//     }

//     delete(key: string): boolean {
//         return this.#map.delete(key);
//     }

//     clear(): void {
//         this.#map.clear();
//     }
// }

// export class MockWorldCollection<V extends { readonly parent: null }> extends MockCollection<V> {}

// export class MockActors extends MockWorldCollection<ActorPTR2e<ActorSystemPTR2e,null>> {
//     tokens: Record<string, ActorPTR2e | undefined> = {};

//     documentClass = MockActor as unknown as typeof ActorPTR2e;
// }

// export class MockItems extends MockWorldCollection<ItemPTR2e<ItemSystemPTR,null>> {
//     tokens: Record<string, ActorPTR2e | undefined> = {};

//     documentClass = MockItem as unknown as typeof ItemPTR2e;
// }
