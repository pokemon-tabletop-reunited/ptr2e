import { BracketedValue } from "@module/effects/data.ts";
import * as R from "remeda";
import Sortable from "sortablejs";

const wordCharacter = String.raw`[\p{Alphabetic}\p{Mark}\p{Decimal_Number}\p{Join_Control}]`;
const nonWordCharacter = String.raw`[^\p{Alphabetic}\p{Mark}\p{Decimal_Number}\p{Join_Control}]`;
const nonWordCharacterRE = new RegExp(nonWordCharacter, "gu");

const wordBoundary = String.raw`(?:${wordCharacter})(?=${nonWordCharacter})|(?:${nonWordCharacter})(?=${wordCharacter})`;
const nonWordBoundary = String.raw`(?:${wordCharacter})(?=${wordCharacter})`;
const lowerCaseLetter = String.raw`\p{Lowercase_Letter}`;
const upperCaseLetter = String.raw`\p{Uppercase_Letter}`;
const lowerCaseThenUpperCaseRE = new RegExp(
  `(${lowerCaseLetter})(${upperCaseLetter}${nonWordBoundary})`,
  "gu"
);

const nonWordCharacterHyphenOrSpaceRE =
  /[^-\p{White_Space}\p{Alphabetic}\p{Mark}\p{Decimal_Number}\p{Join_Control}]/gu;
const upperOrWordBoundariedLowerRE = new RegExp(
  `${upperCaseLetter}|(?:${wordBoundary})${lowerCaseLetter}`,
  "gu"
);

/**
 * The system's sluggification algorithm for labels and other terms.
 * @param text The text to sluggify
 * @param [options.camel=null] The sluggification style to use
 */
function sluggify(text: string, { camel }: { camel: string | null } = { camel: null }): string {
  if (typeof text !== "string") {
    console.warn("Non-string argument passed to `sluggify`");
    return "";
  }

  // A hyphen by its lonesome would be wiped: return it as-is
  if (text === "-") return text;

  if (camel === null)
    return text
      .replace(lowerCaseThenUpperCaseRE, "$1-$2")
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(nonWordCharacterRE, " ")
      .trim()
      .replace(/[-\s]+/g, "-");

  if (camel === "bactrian") {
    const dromedary = sluggify(text, { camel: "dromedary" });
    return dromedary.charAt(0).toUpperCase() + dromedary.slice(1);
  }

  if (camel === "dromedary")
    return text
      .replace(nonWordCharacterHyphenOrSpaceRE, "")
      .replace(/[-_]+/g, " ")
      .replace(upperOrWordBoundariedLowerRE, (part, index) =>
        index === 0 ? part.toLowerCase() : part.toUpperCase()
      )
      .replace(/\s+/g, "");

  throw new Error(`I'm pretty sure that's not a real camel: ${camel}`);
}

type SlugCamel = "dromedary" | "bactrian" | null;

function formatSlug(slug: string): string;
function formatSlug(slug: Maybe<string>): Maybe<string>;
function formatSlug(slug: Maybe<string>) {
  return capitalize(slug)?.replaceAll("-", " ");
}

function capitalize(input: string): string;
function capitalize(input: Maybe<string>): Maybe<string>;
function capitalize(input: Maybe<string>) {
  if (!input) return input;
  let i, j, str;
  str = input.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });

  // Certain minor words should be left lowercase unless
  // they are the first or last words in the string
  const lowers = [
    "A",
    "An",
    "The",
    "And",
    "But",
    "Or",
    "For",
    "Nor",
    "As",
    "At",
    "By",
    "For",
    "From",
    "In",
    "Into",
    "Near",
    "Of",
    "On",
    "Onto",
    "To",
    "With",
  ];
  for (i = 0, j = lowers.length; i < j; i++)
    str = str.replace(new RegExp("\\s" + lowers[i] + "\\s", "g"), function (txt) {
      return txt.toLowerCase();
    });

  // Certain words such as initialisms or acronyms should be left uppercase
  const uppers = ["Id", "Tv"];
  for (i = 0, j = uppers.length; i < j; i++)
    str = str.replace(new RegExp("\\b" + uppers[i] + "\\b", "g"), uppers[i].toUpperCase());

  return str;
}

// async function findItemInCompendium({ type, name, compendium }) {
//     if (!type || !name) return undefined;
//     const pack = (() => {
//         if (game.packs.get(compendium)) return game.packs.get(compendium);
//         switch (type) {
//             case "move": return game.packs.get("ptu.moves");
//             case "ability": return game.packs.get("ptu.abilities");
//             case "capability": return game.packs.get("ptu.capabilities");
//             case "species": return game.packs.get("ptu.species");
//             case "item": return game.packs.get("ptu.items");
//             case "edge": return game.packs.get("ptu.edges");
//             case "feat": return game.packs.get("ptu.feats");
//             case "effect": return game.packs.get("ptu.effects");
//             default: throw new Error(`Unknown type: ${type}`);
//         }
//     })();

