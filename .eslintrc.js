
module.exports = {
  extends: ['airbnb'],
  plugins: ['import'],
  parser: '@babel/eslint-parser',
  env: {
    es6: true,
    browser: true,
  },
  overrides: [{
    // these are overrides for .ts files, meaning these are only applied to .ts files
    files: ['*.ts'],
    extends: ['airbnb-typescript'],
    plugins: ['@typescript-eslint'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: ['./tsconfig.json'],
      tsconfigRootDir: './',
    },
    // typescript rules must be added here to work
    rules: {
      '@typescript-eslint/no-unused-vars': 0,
      '@typescript-eslint/naming-convention': 0,
      '@typescript-eslint/default-param-last': 0,
      '@typescript-eslint/consistent-type-imports': 2,
    },
  }],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'no-restricted-syntax': 0,
    'no-continue': 0,
    'jsx-a11y/control-has-associated-label': 0,
    'arrow-parens': 0,
    'no-async-promise-executor': 0,
    'no-multiple-empty-lines': [2, { max: 2 }],
    camelcase: [2, { allow: ['^UNSAFE_'] }],
    'no-mixed-operators': [2, { allowSamePrecedence: true }],
    'no-plusplus': 0,
    'no-minusminus': 0,
    'prefer-destructuring': 0,
    'max-len': 0,
    'class-methods-use-this': 0,
    'jsx-a11y/href-no-hash': 'off',
    'jsx-a11y/no-autofocus': 0,
    'no-unused-vars': 0,
    'no-underscore-dangle': 0,
    'global-require': 0,
    'no-console': 0,
    'new-cap': 0,
    'eol-last': 0,
    'jsx-a11y/label-has-for': 0,
    'linebreak-style': 0,
    'consistent-return': 0,
    'import/prefer-default-export': 0,
    'no-unescaped-entities': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'no-shadow': 0,
    'prefer-promise-reject-errors': 0,
    'function-paren-newline': 0,
    'operator-linebreak': 0,
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'jsx-a11y/label-has-associated-control': 0,
    'no-nested-ternary': 0,
    'import/no-cycle': 0,
    'import/no-unresolved': 0,
    'function-call-argument-newline': 0,
    'import/extensions': [
      'error',
      'always',
      {
        pattern: {
          js: 'never',
          ts: 'never',
        },
      },
    ],
  },
  globals: {
    web3: true,
    ethereum: true,
    $: true,
    window: true,
    document: true,
    fetch: true,
    location: true,
    localStorage: true,
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
