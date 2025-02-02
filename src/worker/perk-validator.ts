import { Actor, Perk } from "./types.js";

/**
 * Helpers for validating the prerequisites of perks
 */
export function validatePrerequisites(perk: Perk, actor: Actor, rollOptions: string[]) {
  const prereqs = duplicate(perk.system.prerequisites);
  const predicate = new Predicate(resolveValue(
    prereqs,
    prereqs,
    { actor, item: perk },
  ) as PredicateStatement[]);
  const result =  predicate.test(rollOptions);
  return {
    results: result.results.map(r => ({
      result: r.result,
      statement: perk.system.prerequisites[r.index],
    })),
    passes: result.passes,
  }
}

export function getStatementType(statement: PredicateStatement | PredicateStatement[]): (string|number)[] | string | number | void {
  if(Array.isArray(statement)) {
    const values: (string|number)[] = [];
    for(const s of statement) {
      const value = getStatementType(s) as string | number | void;
      if(value) values.push(value);
    }
    return values;
  }
  if(StatementValidator.isBinaryOp(statement)) {
    const entries = Object.entries(statement);
    const [, value]: [string, PredicateStatement[]] = entries[0];
    return getStatementType(value);
  }
  if(StatementValidator.isCompound(statement)) {
    const entries = Object.entries(statement);
    const [,value]: [string, PredicateStatement[]] = entries[0];
    return getStatementType(value);
  }
  if((typeof statement === "string" && statement.length > 0)) {
    const number = Number(statement);
    if(!isNaN(number)) return number;
    
    const itemRollOption = statement.trim().match(/^(item):(?<type>[-a-z]+):(?<slug>[-a-z0-9]+)$/);
    if (itemRollOption) {
      return "item";
    }

    const traitRollOption = statement.trim().match(/^(trait):(?<slug>[-a-z0-9]+)$/);
    if (traitRollOption) {
      return "trait"
    }

    const injected = statement.trim().match(/^{(?<type>actor|item|effect|change)\|(?<path>[\w.-]+)}$/);

    if (injected) {
      const path = injected.groups?.path;
      if (!path) return;

      if (path.startsWith("skills.") && path.endsWith(".mod")) {
        return `skill:${path.slice(7, -4)}`;
      }
      switch (path) {
        case "level":
        case "system.advancement.level":
          return "level";
      }

      return;
    }
  }
  if(typeof statement === "number") return statement;
}

/**
 * Predication & Required Helpers
 */

/** Short form of type and non-null check */
function isObject<T extends object>(value: unknown): value is DeepPartial<T>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isObject<T extends object>(value: unknown): value is Record<string, unknown>;
function isObject<T extends string>(value: unknown): value is { [K in T]?: unknown };
function isObject(value: unknown): boolean {
  return typeof value === "object" && value !== null;
}

/**
 * A cheap data duplication trick which is relatively robust.
 * For a subset of cases the deepClone function will offer better performance.
 * @param {Object} original   Some sort of data
 */
export function duplicate<T>(original: T): T {
  return JSON.parse(JSON.stringify(original));
}

/**
 * Quickly clone a simple piece of data, returning a copy which can be mutated safely.
 * This method DOES support recursive data structures containing inner objects or arrays.
 * This method DOES NOT support advanced object types like Set, Map, or other specialized classes.
 * @param {*} original                     Some sort of data
 * @param {object} [options]               Options to configure the behaviour of deepClone
 * @param {boolean} [options.strict=false]  Throw an Error if deepClone is unable to clone something instead of
 *                                          returning the original
 * @param {number} [options._d]             An internal depth tracker
 * @return {*}                             The clone of that data
 */
export function deepClone<T>(original: T, { strict = false, _d = 0 } = {}): T {
  if (_d > 100) {
    throw new Error("Maximum depth exceeded. Be sure your object does not contain cyclical data structures.");
  }
  _d++;

  // Simple types
  if ((typeof original !== "object") || (original === null)) return original;

  // Arrays
  if (original instanceof Array) return original.map(o => deepClone(o, { strict, _d })) as unknown as T;

  // Dates
  if (original instanceof Date) return new Date(original) as unknown as T;

  // Unsupported advanced objects
  if (original.constructor && (original.constructor !== Object)) {
    if (strict) throw new Error("deepClone cannot clone advanced objects");
    return original;
  }

  // Other objects
  const clone = {} as Record<string, unknown>;
  for (const k of Object.keys(original)) {
    clone[k] = deepClone(original[k as keyof typeof original], { strict, _d });
  }
  return clone as unknown as T;
}

