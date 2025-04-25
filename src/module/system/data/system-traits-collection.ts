import Trait from './models/trait.ts';
export default class SystemTraitsCollection<V extends Trait = Trait> extends Collection<V> {
  suppressedTraits = new Set<string>();

  override filter<S extends V>(/** @immediate */ condition: (e: V, index: number, collection: Collection<V>) => e is S): S[];
  override filter(/** @immediate */ condition: (e: V, index: number, collection: Collection<V>) => boolean): V[];
  override filter(/** @immediate */ condition: (e: V, index: number, collection: Collection<V>) => boolean): V[] {
    return super.filter((value, i, c) => !this.suppressedTraits.has(value.slug) && condition(value, i, c));
  }

  //@ts-expect-error - FVTT Types issue
  override get<T extends V = V>(key: Maybe<string>, options: { strict: true }): T;
  override get<T extends V = V>(key: Maybe<string>, options?: Record<string, unknown>): T | undefined;
  override get<T extends V = V>(key: Maybe<string>, options?: Record<string, unknown>): T | undefined {
    if (this.suppressedTraits.has(key as string)) return undefined;
    //@ts-expect-error - FVTT Types issue
    return super.get(key, options);
  }

  override getName(name: string, { strict }: { strict: true }): V;
  override getName(name: string, { strict }: { strict: false }): V | undefined;
  override getName(name: string, options?: { strict?: boolean }): V | undefined;
  override getName(name: string, options?: { strict?: boolean }): V | undefined {
    const result = super.getName(name, options as { strict: false });
    if (result && this.suppressedTraits.has(result.slug)) return undefined;
    return result;
  }

  override get contents(): V[] {
    return super.contents.filter((value: V) => !this.suppressedTraits.has(value.slug));
  }

  override [Symbol.iterator](): IterableIterator<V> {
    return this.values().filter((value: V) => !this.suppressedTraits.has(value.slug))[Symbol.iterator]();
  }
}