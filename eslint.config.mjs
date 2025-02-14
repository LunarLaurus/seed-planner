import globals from "globals";
import parser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: [
      "**/public/**/*",
      ".local/**/*",
      "node_modules/**/*",
      "src/coverage/**/*",
    ],
    languageOptions: {
      // Provide the parser directly via import
      parser,
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
        warnOnUnsupportedTypeScriptVersion: false,
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // Spread in recommended rules from @typescript-eslint
      ...tsPlugin.configs.recommended.rules,

      // Spread in recommended rules from eslint-plugin-react
      ...reactPlugin.configs.recommended.rules,

      // Pull in Prettier overrides
      ...prettierConfig.rules,

      // Custom rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],
      "no-import-assign": "error",
      "no-unreachable": "error",
    },
  },
];
