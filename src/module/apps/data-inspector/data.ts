class StubModel {
  static defineSchema() { return {}; }
  defineSchema = {};
  schema = {};
  modelProvider = {};
  _source = {};
}

const ignoreDataModelParts = Object.freeze(Object.getOwnPropertyNames(new StubModel()));

/**
 * Recognized data types
 *
 * @readonly
 * @enum {number}
 */
const DATA_TYPES = {
  undefined: -1,
  null: 0,
  object: 110,
  number: 410,
  boolean: 420,
  string: 430,
  array: 120,
  set: 130,
  map: 510,
  collection: 520,
  function: 910,
  getter: 980,
  model: 1010,
  // data: 2010,
  document: 2020,
  placeable: 5010,
  pixi: 5020,
  app: 5030,
  custom: 10000,
};

/**
 * @readonly
 * @enum {string}
 */
const DATA_TYPE_INVERTED = foundry.utils.invertObject(DATA_TYPES);

interface ValueLike { value?: unknown, max?: unknown, total?: unknown };

type ModeTypes = "derived" | "rolldata" | "source" | "override" | "flags" | "roll"

export { ignoreDataModelParts, DATA_TYPES, DATA_TYPE_INVERTED, type ValueLike, type ModeTypes as TreeTypes };