/**
 * Checks if `data` is a "plain" object. A plain object is defined as an object with string keys and values of any type, including primitives, other objects, functions, classes, etc (aka struct/shape/record/simple). Technically, a plain object is one whose prototype is either `Object.prototype` or `null`, ensuring it does not inherit properties or methods from other object types.
 *
 * This function is narrower in scope than `isObjectType`, which accepts any entity considered an `"object"` by JavaScript's `typeof`.
 *
 * Note that Maps, Arrays, and Sets are not considered plain objects and would return `false`.
 *
 * @param data - The variable to check.
 * @returns The input type, narrowed to only plain objects.
 * @signature
 *    R.isPlainObject(data)
 * @example
 *    // true
 *    R.isPlainObject({}) //=> true
 *    R.isPlainObject({ a: 123 }) //=> true
 *
 *    // false
 *    R.isPlainObject([]) //=> false
 *    R.isPlainObject(Promise.resolve("something")) //=> false
 *    R.isPlainObject(new Date()) //=> false
 *    R.isPlainObject(new Error("error")) //=> false
 *    R.isPlainObject('somethingElse') //=> false
 *    R.isPlainObject(null) //=> false
 * @category Guard
 */
export function isPlainObject<T>(
  data: Readonly<Record<PropertyKey, unknown>> | T,
): data is NarrowedTo<T, Record<PropertyKey, unknown>> {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- This is a low-level check, we can't avoid it being typed as `any`.
  const proto = Object.getPrototypeOf(data);
  return proto === null || proto === Object.prototype;
}

/**
 * A helper function which searches through an object to retrieve a value by a string key.
 * The method also supports arrays if the provided key is an integer index of the array.
 * The string key supports the notation a.b.c which would return object[a][b][c]
 * @param {object} object   The object to traverse
 * @param {string} key      An object property with notation a.b.c
 * @return {*}              The value of the found property
 */
export function getProperty<TValue = unknown>(object: object, key: string): TValue | undefined {
  if (!key || !object) return undefined;
  if (key in object) return object[key as keyof typeof object];
  let target = object;
  for (const p of key.split('.')) {
    if (!target || (typeof target !== "object")) return undefined;
    if (p in target) target = target[p as keyof typeof target];
    else return undefined;
  }
  return target as TValue;
}

/**
 * A helper function which searches through an object to assign a value using a string key
 * This string key supports the notation a.b.c which would target object[a][b][c]
 * @param {object} object   The object to update
 * @param {string} key      The string key
 * @param {*} value         The value to be assigned
 * @return {boolean}        Whether the value was changed from its previous value
 */
export function setProperty(object: object, key: string, value: unknown): boolean {
  if (!key) return false;

  // Convert the key to an object reference if it contains dot notation
  let target = object;
  if (key.indexOf('.') !== -1) {
    const parts = key.split('.');
    key = parts.pop()!;
    target = parts.reduce((o, i) => {
      //@ts-expect-error - We are intentionally setting a value on an object
      if (!o.hasOwnProperty(i)) o[i] = {};
      return o[i as keyof typeof o];
    }, object);
  }

  // Update the target
  if (!(key in target) || (target[key as keyof typeof target] !== value)) {
    //@ts-expect-error - We are intentionally setting a value on an object
    target[key] = value;
    return true;
  }
  return false;
}

/**
 * Learn the underlying data type of some variable. Supported identifiable types include:
 * undefined, null, number, string, boolean, function, Array, Set, Map, Promise, Error,
 * HTMLElement (client side only), Object (catchall for other object types)
 * @param {*} variable  A provided variable
 * @return {string}     The named type of the token
 */
