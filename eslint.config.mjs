import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';
import zod from 'eslint-plugin-zod';
import drizzle from 'eslint-plugin-drizzle';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    plugins: {
      zod,
      drizzle,
      import: importPlugin,
    },
    rules: {
      // TypeScript específico
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { 
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_'
      }],
      
      // Organização de Imports
      'import/order': [
        'error',
        {
          'groups': [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
            'object',
            'type'
          ],
          'newlines-between': 'always',
          'alphabetize': {
            'order': 'asc',
            'caseInsensitive': true
          }
        }
      ],

      // Regras gerais
      'no-console': 'warn',
      'prettier/prettier': 'error',
      
      // Regras específicas para Zod
      'zod/require-strict': 'error',
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2023,
        sourceType: 'module',
      },
    },
    settings: {
      'import/resolver': {
        typescript: {}
      }
    }
  }
);