
module.exports = {
  extends: ['@defisaver/eslint-config/base-config'],
  parser: '@babel/eslint-parser',
  env: {
    es6: true,
    browser: true,
  },
  overrides: [{
    // these are overrides for .ts files, meaning these are only applied to .ts files
    files: ['*.ts'],
    extends: ['@defisaver/eslint-config/base-config-typescript'],
    plugins: ['@typescript-eslint'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: ['./tsconfig.json'],
      tsconfigRootDir: './',
    },
    // typescript rules must be added here to work
    rules: {
      '@typescript-eslint/consistent-type-imports': 2,
      'max-len': 0,
    },
  }],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
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
