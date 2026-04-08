import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  resolvePluginsRelativeTo: import.meta.dirname,
});

export default [

  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  // 1. Base ESLint recommended
  eslint.configs.recommended,

  // 2. TypeScript recommended
  ...tseslint.configs.recommended,

  // 3. Airbnb-base using FlatCompat
  ...compat.extends('airbnb-base'),

  {
    files: ['**/*.ts'],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },

    plugins: {
      import: importPlugin,
      '@typescript-eslint': tseslint.plugin,
    },

    rules: {
      // Fix import issues for TypeScript
      'import/no-unresolved': 'off',
      'import/extensions': 'off',

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // Backend friendly rules
      'no-console': 'off',
      'import/prefer-default-export': 'off',

      // ✅ Mongo support
      'no-underscore-dangle': 'off',

      // ✅ Disable unnecessary strict rules
      'class-methods-use-this': 'off',
      'no-return-await': 'off',
      'no-param-reassign': 'off',

      // ✅ Allow backend patterns
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',

      // ✅ Relax comparisons (optional)
      eqeqeq: ['error', 'always'], // keep strict OR change to 'off'

    },
  },
];
