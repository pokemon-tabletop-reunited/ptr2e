import { PTRCONSTS, PokemonCategory, PokemonType } from "@data";
import { capitalize, formatSlug } from "./misc.ts";
import { getTypes } from "@scripts/config/effectiveness.ts";

export function registerHandlebarsHelpers() {
    _registerBasicHelpers();
    _registerPTRHelpers();
}

function _registerPTRHelpers() {
    Handlebars.registerHelper("keywords", function (keywords) {
        return keywords.map((k: string) => `<span class="keyword" >&lt;${k}&gt;</span>`).join("");
    });

    Handlebars.registerHelper("calcHeight", function (percent) {
        return Math.round(((100 - percent) / 100) * 48);
    });

    Handlebars.registerHelper(
        "getIcon",
        function (img: PokemonType | PokemonCategory, args: { hash: Record<string, string> }) {
            if (
                !Object.values(PTRCONSTS.Categories).includes(img as PokemonCategory) &&
                !getTypes().includes(img as PokemonType)
            )
                return "<small>Incorrect img data provided</small>";

            const hash = args.hash;
            const direction: string = hash?.direction ?? "LEFT";
            const tooltip: string = hash?.tooltip ?? formatSlug(img);
            const classes: string = hash?.classes ?? "";

            return `<img src="/systems/ptr2e/img/icons/${img}_icon.png" alt="${img}" data-tooltip="${tooltip}" data-tooltip-direction="${direction}" class="icon ${classes}" />`;
        }
    );

    Handlebars.registerHelper("formatFormula", function (formula) {
        // Find all numbers in the string
        const numbers = formula.match(/(\d+\.\d+|\d+)/g);

        // If no numbers were found, return the original formula
        if (!numbers) return formula;

        // Round each number to two decimal places
        const roundedNumbers = numbers.map((num: string) => {
            const parsedNum = parseFloat(num);
            return Number.isInteger(parsedNum) ? parsedNum.toString() : parsedNum.toFixed(2);
        });

        // Replace each number in the formula with its rounded version
        let roundedFormula = formula;
        for (let i = 0; i < numbers.length; i++) {
            roundedFormula = roundedFormula.replace(numbers[i], roundedNumbers[i]);
        }

        // Replace mathematical symbols with their HTML entities
        return roundedFormula.replaceAll("*", "&times;").replaceAll("/", "&divide;");
    });

    Handlebars.registerHelper("asContentLink", function (content: string) {
        const uuid = fu.parseUuid(content);
        if (!uuid.id) {
            // Return as raw string
            // But escape the content in case of Keyword strings
            const ele = document.createElement("div");
            ele.innerText = content;
            return ele.innerHTML;
        }

        const doc = fromUuidSync(content);
        if (!doc) {
            return TextEditor.createAnchor({
                classes: ["content-link", "broken"],
                icon: "fas fa-unlink",
                dataset: {},
                attrs: {}
            }).outerHTML
        }

        const ele = document.createElement("div");
        ele.innerText = doc.name!;
        const name = ele.innerHTML;

        const {type, tooltip, icon} = ((): {tooltip: string, icon: string, type: string} => {
            if(doc instanceof foundry.abstract.Document) {
                const documentConfig = CONFIG[doc.documentName as keyof typeof CONFIG];
                const documentName = game.i18n.localize(`DOCUMENT.${doc.documentName}`);

                if('type' in doc && typeof doc.type === 'string' && typeof documentConfig === 'object' && 'typeLabels' in documentConfig && 'sidebarIcon' in documentConfig) {
                    const typeLabel = documentConfig.typeLabels[doc.type];
                    const typeName = game.i18n.has(typeLabel) ? game.i18n.localize(typeLabel) : "";
                    const tooltip = typeName ? game.i18n.format("DOCUMENT.TypePageFormat", {type: typeName, page: documentName}) : documentName;
                    const icon = documentConfig.typeIcons?.[doc.type] ?? documentConfig.sidebarIcon;
                    return {tooltip, icon, type: doc.documentName};
                }
                // @ts-expect-error
                return {tooltip: documentName, icon: documentConfig.sidebarIcon, type: doc.documentName};
            }
            
            const documentName = game.packs.get(doc.pack)?.documentName!;
            return {
                tooltip: name,
                type: documentName,
                //@ts-expect-error
                icon: CONFIG[documentName].sidebarIcon
            }
        })();

        const data = {
            classes: ["content-link"],
            attrs: {draggable: true as unknown as string},
            name,
            dataset: {
                link: "",
                uuid: content,
                type,
                tooltip,
                id: uuid.id,
                pack: doc.pack,
            },
            icon
        }

        return TextEditor.createAnchor(data).outerHTML;
    });
}

