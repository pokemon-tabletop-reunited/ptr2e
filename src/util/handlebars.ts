import { POKEMON_CATEGORIES, PokemonCategories } from "@module/data/models/attack.ts";
import { capitalize, formatSlug } from "./misc.ts";
import { PokemonTypes, getTypes } from "@scripts/config/effectiveness.ts";

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

    Handlebars.registerHelper("icon", function(img: PokemonTypes | PokemonCategories) {
        if(!POKEMON_CATEGORIES.includes(img as PokemonCategories) && !getTypes().includes(img as PokemonTypes)) return "<small>Incorrect img data provided</small>";

        return `<img src="/systems/ptr2e/img/icons/${img}_icon.png" alt="${img}" data-tooltip="${formatSlug(img)}" data-tooltip-direction="LEFT" class="icon" />`;
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

    const buildInEachHelper = Handlebars.helpers.each; 
    Handlebars.registerHelper("each", function (context, options) {
        let fn = options.fn,
            inverse = options.inverse,
            i = 0,
            ret = '',
            data: { key: string; index: number; first: boolean; last: boolean } | undefined;

        if (fu.getType(context) === "function") {
            // @ts-ignore
            context = context.call(this);
        }

        function execIteration(field: string, value: unknown, index: number, last: boolean) {
            if (data) {
                data.key = field;
                data.index = index;
                data.first = index === 0;
                data.last = !!last;
            }

            ret =
                ret +
                fn(value, {
                    data: data,
                    blockParams: [context.get(field), field],
                });
        }

        if (fu.getType(context) === 'Map') {
            if (options.data) {
                data = Handlebars.Utils.createFrame(options.data);
            }

            const map = context as Map<string, unknown>;
            const j = map.size;
            for (const [key, value] of map) {
                execIteration(key, value, i++, i === j);
            }
        }
        else {
            return buildInEachHelper(context, options);
        }

        if (i === 0) {
            // @ts-ignore
            ret = inverse(this);
        }

        return ret;
    });

}