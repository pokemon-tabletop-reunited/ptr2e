//@ts-nocheck - This file is constantly tripping based on [Symbol.iterator], thus no-check to stop unnecessary warnings/errors.
import Trait from './models/trait.ts';
export default class SystemTraitsCollection<V extends Trait = Trait> extends Collection<V> {
  suppressedTraits = new Set<string>();

  override filter<T extends V = V>(condition: (value: V) => value is T): T[];
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  override filter<T extends V = V>(condition: (value: V) => boolean): T[];
  override filter<T extends V = V>(condition: (value: V) => boolean): T[] {
    return super.filter((value) => !this.suppressedTraits.has(value.slug) && condition(value));
  }

  override get<T extends V = V>(key: Maybe<string>, options: { strict: true }): T;
  override get<T extends V = V>(key: Maybe<string>, options?: CollectionGetOptions): T | undefined;
  override get<T extends V = V>(key: Maybe<string>, options?: CollectionGetOptions): T | undefined {
    if (this.suppressedTraits.has(key as string)) return undefined;
    return super.get(key, options);
  }

  override getName(name: string, { strict }: { strict: true }): V;
  override getName(name: string, { strict }: { strict: false }): V | undefined;
  override getName(name: string, options?: { strict?: boolean }): V | undefined;
  override getName(name: string, options?: { strict?: boolean }): V | undefined {
    const result = super.getName(name, options);
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