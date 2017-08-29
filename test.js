// @flow
'use strict';

const extractReactTypes = require('./');
const stripIndent = require('strip-indent');

const TESTS = [{
  name: 'one',
  typeSystem: 'flow',
  code: `
    class Component extends React.Component<{ foo: boolean }> {
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