function _registerBasicHelpers() {
    Handlebars.registerHelper("abs", value => Math.abs(Number(value)));

    Handlebars.registerHelper("getProperty", (obj, key) => fu.getProperty(obj, key));

    Handlebars.registerHelper("concat", function () {
        var outStr = "";
        for (var arg in arguments) {
            if (typeof arguments[arg] != "object") {
                outStr += arguments[arg];
            }
        }
        return outStr;
    });

    Handlebars.registerHelper("switch", function (value, options) {
        // @ts-ignore
        this.switch_value = value;
        // @ts-ignore
        return options.fn(this);
    });

    Handlebars.registerHelper("case", function (value, options) {
        // @ts-ignore
        if (value == this.switch_value) {
            // @ts-ignore
            return options.fn(this);
        }
    });

    Handlebars.registerHelper("toLowerCase", function (str) {
        return str.toLowerCase ? str.toLowerCase() : str;
    });

    Handlebars.registerHelper("capitalizeFirst", (e) => {
        return "string" != typeof e ? e : e.charAt(0).toUpperCase() + e.slice(1);
    });

    Handlebars.registerHelper("capitalize", capitalize);

    Handlebars.registerHelper("formatLocalize", (key, value) => ({
        hash: {
            [key]: value,
        },
    }));

    Handlebars.registerHelper("formatSlug", formatSlug);

    Handlebars.registerHelper("isdefined", function (value) {
        return value !== undefined;
    });

    Handlebars.registerHelper("is", function (a, b) {
        return a == b;
    });
    Handlebars.registerHelper("bigger", function (a, b) {
        return a > b;
    });
    Handlebars.registerHelper("biggerOrEqual", function (a, b) {
        return a >= b;
    });
    Handlebars.registerHelper("and", function (a, b) {
        return a && b;
    });
    Handlebars.registerHelper("or", function (a, b) {
        return a || b;
    });
    Handlebars.registerHelper("not", function (a, b = false) {
        return a != b;
    });
    Handlebars.registerHelper("divide", (value1, value2) => Number(value1) / Number(value2));
    Handlebars.registerHelper("multiply", (value1, value2) => Number(value1) * Number(value2));
    Handlebars.registerHelper("add", (value1, value2) => Number(value1) + Number(value2));
    Handlebars.registerHelper("floor", (value) => Math.floor(Number(value)));

    Handlebars.registerHelper("minMaxDiceCheck", function (roll, faces) {
        return roll == 1 ? "min" : roll == faces ? "max" : "";
    });

    Handlebars.registerHelper("isGm", function () {
        return game.user.isGM;
    });

    Handlebars.registerHelper("contains", function (needle, haystack) {
        needle = Handlebars.escapeExpression(needle);
        haystack = Handlebars.escapeExpression(haystack);
        return haystack.indexOf(needle) > -1 ? true : false;
    });

    Handlebars.registerHelper("ifContains", function (needle, haystack, options) {
        needle = Handlebars.escapeExpression(needle);
        haystack = Handlebars.escapeExpression(haystack); // @ts-ignore
        return haystack.indexOf(needle) > -1 ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper("inc", function (num) {
        return Number(num) + 1;
    });

    Handlebars.registerHelper("newline", function (a) {
        return a.replace("\\n", "\n");
    });

    Handlebars.registerHelper("lpad", function (str, len, char) {
        str = str.toString();
        while (str.length < len) str = char + str;
        return str;
    });

    Handlebars.registerHelper("padDecimal", function (value, decimals) {
        const stringValue = String(value);
        const decimalIndex = stringValue.indexOf(".");
        if (decimalIndex === -1) {
            // No decimal point found, add the specified number of decimal places
            return `${stringValue}.${"0".repeat(decimals)}`;
        } else {
            // Decimal point found, pad the decimal places up to the specified number
            const numDecimals = stringValue.length - decimalIndex - 1;
            if (numDecimals < decimals) {
                return `${stringValue}${"0".repeat(decimals - numDecimals)}`;
            } else {
                return stringValue;
            }
        }
    });

    Handlebars.registerHelper("diceResult", function (roll, term) {
        const result = roll.terms.find((t: { faces: any }) => t.faces == term);
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
    });

    Handlebars.registerHelper("json", function (context, args: {hash: {spaces: string | number}}) {
        return JSON.stringify(context, null, Number(args?.hash?.spaces ?? 2));
    });

    const buildInEachHelper = Handlebars.helpers.each;
    Handlebars.registerHelper("each", function (context, options) {
        let fn = options.fn,
            inverse = options.inverse,
            i = 0,
            ret = "",
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

        if (fu.getType(context) === "Map") {
            if (options.data) {
                data = Handlebars.Utils.createFrame(options.data);
            }

            const map = context as Map<string, unknown>;
            const j = map.size;
            for (const [key, value] of map) {
                execIteration(key, value, i++, i === j);
            }
        } else {
            return buildInEachHelper(context, options);
        }

        if (i === 0) {
            // @ts-ignore
            ret = inverse(this);
        }

        return ret;
    });
}