export function getType(variable: unknown): string {

  // Primitive types, handled with simple typeof check
  const typeOf = typeof variable;
  if (typeOf !== "object") return typeOf;

  // Special cases of object
  if (variable === null) return "null";
  if (!variable!.constructor) return "Object"; // Object with the null prototype.
  if (variable!.constructor.name === "Object") return "Object";  // simple objects

  // Match prototype instances
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prototypes: [any, string][] = [
    [Array, "Array"],
    [Set, "Set"],
    [Map, "Map"],
    [Promise, "Promise"],
    [Error, "Error"],
  ];
  for (const [cls, type] of prototypes) {
    if (variable instanceof cls) return type;
  }

  // Unknown Object type
  return "Object";
}

/**
 * Expand a flattened object to be a standard nested Object by converting all dot-notation keys to inner objects.
 * Only simple objects will be expanded. Other Object types like class instances will be retained as-is.
 * @param {object} obj      The object to expand
 * @return {object}         An expanded object
 */
export function expandObject<T extends Record<string, unknown>>(obj: object): T {
  function _expand(value: object, depth: number): T {
    if (depth > 32) throw new Error("Maximum object expansion depth exceeded");
    if (!value) return value;
    if (Array.isArray(value)) return value.map(v => _expand(v, depth + 1)) as unknown as T; // Map arrays
    if (value.constructor?.name !== "Object") return value as unknown as T;               // Return advanced objects directly
    const expanded = {};                                                    // Expand simple objects
    for (const [k, v] of Object.entries(value)) {
      setProperty(expanded, k, _expand(v, depth + 1));
    }
    return expanded as unknown as T;
  }
  return _expand(obj, 0);
}

/**
 * Update a source object by replacing its keys and values with those from a target object.
 *
 * @param {object} original                           The initial object which should be updated with values from the
 *                                                    target
 * @param {object} [other={}]                         A new object whose values should replace those in the source
 * @param {object} [options={}]                       Additional options which configure the merge
 * @param {boolean} [options.insertKeys=true]         Control whether to insert new top-level objects into the resulting
 *                                                    structure which do not previously exist in the original object.
 * @param {boolean} [options.insertValues=true]       Control whether to insert new nested values into child objects in
 *                                                    the resulting structure which did not previously exist in the
 *                                                    original object.
 * @param {boolean} [options.overwrite=true]          Control whether to replace existing values in the source, or only
 *                                                    merge values which do not already exist in the original object.
 * @param {boolean} [options.recursive=true]          Control whether to merge inner-objects recursively (if true), or
 *                                                    whether to simply replace inner objects with a provided new value.
 * @param {boolean} [options.inplace=true]            Control whether to apply updates to the original object in-place
 *                                                    (if true), otherwise the original object is duplicated and the
 *                                                    copy is merged.
 * @param {boolean} [options.enforceTypes=false]      Control whether strict type checking requires that the value of a
 *                                                    key in the other object must match the data type in the original
 *                                                    data to be merged.
 * @param {boolean} [options.performDeletions=false]  Control whether to perform deletions on the original object if
 *                                                    deletion keys are present in the other object.
 * @param {number} [_d=0]                             A privately used parameter to track recursion depth.
 * @returns {object}                                  The original source object including updated, inserted, or
 *                                                    overwritten records.
 *
 * @example Control how new keys and values are added
 * ```js
 * mergeObject({k1: "v1"}, {k2: "v2"}, {insertKeys: false}); // {k1: "v1"}
 * mergeObject({k1: "v1"}, {k2: "v2"}, {insertKeys: true});  // {k1: "v1", k2: "v2"}
 * mergeObject({k1: {i1: "v1"}}, {k1: {i2: "v2"}}, {insertValues: false}); // {k1: {i1: "v1"}}
 * mergeObject({k1: {i1: "v1"}}, {k1: {i2: "v2"}}, {insertValues: true}); // {k1: {i1: "v1", i2: "v2"}}
 * ```
 *
 * @example Control how existing data is overwritten
 * ```js
 * mergeObject({k1: "v1"}, {k1: "v2"}, {overwrite: true}); // {k1: "v2"}
 * mergeObject({k1: "v1"}, {k1: "v2"}, {overwrite: false}); // {k1: "v1"}
 * ```
 *
 * @example Control whether merges are performed recursively
 * ```js
 * mergeObject({k1: {i1: "v1"}}, {k1: {i2: "v2"}}, {recursive: false}); // {k1: {i2: "v2"}}
 * mergeObject({k1: {i1: "v1"}}, {k1: {i2: "v2"}}, {recursive: true}); // {k1: {i1: "v1", i2: "v2"}}
 * ```
 *
 * @example Deleting an existing object key
 * ```js
 * mergeObject({k1: "v1", k2: "v2"}, {"-=k1": null}, {performDeletions: true});   // {k2: "v2"}
 * ```
 */
