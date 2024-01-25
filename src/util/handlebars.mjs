export function registerHandlebarsHelpers() {
    _registerBasicHelpers();
    _registerPTRHelpers();
}

function _registerPTRHelpers() {
    Handlebars.registerHelper("keywords", function (keywords) {
        return keywords.map(k => `<span class="keyword" >&lt;${k}&gt;</span>`).join("");
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
        this.switch_value = value;
        return options.fn(this);
    });

    Handlebars.registerHelper('case', function (value, options) {
        if (value == this.switch_value) {
            return options.fn(this);
        }
    });

    Handlebars.registerHelper("toLowerCase", function (str) {
        return str.toLowerCase ? str.toLowerCase() : str;
    });

    Handlebars.registerHelper("capitalizeFirst", (e) => { return "string" != typeof e ? e : e.charAt(0).toUpperCase() + e.slice(1) });

    const capitalize = function (input) {
        var i, j, str, lowers, uppers;
        str = input.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });

        // Certain minor words should be left lowercase unless 
        // they are the first or last words in the string
        lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At',
            'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
        for (i = 0, j = lowers.length; i < j; i++)
            str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'),
                function (txt) {
                    return txt.toLowerCase();
                });

        // Certain words such as initialisms or acronyms should be left uppercase
        uppers = ['Id', 'Tv'];
        for (i = 0, j = uppers.length; i < j; i++)
            str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'),
                uppers[i].toUpperCase());

        return str;
    }

    Handlebars.registerHelper("capitalize", capitalize);

    Handlebars.registerHelper("formatLocalize", (key, value) => ({
        "hash": {
            [key]: value
        }
    }));

    Handlebars.registerHelper("formatSlug", (slug) => {
        return capitalize(slug).replaceAll('-', ' ');
    });

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
        haystack = Handlebars.escapeExpression(haystack);
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
        const result = roll.terms.find(t => t.faces == term);
        if (result) return result.total ?? result.results[0].result;
    });

    Handlebars.registerHelper("split", function (str, separator) {
        return str.split(separator).map(s => s.trim());
    });

    Handlebars.registerHelper("isNumber", function (value) {
        return isNaN(Number(value)) == false;
    });

    Handlebars.registerHelper("ld", function (key, value) {
        return { hash: { [key]: value } };
    })

    Handlebars.registerHelper("json", function (context) { return JSON.stringify(context); });
}