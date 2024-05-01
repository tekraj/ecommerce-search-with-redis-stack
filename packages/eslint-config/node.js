module.exports = {
  extends: [
    '@vercel/style-guide/eslint/node',
    '@vercel/style-guide/eslint/typescript',
  ].map(require.resolve),
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
  globals: {
    React: true,
    JSX: true,
  },
  ignorePatterns: [
    '**/.eslintrc.cjs',
    '**/*.config.js',
    '**/*.config.cjs',
    'dist',
    'pnpm-lock.yaml',
    'node_modules',
  ],
  rules: {
    'import/order': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
    ],
    'import/no-cycle': ['error', { ignoreExternal: true, maxDepth: 1 }],
    'no-console': 'off',
  },
};
