/* eslint-disable @typescript-eslint/no-explicit-any */
import { FunctionDeclaration } from "typescript";
import { DATA_TYPE_INVERTED, DATA_TYPES, ignoreDataModelParts, TreeTypes, ValueLike } from "./data.ts";
import { getChildTypeId, getTypeId } from "./helpers.ts";
import MiniSearch, { MatchInfo } from "minisearch";

class ChildKeyData {
  key: string;
  type?: number;
  constructor(key: string, type?: number) {
    this.key = key;
    this.type = type;
  }
}

const dataKeySorter = (a: ChildKeyData, b: ChildKeyData) => a.key.localeCompare(b.key);

class DataStructure {
  key: string;
  path: string;
  typeId: ValueOf<typeof DATA_TYPES>;
  root: DataStructure
  value: unknown;
  document?: foundry.abstract.Document;
  parent: DataStructure | null;
  children: DataStructure[] = [];
  depth = 0;
  treetype?: TreeTypes;
  includeFunctions = false;
  recursionPoint?: string;
  private _isExpanded = false;
  public hidden = false;
  public isGetter = false;

  protected _sourceData: object | undefined;
  protected _derivedData: object | undefined;
  protected _rollData: object | undefined;
  protected _overides: object | undefined;
  protected _temporaryData: object | undefined;

  get expanded() {
    return this.expandable && this._isExpanded;
  }

  set expanded(value: boolean) {
    if (!this.expandable) return;
    this._isExpanded = value;
  }

  get expandable() {
    return this.children.length > 0;
  }

  get type(): keyof typeof DATA_TYPES {
    return DATA_TYPE_INVERTED[this.typeId as keyof typeof DATA_TYPE_INVERTED];
  }

  isBigString(): this is { value: string } {
    return this.isString() && this.value?.length > 24;
  }

  isNull(): this is { value: null } {
    return this.typeId === DATA_TYPES.null;
  }

  isFunction(): this is { value: FunctionDeclaration } {
    return this.typeId === DATA_TYPES.function;
  }

  // isGetter(): this is { value: GetAccessorDeclaration } {
  //   return this.typeId === DATA_TYPES.getter;
  // }

  isUndefined(): this is { value: undefined } {
    return this.typeId === DATA_TYPES.undefined;
  }

  isNullish(): this is { value: null | undefined } {
    if ([DATA_TYPES.null, DATA_TYPES.undefined].includes(this.typeId)) return true;
    if (this.isArray() && this.value.length === 0) return true;
    if (this.isSet() && this.value.size === 0) return true;
    if ((this.isMap() || this.isCollection()) && this.value.size === 0) return true;
    return false;
  }

  get identifier(): string | null {
    if ([DATA_TYPES.custom, DATA_TYPES.model].includes(this.typeId)) return (this.value as any).constructor.name;
    return null;
  }

  isModel(): this is { value: foundry.abstract.DataModel } {
    return this.typeId === DATA_TYPES.model;
  }

  isArray(): this is { value: unknown[] } {
    return this.typeId === DATA_TYPES.array;
  }

  isSet(): this is { value: Set<unknown> } {
    return this.typeId === DATA_TYPES.set;
  }

  isArrayLike(): this is { value: unknown[] | Set<unknown> } {
    return this.isArray() || this.isSet();
  }

  isMap(): this is { value: Map<unknown, unknown> } {
    return this.typeId === DATA_TYPES.map;
  }

  isCollection(): this is { value: Collection<unknown> } {
    return this.typeId === DATA_TYPES.collection;
  }

  isObject(): this is { value: object } {
    return this.typeId === DATA_TYPES.object;
  }

  get isUndesirable() {
    return this.isDocument() || [DATA_TYPES.placeable, DATA_TYPES.pixi, DATA_TYPES.app].includes(this.typeId);
  }

  isDocument(): this is { value: foundry.abstract.Document } {
    return this.typeId === DATA_TYPES.document;
  }

  get documentId(): string | undefined {
    if (this.isDocument()) return this.value.id;
    return undefined;
  }

  hasValues(): this is { value: ValueLike } {
    if (this.isContainer() && !this.isArrayLike()) {
      return ('total' in this.value || 'value' in this.value || 'max' in this.value);
    }
    return false;
  }

