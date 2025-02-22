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

export { getFilesRecursively, PackError, isObject, sluggify, tupleHasValue, StatementValidator};
export type {PredicateStatement}
