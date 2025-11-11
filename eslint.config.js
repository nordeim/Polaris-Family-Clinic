/**
 * ESLint Configuration for Gabriel Family Clinic MVP
 * Prioritizes simplicity, readability, accessibility, and maintainability.
 */

const { FlatCompat } = require('@eslint/eslintrc');
const path = require('path');

const compat = new FlatCompat({
  baseDirectory: __dirname
});

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  // Base configs: Next.js, TS, Prettier, a11y
  ...compat.extends(
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier'
  ),

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: {
          project: path.resolve(__dirname, 'tsconfig.json')
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      }
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/ban-ts-comment': [
        'warn',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': false,
          'ts-nocheck': false,
          'ts-check': false
        }
      ],

      // React
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Imports
      'import/prefer-default-export': 'off',
      'import/extensions': [
        'error',
        'ignorePackages',
        { js: 'never', jsx: 'never', ts: 'never', tsx: 'never' }
      ],
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type'
          ],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal'
            }
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true }
        }
      ],

      // General
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-use-before-define': 'off',
      'no-nested-ternary': 'warn',

      // Accessibility (crucial for seniors)
      'jsx-a11y/anchor-is-valid': [
        'warn',
        {
          components: ['Link'],
          aspects: ['invalidHref', 'preferButton']
        }
      ]
    }
  },

  // Tests: relax some rules
  {
    files: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off'
    }
  },

  // Configs and scripts: allow console and require
  {
    files: ['*.config.{js,ts}', 'scripts/**/*.{js,ts}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off'
    }
  },

  // Ignores
  {
    ignores: [
      '.next',
      'out',
      'public',
      'node_modules',
      'dist',
      'coverage',
      '.turbo',
      'playwright-report',
      'test-results'
    ]
  }
];
