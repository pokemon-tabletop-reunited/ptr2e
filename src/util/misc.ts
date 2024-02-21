import { BracketedValue } from "@module/effects/data.ts";
import * as R from "remeda";

const wordCharacter = String.raw`[\p{Alphabetic}\p{Mark}\p{Decimal_Number}\p{Join_Control}]`;
const nonWordCharacter = String.raw`[^\p{Alphabetic}\p{Mark}\p{Decimal_Number}\p{Join_Control}]`;
const nonWordCharacterRE = new RegExp(nonWordCharacter, "gu");

const wordBoundary = String.raw`(?:${wordCharacter})(?=${nonWordCharacter})|(?:${nonWordCharacter})(?=${wordCharacter})`;
const nonWordBoundary = String.raw`(?:${wordCharacter})(?=${wordCharacter})`;
const lowerCaseLetter = String.raw`\p{Lowercase_Letter}`;
const upperCaseLetter = String.raw`\p{Uppercase_Letter}`;
const lowerCaseThenUpperCaseRE = new RegExp(`(${lowerCaseLetter})(${upperCaseLetter}${nonWordBoundary})`, "gu");

const nonWordCharacterHyphenOrSpaceRE = /[^-\p{White_Space}\p{Alphabetic}\p{Mark}\p{Decimal_Number}\p{Join_Control}]/gu;
const upperOrWordBoundariedLowerRE = new RegExp(`${upperCaseLetter}|(?:${wordBoundary})${lowerCaseLetter}`, "gu");

/**
 * The system's sluggification algorithm for labels and other terms.
 * @param text The text to sluggify
 * @param [options.camel=null] The sluggification style to use
 */
export function sluggify(text: string, { camel }: { camel: string | null } = { camel: null }): string {
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

export function formatSlug(slug: string) {
    return capitalize(slug).replaceAll('-', ' ');
}

export function capitalize(input: string) {
    var i, j, str, lowers, uppers;
    str = input.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    // Certain minor words should be left lowercase unless 
    // they are the first or last words in the string
    lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At',
        'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
    for (i = 0, j = lowers.length; i < j; i++)
        str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'),
            function (txt) {
                return txt.toLowerCase();
            });

    // Certain words such as initialisms or acronyms should be left uppercase
    uppers = ['Id', 'Tv'];
    for (i = 0, j = uppers.length; i < j; i++)
        str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'),
            uppers[i].toUpperCase());

    return str;
}

// export async function findItemInCompendium({ type, name, compendium }) {
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

// export async function querySpeciesCompendium(filterQuery) {
//     const pack = game.packs.get("ptu.species");
//     const species = await pack.getDocuments();
//     return species.filter(filterQuery);
// }

export function isBracketedValue(value: unknown): value is BracketedValue {
    return (
        R.isObject(value) && Array.isArray(value.brackets) && (typeof value.field === "string" || !("fields" in value))
    );
}

/** Short form of type and non-null check */
function isObject<T extends object>(value: unknown): value is Record<string, unknown>;
function isObject<T extends object>(value: unknown): value is DeepPartial<T>;
function isObject<T extends string>(value: unknown): value is { [K in T]?: unknown };
function isObject(value: unknown): boolean {
    return typeof value === "object" && value !== null;
}
export { isObject };

export function isItemUUID(uuid: any) {
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

export function isTokenUUID(uuid: any) {
    return typeof uuid === "string" && /^Scene\.[A-Za-z0-9]{16}\.Token\.[A-Za-z0-9]{16}$/.test(uuid);
}

export function sortStringRecord(record: Record<string, string>) {
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
// export async function getItemFromCompendium({ uuid, name, type, item }) {
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
export function tupleHasValue<const A extends readonly unknown[]>(array: A, value: unknown): value is A[number] {
    return array.includes(value);
}