export function mergeObject<T extends object, U extends object = T>(original: T, other: U, {
  insertKeys = true, insertValues = true, overwrite = true, recursive = true, inplace = true, enforceTypes = false,
  performDeletions = false
}: MergeObjectOptions = {}, _d = 0) {
  other = other || {};
  if (!(original instanceof Object) || !(other instanceof Object)) {
    throw new Error("One of original or other are not Objects!");
  }
  const options = { insertKeys, insertValues, overwrite, recursive, inplace, enforceTypes, performDeletions };

  // Special handling at depth 0
  if (_d === 0) {
    if (Object.keys(other).some(k => /\./.test(k))) other = expandObject(other) as U;
    if (Object.keys(original).some(k => /\./.test(k))) {
      const expanded = expandObject(original);
      if (inplace) {
        Object.keys(original).forEach(k => delete original[k as keyof typeof original]);
        Object.assign(original, expanded);
      }
      else original = expanded as T;
    }
    else if (!inplace) original = deepClone(original);
  }

  // Iterate over the other object
  for (const k of Object.keys(other)) {
    const v = other[k as keyof typeof other];
    if (original.hasOwnProperty(k)) _mergeUpdate(original, k, v, options, _d + 1);
    else _mergeInsert(original, k, v, options, _d + 1);
  }
  return original;
}

/**
* A helper function for merging objects when the target key does not exist in the original
* @private
*/
function _mergeInsert<T extends object, U extends object = T>(original: T, k: string, v: U[keyof U], { insertKeys, insertValues, performDeletions }: MergeObjectOptions = {}, _d: number) {
  // Delete a key
  if (k.startsWith("-=") && performDeletions) {
    delete original[k.slice(2) as keyof T];
    return;
  }

  const canInsert = ((_d <= 1) && insertKeys) || ((_d > 1) && insertValues);
  if (!canInsert) return;

  // Recursively create simple objects
  if (v?.constructor === Object) {
    original[k as keyof T] = mergeObject({}, v, { insertKeys: true, inplace: true, performDeletions }) as unknown as T[keyof T];
    return;
  }

  // Insert a key
  original[k as keyof T] = v as unknown as T[keyof T];
}

/**
* A helper function for merging objects when the target key exists in the original
* @private
*/
function _mergeUpdate<T extends object, U extends object = T>(original: T, k: string, v: U[keyof U], {
  insertKeys, insertValues, enforceTypes, overwrite, recursive, performDeletions
}: MergeObjectOptions = {}, _d: number): object | void {
  const x = original[k as keyof T];
  const tv = getType(v);
  const tx = getType(x);

  // Recursively merge an inner object
  if ((tv === "Object") && (tx === "Object") && recursive) {
    return mergeObject(x as object, v as object, {
      insertKeys, insertValues, overwrite, enforceTypes, performDeletions,
      inplace: true
    }, _d);
  }

  // Overwrite an existing value
  if (overwrite) {
    if ((tx !== "undefined") && (tv !== tx) && enforceTypes) {
      throw new Error(`Mismatched data types encountered during object merge.`);
    }
    original[k as keyof T] = v as unknown as T[keyof T];
  }
}

/**
   * Callback used to parse and look up values when calculating rules. Parses strings that look like
   * {actor|x.y.z}, {item|x.y.z} or {rule|x.y.z} where x.y.z is the path on the current actor, item or rule.
   * It's useful if you want to include something like the item's ID in a modifier selector (for applying the
   * modifier only to a specific weapon, for example), or include the item's name in some text.
   *
   * Example:
   * {
   *   "key": "PTR2e.RuleElement.Note",
   *   "selector": "water-attack",
   *   "text": "<b>{item|name}</b> Water attacks push the target 3 meters",
   *   "predicate": {
   *       "and": ["attack:type:water"]
   *   }
   * }
   *
   * @param source The string that is to be resolved
   * @param options.warn Whether to warn on a failed resolution
   * @return the looked up value on the specific object
   */
