
module.exports = {
  extends: ['@defisaver/eslint-config/base-config'],
  env: {
    es6: true,
    mocha: true,
  },
  ignorePatterns: ['*.test.ts', 'esm/', 'cjs/'],
  overrides: [{
    files: ['*.ts'],
    extends: ['@defisaver/eslint-config/base-config-typescript'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: ['./tsconfig.json'],
      tsconfigRootDir: './',
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 2,
    },
  }],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'max-len': 0,
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: ['./tsconfig.json'],
      },
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
};
