// @flow

/*::
type TestCase = {
  name: string,
  typeSystem: 'flow' | 'typescript',
  code: string,
  only?: boolean,
  skip?: boolean
}
*/

import stripIndent from 'strip-indent';
import cases from 'jest-in-case';
import { extractReactTypes } from './src';

const typeSystem = 'flow';
const TESTS = [
  {
    name: 'flow boolean',
    typeSystem,
    code: `
    class Component extends React.Component<{ foo: boolean }> {
      // ...
    }
  `
  },
  {
    name: 'LogicalExpression and',
    typeSystem,
    code: `
    class Button extends React.Component<{ and: string }> {
      static defaultProps = {
        and: true && 'something',
      }
    }

  `
  },
  {
    name: 'LogicalExpression or',
    typeSystem,
    code: `
    class Button extends React.Component<{ or: string }> {
      static defaultProps = {
        or: 'me' || 'you',
      }
    }

  `
  },
  {
    name: 'LogicalExpression or complicated',
    typeSystem,
    code: `
    class Button extends React.Component<{ or: string }> {
      static defaultProps = {
        or: 'me' || 'you' || 'someone else' && 'impossible state',
      }
    }
  `
  },
  {
    name: 'flow string',
    typeSystem,
    code: `
    class Component extends React.Component<{ foo: string }> {
      // ...
    }
  `
  },
  {
    name: 'flow number',
    typeSystem,
    code: `
    class Component extends React.Component<{ foo: number }> {
      // ...
    }
  `
  },
  {
    name: 'flow function',
    typeSystem,
    code: `
    class Component extends React.Component<{ foo: (string, number) => string }> {
      // ...
    }
  `
  },
  {
    name: 'flow function named params',
    typeSystem,
    code: `
    class Component extends React.Component<{ foo: (name: string, age: number) => void }> {
      // ...
    }
  `
  },
  {
    name: 'flow function unnamed params',
    typeSystem,
    code: `
    class Component extends React.Component<{ foo: (string, number) => void }> {
      // ...
    }
  `
  },
  {
    name: 'flow function unnamed params w/ object',
    typeSystem,
    code: `
    class Component extends React.Component<{ foo: ({ prop: string }) => void }> {
      // ...
    }
  `
  },
  {
    name: 'flow function return type',
    typeSystem,
    code: `
    class Component extends React.Component<{ foo: (number) => void }> {
      // ...
    }
  `
  },
  {
    name: 'flow function type',
    typeSystem,
    code: `
    class Component extends React.Component<{ foo: Function }> {
      // ...
    }
  `
  },
  {
    name: 'flow maybe',
    typeSystem,
    code: `
    class Component extends React.Component<{ foo: ?string }> {
      // ...
    }
  `
  },
  {
    name: 'flow array',
    typeSystem,
    code: `
    class Component extends React.Component<{ foo: Array<boolean> }> {
      // ...
    }
  `
  },
  {
    name: 'flow union',
    typeSystem,
    code: `
    class Component extends React.Component<{ foo: boolean | number }> {
      // ...
    }
  `
  },
  {
    name: 'flow union literals',
    typeSystem,
    code: `
    class Component extends React.Component<{ age: '25' | 30 }> {
      // ...
    }
  `
  },
  {
    name: 'flow mixed',
    typeSystem,
    code: `
    class Component extends React.Component<{ age: mixed }> {
      // ...
    }
  `
  },
  {
    name: 'flow any',
    typeSystem,
    code: `
    class Component extends React.Component<{ age: any }> {
      // ...
    }
  `
  },
  {
    name: 'flow generic class',
    typeSystem,
    code: `
    class Component extends React.Component<A> {
      name: A;
    }
  `
  },
  {
    name: 'flow type',
    typeSystem,
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
    typeSystem,
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
    typeSystem,
    code: `
    export type Foo = boolean;
    class Component extends React.Component<{ foo: Foo }> {

    }
  `
  },
  {
    name: 'flow type',
    typeSystem,
    code: `
    class Component extends React.Component<{foo: number & string}> {

    }
  `
  },
  {
    name: 'intersection type',
    typeSystem,
    code: `
  type BaseProps = { bar: string }

  class Component extends React.Component<BaseProps & {
    isDefaultChecked: boolean,
  }> {
  }
  `
  },
  {
    name: 'nested intersection type with default props',
    typeSystem,
    code: `
  type BaseProps = { bar: string }
  type Props = BaseProps & { foo: string }

  class Component extends React.Component<Props & {
    isDefaultChecked: boolean,
  }> {
    static defaultProps = {
      bar: 'baz',
    }
  }
  `
  },
  {
    name: 'with spread in type annotation',
    typeSystem,
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
    name: 'with spread in type annotation and default props',
    typeSystem,
    code: `
  type BaseProps = { foo: string }
  type Props = {
    ...BaseProps,
    isDefaultChecked: boolean,
  }
  class Component extends React.Component<Props> {
    static defaultProps = {
      foo: 'abc',
    };
  }
  `
  },
  {
    name: 'with generic spread in type annotation and default props',
    typeSystem,
    code: `
  type BaseProps = { foo: string }
  type Props = {
    ...$Diff<BaseProps, OtherProps>,
    isDefaultChecked: boolean,
  }
  class Component extends React.Component<Props> {
    static defaultProps = {
      foo: 'abc',
    };
  }
  `
  },
  {
    name: '$Exact flow utility type',
    typeSystem,
    code: `
  type BaseProps = { bar: string }
  type Props = {
    foo: $Exact<BaseProps>,
    isDefaultChecked: boolean,
  }
  class Component extends React.Component<Props> {
    static defaultProps = {
      isDefaultChecked: false,
    };
  }
  `
  },
  {
    name: 'with $Exact spread in type annotation and default props',
    typeSystem,
    code: `
  type BaseProps = { foo: string }
  type Props = {
    ...$Exact<BaseProps>,
    isDefaultChecked: boolean,
  }
  class Component extends React.Component<Props> {
    static defaultProps = {
      foo: 'abc',
    };
  }
  `
  },
  {
    name: 'flow array union',
    typeSystem,
    code: `
    class Component extends React.Component<{ foo: Array<boolean | number> }> {
      // ...
    }
  `
  },
  {
    name: 'flow void',
    typeSystem,
    code: `
    class Component extends React.Component<{ foo: void }> {
      // ...
    }
  `
  },
  {
    name: 'flow optional',
    typeSystem,
    code: `
    class Component extends React.Component<{ foo?: number }> {
    }
  `
  },
  {
    name: 'flow no React component',
    typeSystem,
    code: `
    class FooComponent extends Bar<{ foo?: number }> {
    }
  `
  },
  {
    name: 'flow different React component',
    typeSystem,
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
    typeSystem,
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
    name: 'test',
    typeSystem,
    code: `
    class Component extends React.Component<{ foo?: Object }> {}
  `
  },
  {
    name: 'test get defaultProps',
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
    code: `
      class Component extends React.Component<{a: string => true}> {}
    `
  },
  {
    name: 'NullLiteralTypeAnnotation',
    typeSystem,
    code: `
      class Component extends React.Component<{a: null}> {}
    `
  },
  {
    name: 'non-standard key',
    typeSystem,
    code: `
      class Component extends React.Component<{ 'ab-a': number, a: number }> {
      }
    `
  },
  {
    name: 'non-standard key with default',
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
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
    typeSystem,
    code: `
      class Component extends React.Component<{ a: number[] }> {}
    `
  },
  {
    name: 'Should handle importing JSON files',
    typeSystem,
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
    typeSystem,
    code: `
      const one = 1;

      class Component extends React.Component<{ a: typeof one }> {}
  `
  },
  {
    name: 'flow type parameter declaration',
    typeSystem,
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
    typeSystem,
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
    name: 'flow type alias declaration - 1',
    typeSystem,
    code: `
      import * as React from 'react';

      type ReactElement = React.Element<any> | React.Element<any>[];
      type Props = {
        a: ReactElement,
      }

      class Component extends React.Component<Props> {
      }
    `
  },
  {
    name: 'flow recursive type',
    typeSystem,
    code: `
      type RecursiveType = {
        props: RecursiveType
      }

      class Component extends React.Component<RecursiveType> {}
    `
  },
  {
    name: 'flow function component',
    typeSystem,
    code: `
      type Props = {
        name: string
      }

      function Component(props: Props) {
        return null;
      }

      export default Component;
    `
  },
  {
    name: 'flow inline function component',
    typeSystem,
    code: `
      type Props = {
        name: string
      }

      export default function Component(props: Props) {
        return null;
      }
    `
  },
  {
    name: 'flow inline anonymous function component',
    typeSystem,
    code: `
      type Props = {
        name: string
      }

      export default function(props: Props) {
        return null;
      }
    `
  },
  {
    name: 'flow arrow function component',
    typeSystem,
    code: `
      type Props = {
        name: string
      }

      const Component = (props: Props) => null;

      export default Component;
    `
  },
  {
    name: 'flow inline arrow function component',
    typeSystem,
    code: `
      type Props = {
        name: string
      }

      export default (props: Props) => null;
    `
  },
  {
    name: 'flow ignores other components',
    typeSystem,
    code: `
      type Props = {
        name: string
      }

      class Component extends React.Component<{ foo: string[] }> {}

      function FunComponent(props: Props) {
        return null;
      }

      export default (props: Props) => null;
    `
  },
  {
    name: 'flow function component with default props',
    typeSystem,
    code: `
      type Props = {
        name: string
      }

      const Component = (props: Props) => null;

      Component.defaultProps = {
        name: 'bob',
      };

      export default Component;
    `
  },
  {
    name: 'flow function component with default including spread',
    typeSystem,
    code: `
      type Props = {
        name: string,
        something: string
      }

      const abc = { something: 'a' }

      const Component = (props: Props) => null;

      Component.defaultProps = {
        ...abc,
        name: 'bob',
      };

      export default Component;
    `
  },
  {
    name: 'flow function with defaults not arrow',
    typeSystem,
    code: `
      type Props = {
        name: string,
        something: string
      }

      const abc = { something: 'a' }

      function Component (props: Props) {};

      Component.defaultProps = {
        ...abc,
        name: 'bob',
      };

      export default Component;
    `
  },
  {
    name: 'flow forwardRef default export',
    typeSystem,
    code: `
      type Props = {
        name: string,
      }

      function Component (props: Props) {};

      Component.defaultProps = {
        name: 'bob',
      };

      export default React.forwardRef((props: Props, ref) => <Component {...props} ref={ref} />);
    `
  },
  {
    name: 'flow forwardRef callable type arguments',
    typeSystem,
    code: `
      type Props = {
        name: string,
      }

      function Component (props: Props) {};

      Component.defaultProps = {
        name: 'bob',
      };

      export default React.forwardRef<Props, HTMLElement>((props: Props, ref) => <Component {...props} ref={ref} />);
    `
  },
  {
    name: 'flow default class export',
    typeSystem,
    code: `
      import { Component } from 'react';
      type Props = {
        name: string,
      }

      export default class OnboardingModal extends Component<Props> {
        onChange = () => {
          console.log('hi');
        }
      }
    `
  },
  {
    name: 'flow class with this expression',
    typeSystem,
    code: `
    type Props = {
      ok: number
    }

    class FieldInner extends React.Component<Props> {
      unregisterField = () => {};

      componentDidMount() {
        this.unregisterField = this.register();
      }

      componentWillUnmount() {
        this.unregisterField();
      }
    }

    const Field = (props: Props) => <FieldInner {...props} />;

    Field.defaultProps = {
      ok: 1
    };

    export default Field;

    `
  },
  {
    name: 'flow forwardRef',
    typeSystem,
    code: `
    type Props = {
      ok: number
    }

    const SomeComponent = forwardRef((props: Props, ref) => {

    })

    export default SomeComponent


    `
  },
  {
    name: 'flow React.forwardRef',
    typeSystem,
    code: `
    type Props = {
      ok: number
    }

    const SomeComponent = React.forwardRef((props: Props, ref) => {

    })

    export default SomeComponent

    `
  },
  {
    name: 'flow function expression',
    typeSystem,
    code: `
    type Props = {
      ok: number
    }

    const SomeComponent = function(props: Props) {

    }

    export default SomeComponent

    `
  },
  {
    name: 'flow React.memo',
    typeSystem,
    code: `
    type Props = {
      ok: number
    }

    const SomeComponent = memo((props: Props, ref) => {

    })

    export default SomeComponent

    `
  },
  {
    name: 'flow memo',
    typeSystem,
    code: `
    type Props = {
      ok: number
    }

    const SomeComponent = React.memo((props: Props, ref) => {

    })

    export default SomeComponent

    `
  },
  {
    name: 'flow func that is not valid',
    typeSystem,
    code: `
    type Props = {
      ok: number
    }

    const SomeComponent = something((props: Props, ref) => {

    })

    export default SomeComponent

    `
  },
  {
    name: 'flow memo wrapping forwardRef',
    typeSystem,
    code: `
    type Props = {
      ok: number
    }

    const SomeComponent = memo(forwardRef((props: Props, ref) => {

    }))

    export default SomeComponent

    `
  },
  {
    name: 'OpaqueType test',
    typeSystem,
    code: `
    opaque type SomethingId = string;

    type Props = {
      ok?: SomethingId
    }

    const SomeComponent = function(props: Props) {

    }

    export default SomeComponent
    `
  },
  {
    name: 'flow forwardRef default export',
    typeSystem,
    code: `
    type Props = {
      ok: number
    }

    export default forwardRef((props: Props, ref) => {

    })
    `
  },
  {
    name: 'flow memo default export',
    typeSystem,
    code: `
    type Props = {
      ok: number
    }

    export default memo((props: Props, ref) => {

    })
    `
  },
  {
    name: 'flow memo wrapping forwardRef default export',
    typeSystem,
    code: `
    type Props = {
      ok: number
    }

    export default memo(forwardRef((props: Props, ref) => {

    }))
    `
  },
  {
    name: 'Flow TypeCastExpression',
    typeSystem,
    code: `
    type Props = { bar: string }

    class Component extends React.Component<Props> {
      static defaultProps = {
        bar: (ascii: string),
      }
    }
    `
  }
];

cases(
  '',
  testCase => {
    let code = stripIndent(testCase.code);
    // Pass in file name so we can resolve imports to files in __fixtures__
    let result = extractReactTypes(code, testCase.typeSystem, __filename);
    expect(result).toMatchSnapshot();
  },
  TESTS
);
