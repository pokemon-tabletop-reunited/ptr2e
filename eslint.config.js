import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    "plugins": { "html": {} }
  },
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { files: ["**/*.js"], languageOptions: { sourceType: "script" } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  {
    rules: {
      "no-prototype-builtins": "off",
    }
  },
  ...tseslint.configs.strict,
  {
    rules: {
      "@typescript-eslint/no-unsafe-declaration-merging": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-invalid-void-type": "off",
      "@typescript-eslint/no-dynamic-delete": "off",
    }
  },
  ...tseslint.configs.stylistic,
  {
    rules: {
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-extraneous-class": "off",
      "@typescript-eslint/ban-ts-comment": ["error", {
        "ts-expect-error": "allow-with-description",
        "ts-ignore": true,
        "ts-nocheck": false,
        "ts-check": false,
        minimumDescriptionLength: 10,
      }],
    }
  }
];