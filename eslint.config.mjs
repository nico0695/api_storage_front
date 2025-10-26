import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/no-require-imports': 'off',

      // React specific rules
      'react/jsx-curly-brace-presence': 'off',
      'react/self-closing-comp': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'jsx-a11y/alt-text': 'off',

      // General code quality rules
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: 'off',
      'no-else-return': 'off',
      'prefer-template': 'off',
      'object-shorthand': 'off',
      'no-lonely-if': 'off',
      'no-useless-return': 'off',

      // Import organization
      'import/order': 'off',
    },
  },
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'public/**',
      '.cache/**',
      'dist/**',
      'build/**',
    ],
  },
];

export default eslintConfig;