  get values() {
    if (!this.hasValues()) return null;

    const data = {
      value: this.value.value,
      haveValue: false,
      max: this.value.max,
      haveMax: false,
      isValue: false,
      total: this.value.total,
      haveTotal: false,
      noValues: false,
    };

    if (data.value === null || (typeof data.value === 'number')) {
      data.value = `${data.value}`;
      data.haveValue = true;
    }
    if (data.max === null || (typeof data.max === 'number')) {
      data.max = `${data.max}`;
      data.haveMax = true;
    }
    if (data.total === null || (typeof data.total === 'number')) {
      data.total = `${data.total}`;
      data.haveTotal = true;
    }
    if (data.haveValue || data.haveMax) {
      data.isValue = true;
      return {
        ...data,
        isValueOf: data.haveValue && data.haveMax,
      }
    }

    if (!data.isValue && !data.haveTotal) data.noValues = true;

    return data;
  }

  get className(): string {
    return (this.value as any).__proto__?.constructor.name;
  }

  get isEmpty(): boolean {
    if (this.isNullish()) return true;
    if (this.isArray()) return this.value.length === 0;
    if (this.isObject()) return foundry.utils.isEmpty(this.value);
    if ((this.isMap() || this.isCollection())) return this.value.size === 0;
    if (this.typeId === DATA_TYPES.custom) return this.children.length === 0;
    return false;
  }

  get isPrimitive() {
    return this.isBoolean() || this.isNumber() || this.isString() || this.isNull() || this.isUndefined();
  }

  isBoolean(): this is { value: boolean } {
    return this.typeId === DATA_TYPES.boolean;
  }

  isString(): this is { value: string } {
    return this.typeId === DATA_TYPES.string;
  }

  isNumber(): this is { value: number } {
    return this.typeId === DATA_TYPES.number;
  }

  get inArray() {
    return this.parent?.isArrayLike() ?? false;
  }

  isContainer(): this is { value: Record<string, unknown> } {
    if (this.recursionPoint) return false;
    return [DATA_TYPES.array, DATA_TYPES.set, DATA_TYPES.object, DATA_TYPES.model, DATA_TYPES.map, DATA_TYPES.collection, DATA_TYPES.custom].includes(this.typeId);
  }

  get isChildLess() {
    return [DATA_TYPES.boolean, DATA_TYPES.string, DATA_TYPES.null, DATA_TYPES.undefined, DATA_TYPES.number].includes(this.typeId);
  }

  isCustom(): this is { value: object } {
    return this.typeId === DATA_TYPES.custom;
  }

  get formattedValue() {
    switch (this.typeId) {
      case DATA_TYPES.undefined: return 'undefined';
      case DATA_TYPES.null: return 'null';
      case DATA_TYPES.function: return 'function';
    }
    if(this.isString()) {
      const fragment = document.createElement("fragment");
      fragment.innerHTML = this.value as string;
      return fragment.textContent?.trim() || this.value + "";
    }
    return this.value + "";
  }

  private _inRollData: boolean;
  get inRollData() {
    return this._inRollData ??= (() => {
      if (this.root.treetype === "rolldata") return true;
      if (!this.root._rollData) return false;
      try {
        return fu.hasProperty(this.root._rollData, this.path);
      }
      catch {
        return false;
      }
    })();
  }

  private _inSourceData: boolean;
  get inSourceData() {
    return this._inSourceData ??= (() => {
      if (this.root.treetype === "source") return true;
      if (!this.root._sourceData) return false;
      try {
        return fu.hasProperty(this.root._sourceData, this.path);
      }
      catch {
        return false;
      }
    })();
  }

  private _inDerivedData: boolean;
  get inDerivedData() {
    return this._inDerivedData ??= (() => {
      if (this.root.treetype === "derived") return true;
      if (!this.root._derivedData) return false;
      try {
        return fu.hasProperty(this.root._derivedData, this.path);
      }
      catch {
        return false;
      }
    })();
  }

  private _inTemporary: boolean;
  get inTemporary() {
    return this._inTemporary ??= (() => {
      if (!this.root._temporaryData) return false;
      try {
        return fu.hasProperty(this.root._temporaryData, this.path);
      }
      catch {
        return false;
      }
    })();
  }

