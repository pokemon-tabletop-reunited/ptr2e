import type { AnyObject } from "fvtt-types/utils";
import { Predicate, type PredicateStatement, type RawPredicate, StatementValidator } from "./predication.ts";

class PredicateStatementField<Options extends foundry.data.fields.DataField.Options.Any = foundry.data.fields.DataField.DefaultOptions> extends foundry.data.fields.DataField<
  Options,
  PredicateStatement,
  PredicateStatement
> {
  /** A `PredicateStatement` is always required (not `undefined`) and never nullable */
  constructor(options?: Options) {
    options ??= {} as Options;
    super({
      ...options,
      required: true,
      nullable: false,
      validationError: "must be a recognized predication statement",
    });
  }

  protected override _validateType(value: unknown): boolean {
    return StatementValidator.isStatement(value);
  }

  /** No casting is available for a predicate statement */
  protected _cast(value: PredicateStatement): PredicateStatement {
    return value;
  }

  protected override _cleanType(value: PredicateStatement): PredicateStatement {
    return typeof value === "string" ? value.trim() : value;
  }
}

class PredicateField<
  Options extends foundry.data.fields.DataField.Options.Any = {
    required: true,
    nullable: false
  },
  SubFieldOptions extends foundry.data.fields.DataField.Options.Any = foundry.data.fields.DataField.DefaultOptions
> extends foundry.data.fields.ArrayField<
  PredicateStatementField<SubFieldOptions>, 
  Options,
  PredicateStatement,
  PredicateStatement,
  RawPredicate,
  Predicate,
  PredicateStatement,
  RawPredicate
> {
  constructor(options?: Options) {
    if(!options) options = {} as Options;
    super(new PredicateStatementField(), { label: "PTR2E.Effect.FIELDS.ChangePredicate.label", ...options });
  }

  /** Construct a `Predicate` from the initialized `PredicateStatement[]` */
  override initialize(
    value: RawPredicate,
    model: foundry.abstract.DataModel.Any,
    options?: AnyObject
  ): Predicate {
    const statements = super.initialize(value, model, options)!;   

    return Array.isArray(statements) 
      ? new Predicate(...foundry.utils.deepClone(statements)) 
      : typeof statements === "function"
        ? statements()!
        : statements;
  }
}

export { PredicateField }