module.exports = {
  extends: [
    'prettier',
    'airbnb',
    'prettier/react',
    'plugin:jest/recommended',
    'plugin:prettier/recommended'
  ],
  parser: 'babel-eslint',
  plugins: ['prettier', 'react', 'import', 'jest'],
  env: {
    es6: true,
    browser: true,
    node: true,
    'jest/globals': true
  },
  globals: {
    // flow globals
    TimeoutID: true,
    IntervalID: true,
    AnimationFrameID: true
  },
  rules: {
    // Error on prettier violations
    'prettier/prettier': 'error',

    'prefer-const': 'off',

    // New eslint style rules that is not disabled by prettier:
    'lines-between-class-members': 'off',

    // Allowing warning and error console logging
    // use `invariant` and `warning`
    'no-console': ['error'],

    // Opting out of prefer destructuring (nicer with flow in lots of cases)
    'prefer-destructuring': 'off',

    // Disallowing the use of variables starting with `_` unless it called on `this`.
    // Allowed: `this._secret = Symbol()`
    // Not allowed: `const _secret = Symbol()`
    'no-underscore-dangle': ['error', { allowAfterThis: true }],

    // Cannot reassign function parameters but allowing modification
    'no-param-reassign': ['error', { props: false }],

    // Allowing ++ on numbers
    'no-plusplus': 'off',

    // Allowing Math.pow rather than forcing `**`
    'no-restricted-properties': [
      'off',
      {
        object: 'Math',
        property: 'pow'
      }
    ],

    // Allowing jsx in files with any file extension (old components have jsx but not the extension)
    'react/jsx-filename-extension': 'off',

    // Not requiring default prop declarations all the time
    'react/require-default-props': 'off',

    // Opt out of preferring stateless functions
    'react/prefer-stateless-function': 'off',

    // Allowing files to have multiple components in it
    'react/no-multi-comp': 'off',

    // Sometimes we use the PropTypes.object PropType for simplicity
    'react/forbid-prop-types': 'off',

    // Allowing the non function setState approach
    'react/no-access-state-in-setstate': 'off',

    // Opting out of this
    'react/destructuring-assignment': 'off',

    // Adding 'skipShapeProps' as the rule has issues with correctly handling PropTypes.shape
    'react/no-unused-prop-types': ['error', { skipShapeProps: true }],

    // Having issues with this rule not working correctly
    'react/default-props-match-prop-types': 'off',

    // Allowing importing from dev deps (for stories and tests)
    'import/no-extraneous-dependencies': 'off',
    'spaced-comment': 'off',
    'consistent-return': 'off',
    'no-else-return': 'off',
    'react/jsx-curly-brace-presence': 'off',
    'import/no-useless-path-segments': 'off',
    'react/sort-comp': 'off',
    'no-use-before-define': 'off',
    'no-restricted-syntax': 'off'
  }
};
