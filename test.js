// @flow
'use strict';

const extractReactTypes = require('./');
const stripIndent = require('strip-indent');

const TESTS = [
  {
    name: 'flow boolean',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: boolean }> {
      // ...
    }
  `
  },
  {
    name: 'flow string',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: string }> {
      // ...
    }
  `
  },
  {
    name: 'flow number',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: number }> {
      // ...
    }
  `
  },
  {
    name: 'flow function',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: (string, number) => string }> {
      // ...
    }
  `
  },
  {
    name: 'flow function named params',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: (name: string, age: number) => void }> {
      // ...
    }
  `
  },
  {
    name: 'flow function unnamed params',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: (string, number) => void }> {
      // ...
    }
  `
  },
  {
    name: 'flow function unnamed params w/ object',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: ({ prop: string }) => void }> {
      // ...
    }
  `
  },
  {
    name: 'flow function return type',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: (number) => void }> {
      // ...
    }
  `
  },
  {
    name: 'flow function type',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: Function }> {
      // ...
    }
  `
  },
  {
    name: 'flow maybe',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: ?string }> {
      // ...
    }
  `
  },
  {
    name: 'flow array',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: Array<boolean> }> {
      // ...
    }
  `
  },
  {
    name: 'flow union',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: boolean | number }> {
      // ...
    }
  `
  },
  {
    name: 'flow union literals',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ age: '25' | 30 }> {
      // ...
    }
  `
  },
  {
    name: 'flow mixed',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ age: mixed }> {
      // ...
    }
  `
  },
  {
    name: 'flow any',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ age: any }> {
      // ...
    }
  `
  },
  {
    name: 'flow generic class',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<A> {
      name: A;
    }
  `
  },
  {
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
  },
  {
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
  },
  {
    name: 'flow exported type alias reference',
    typeSystem: 'flow',
    code: `
    export type Foo = boolean;
    class Component extends React.Component<{ foo: Foo }> {

    }
  `
  },
  {
    name: 'flow type',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{foo: number & string}> {

    }
  `
  },
  {
    name: 'intersection type',
    typeSystem: 'flow',
    code: `
  type BaseProps = { bar: string }

  class Component extends React.Component<BaseProps & {
    isDefaultChecked: boolean,
  }> {
  }
  `
  },
  {
    name: 'with spread in type annotation',
    typeSystem: 'flow',
    code: `
  type BaseProps = { foo: string }
  type Props = {
    ...BaseProps,
    isDefaultChecked: boolean,
  }
  class Component extends React.Component<Props> {
  }
  `
  },
  {
    name: 'flow array union',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: Array<boolean | number> }> {
      // ...
    }
  `
  },
  {
    name: 'flow void',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: void }> {
      // ...
    }
  `
  },
  {
    name: 'flow optional',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo?: number }> {
    }
  `
  },
  {
    name: 'flow no React component',
    typeSystem: 'flow',
    code: `
    class FooComponent extends Bar<{ foo?: number }> {
    }
  `
  },
  {
    name: 'flow different React component',
    typeSystem: 'flow',
    code: `
    import {Component} from 'react';

    class FooComponent extends Component<{ foo?: number }> {
    }

    class BarComponent extends React.Component<{ foo?: number }> {
    }
  `
  },
  {
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
  },
  {
    name: 'ts boolean',
    typeSystem: 'typescript',
    code: `
    class Component extends React.Component<{ foo: boolean }> {

    }
  `
  },
  {
    name: 'ts string',
    typeSystem: 'typescript',
    code: `
    class Component extends React.Component<{ foo: string }> {

    }
  `
  },
  {
    name: 'ts object',
    typeSystem: 'typescript',
    code: `
    class Component extends React.Component<{foo: { name: string }, bar: number, verified: boolean}> {

    }
  `
  },
  {
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
  },
  {
    name: 'ts function',
    typeSystem: 'typescript',
    code: `
    class Component extends React.Component<{foo: (string, boolean) => number}> {
      // ...
    }
  `
  },
  {
    name: 'ts array',
    typeSystem: 'typescript',
    code: `
    class Component extends React.Component<{foo: Array<number>}> {
      // ...
    }
  `
  },
  {
    name: 'ts union',
    typeSystem: 'typescript',
    code: `
    class Component extends React.Component<{foo: number | string}> {
      // ...
    }
  `
  },
  {
    name: 'ts any',
    typeSystem: 'typescript',
    code: `
    class Component extends React.Component<{foo: any}> {
      // ...
    }
  `
  },
  {
    name: 'ts literals',
    typeSystem: 'typescript',
    code: `
    class Component extends React.Component<{foo: '25' | 30}> {

    }
  `
  },
  {
    name: 'ts optional',
    typeSystem: 'typescript',
    code: `
    class Component extends React.Component<{foo?: string}> {

    }
  `
  },
  {
    name: 'ts void',
    typeSystem: 'typescript',
    code: `
    class Component extends React.Component<{foo: void}> {

    }
  `
  },
  {
    name: 'ts no react component',
    typeSystem: 'typescript',
    code: `
    class Component extends Foo<{foo: void}> {

    }
  `
  },
  {
    name: 'ts different React components',
    typeSystem: 'typescript',
    code: `
    import {Component} from 'react';

    class FooComponent extends Component<{foo: void}> {

    }

    class BarComponent extends React.Component<{foo: void}> {

    }
  `
  },
  {
    name: 'ts tuple',
    typeSystem: 'typescript',
    code: `
    class Component extends React.Component<{foo: [string, number]}> {

    }
  `
  },
  {
    name: 'ts enum',
    typeSystem: 'typescript',
    code: `
    enum Color {Red, Green, Blue};
    class Component extends React.Component<{foo: Color}> {

    }
  `
  },
  {
    name: 'test',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo?: Object }> {}
  `
  },
  {
    name: 'test get defaultProps',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ a: string }> {
      defaultProps = {
        a: 'a'
      }
    }
  `
  },
  {
    name: 'test defaultProp as JSXElement',
    typeSystem: 'flow',
    code: `
      import type { Node } from 'react';
      const Icon = <div></div>
      class Component extends React.Component<{a: Node }> {
        defaultProps = {
          a: <Icon name={"test icon"}/>
        }
      }
    `
  },
  {
    name: 'test defaultProp as JSXElement with member expression',
    typeSystem: 'flow',
    code: `
    import type { Node } from 'react';
    const Icon = <div></div>
    const componentObj = { Icon }
    class Component extends React.Component<{a: Node }> {
      defaultProps = {
        a: <componentObj.Icon name={"test icon"}/>
      }
    }
    `
  },
  {
    name: 'test defaultProp as JSXElement with multiple props',
    typeSystem: 'flow',
    code: `
      import type { Node } from 'react';
      const Icon = <div></div>
      class Component extends React.Component<{a: Node}>{
        defaultProps = {
          a: <Icon name="test icon" iconType="avatar" />
        }
      }
    `
  },
  {
    name: 'test defaultProp as JSXElement with JSXExpressionContainer',
    typeSystem: 'flow',
    code: `
        import type { Node } from 'react';
        const Icon = <div></div>
        class Component extends React.Component<{a: Node}>{
          defaultProps = {
            a: <Icon name={"test icon"} />
          }
        }
      `
  },
  {
    name: 'spread element ',
    typeSystem: 'flow',
    code: `

    const something = { a: true }
    class Component extends React.Component<{ a: boolean, b: boolean }> {
      defaultProps = {
        ...something,
        b: false
      }
    }
  `
  },
  {
    name: 'spread element cannot find',
    typeSystem: 'flow',
    code: `
    import something from 'somewhere'

    class Component extends React.Component<{ a: any, b: boolean }> {
      defaultProps = {
        a: { ...something },
        b: false
      }
    }
  `
  },
  {
    name: 'string literal',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ a: string }> {
      defaultProps = {
        a: 'stringVal'
      }
    }
  `
  },
  {
    name: 'numeric literal',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ a: number }> {
      defaultProps = {
        a: 5
      }
    }
  `
  },
  {
    name: 'null literal',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ a?: number }> {
      defaultProps = {
        a: null
      }
    }
  `
  },
  {
    name: 'boolean literal',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ a: boolean }> {
      defaultProps = {
        a: true
      }
    }
  `
  },
  {
    name: 'array expression',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ a: Array<string> }> {
      defaultProps = {
        a: ['a']
      }
    }
  `
  },
  {
    name: 'binary expression',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ a: number }> {
      defaultProps = {
        a: 3 + 5
      }
    }
  `
  },
  {
    name: 'member expression',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ a: () => mixed }> {
      defaultProps = {
        a: b.c
      }
    }
  `
  },
  {
    name: 'defined member expression',
    typeSystem: 'flow',
    code: `
    const b = {
      c: (a: string, b: string): number => {}
    }
    class Component extends React.Component<{ a: () => mixed }> {
      defaultProps = {
        a: b.c
      }
    }
  `
  },
  {
    name: 'imported member expression default',
    typeSystem: 'flow',
    code: `
    import c from 'somewhere-awesome'
    class Component extends React.Component<{ a: () => mixed }> {
      defaultProps = {
        a: b.c
      }
    }
  `
  },
  {
    name: 'imported member expression named',
    typeSystem: 'flow',
    code: `
    import { c } from 'somewhere-awesome'
    class Component extends React.Component<{ a: () => mixed }> {
      defaultProps = {
        a: b.c
      }
    }
  `
  },
  {
    name: 'imported member expression named alias',
    typeSystem: 'flow',
    code: `
    import { d as c } from 'somewhere-awesome'
    class Component extends React.Component<{ a: () => mixed }> {
      defaultProps = {
        a: b.c
      }
    }
  `
  },
  {
    name: 'arrow function expression',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ a: () => mixed }> {
      defaultProps = {
        a: (): number => 5
      }
    }
  `
  },
  {
    name: 'function expression',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ a: () => mixed }> {
      defaultProps = {
        a: function (): number {}
      }
    }
  `
  },
  {
    name: 'exists type annotation',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ a: () => mixed }> {
      defaultProps = {
        a: function (): * {}
      }
    }
  `
  },
  {
    name: 'unary operator',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ a: number }> {
      defaultProps = {
        a: -1
      }
    }
  `
  },
  {
    name: 'tagged template expression',
    typeSystem: 'flow',
    code: `
      class Component extends React.Component<{ a: () => mixed }> {
        defaultProps = {
          a: styled.div\`
            width: 19px;
          \`
        }
      }
    `
  },
  {
    name: 'Assignment Pattern',
    typeSystem: 'flow',
    code: `
      class Component extends React.Component<{a: number => number}> {
        defaultProps = {
          a: function (b = 3): number { return b; }
        }
      }
    `
  },
  {
    name: 'BooleanLiteralTypeAnnotation',
    typeSystem: 'flow',
    code: `
      class Component extends React.Component<{a: string => true}> {}
    `
  },
  {
    name: 'NullLiteralTypeAnnotation',
    typeSystem: 'flow',
    code: `
      class Component extends React.Component<{a: null}> {}
    `
  },
  {
    name: 'non-standard key',
    typeSystem: 'flow',
    code: `
      class Component extends React.Component<{ 'ab-a': number, a: number }> {
      }
    `
  },
  {
    name: 'non-standard key with default',
    typeSystem: 'flow',
    code: `
      class Component extends React.Component<{ 'ab-a': number, a: number }> {
        defaultProps = {
          'ab-a': 37,
        }
      }
    `
  },
  {
    name: 'new expression',
    typeSystem: 'flow',
    code: `
      class Component extends React.Component<{ a: Date }> {
        defaultProps = {
          a: new Date()
        }
      }
    `
  },
  {
    name: 'function declaration',
    typeSystem: 'flow',
    code: `
      function sayHello() { return 'hello'; };

      class Component extends React.Component<{ a: string }> {
        defaultProps = {
          a: sayHello(),
        }
      }
    `
  },
  {
    name: 'template literal with quasis',
    typeSystem: 'flow',
    code: `
      class Component extends React.Component<{ a: string }> {
        defaultProps = {
          a: \`asdf\${abcd}\`,
        }
      }
    `
  },
  {
    name: 'Should handle rest element',
    typeSystem: 'flow',
    code: `
      class Component extends React.Component<{ a: () => void }> {
        defaultProps = {
          a: ({ a, ...restOfThis }) => {},
        }
      }
    `
  },
  {
    name: 'Should handle ArrayTypeAnnotations',
    typeSystem: 'flow',
    code: `
      class Component extends React.Component<{ a: number[] }> {}
    `
  },
  {
    name: 'Should handle importing JSON files',
    typeSystem: 'flow',
    code: `
      import { name, version } from "./__fixtures__/test";

      class Component extends React.Component<{ a: string }> {
        defaultProps = {
          a: name,
        }
      }
    `
  },
  {
    name: 'typeof statements',
    typeSystem: 'flow',
    code: `
      const one = 1;

      class Component extends React.Component<{ a: typeof one }> {}
  `
  },
  {
    name: 'flow type parameter declaration',
    typeSystem: 'flow',
    code: `
      type Foo<T> = () => T;

      class Component extends React.Component<{ a: Foo<string> }> {}
  `
  },
  {
    name: 'ts type comments',
    typeSystem: 'typescript',
    code: `
      interface Props {
        /* Type comment for a */
        a: string;
      }

      class Component extends React.Component<Props> {
      }
    `
  },
  {
    name: 'flow type comments',
    typeSystem: 'flow',
    code: `
      type Props = {
        /* Type comment for a */
        a: string;
      }

      class Component extends React.Component<Props> {
      }
    `
  },
  {
    name: 'ts type alias',
    typeSystem: 'typescript',
    code: `
      type Props = {
        a: string;
      }

      class Component extends React.Component<Props> {
      }
    `
  }
];

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
    // Pass in file name so we can resolve imports to files in __fixtures__
    let result = extractReactTypes(code, testCase.typeSystem, __filename);
    expect(result).toMatchSnapshot();
  });
}
