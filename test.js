// @flow
'use strict';

const extractReactTypes = require('./');
const stripIndent = require('strip-indent');

const TESTS = [{
  name: 'flow boolean',
  typeSystem: 'flow',
  code: `
    class Component extends React.Component<{ foo: boolean }> {
      // ...
    }
  `
}, {
  name: 'flow string',
  typeSystem: 'flow',
  code: `
    class Component extends React.Component<{ foo: string }> {
      // ...
    }
  `
}, {
  name: 'flow number',
  typeSystem: 'flow',
  code: `
    class Component extends React.Component<{ foo: number }> {
      // ...
    }
  `
}, {
  name: 'flow function',
  typeSystem: 'flow',
  code: `
    class Component extends React.Component<{ foo: (string) => void }> {
      // ...
    }
  `
}, {
  name: 'flow maybe',
  typeSystem: 'flow',
  code: `
    class Component extends React.Component<{ foo: ?string }> {
      // ...
    }
  `
}, {
  name: 'flow array',
  typeSystem: 'flow',
  code: `
    class Component extends React.Component<{ foo: Array<boolean> }> {
      // ...
    }
  `
}, {
  name: 'flow union',
  typeSystem: 'flow',
  code: `
    class Component extends React.Component<{ foo: boolean | number }> {
      // ...
    }
  `
}, {
  name: 'flow union literals',
  typeSystem: 'flow',
  code: `
    class Component extends React.Component<{ age: '25' | 30 }> {
      // ...
    }
  `
}, {
  name: 'flow mixed',
  typeSystem: 'flow',
  code: `
    class Component extends React.Component<{ age: mixed }> {
      // ...
    }
  `
}, {
  name: 'flow any',
  typeSystem: 'flow',
  code: `
    class Component extends React.Component<{ age: any }> {
      // ...
    }
  `
}, {
  name: 'flow generic class',
  typeSystem: 'flow',
  code: `
    class Component extends React.Component<A> {
      name: A;
    }
  `
}, {
  name: 'flow type',
  typeSystem: 'flow',
  code: `
    type ComponentProps = {
      foo: number,
      bar: boolean
    };
    class Component extends React.Component<ComponentProps> {
      
    }
  `
}, {
  name: 'flow type',
  typeSystem: 'flow',
  code: `
    class Component extends React.Component<{foo: number & string}> {
      
    }
  `
}, {
  name: 'flow array union',
  typeSystem: 'flow',
  code: `
    class Component extends React.Component<{ foo: Array<boolean | number> }> {
      // ...
    }
  `
}, {
  name: 'flow void',
  typeSystem: 'flow',
  code: `
    class Component extends React.Component<{ foo: void }> {
      // ...
    }
  `
}, {
  name: 'flow optional',
  typeSystem: 'flow',
  code: `
    class Component extends React.Component<{ foo?: number }> {
    }
  `
}, {
  name: 'ts boolean',
  typeSystem: 'typescript',
  code: `
    class Component extends React.Component<{ foo: boolean }> {
      
    }
  `
}, {
  name: 'ts string',
  typeSystem: 'typescript',
  code: `
    class Component extends React.Component<{ foo: string }> {
      
    }
  `
}, {
  name: 'ts object',
  typeSystem: 'typescript',
  code: `
    class Component extends React.Component<{foo: { name: string }, bar: number, verified: boolean}> {
      
    }
  `
}, {
  name: 'ts interface',
  typeSystem: 'typescript',
  code: `
    interface ComponentProps {
      foo: string;
    }

    class Component extends React.Component<{foo: { hector: string }, bar: number}> {
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