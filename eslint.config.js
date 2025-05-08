import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';

const compat = new FlatCompat({ eslintRecommended: true });

export default [
  // apply ESLint's built-in recommended rules
  ...compat.extends('eslint:recommended'),
  // pull in all overrides/plugins from your existing .eslintrc.js
  ...compat.config({ baseDirectory: fileURLToPath(import.meta.url) }).overrides,
]; 