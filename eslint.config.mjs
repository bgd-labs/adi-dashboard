import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintReact from 'eslint-plugin-react';
import eslintReactHooks from 'eslint-plugin-react-hooks';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginNext from '@next/eslint-plugin-next';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default tseslint.config(
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react': eslintReact,
      'react-hooks': eslintReactHooks,
      prettier: prettierPlugin,
      'simple-import-sort': eslintPluginSimpleImportSort,
      'import': eslintPluginImport,
      '@next/next': eslintPluginNext
    },
  },
  {
    ignores: ['dist', 'node_modules', 'coverage', 'eslint.config.mjs', "icons"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
      },
      parserOptions: {
        project: ['tsconfig.json'],
      },
      parser: tseslint.parser,
      ecmaVersion: 'latest'
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      ...eslintConfigPrettier.rules,
      ...eslintPluginImport.configs.recommended.rules,
      ...eslintPluginNext.configs.recommended.rules,
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prettier/prettier': 'warn',
      'react-hooks/rules-of-hooks': 'off',
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/no-named-as-default': 'off',
      'import/no-unresolved': 'off',
      'import/no-named-as-default-member': 'off',
      'import/namespace': 'off',
      'react/self-closing-comp': 'warn',
      '@next/next/no-duplicate-head': 'off',
      'no-prototype-builtins': 'off',
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          "prefer": "type-imports",
          "fixStyle": "inline-type-imports"
        }
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_"
        }
      ],
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      // "@typescript-eslint/no-misused-promises": [
      //   "error",
      //   {
      //     "checksVoidReturn": {
      //       "attributes": false
      //     }
      //   }
      // ],
    },
  },
);