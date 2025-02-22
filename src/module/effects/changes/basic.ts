import { ActorPTR2e } from "@actor";
import { isObject } from "@utils";
import { ChangeModel } from "@data";
import { CHANGE_MODES } from "./change.ts";

export default class BasicChangeSystem extends ChangeModel {
  static override TYPE = "basic";

  override apply(actor: ActorPTR2e, rollOptions?: string[] | Set<string> | null): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const change = this;

    if (change.ignored) return;

    const path = change.resolveInjectedProperties(change.key);
    if (change.ignored) return;
    if (!this.#pathIsValid(path)) {
      return change.failValidation(`The path "${path}" is not valid for the actor ${actor.id}.`)
    }

    rollOptions ??= change.predicate.length > 0 ? new Set(rollOptions ?? actor.getRollOptions()) : null;
    if (!change.test(rollOptions)) return;

    // Determine the data type of the target field
    const current = fu.getProperty(actor, path) ?? null;
    const resolvables = {
      actor: actor,
      item: change.item,
      effect: change.effect,
      change: change,
    }
    const changeValue = change.resolveValue(change.value, 0, { resolvables });
    const newValue = BasicChangeSystem.getNewValue(change.mode, current, changeValue, change.merge);
    if (newValue instanceof foundry.data.validation.DataModelValidationFailure) {
      return change.failValidation(newValue.asError().message);
    }

