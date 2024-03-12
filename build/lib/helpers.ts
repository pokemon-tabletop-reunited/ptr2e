import fs from "fs";
import path from "path";

const PackError = (message: string): void => {
    console.error(`Error: ${message}`);
    process.exit(1);
};

const getFilesRecursively = (directory: string, filePaths: string[] = []): string[] => {
    const filesInDirectory = fs.readdirSync(directory);
    for (const file of filesInDirectory) {
        const absolute = path.join(directory, file);
        if (fs.lstatSync(absolute).isDirectory()) {
            getFilesRecursively(absolute, filePaths);
        } else {
            if (file === "_folders.json" || !file.endsWith(".json")) continue;
            filePaths.push(absolute);
        }
    }
    return filePaths;
};

function isObject<T extends object>(value: unknown): value is Record<string, unknown>;
function isObject<T extends object>(value: unknown): value is DeepPartial<T>;
function isObject<T extends string>(value: unknown): value is { [K in T]?: unknown };
function isObject(value: unknown): boolean {
    return typeof value === "object" && value !== null;
}

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

function tupleHasValue<const A extends readonly unknown[]>(array: A, value: unknown): value is A[number] {
    return array.includes(value);
}

export { getFilesRecursively, PackError, isObject, sluggify, tupleHasValue};