//     const find = (items) => {
//         return items?.find((item) => item.slug === sluggify(name) || item.name === name);
//     }

//     const indexed = find(pack.contents);
//     if (indexed) return indexed;
//     return find(await pack.getDocuments());

// }

// async function querySpeciesCompendium(filterQuery) {
//     const pack = game.packs.get("ptu.species");
//     const species = await pack.getDocuments();
//     return species.filter(filterQuery);
// }

function isBracketedValue(value: unknown): value is BracketedValue {
  return (
    R.isPlainObject(value) &&
    Array.isArray(value.brackets) &&
    (typeof value.field === "string" || !("fields" in value))
  );
}

/** Generate and return an HTML element for a FontAwesome icon */
type FontAwesomeStyle = "solid" | "regular" | "duotone";

function fontAwesomeIcon(
  glyph: string,
  { style = "solid", fixedWidth = false }: { style?: FontAwesomeStyle; fixedWidth?: boolean } = {}
): HTMLElement {
  const styleClass = `fa-${style}`;
  const glyphClass = glyph.startsWith("fa-") ? glyph : `fa-${glyph}`;
  const icon = document.createElement("i");
  icon.classList.add(styleClass, glyphClass);
  if (fixedWidth) icon.classList.add("fa-fw");

  return icon;
}

/** Check if an element is present in the provided set. Especially useful for checking against literal sets */
function setHasElement<T extends Set<unknown>>(set: T, value: unknown): value is SetElement<T> {
  return set.has(value);
}

/** Create a localization function with a prefixed localization object path */
function localizer(prefix: string): (...args: Parameters<Localization["format"]>) => string {
  return (...[suffix, formatArgs]: Parameters<Localization["format"]>) =>
    formatArgs ? game.i18n.format(`${prefix}.${suffix}`, formatArgs) : game.i18n.localize(`${prefix}.${suffix}`);
}

/** Short form of type and non-null check */
function isObject<T extends object>(value: unknown): value is DeepPartial<T>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isObject<T extends object>(value: unknown): value is Record<string, unknown>;
function isObject<T extends string>(value: unknown): value is { [K in T]?: unknown };
function isObject(value: unknown): boolean {
  return typeof value === "object" && value !== null;
}

function isItemUUID(uuid: unknown): uuid is ItemUUID {
  if (typeof uuid !== "string") return false;
  if (/^(?:Actor\.[a-zA-Z0-9]{16}\.)?Item\.[a-zA-Z0-9]{16}$/.test(uuid)) {
    return true;
  }

  const [type, scope, packId, id] = uuid.split(".");
  if (type !== "Compendium") return false;
  if (!(scope && packId && id)) throw Error(`Unable to parse UUID: ${uuid}`);

  const pack = game.packs.get(`${scope}.${packId}`);
  return pack?.documentName === "Item";
}

function isTokenUUID(uuid: unknown) {
  return (
    typeof uuid === "string" && /^Scene\.[A-Za-z0-9]{16}\.Token\.[A-Za-z0-9]{16}$/.test(uuid)
  );
}

function sortStringRecord(record: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(record)
      .map((entry) => {
        entry[1] = game.i18n.localize(entry[1]);
        return entry;
      })
      .sort((a, b) => a[1].localeCompare(b[1], game.i18n.lang))
  );
}

// /**
//  * @param uuid The UUID of the item to get and first search param
//  * @param name The name of the item to get and second search param, type required to succeed
//  * @param type The type of the item required for name search
//  * @param item Original item to derrive search params from
//  */
// async function getItemFromCompendium({ uuid, name, type, item }) {
//     let found = null;
//     if (uuid) {
//         found = await fromUuid(uuid);
//     }
//     if (!found && name && type) {
//         found = await findItemInCompendium({ name, type });
//     }
//     if (!found && item) {
//         found = await getItemFromCompendium({ uuid: item.flags?.core?.sourceId, name: item.name, type: item.type });
//     }
//     return found;
// }

/** Check if a value is present in the provided array. Especially useful for checking against literal tuples */
function tupleHasValue<const A extends readonly unknown[]>(
  array: A,
  value: unknown
): value is A[number] {
  return array.includes(value);
}