  get hasOverrides() {
    return !!this._overides;
  }

  get css() {
    if (this.isBoolean())
      return this.value ? 'true' : 'false';
    if (this.isNumber())
      return this.value === 0 ? 'zero' : this.value < 0 ? 'negative' : 'positive';
    return '';
  }

  constructor({ key, path, value, parent, type, treeType, depth }: { key: string, path: string, value: unknown, parent: DataStructure | null, type?: number | undefined, treeType?: TreeTypes, depth: number }) {
    this.key = key;
    this.path = path;
    if(type === 980) {
      this.isGetter = true;
      type = 0;
    }
    this.typeId = type || getTypeId(value);
    this.value = value;
    this.parent = parent;
    this.root = parent?.root ?? parent ?? this;
    this.depth = depth;
    this.treetype = treeType;

    this.includeFunctions = parent?.includeFunctions ?? false;
  }

  private _childKeys: ChildKeyData[][];
  childKeys(): ChildKeyData[][] {
    if (this._childKeys) return this._childKeys;
    if (this.isUndesirable) return [];
    if (this.isSet()) return this._childKeys = [Array.from(this.value).map(k => new ChildKeyData(k as string))];
    if (this.isArray()) return this._childKeys = [this.value.map(k => new ChildKeyData(k as string))];
    if (this.isMap() || this.isCollection()) return this._childKeys = [Array.from(this.value.keys()).map(k => new ChildKeyData(k as string))];
    if (this.isObject() || this.isModel() || this.isCustom()) {
      const allKeys = [], rvg = [], rvf = [];
      const props = Object.getOwnPropertyNames(this.value).filter(k => {
        if (this.isModel()) return !ignoreDataModelParts.includes(k);
        return true;
      })
      allKeys.push(...props.map(k => new ChildKeyData(k)));

      if (this.includeFunctions) {
        let proto: any = this.value;
        if ([DATA_TYPES.custom, DATA_TYPES.object, DATA_TYPES.model].includes(this.typeId)) {
          const ignored = ['constructor', 'toString', 'almostEqual', '__proto__', 'prototype', 'between', 'toObject', 'toJSON', 'clone'];
          const ignoreModelBits = [...ignoreDataModelParts, 'schema', 'validationFailures', 'invalid', 'validate', 'update', 'updateSource', 'reset'];
          do {
            const keys = Object.getOwnPropertyNames(proto);
            for (const key of keys) {
              if (key.startsWith('_')) continue;
              if (ignored.includes(key)) continue;

              if (this.isModel() && ignoreModelBits.includes(key)) continue;

              const cType = getChildTypeId(proto, key);
              if (cType === DATA_TYPES.getter)
                rvg.push(new ChildKeyData(key, DATA_TYPES.getter));
              else if (cType === DATA_TYPES.function)
                rvf.push(new ChildKeyData(key, DATA_TYPES.function));
            }

            proto = Object.getPrototypeOf(proto);
            if (proto?.__proto__ == null) break;
          } while (proto);
        }
      }
      return this._childKeys = [allKeys.sort(dataKeySorter), rvg.sort(dataKeySorter), rvf.sort(dataKeySorter)];
    }
    return this._childKeys = [];
  }

  fillChildren(): DataStructure[] {
    if (this.recursionPoint) return [];

    const curPath = this.path,
      basePath = curPath?.length ? curPath : this.key,
      isArrayLike = this.isArrayLike(),
      isMap = this.isMap() || this.isCollection(),
      isSet = this.isSet();

    const saferValue = isSet ? Array.from(this.value) : this.value;

    const parseChildren = (list?: ChildKeyData[]): void => {
      list?.forEach((ckData, i) => {
        const { key, type } = ckData;
        const childKey = !isArrayLike ? key : i + "";
        const path = basePath ? `${basePath}.${childKey}` : childKey;

        //@ts-expect-error - Index here is correct
        const value = isMap ? this.value.get(childKey) : saferValue[childKey],
          typeId = getTypeId(value);

        if (typeId === DATA_TYPES.function && !this.includeFunctions) return;

        this.children.push(new DataStructure({ key: childKey as string, path, value, parent: this, type, depth: this.depth + 1 }));
      });
    }

    const [all, functions, getters] = this.childKeys();

    parseChildren(all);
    parseChildren(functions);
    parseChildren(getters);

    return this.children;
  }

