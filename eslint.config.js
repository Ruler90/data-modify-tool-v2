import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
    { ignores: ['dist/**', 'public/**', 'legacy/**'] },
    { files: ['**/*.{js,mjs,cjs,ts}'], ignores: ['dist/**', 'public/**', 'legacy/**'] },
    { languageOptions: { globals: globals.browser } },
    ...tseslint.configs.recommended,
    {
        rules: {
            indent: ['error', 4],
            quotes: ['error', 'single'],
            semi: ['error', 'always'],
            'no-console': 'warn',
            'no-var': 'error',
            'prefer-const': 'error',
            'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
        },
    },
];