/** Create a "reduced" item name; that is, one without an "Effect:" or similar prefix */
function reduceItemName(label: string): string {
  return label.includes(":") ? label.replace(/^[^:]+:\s*|\s*\([^)]+\)$/g, "") : label;
}

let intlNumberFormat: Intl.NumberFormat;
/**
 * Return an integer string of a number, always with sign (+/-)
 * @param value The number to convert to a string
 * @param options.emptyStringZero If the value is zero, return an empty string
 * @param options.zeroIsNegative Treat zero as a negative value
 */
function signedInteger(
  value: number,
  { emptyStringZero = false, zeroIsNegative = false } = {}
): string {
  if (value === 0 && emptyStringZero) return "";
  const nf = (intlNumberFormat ??= new Intl.NumberFormat(game.i18n.lang, {
    maximumFractionDigits: 0,
    signDisplay: "always",
  }));
  const maybeNegativeZero = zeroIsNegative && value === 0 ? -0 : value;

  return nf.format(maybeNegativeZero);
}

const SORTABLE_BASE_OPTIONS: Sortable.Options = {
  animation: 200,
  direction: "vertical",
  dragClass: "drag-preview",
  dragoverBubble: true,
  easing: "cubic-bezier(1, 0, 0, 1)",
  fallbackOnBody: true,
  ghostClass: "drag-gap",
  // group: "inventory",
  // filter: "div.item-summary",
  // preventOnFilter: false,
  // swapThreshold: 0.25,

  // // These options are from the Autoscroll plugin and serve as a fallback on mobile/safari/ie/edge
  // // Other browsers use the native implementation
  // scroll: true,
  // scrollSensitivity: 30,
  // scrollSpeed: 15,

  // delay: 500,
  // delayOnTouchOnly: true,
};

/**
 * Converts a possible UUID string to an embedded UUID string if it is a valid UUID
 */
function maybeUuidStringToUuidEmbed(uuid: string) {
  const result = uuid ? fu.parseUuid(uuid) : null;
  if (result?.id) {
    return `@UUID[${uuid}]`;
  }
  return uuid;
}

/**
 * Check if a key is present in a given object in a type safe way
 *
 * @param obj The object to check
 * @param key The key to check
 */
function objectHasKey<O extends object>(obj: O, key: unknown): key is keyof O {
  return (typeof key === "string" || typeof key === "number") && key in obj;
}

/**
 * Wrap a callback in a debounced timeout.
 * Delay execution of the callback function until the function has not been called for delay milliseconds
 * @param {Function} callback       A function to execute once the debounced threshold has been passed
 * @param {number} delay            An amount of time in milliseconds to delay
 * @return {Function}               A wrapped function which can be called to debounce execution
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounceAsync<T = any>(callback: () => T, delay: number): (...args: any[]) => Promise<T> {
  let timeoutId: number | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (...args: any[]) {
    return new Promise((resolve) => {
      //@ts-expect-error - This is a valid check
      clearTimeout(timeoutId);
      //@ts-expect-error - This is a valid check
      timeoutId = setTimeout(() => {
        //@ts-expect-error - This is a valid check
        resolve(callback.apply(this, args));
      }, delay);
    });
  };
}

/**
   * Define a simple migration from one field name to another.
   * The value of the data can be transformed during the migration by an optional application function.
   * @param {object} data     The data object being migrated
   * @param {string} oldKey   The old field name
   * @param {string} newKey   The new field name
   * @param {function(data: object): any} [apply] An application function, otherwise the old value is applied
   * @returns {boolean}       Whether a migration was applied.
   * @internal
   */
function _addDataFieldMigration(data: Record<string, unknown>, oldKey: string, newKey: string, apply?: (data: Record<string, unknown>) => unknown): boolean {
  if (!fu.hasProperty(data, newKey) && fu.hasProperty(data, oldKey)) {
    const prop = Object.getOwnPropertyDescriptor(data, oldKey);
    if (prop && !prop.writable) return false;
    fu.setProperty(data, newKey, apply ? apply(data) : fu.getProperty(data, oldKey));
    delete data[oldKey];
    return true;
  }
  return false;
}

export {
  fontAwesomeIcon,
  formatSlug,
  isBracketedValue,
  isItemUUID,
  isObject,
  isTokenUUID,
  reduceItemName,
  signedInteger,
  sluggify,
  sortStringRecord,
  tupleHasValue,
  capitalize,
  SORTABLE_BASE_OPTIONS,
  maybeUuidStringToUuidEmbed,
  objectHasKey,
  debounceAsync,
  _addDataFieldMigration as addDataFieldMigration,
  localizer,
  setHasElement,
};
export type { FontAwesomeStyle, SlugCamel };
