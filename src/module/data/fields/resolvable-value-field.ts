import { BracketedValue, RuleValue } from "@module/effects/data.ts";
import { isObject } from "@utils";
import * as R from "remeda";
import { FormInputConfig } from "types/foundry/common/data/fields.js";

class ResolvableValueField<
    TRequired extends boolean,
    TNullable extends boolean,
    THasInitial extends boolean = false,
> extends foundry.data.fields.DataField<RuleValue, RuleValue, TRequired, TNullable, THasInitial> {
    protected override _validateType(value: unknown): boolean {
        return value !== null && ["string", "number", "object", "boolean"].includes(typeof value);
    }

    /** No casting is applied to this value */
    protected _cast(value: unknown): unknown {
        return value;
    }

    /** Coerce a string value that looks like a number into a number. */
    #coerceNumber(value: string): number | string {
        const trimmed = value.trim();
        return /^-?\d+(?:\.\d+)?$/.test(trimmed) ? Number(trimmed) : trimmed || 0;
    }

    protected override _cleanType(value: RuleValue): RuleValue {
        if (typeof value === "string") {
            return this.#coerceNumber(value);
        }

        if (isObject<BracketedValue>(value) && "brackets" in value) {
            value.field ||= "actor|level";
            const brackets = (value.brackets = R.filter(Object.values(value.brackets ?? {}), R.isTruthy));
            for (const bracket of brackets) {
                if (bracket.start === null) delete bracket.start;
                if (bracket.end === null) delete bracket.end;
                bracket.value = typeof bracket.value === "string" ? this.#coerceNumber(bracket.value) : bracket.value;
            }
        }

        return value;
    }

    override _toInput(config: FormInputConfig): HTMLElement | HTMLCollection {
      return foundry.data.fields.StringField.prototype._toInput.bind(this)(config);
    }
}

export default ResolvableValueField;