  static recurse(sourceData: any, key: string, path: string, type: TreeTypes, { includeFunctions = false, document }: { includeFunctions?: boolean, document?: foundry.abstract.Document } = {}): { root: DataStructure, all: Record<string, DataStructure>, count: number, depth: number } {
    const dt = new DataStructure({ key, path: key, value: sourceData, parent: null, treeType: type, depth: 0 });
    dt.includeFunctions = includeFunctions;
    dt.document = document;

    const all = {} as Record<string, DataStructure>;
    if (dt.path) all[dt.path] = dt;
    let itemCount = 0, error = false, maxDepth = 0;
    const visitedNodes = new Map();

    const handleChild = (ds: DataStructure) => {
      all[ds.path] = ds;

      if (maxDepth < ds.depth) maxDepth = ds.depth;
      itemCount++;
      if (itemCount > 25000) {
        if (!error) {
          ui.notifications.error('DATA INSPECTOR | Possible cyclic reference encountered; ending inspection early', { console: false });
          console.error(ds.path, '\nDATA INSPECTOR | Possible cyclic reference encountered; ending inspection early\n', ds);
          error = true;
        }
        return;
      }

      if (!ds.isPrimitive) {
        const old = visitedNodes.get(ds.value);
        if (old) {
          ds.recursionPoint = old;
          return;
        }
        else visitedNodes.set(ds.value, ds.path);
      }

      try {
        recurseChildren(ds);
      }
      catch (err) {
        console.error(err, this);
        throw err;
      }
    }

    const recurseChildren = (ds: DataStructure) => {
      if (!ds.isChildLess) {
        ds.fillChildren().forEach(handleChild);
      }
    }

    recurseChildren(dt);

    if (key !== path) {
      const requestedRoot = dt.getAtPath(path);
      if (requestedRoot) {
        return DataStructure.recurse(requestedRoot.value, requestedRoot.key, requestedRoot.path, type, { includeFunctions, document });
      }
    }

    return { root: dt, all, count: itemCount, depth: maxDepth }
  }

  filterChildren(searchTerm: Maybe<string>, all: Record<string, DataStructure>, fuzzy: number) {
    if (!searchTerm || searchTerm.length <= 3) return;

    const miniSearch = new MiniSearch({
      fields: ["key", "path", "value"],
      storeFields: ["key", "path", "value"],
      idField: "path",
      searchOptions: {
        fuzzy,
        boost: {
          key: 2,
        }
      },
    });
    miniSearch.addAll(Object.values(all));

    const search = miniSearch.search(searchTerm);
    const results = search.reduce((acc, res) => {
      if (res.score < 5) return acc;
      acc.set(res.id, res.match);
      return acc;
    }, new Map<string, MatchInfo>());

    const unHideParents = (ds: DataStructure) => {
      if (ds.parent) {
        ds.parent.hidden = false;
        ds.parent.expanded = true;
        unHideParents(ds.parent);
      }
    }

    const unHideChildren = (ds: DataStructure) => {
      for (const child of ds.children) {
        if (seen.has(child.path)) continue;

        child.hidden = false;
        child.expanded = false;
        seen.add(child.path);
        unHideChildren(child);
      }
    }

    const seen = new Set<string>();

    for (const key in all) {
      if (seen.has(key)) continue;
      if (!results.has(key)) {
        all[key].hidden = true;
        continue;
      }
      all[key].hidden = false;
      seen.add(key);

      const result = results.get(key)!;
      const isValueBased = (() => {
        for (const key in result) {
          for (const value of result[key]) {
            if (value === "value") return true;
          }
        }
        return false;
      })();
      if (isValueBased) all[key].expanded = true;

      unHideParents(all[key]);
      unHideChildren(all[key]);
    }
  }

  resetFilters(all: Record<string, DataStructure>) {
    for (const key in all) {
      all[key].hidden = false;
      all[key].expanded = false;
    }
  }

