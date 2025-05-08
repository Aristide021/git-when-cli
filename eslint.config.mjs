import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import globals from 'globals';

const compat = new FlatCompat({
  // provide ESLint recommended (and all) legacy configs
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
  // resolve paths relative to this config file
  baseDirectory: fileURLToPath(import.meta.url)
});

// legacy ESLintRC config in modern format
const legacyConfig = {
  root: true,
  env: { node: true, es2023: true },
  extends: ["eslint:recommended"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  rules: {},
  overrides: [{ files: ["test/**/*.js"], env: { jest: true } }],
};

export default [
  // apply ESLint's built-in recommended rules
  ...compat.extends('eslint:recommended'),
  // pull in all rules from the legacy config
  ...compat.config(legacyConfig),
  // Jest globals override for test files
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
]; 