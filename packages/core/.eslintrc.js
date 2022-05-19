module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
  },
  env: {
    browser: false,
    es2021: true,
    mocha: true,
    node: true,
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'standard',
    'plugin:prettier/recommended',
    'plugin:node/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  rules: {
    'node/no-unsupported-features/es-syntax': [
      'error',
      { ignores: ['modules'] },
    ],
    'prettier/prettier': ['error', { singleQuote: true }],
    'import/no-unresolved': 'error',
    'node/no-missing-import': 'off',
  },
};
