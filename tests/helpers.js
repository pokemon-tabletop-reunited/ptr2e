import fs from "fs";
import path from "path";

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

export function sluggify(text, { camel } = { camel: null }) {
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

export function getFilesRecursively(directory, filePaths = [], folderPaths = []) {
  const filesInDirectory = fs.readdirSync(directory);
  for (const file of filesInDirectory) {
    const absolute = path.join(directory, file);
    if (fs.lstatSync(absolute).isDirectory()) {
      getFilesRecursively(absolute, filePaths);
    } else {
      if(file === "_folders.json") {
        folderPaths.push(absolute);
        continue;
      }
      if (!file.endsWith(".json")) continue;
      filePaths.push(absolute);
    }
  }
  return {filePaths, folderPaths};
};