import { capitalize, formatSlug } from "./misc.ts";

export function registerHandlebarsHelpers() {
    _registerBasicHelpers();
    _registerPTRHelpers();
}

function _registerPTRHelpers() {
    Handlebars.registerHelper("keywords", function (keywords) {
        return keywords.map((k: string) => `<span class="keyword" >&lt;${k}&gt;</span>`).join("");
    });

    Handlebars.registerHelper("calcHeight", function (percent) {
        return Math.round((100 - percent) / 100 * 48);
    });
}

function _registerBasicHelpers() {
    Handlebars.registerHelper("concat", function () {
        var outStr = '';
        for (var arg in arguments) {
            if (typeof arguments[arg] != 'object') {
                outStr += arguments[arg];
            }
        }
        return outStr;
    });

    Handlebars.registerHelper('switch', function (value, options) {
        // @ts-ignore
        this.switch_value = value;
        // @ts-ignore
        return options.fn(this);
    });

    Handlebars.registerHelper('case', function (value, options) {
        // @ts-ignore
        if (value == this.switch_value) {
            // @ts-ignore
            return options.fn(this);
        }
    });

    Handlebars.registerHelper("toLowerCase", function (str) {
        return str.toLowerCase ? str.toLowerCase() : str;
    });

    Handlebars.registerHelper("capitalizeFirst", (e) => { return "string" != typeof e ? e : e.charAt(0).toUpperCase() + e.slice(1) });

    Handlebars.registerHelper("capitalize", capitalize);

    Handlebars.registerHelper("formatLocalize", (key, value) => ({
        "hash": {
            [key]: value
        }
    }));

    Handlebars.registerHelper("formatSlug", formatSlug);

    Handlebars.registerHelper("isdefined", function (value) {
        return value !== undefined;
    });

    Handlebars.registerHelper("is", function (a, b) { return a == b });
    Handlebars.registerHelper("bigger", function (a, b) { return a > b });
    Handlebars.registerHelper("biggerOrEqual", function (a, b) { return a >= b });
    Handlebars.registerHelper("and", function (a, b) { return a && b });
    Handlebars.registerHelper("or", function (a, b) { return a || b });
    Handlebars.registerHelper("not", function (a, b = false) { return a != b });
    Handlebars.registerHelper("divide", (value1, value2) => Number(value1) / Number(value2));
    Handlebars.registerHelper("multiply", (value1, value2) => Number(value1) * Number(value2));
    Handlebars.registerHelper("floor", (value) => Math.floor(Number(value)));

    Handlebars.registerHelper("minMaxDiceCheck", function (roll, faces) {
        return roll == 1 ? "min" : roll == faces ? "max" : "";
    });

    Handlebars.registerHelper("isGm", function () {
        return game.user.isGM;
    })

    Handlebars.registerHelper('contains', function (needle, haystack) {
        needle = Handlebars.escapeExpression(needle);
        haystack = Handlebars.escapeExpression(haystack);
        return (haystack.indexOf(needle) > -1) ? true : false;
    });

    Handlebars.registerHelper('ifContains', function (needle, haystack, options) {
        needle = Handlebars.escapeExpression(needle);
        haystack = Handlebars.escapeExpression(haystack); // @ts-ignore
        return (haystack.indexOf(needle) > -1) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("inc", function (num) { return Number(num) + 1 })

    Handlebars.registerHelper("newline", function (a) { return a.replace("\\n", "\n") });

    Handlebars.registerHelper("lpad", function (str, len, char) {
        str = str.toString();
        while (str.length < len) str = char + str;
        return str;
    });

    Handlebars.registerHelper('padDecimal', function (value, decimals) {
        const stringValue = String(value);
        const decimalIndex = stringValue.indexOf('.');
        if (decimalIndex === -1) {
            // No decimal point found, add the specified number of decimal places
            return `${stringValue}.${'0'.repeat(decimals)}`;
        } else {
            // Decimal point found, pad the decimal places up to the specified number
            const numDecimals = stringValue.length - decimalIndex - 1;
            if (numDecimals < decimals) {
                return `${stringValue}${'0'.repeat(decimals - numDecimals)}`;
            } else {
                return stringValue;
            }
        }
    });

    Handlebars.registerHelper("diceResult", function (roll, term) {
        const result = roll.terms.find((t: { faces: any; }) => t.faces == term);
        if (result) return result.total ?? result.results[0].result;
    });

    Handlebars.registerHelper("split", function (str, separator) {
        return str.split(separator).map((s: string) => s.trim());
    });

    Handlebars.registerHelper("isNumber", function (value) {
        return isNaN(Number(value)) == false;
    });

    Handlebars.registerHelper("ld", function (key, value) {
        return { hash: { [key]: value } };
    })

    Handlebars.registerHelper("json", function (context) { return JSON.stringify(context); });
}