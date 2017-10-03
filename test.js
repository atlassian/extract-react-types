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
    class Component extends React.Component<{ foo: (string, number) => string }> {
      // ...
    }
  `
}, {
  name: 'flow function named params',
  typeSystem: 'flow',
  code: `
    class Component extends React.Component<{ foo: (name: string, age: number) => void }> {
      // ...
    }
  `
}, {
  name: 'flow function return type',
  typeSystem: 'flow',
  code: `
    class Component extends React.Component<{ foo: (number) => void }> {
      // ...
    }
  `
}, {
  name: 'flow function type',
  typeSystem: 'flow',
  code: `
    class Component extends React.Component<{ foo: Function }> {
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
  name: 'flow type identifier',
  typeSystem: 'flow',
  code: `
    import * as React from 'react';

    type Props = {
      children: React.Node,
    };

    class Component extends React.Component<Props> {

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
  name: 'flow no React component',
  typeSystem: 'flow',
  code: `
    class FooComponent extends Bar<{ foo?: number }> {
    }
  `
}, {
  name: 'flow different React component',
  typeSystem: 'flow',
  code: `
    import {Component} from 'react';

    class FooComponent extends Component<{ foo?: number }> {
    }

    class BarComponent extends React.Component<{ foo?: number }> {
    }
  `
}, {
  name: 'flow import { type }',
  typeSystem: 'flow',
  code: `
    import React, { type Node } from 'react';

    type Props = {
      children: Node,
    };

    class Component extends React.Component<Props> {

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
      bar: number;
    }

    class Component extends React.Component<ComponentProps> {
      // ...
    }
  `
}, {
  name: 'ts function',
  typeSystem: 'typescript',
  code: `
    class Component extends React.Component<{foo: (string, boolean) => number}> {
      // ...
    }
  `
}, {
  name: 'ts array',
  typeSystem: 'typescript',
  code: `
    class Component extends React.Component<{foo: Array<number>}> {
      // ...
    }
  `
}, {
  name: 'ts union',
  typeSystem: 'typescript',
  code: `
    class Component extends React.Component<{foo: number | string}> {
      // ...
    }
  `
}, {
  name: 'ts any',
  typeSystem: 'typescript',
  code: `
    class Component extends React.Component<{foo: any}> {
      // ...
    }
  `
}, {
  name: 'ts literals',
  typeSystem: 'typescript',
  code: `
    class Component extends React.Component<{foo: '25' | 30}> {

    }
  `
}, {
  name: 'ts optional',
  typeSystem: 'typescript',
  code: `
    class Component extends React.Component<{foo?: string}> {

    }
  `
}, {
  name: 'ts void',
  typeSystem: 'typescript',
  code: `
    class Component extends React.Component<{foo: void}> {

    }
  `
}, {
  name: 'ts no react component',
  typeSystem: 'typescript',
  code: `
    class Component extends Foo<{foo: void}> {

    }
  `
}, {
  name: 'ts different React components',
  typeSystem: 'typescript',
  code: `
    import {Component} from 'react';

    class FooComponent extends Component<{foo: void}> {

    }

    class BarComponent extends React.Component<{foo: void}> {

    }
  `
}, {
  name: 'ts tuple',
  typeSystem: 'typescript',
  code: `
    class Component extends React.Component<{foo: [string, number]}> {

    }
  `
}, {
  name: 'ts enum',
  typeSystem: 'typescript',
  code: `
    enum Color {Red, Green, Blue};
    class Component extends React.Component<{foo: Color}> {

    }
  `
}];

for (let testCase of TESTS) {
  let testFn;

  if (testCase.only) {
    testFn = test.only;
  } else if (testCase.skip) {
    testFn = test.skip;
  } else {
    testFn = test;
  }

  testFn(testCase.name, () => {
    let code = stripIndent(testCase.code);
    let result = extractReactTypes(code, testCase.typeSystem);
    expect(result).toMatchSnapshot();
  });
}
