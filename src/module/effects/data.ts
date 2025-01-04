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

export type {
  RuleValue,
  Bracket,
  BracketedValue
}