  getAtPath(path?: string, initial = true, unSplitCount = 0): Maybe<DataStructure> {
    if (!path) return this;
    const parts = path.split('.');
    const key = (() => {
      let result = parts.shift();

      if(unSplitCount > 0) {
        for (let i = 0; i < unSplitCount; i++) {
          if(parts.length === 0) return result;
          result += `.${parts.shift()}`;
        }
      }

      return result;
    })();
    if (initial && this.root.key === key) return this.root.getAtPath(parts.join('.'), false);

    const getPart = () => {
      if (this.isArrayLike()) return this.children[parseInt(key!)];
      return this.children.find(c => c.key === key);
    }

    const c = getPart();
    if (parts.length === 0) {
      return c;
    }
    else if (c) return c.getAtPath(parts.join('.'), false);
    else {
      if(unSplitCount > 6) return c;
      return this.getAtPath(key + '.' + parts.join('.'), false, unSplitCount + 1);
    }
    return c;
  }

  get displayValue(): string {
    if (this.recursionPoint) return `<label class="value recursion" data-tooltip="${this.recursionPoint}">${game.i18n.localize("PTR2E.DataInspector.Link")}: <span class="path">${this.recursionPoint}</label>`;

    if (this.isContainer() || this.isDocument() || this.isUndesirable) {
      if (this.isEmpty) {
        const label = (() => {
          if (this.isArray()) return '[]';
          if (this.isUndefined()) return 'undefined';
          if (this.isNull()) return 'null';
          if (this.isCustom()) return `{${this.className}}`;
          return "{}";
        })();
        return `<label class="value container empty ${this.type} ${this.css} type-${this.className}">${label}</label>`;
      }

      const label = (() => {
        if (this.isArray()) return `[0...<span class="child-count">${this.children.length}</span>]`;
        if (this.isModel()) return `{${this.identifier}} [<span class="child-count">${this.children.length}</span>]`;
        if (this.className === 'Object') return `{...<span class="child-count">${this.children.length}</span>}`;
        return `{${this.className}${this.isDocument() ? `: ${this.documentId}` : ''}} ${this.children.length ? ` [<span class="child-count">${this.children.length}</span>]` : ''}`;
      })();
      const valueLabel = (() => {
        if (!this.hasValues() || !this.values || this.values.noValues) return "";
        return `${this.values.isValue
          ? `<label>[${game.i18n.localize("PTR2E.DataInspector.DataValue.Value")}: ${this.values.haveValue ? `<span class="value">${this.values.value}</span>` : ''}${'isValueOf' in this.values && this.values.isValueOf ? " / " : ''}${this.values.haveMax ? `<span class="max">${this.values.max}</span>` : ''}]</label>`
          : this.values.haveTotal ? `<label>[${game.i18n.localize("PTR2E.DataInspector.DataValue.Total")}: <span class="total">${this.values.total}</span>]</label>` : ''}`
      })();

      return `<label class="value container ${this.type} ${this.css} type-${this.className}${this.isModel() ? ` model-${this.identifier}` : ''}"${this.isDocument() ? ` data-tooltip="This is a reference to a document, double click to inspect this document."` : ''}>${label} ${valueLabel}</label>`;
    }

    // const extra = this.isBigString() ? `<div class="extended-value"><label class="value-details">(${game.i18n.format("PTR2E.DataInspector.DataValue.Length", {length: this.value.length})})</label>` : '';

    // return extra + `<label class="value basic ${this.type} ${this.isNullish() ? 'empty' : this.isBigString() ? 'big' : ''} ${this.css}">${this.formattedValue}</label>` + (extra.length ? '</div>' : '');

    return `<label class="value basic ${this.type} ${this.isNullish() ? 'empty' : this.isBigString() ? 'big' : ''} ${this.css}" data-tooltip="${this.formattedValue}">${this.formattedValue}</label>`;
  }

  get toCopy(): string {
    if(this.isPrimitive) return this.formattedValue;
    if(this.isSet()) return JSON.stringify(Array.from(this.value), null, 2)
    if(this.isMap() || this.isCollection()) return JSON.stringify(Array.from(this.value.entries()), null, 2);
    return JSON.stringify(this.value, null, 2);
  }
}

export { DataStructure }