function resolveInjectedProperties<T extends string | number | object | null | undefined>(
  source: T,
  injectables: { actor: Actor; item: Perk }
): T;
function resolveInjectedProperties(
  source: string | number | object | null | undefined,
  injectables: { actor: Actor; item: Perk }
): string | number | object | null | undefined {
  if (
    source === null ||
    typeof source === "number" ||
    (typeof source === "string" && !source.includes("{"))
  ) {
    return source;
  }

  // Walk the object tree and resolve any string values found
  if (Array.isArray(source)) {
    for (let i = 0; i < source.length; i++) {
      source[i] = resolveInjectedProperties(source[i], injectables);
    }
  } else if (isPlainObject(source)) {
    for (const [key, value] of Object.entries(source)) {
      if (typeof value === "string" || isObject(value)) {
        source[key] = resolveInjectedProperties(value, injectables);
      }
    }
    return source;
  } else if (typeof source === "string") {
    return source.replace(
      /{(actor|item|attack)\|(.*?)}/g,
      (_match, key: string, prop: string) => {
        const data =
          key === "actor" || key === "item"
            ? injectables[key]
            : injectables.item;
        const value = getProperty(data ?? {}, prop);
        return String(value);
      }
    );
  }

  return source;
}

/**
   * Parses the value attribute on a rule.
   *
   * @param valueData can be one of 3 different formats:
   * * {value: 5}: returns 5
   * * {value: "4 + @details.level.value"}: uses foundry's built in roll syntax to evaluate it
   * * {
   *      field: "item|data.level.value",
   *      brackets: [
   *          {start: 1, end: 4, value: 5}],
   *          {start: 5, end: 9, value: 10}],
   *   }: compares the value from field to >= start and <= end of a bracket and uses that value
   * @param defaultValue if no value is found, use that one
   * @return the evaluated value
   */
function resolveValue(
  value: unknown,
  defaultValue: Exclude<RuleValue, BracketedValue> = 0,
  injectables: { actor: Actor; item: Perk },
): number | string | boolean | object | null {
  value ??= defaultValue ?? null;
  if (typeof value === "number" || typeof value === "boolean" || value === null) {
    return value;
  }
  value = resolveInjectedProperties(value, injectables);

  const resolvedFromBracket = isBracketedValue(value)
    ? resolveBracketedValue(value, defaultValue, injectables)
    : value;
  if (typeof resolvedFromBracket === "number") return resolvedFromBracket;

  if (resolvedFromBracket instanceof Object) {
    return defaultValue instanceof Object
      ? mergeObject(defaultValue, resolvedFromBracket, { inplace: false })
      : resolvedFromBracket;
  }

  if (typeof resolvedFromBracket === "string") {
    return resolvedFromBracket.trim();
  }

  return defaultValue;
}

function isBracketedValue(value: unknown): value is BracketedValue {
  return (
    isPlainObject(value) &&
    Array.isArray(value.brackets) &&
    (typeof value.field === "string" || !("fields" in value))
  );
}

function resolveBracketedValue(
  value: BracketedValue,
  defaultValue: Exclude<RuleValue, BracketedValue>,
  injectables: { actor: Actor; item: Perk }
): Exclude<RuleValue, BracketedValue> {
  const bracketNumber = ((): number => {
    if (!value.field) return injectables.actor?.system.advancement.level as number ?? 0;
    const field = String(value.field);
    const separator = field.indexOf("|");
    const source = field.substring(0, separator);
    const { actor, item } = injectables;

    switch (source) {
      case "actor":
        return Number(getProperty(actor ?? {}, field.substring(separator + 1))) || 0;
      case "item":
        return Number(getProperty(item ?? {}, field.substring(separator + 1))) || 0;
      default:
        return Number(getProperty(actor ?? {}, field.substring(0))) || 0;
    }
  })();
  const brackets = value.brackets ?? [];
  // Set the fallthrough (the value set when no bracket matches) to be of the same type as the default value
  const bracketFallthrough = (() => {
    switch (typeof defaultValue) {
      case "number":
      case "boolean":
      case "object":
        return defaultValue;
      case "string":
        return Number.isNaN(Number(defaultValue)) ? defaultValue : Number(defaultValue);
      default:
        return null;
    }
  })();
  return (
    brackets.find((bracket) => {
      const start = bracket.start ?? 0;
      const end = bracket.end ?? Infinity;
      return start <= bracketNumber && end >= bracketNumber;
    })?.value ?? bracketFallthrough
  );
}

