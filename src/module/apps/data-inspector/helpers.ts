/* eslint-disable @typescript-eslint/no-explicit-any */

import { DATA_TYPES } from "./data.ts";

/**
 * Better type name getter.
 */
export const getTypeName = (value: any): string => {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  const type = typeof value;
  if (['string', 'number', 'function', 'boolean'].includes(type)) return type;
  if (Array.isArray(value)) return 'array';
  // Gets class name more reliably than just value.contructor.name
  const n = value.__proto__.constructor.name;
  if (n === 'Object') return 'object';
  if (n === 'Map') return 'map';
  return '_' + n; // underscore to ensure they don't conflict with the other names under any circumstances
};

export const getModelType = (model: unknown) => {
  const fields = foundry.data.fields;
  if (model instanceof fields.BooleanField)
    return DATA_TYPES.boolean;
  else if (model instanceof fields.StringField)
    return DATA_TYPES.string;
  else if (model instanceof fields.NumberField)
    return DATA_TYPES.number;
  else if (model instanceof fields.ArrayField)
    return DATA_TYPES.array;
  else if (model instanceof fields.ObjectField)
    return DATA_TYPES.object;
  else if (model instanceof fields.SchemaField)
    return DATA_TYPES.model;
  else if (model instanceof fields.EmbeddedDataField)
    return DATA_TYPES.model;

  return DATA_TYPES.custom;
};

/**
 * @param {any} parent - Parent object
 * @param {string} childKey - Child key
 * @returns {DATA_TYPES} - Data type
 */
export function getChildTypeId(parent: any, childKey: string) {
  const data = Object.getOwnPropertyDescriptor(parent, childKey);
  if (data?.get) return DATA_TYPES.getter;
  return getTypeId(parent[childKey]);
}

/**
 * @param {any} value - Data
 * @returns {DATA_TYPES} - Data type
 */
export function getTypeId(value: any) {
  if (value === undefined) return DATA_TYPES.undefined;
  if (value === null) return DATA_TYPES.null;
  const type = typeof value;
  switch (type) {
    case 'string':
      return DATA_TYPES.string;
    case 'number':
    case 'bigint':
      return DATA_TYPES.number;
    case 'function':
      return DATA_TYPES.function;
    case 'boolean':
      return DATA_TYPES.boolean;
  }
  if (Array.isArray(value)) return DATA_TYPES.array;
  if (value instanceof Set) return DATA_TYPES.set;
  if (value instanceof foundry.abstract.Document) return DATA_TYPES.document;
  // Prevent placeables, pixi elements and applications
  if (value instanceof PlaceableObject) return DATA_TYPES.placeable;
  if (value instanceof PIXI.Container) return DATA_TYPES.pixi;
  if (value instanceof Application) return DATA_TYPES.app;
  if (value instanceof foundry.abstract.DataModel) return DATA_TYPES.model;
  // Gets class name more reliably than just value.contructor.name
  if (value instanceof Collection) return DATA_TYPES.collection;
  if (value instanceof Map) return DATA_TYPES.map;
  const n = value.__proto__?.constructor.name;
  if (n === 'Object') return DATA_TYPES.object;
  return DATA_TYPES.custom;
}