    // Handle arrays
    if (change.mode === CHANGE_MODES.ADD && (Array.isArray(current) || current instanceof Set)) {
      if (Array.isArray(current)) {
        if (!current.includes(newValue)) {
          current.push(newValue);
        }
      }
      else {
        current.add(newValue);
      }
    } else if(change.mode === CHANGE_MODES.REMOVE && (Array.isArray(current) || current instanceof Set)) {
      if (Array.isArray(current)) {
        if (current.includes(newValue)) {
          current.splice(current.indexOf(newValue), 1);
        }
      }
      else {
        current.delete(newValue);
      }
    } else {
      try {
        fu.setProperty(actor, path, newValue);
        // TODO: Implement data change logging here
      } catch (error) {
        if (error instanceof Error) {
          return change.failValidation(error.message);
        }
        console.warn(error);
      }
    }
  }

  #pathIsValid(path: string): boolean {
    if (!this.effect.targetsActor()) return false;
    const actor = this.effect.target;
    return (
      path.length > 0 &&
      !/\bnull\b/.test(path) &&
      (path.startsWith("flags.") ||
        [path, path.replace(/\.[-\w]+$/, ""), path.replace(/\.?[-\w]+\.[-\w]+$/, "")].some(
          (path) => fu.getProperty(actor, path) !== undefined,
        ))
    );
  }

  /**
   * Cast a raw EffectChangeData change string to the desired data type.
   * @param {string} raw      The raw string value
   * @param {string} type     The target data type that the raw value should be cast to match
   * @returns {*}             The parsed delta cast to the target data type
   * @private
   */
  _castDelta(raw: string, type: string) {
    let delta;
    switch (type) {
      case "boolean":
        delta = Boolean(this._parseOrString(raw));
        break;
      case "number":
        delta = Number.fromString(raw);
        if (Number.isNaN(delta)) delta = 0;
        break;
      case "string":
        delta = String(raw);
        break;
      default:
        delta = this._parseOrString(raw);
    }
    return delta;
  }

  /**
   * Cast a raw EffectChangeData change string to an Array of an inner type.
   * @param {string} raw      The raw string value
   * @param {string} type     The target data type of inner array elements
   * @returns {Array<*>}      The parsed delta cast as a typed array
   * @private
   */
  _castArray(raw: string, type: string) {
    let delta;
    try {
      delta = this._parseOrString(raw);
      delta = delta instanceof Array ? delta : [delta];
    } catch (e) {
      delta = [raw];
    }
    return delta.map(d => this._castDelta(d, type));
  }

  /**
   * Parse serialized JSON, or retain the raw string.
   * @param {string} raw      A raw serialized string
   * @returns {*}             The parsed value, or the original value if parsing failed
   * @private
   */
  _parseOrString(raw: string) {
    try {
      return JSON.parse(raw);
    } catch (err) {
      return raw;
    }
  }

  /**
   * Apply an ActiveEffect change to a target Actor.
   */
  static getNewValue(mode: ActiveEffectChangeMode | 6, current: number, change: number, merge?: boolean): number;
  static getNewValue<TCurrent>(mode: ActiveEffectChangeMode | 6, current: TCurrent, change: TCurrent extends (infer TValue)[] ? TValue : TCurrent, merge?: boolean): (TCurrent extends (infer TValue)[] ? TValue : TCurrent) | foundry.data.validation.DataModelValidationFailure;
  static getNewValue(mode: ActiveEffectChangeMode | 6, current: unknown, change: unknown, merge?: boolean): unknown {
    const modes = CHANGE_MODES;
    switch (mode) {
      case modes.ADD:
        return this._applyAdd(change, current);
      case modes.MULTIPLY:
        return this._applyMultiply(change, current);
      case modes.OVERRIDE:
        return this._applyOverride(change, current, merge);
      case modes.UPGRADE:
        return this._applyUpgrade(change, current, true);
      case modes.DOWNGRADE:
        return this._applyUpgrade(change, current, false);
      case modes.REMOVE:
        return this._applyReduce(change, current);
      default:
        return null;
    }
  }

  /**
   * Apply an ActiveEffect that uses an ADD application mode.
   * The way that effects are added depends on the data type of the current value.
   */
  static _applyAdd(change: unknown, current: unknown): number | unknown | foundry.data.validation.DataModelValidationFailure {
    const isNumericAdd =
      typeof change === "number" && (typeof current === "number" || typeof current === "undefined" || current === null);
    const isArrayAdd = (Array.isArray(current) || current instanceof Set) && (current as unknown[]).every(e => typeof e === typeof change)

    if (isNumericAdd) {
      return (current as number ?? 0) + change;
    } else if (isArrayAdd) {
      return change;
    }

    return new foundry.data.validation.DataModelValidationFailure({ message: `Unable to Add \`${change}\` to \`${current}\`. This is likely due to an invalid Key.`, invalidValue: change, fallback: false });
  }

  /* -------------------------------------------- */

  /**
   * Apply an ActiveEffect that uses a MULTIPLY application mode.
   * Changes which MULTIPLY must be numeric to allow for multiplication.
   */
  static _applyMultiply(change: unknown, current: unknown): number | foundry.data.validation.DataModelValidationFailure {
    if (typeof change !== 'number') {
      return new foundry.data.validation.DataModelValidationFailure({ message: `Invalid value \`${change}\` for mode Multiply, value must be a number.`, invalidValue: change, fallback: false });
    }
    if (!(typeof current === 'number' || current === undefined)) {
      return new foundry.data.validation.DataModelValidationFailure({ message: `Unable to apply mode Multiply on \`${current}\`. This is likely due to an invalid Key.`, invalidValue: current, fallback: false });
    }
    return change > 1 ? Math.ceil((current ?? 0) * change) : Math.floor((current ?? 0) * change);
  }

  /* -------------------------------------------- */

  /**
   * Apply an ActiveEffect that uses an OVERRIDE application mode.
   */
  static _applyOverride(change: unknown, current: unknown, merge?: boolean): unknown | foundry.data.validation.DataModelValidationFailure {
    if (merge && isObject(current) && isObject(change)) {
      return fu.mergeObject(current, change);
    }
    return change;
  }

  /* -------------------------------------------- */

  /**
   * Apply an ActiveEffect that uses an UPGRADE, or DOWNGRADE application mode.
   * Changes which UPGRADE or DOWNGRADE must be numeric to allow for comparison.
   * @param {Actor} actor                   The Actor to whom this effect should be applied
   * @param {EffectChangeData} change       The change data being applied
   * @param {*} current                     The current value being modified
   * @param {*} delta                       The parsed value of the change object
   * @param {object} changes                An object which accumulates changes to be applied
   * @private
   */
  static _applyUpgrade(change: unknown, current: unknown, upgrade = true) {
    if (typeof change !== "number") {
      return new foundry.data.validation.DataModelValidationFailure({ message: `Invalid value \`${change}\` for mode ${upgrade ? "Upgrade" : "Downgrade"}, value must be a number.`, invalidValue: change, fallback: false });
    }
    if (!(typeof current === "number" || current === undefined || current === null)) {
      return new foundry.data.validation.DataModelValidationFailure({ message: `Unable to apply mode ${upgrade ? "Upgrade" : "Downgrade"} on \`${current}\`. This is likely due to an invalid Key.`, invalidValue: current, fallback: false });
    }

    return upgrade ? Math.max(current ?? 0, change) : Math.min(current ?? 0, change);
  }

  /* -------------------------------------------- */

  /**
   * Apply an ActiveEffect that uses a REDUCE application mode.
   */
  static _applyReduce(change: unknown, current: unknown): number | unknown | foundry.data.validation.DataModelValidationFailure {
    const isNumericReduce =
      typeof change === "number" && (typeof current === "number" || typeof current === "undefined" || current === null);
    const isArrayReduce = (Array.isArray(current) || current instanceof Set) && (current as unknown[]).every(e => typeof e === typeof change)

    if (isNumericReduce) {
      return (current as number ?? 0) - change;
    } else if (isArrayReduce) {
      return change;
    }

    return new foundry.data.validation.DataModelValidationFailure({ message: `Unable to Reduce \`${change}\` to \`${current}\`. This is likely due to an invalid Key.`, invalidValue: change, fallback: false });
  }
}