/**
 * Encapsulates logic to determine if a modifier should be active or not for a specific roll based
 * on a list of string values. This will often be based on traits, but that is not required.
 */
class Predicate extends Array<PredicateStatement> {
  /** Is the predicate data structurally valid? */
  readonly isValid: boolean;

  constructor(...statements: PredicateStatement[] | [PredicateStatement[]]) {
    super(...(Array.isArray(statements[0]) ? statements[0] : (statements as PredicateStatement[])));
    this.isValid = Predicate.isValid(this);
    Object.defineProperty(this, "isValid", { enumerable: false });
  }

  /** Structurally validate the predicates */
  static isValid(statements: unknown): statements is PredicateStatement[] {
    return this.isArray(statements);
  }

  /** Is this an array of predicatation statements? */
  static override isArray(statements: unknown): statements is PredicateStatement[] {
    return super.isArray(statements) && statements.every((s) => StatementValidator.isStatement(s));
  }

  /** Test if the given predicate passes for the given list of options. */
  static test(predicate: PredicateStatement[] = [], options: Set<string> | string[]) {
    return predicate instanceof Predicate
      ? predicate.test(options)
      : new Predicate(...predicate).test(options);
  }

  /** Test this predicate against a domain of discourse */
  test(options: Iterable<string>): {
    results: { index: number; result: boolean }[];
    passes: boolean;
  } {
    if (this.length === 0) {
      return {passes: true, results: []};
    } else if (!this.isValid) {
      console.warn("PTR2e System | The provided predicate set is malformed.");
      return {passes: false, results: []};
    }

    const domain = options instanceof Set ? options : new Set(options);

    const results = this.map((s, i) => ({ index: i, result: this.#isTrue(s, domain) }));
    return {
      passes: results.every(r => r.result),
      results,
    }
  }

  toObject(): RawPredicate {
    return deepClone([...this]);
  }

  clone(): Predicate {
    return new Predicate(this.toObject());
  }

  /** Is the provided statement true? */
  #isTrue(statement: PredicateStatement, domain: Set<string>): boolean {
    return (
      (typeof statement === "string" && (statement.startsWith("#") || domain.has(statement))) ||
      (StatementValidator.isBinaryOp(statement) && this.#testBinaryOp(statement, domain)) ||
      (StatementValidator.isCompound(statement) && this.#testCompound(statement, domain))
    );
  }

  #testBinaryOp(statement: BinaryOperation, domain: Set<string>): boolean {
    if ("eq" in statement) {
      return domain.has(`${statement.eq[0]}:${statement.eq[1]}`) || statement.eq[0] === statement.eq[1];
    } else {
      const operator = Object.keys(statement)[0];

      // Allow for tests of partial statements against numeric values
      // E.g., `{ "gt": ["actor:level", 5] }` would match against "actor:level:6" and "actor:level:7"
      const [left, right] = Object.values(statement)[0];
      const domainArray = Array.from(domain);
      const getValues = (operand: string | number): number[] => {
        const maybeNumber = Number(operand);
        if (!Number.isNaN(maybeNumber)) return [maybeNumber];
        const pattern = new RegExp(String.raw`^${operand}:([^:]+)$`);
        const values = domainArray
          .map((s) => Number(pattern.exec(s)?.[1] || NaN))
          .filter((v) => !Number.isNaN(v));
        return values.length > 0 ? values : [NaN];
      };
      const leftValues = getValues(left);
      const rightValues = getValues(right);

      switch (operator) {
        case "gt":
          return leftValues.some((l) => rightValues.every((r) => l > r));
        case "gte":
          return leftValues.some((l) => rightValues.every((r) => l >= r));
        case "lt":
          return leftValues.some((l) => rightValues.every((r) => l < r));
        case "lte":
          return leftValues.some((l) => rightValues.every((r) => l <= r));
        default:
          console.warn("PTR2e System | Malformed binary operation encountered");
          return false;
      }
    }
  }

  /** Is the provided compound statement true? */
  #testCompound(statement: Exclude<PredicateStatement, Atom>, domain: Set<string>): boolean {
    return (
      ("and" in statement && statement.and.every((subProp) => this.#isTrue(subProp, domain))) ||
      ("nand" in statement && !statement.nand.every((subProp) => this.#isTrue(subProp, domain))) ||
      ("or" in statement && statement.or.some((subProp) => this.#isTrue(subProp, domain))) ||
      ("xor" in statement && statement.xor.filter((subProp) => this.#isTrue(subProp, domain)).length === 1) ||
      ("nor" in statement && !statement.nor.some((subProp) => this.#isTrue(subProp, domain))) ||
      ("not" in statement && !this.#isTrue(statement.not, domain)) ||
      ("if" in statement && !(this.#isTrue(statement.if, domain) && !this.#isTrue(statement.then, domain))) ||
      ("xof" in statement && statement.xof.filter((subProp) => this.#isTrue(subProp, domain)).length >= statement.x)
    );
  }
}

class StatementValidator {
  static isStatement(statement: unknown): statement is PredicateStatement {
    return statement instanceof Object
      ? this.isCompound(statement) || this.isBinaryOp(statement)
      : typeof statement === "string"
        ? this.isAtomic(statement)
        : false;
  }

  static isAtomic(statement: unknown): statement is Atom {
    return (typeof statement === "string" && statement.length > 0) || this.isBinaryOp(statement);
  }

  static #binaryOperators = new Set(["eq", "gt", "gte", "lt", "lte"]);

  static isBinaryOp(statement: unknown): statement is BinaryOperation {
    if (!isObject(statement)) return false;
    const entries = Object.entries(statement);
    if (entries.length > 1) return false;
    const [operator, operands]: [string, unknown] = entries[0];
    return (
      this.#binaryOperators.has(operator) &&
      Array.isArray(operands) &&
      operands.length === 2 &&
      typeof operands[0] === "string" &&
      ["string", "number"].includes(typeof operands[1])
    );
  }

  static isCompound(statement: unknown): statement is CompoundStatement {
    return (
      isObject(statement) &&
      (this.isAnd(statement) ||
        this.isOr(statement) ||
        this.isNand(statement) ||
        this.isXor(statement) ||
        this.isNor(statement) ||
        this.isNot(statement) ||
        this.isIf(statement) ||
        this.isXOf(statement))
    );
  }

  static isAnd(statement: { and?: unknown }): statement is Conjunction {
    return (
      Object.keys(statement).length === 1 &&
      Array.isArray(statement.and) &&
      statement.and.every((subProp) => this.isStatement(subProp))
    );
  }

  static isNand(statement: { nand?: unknown }): statement is AlternativeDenial {
    return (
      Object.keys(statement).length === 1 &&
      Array.isArray(statement.nand) &&
      statement.nand.every((subProp) => this.isStatement(subProp))
    );
  }

  static isOr(statement: { or?: unknown }): statement is Disjunction {
    return (
      Object.keys(statement).length === 1 &&
      Array.isArray(statement.or) &&
      statement.or.every((subProp) => this.isStatement(subProp))
    );
  }

  static isXor(statement: { xor?: unknown }): statement is ExclusiveDisjunction {
    return (
      Object.keys(statement).length === 1 &&
      Array.isArray(statement.xor) &&
      statement.xor.every((subProp) => this.isStatement(subProp))
    );
  }

  static isNor(statement: { nor?: unknown }): statement is JointDenial {
    return (
      Object.keys(statement).length === 1 &&
      Array.isArray(statement.nor) &&
      statement.nor.every((subProp) => this.isStatement(subProp))
    );
  }

  static isNot(statement: { not?: unknown }): statement is Negation {
    return Object.keys(statement).length === 1 && !!statement.not && this.isStatement(statement.not);
  }

  static isIf(statement: { if?: unknown; then?: unknown }): statement is Conditional {
    return (
      Object.keys(statement).length === 2 && this.isStatement(statement.if) && this.isStatement(statement.then)
    );
  }

  static isXOf(statement: { xof?: unknown; x?: unknown }): statement is XOf {
    return Object.keys(statement).length === 2 &&
      (
        this.isAnd({ and: statement.xof }) ||
        this.isOr({ or: statement.xof }) ||
        this.isNand({ nand: statement.xof }) ||
        this.isXor({ xor: statement.xof }) ||
        this.isNor({ nor: statement.xof })
      ) && (
        typeof statement.x === "number" && statement.x > 0
      );
  }
}

interface EqualTo { eq: [string, string | number] }
interface GreaterThan { gt: [string, string | number] }
interface GreaterThanEqualTo { gte: [string, string | number] }
interface LessThan { lt: [string, string | number] }
interface LessThanEqualTo { lte: [string, string | number] }
type BinaryOperation = EqualTo | GreaterThan | GreaterThanEqualTo | LessThan | LessThanEqualTo;
type Atom = string | BinaryOperation;

interface Conjunction { and: PredicateStatement[] }
interface Disjunction { or: PredicateStatement[] }
interface ExclusiveDisjunction { xor: PredicateStatement[] }
interface Negation { not: PredicateStatement }
interface AlternativeDenial { nand: PredicateStatement[] }
interface JointDenial { nor: PredicateStatement[] }
interface Conditional { if: PredicateStatement; then: PredicateStatement }
interface XOf { xof: PredicateStatement[]; x: number }
type CompoundStatement =
  | Conjunction
  | Disjunction
  | ExclusiveDisjunction
  | AlternativeDenial
  | JointDenial
  | Negation
  | Conditional
  | XOf;

type PredicateStatement = Atom | CompoundStatement;

type RawPredicate = PredicateStatement[];

type DeepPartial<T extends object> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type RuleValue = string | number | boolean | object | BracketedValue | null;

interface Bracket<T extends object | number | string> {
  start?: number;
  end?: number;
  value: T;
}

interface BracketedValue<T extends object | number | string = object | number | string> {
  field?: string;
  brackets: Bracket<T>[];
}

/**
 * An extension of Extract for type predicates which falls back to the base
 * in order to narrow the `unknown` case.
 *
 * @example
 *   function isMyType<T>(data: T | MyType): data is NarrowedTo<T, MyType> { ... }
 */
type NarrowedTo<T, Base> =
  Extract<T, Base> extends never
  ? Base
  : IsAny<T> extends true
  ? Base
  : Extract<T, Base>;

/**
  Returns a boolean for whether the given type is `any`.

  @link https://stackoverflow.com/a/49928360/1490091

  Useful in type utilities, such as disallowing `any`s to be passed to a function.

  @example
  ```
  import type {IsAny} from 'type-fest';

  const typedObject = {a: 1, b: 2} as const;
  const anyObject: any = {a: 1, b: 2};

  function get<O extends (IsAny<O> extends true ? {} : Record<string, number>), K extends keyof O = keyof O>(obj: O, key: K) {
    return obj[key];
  }

  const typedA = get(typedObject, 'a');
  //=> 1

  const anyA = get(anyObject, 'a');
  //=> any
  ```

  @category Type Guard
  @category Utilities
*/
export type IsAny<T> = 0 extends 1 & T ? true : false;

interface MergeObjectOptions {
  /**
   * Control whether to insert new top-level objects into the resulting structure which do not previously exist
   * in the original object.
   */
  insertKeys?: boolean;
  /**
   * Control whether to insert new nested values into child objects in the resulting structure which did not
   * previously exist in the original object. */
  insertValues?: boolean;
  /**
   * Control whether to replace existing values in the source, or only merge values which do not already exist
   * in the original object.
   */
  overwrite?: boolean;
  /**
   * Control whether to merge inner-objects recursively (if true), or whether to simply replace inner objects
   * with a provided new value.
   */
  recursive?: boolean;
  /**
   * Control whether to apply updates to the original object in-place (if true), otherwise the original object is
   * duplicated and the copy is merged.
   */
  inplace?: boolean;
  /**
   * Control whether strict type checking requires that the value of a key in the other object must match the
   * data type in the original data to be merged.
   */
  enforceTypes?: boolean;
  /**
   * Control whether to perform deletions on the original object if deletion keys are present in the other object.
   */
  performDeletions?: boolean;
}

export { Predicate, StatementValidator };
export type { PredicateStatement, RawPredicate };