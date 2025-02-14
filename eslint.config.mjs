import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import prettierPlugin from "eslint-plugin-prettier";
import tsRecommended from "@typescript-eslint/eslint-plugin/dist/configs/recommended.js";
import reactRecommended from "eslint-plugin-react/config/recommended.js";
import prettierConfig from "eslint-config-prettier";

export default [
  {
    // Apply these settings to all JS/TS files
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: [
      "**/public/**/*",
      ".local/**/*",
      "node_modules/**/*",
      "src/coverage/**/*",
    ],
    languageOptions: {
      parser: require.resolve("@typescript-eslint/parser"),
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
      react: reactPlugin,
      "@typescript-eslint": tsPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    // Merge recommended rules from various configs
    rules: {
      // Merge recommended rules from TypeScript and React
      ...tsRecommended.rules,
      ...reactRecommended.rules,
      // Prettier disables conflicting rules
      ...prettierConfig.rules,
      // Your custom rules
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
