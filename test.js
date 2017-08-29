// @flow
'use strict';

const extractReactTypes = require('./');
const stripIndent = require('strip-indent');

const TESTS = [{
  name: 'boolean',
  typeSystem: 'flow',
  code: `
    class Component extends React.Component<{ foo: boolean }> {
      // ...
    }
  `
}, {
  name: 'string',
  typeSystem: 'flow',
  code: `
    class Component extends React.Component<{ foo: string }> {
      // ...
    }
  `
}];

for (let testCase of TESTS) {
  test(testCase.name, () => {
    let code = stripIndent(testCase.code);
    let result = extractReactTypes(code, testCase.typeSystem);
    expect(result).toMatchSnapshot();
  });
}
