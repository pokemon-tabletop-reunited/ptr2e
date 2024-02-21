import { Predicate, PredicateStatement, RawPredicate, StatementValidator } from "./predication.ts";

class PredicateStatementField extends foundry.data.fields.DataField<PredicateStatement, PredicateStatement, true, false, false> {
    /** A `PredicateStatement` is always required (not `undefined`) and never nullable */
    constructor(options: foundry.data.fields.DataFieldOptions<PredicateStatement, true, false, false> = {}) {
        super({
            ...options,
            required: true,
            nullable: false,
            initial: undefined,
            validationError: "must be a recognized predication statement",
        });
    }

    protected override _validateType(value: unknown): boolean {
        return StatementValidator.isStatement(value);
    }

    /** No casting is available for a predicate statement */
    protected _cast(value: unknown): unknown {
        return value;
    }

    protected override _cleanType(value: PredicateStatement): PredicateStatement {
        return typeof value === "string" ? value.trim() : value;
    }
}

class PredicateField<
    TRequired extends boolean = true,
    TNullable extends boolean = false,
    THasInitial extends boolean = true,
> extends foundry.data.fields.ArrayField<PredicateStatementField, RawPredicate, Predicate, TRequired, TNullable, THasInitial> {
    constructor(options: foundry.data.fields.ArrayFieldOptions<RawPredicate, TRequired, TNullable, THasInitial> = {}) {
        super(new PredicateStatementField(), { label: "PTR2E.RuleEditor.General.Predicate", ...options });
    }

    /** Construct a `Predicate` from the initialized `PredicateStatement[]` */
    override initialize(
        value: RawPredicate,
        model: ConstructorOf<foundry.abstract.DataModel>,
        options?: foundry.data.fields.ArrayFieldOptions<RawPredicate, TRequired, TNullable, THasInitial>,
    ): foundry.data.fields.MaybeSchemaProp<Predicate, TRequired, TNullable, THasInitial>;
    override initialize(
        value: RawPredicate,
        model: ConstructorOf<foundry.abstract.DataModel>,
        options: foundry.data.fields.ArrayFieldOptions<RawPredicate, TRequired, TNullable, THasInitial>,
    ): Predicate | null | undefined {
        const statements = super.initialize(value, model, options);
        return Array.isArray(statements) ? new Predicate(...statements) : statements;
    }
}

export { PredicateField }