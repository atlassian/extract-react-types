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

const TESTS = [
  {
    name: 'boolean',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: boolean }> {
      // ...
    }
  `
  },
  {
    name: 'LogicalExpression and',
    typeSystem: 'flow',
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
    typeSystem: 'flow',
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
    typeSystem: 'flow',
    code: `
    class Button extends React.Component<{ or: string }> {
      static defaultProps = {
        or: 'me' || 'you' || 'someone else' && 'impossible state',
      }
    }
  `
  },
  {
    name: 'string',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: string }> {
      // ...
    }
  `
  },
  {
    name: 'number',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: number }> {
      // ...
    }
  `
  },
  {
    name: 'function',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: (string, number) => string }> {
      // ...
    }
  `
  },
  {
    name: 'function named params',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: (name: string, age: number) => void }> {
      // ...
    }
  `
  },
  {
    name: 'function unnamed params',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: (string, number) => void }> {
      // ...
    }
  `
  },
  {
    name: 'function unnamed params w/ object',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: ({ prop: string }) => void }> {
      // ...
    }
  `
  },
  {
    name: 'function return type',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: (number) => void }> {
      // ...
    }
  `
  },
  {
    name: 'function type',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: Function }> {
      // ...
    }
  `
  },
  {
    name: 'maybe',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: ?string }> {
      // ...
    }
  `
  },
  {
    name: 'array',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: Array<boolean> }> {
      // ...
    }
  `
  },
  {
    name: 'union',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: boolean | number }> {
      // ...
    }
  `
  },
  {
    name: 'union literals',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ age: '25' | 30 }> {
      // ...
    }
  `
  },
  {
    name: 'mixed',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ age: mixed }> {
      // ...
    }
  `
  },
  {
    name: 'any',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ age: any }> {
      // ...
    }
  `
  },
  {
    name: 'generic class',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<A> {
      name: A;
    }
  `
  },
  {
    name: 'type',
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
    name: 'type identifier',
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
    name: 'exported type alias reference',
    typeSystem: 'flow',
    code: `
    export type Foo = boolean;
    class Component extends React.Component<{ foo: Foo }> {

    }
  `
  },
  {
    name: 'type',
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
    name: 'nested intersection type with default props',
    typeSystem: 'flow',
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
    name: 'with spread in type annotation and default props',
    typeSystem: 'flow',
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
    typeSystem: 'flow',
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
    typeSystem: 'flow',
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
    typeSystem: 'flow',
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
    name: 'array union',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: Array<boolean | number> }> {
      // ...
    }
  `
  },
  {
    name: 'void',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo: void }> {
      // ...
    }
  `
  },
  {
    name: 'optional',
    typeSystem: 'flow',
    code: `
    class Component extends React.Component<{ foo?: number }> {
    }
  `
  },
  {
    name: 'no React component',
    typeSystem: 'flow',
    code: `
    class FooComponent extends Bar<{ foo?: number }> {
    }
  `
  },
  {
    name: 'different React component',
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
    name: 'import { type }',
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
    name: 'type parameter declaration',
    typeSystem: 'flow',
    code: `
      type Foo<T> = () => T;

      class Component extends React.Component<{ a: Foo<string> }> {}
  `
  },
  {
    name: 'type comments',
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
    name: 'type alias declaration - 1',
    typeSystem: 'flow',
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
    name: 'recursive type',
    typeSystem: 'flow',
    code: `
      type RecursiveType = {
        props: RecursiveType
      }

      class Component extends React.Component<RecursiveType> {}
    `
  },
  {
    name: 'function component',
    typeSystem: 'flow',
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
    name: 'inline function component',
    typeSystem: 'flow',
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
    name: 'inline anonymous function component',
    typeSystem: 'flow',
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
    name: 'arrow function component',
    typeSystem: 'flow',
    code: `
      type Props = {
        name: string
      }

      const Component = (props: Props) => null;

      export default Component;
    `
  },
  {
    name: 'inline arrow function component',
    typeSystem: 'flow',
    code: `
      type Props = {
        name: string
      }

      export default (props: Props) => null;
    `
  },
  {
    name: 'ignores other components',
    typeSystem: 'flow',
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
    name: 'function component with default props',
    typeSystem: 'flow',
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
    name: 'function component with default including spread',
    typeSystem: 'flow',
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
    name: 'function with defaults not arrow',
    typeSystem: 'flow',
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
    name: 'forwardRef default export',
    typeSystem: 'flow',
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
    name: 'forwardRef callable type arguments',
    typeSystem: 'flow',
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
    name: 'default class export',
    typeSystem: 'flow',
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
    name: 'class with this expression',
    typeSystem: 'flow',
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
    name: 'forwardRef',
    typeSystem: 'flow',
    code: `
    type Props = {
      ok: number
    }

    const SomeComponent = forwardRef((props: Props, ref) => {})

    export default SomeComponent


    `
  },
  {
    name: 'React.forwardRef',
    typeSystem: 'flow',
    code: `
    type Props = {
      ok: number
    }

    const SomeComponent = React.forwardRef((props: Props, ref) => {})

    export default SomeComponent

    `
  },
  {
    name: 'function expression',
    typeSystem: 'flow',
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
    name: 'React.memo',
    typeSystem: 'flow',
    code: `
    type Props = {
      ok: number
    }

    const SomeComponent = memo((props: Props, ref) => {})

    export default SomeComponent

    `
  },
  {
    name: 'memo',
    typeSystem: 'flow',
    code: `
    type Props = {
      ok: number
    }

    const SomeComponent = React.memo((props: Props, ref) => {})

    export default SomeComponent

    `
  },
  {
    name: 'func that is not valid',
    typeSystem: 'flow',
    code: `
    type Props = {
      ok: number
    }

    const SomeComponent = something((props: Props, ref) => {})

    export default SomeComponent

    `
  },
  {
    name: 'memo wrapping forwardRef',
    typeSystem: 'flow',
    code: `
    type Props = {
      ok: number
    }

    const SomeComponent = memo(forwardRef((props: Props, ref) => {}))

    export default SomeComponent

    `
  },
  {
    name: 'OpaqueType test',
    typeSystem: 'flow',
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
    name: 'forwardRef default export',
    typeSystem: 'flow',
    code: `
    type Props = {
      ok: number
    }

    export default forwardRef((props: Props, ref) => {})
    `
  },
  {
    name: 'memo default export',
    typeSystem: 'flow',
    code: `
    type Props = {
      ok: number
    }

    export default memo((props: Props, ref) => {})
    `
  },
  {
    name: 'memo wrapping forwardRef default export',
    typeSystem: 'flow',
    code: `
    type Props = {
      ok: number
    }

    export default memo(forwardRef((props: Props, ref) => {}))
    `
  },
  {
    name: 'TypeCastExpression',
    typeSystem: 'flow',
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

describe('Flow Converters', () => {
  cases(
    'Flow:',
    testCase => {
      const code = stripIndent(testCase.code);
      // Pass in file name so we can resolve imports to files in __fixtures__
      const result = extractReactTypes(code, testCase.typeSystem, __filename);
      expect(result.component).toMatchSnapshot();
    },
    TESTS
  );
});
