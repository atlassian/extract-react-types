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
    name: 'type comments',
    typeSystem: 'typescript',
    code: `
      interface Props {
        /* Type comment for a */
        a: string;
      }

      class Component extends React.Component<Props> {}
    `
  },
  {
    name: 'React.ComponentType',
    typeSystem: 'typescript',
    code: `
    import React from 'react';

    type Props = {
      children: React.ComponentType,
    };

    class Component extends React.Component<Props> {}
  `
  },
  {
    name: 'React.FC',
    typeSystem: 'typescript',
    code: `
      type Props = {
        children: string;
      };

      const Component: FC<Props> = (props) => null;

      export default Component;
    `
  },
  {
    name: 'React.FC with empty type argument',
    typeSystem: 'typescript',
    code: `
      type Props = {
        children: string;
      };

      const Component: FC = (props) => null;

      export default Component;
    `
  },
  {
    name: 'React.FC with inline type argument',
    typeSystem: 'typescript',
    code: `
      const Component: FC<{
        children: string;
      }> = (props) => null;

      export default Component;
    `
  },
  {
    name: 'Direct type assignment',
    typeSystem: 'typescript',
    code: `
    interface BadgeProps {
      texture: string;
    }

    function Badge({ texture }: BadgeProps) {}

    Badge.f = [];

    export default Badge;
  `
  },
  {
    name: 'ts nested prop',
    typeSystem: 'typescript',
    code: `
    interface BadgeProps {
      texture: Texture["src"];
    }

    function Badge({ texture }: BadgeProps) {}

    export default Badge;
  `
  },
  {
    name: 'ts array prop',
    typeSystem: 'typescript',
    code: `
    interface ScheduleProps {
      intervals: Array<{
        begin: Interval["begin"];
        end: Interval["end"];
      }>;
    }

    function Schedule({ intervals }: ScheduleProps) {}

    export default Schedule;
  `
  },
  {
    name: 'ts decorators',
    typeSystem: 'typescript',
    code: `
    @ObjectType()
    export class Theme extends React.Component<{}, {}> {
      @Field(_ => ID)
      public id!: string;

      @Field(_ => Textures)
      public fonts!: Textures;

      render() {}
    }

    export default Theme;
  `
  },
  {
    name: 'ts boolean',
    typeSystem: 'typescript',
    code: `
    class Component extends React.Component<{ foo: boolean }> {}
  `
  },
  {
    name: 'ts string',
    typeSystem: 'typescript',
    code: `
    class Component extends React.Component<{ foo: string }> {}
  `
  },
  {
    name: 'ts as expression',
    typeSystem: 'typescript',
    code: `
    type Foo = 'foo' | 'bar';
    type Props = { bar: Foo }

    class Component extends React.Component<Props> {
      static defaultProps = {
        bar: 'foo' as Foo,
      }
    }
  `
  },
  {
    name: 'ts object',
    typeSystem: 'typescript',
    code: `
    class Component extends React.Component<{foo: { name: string }, bar: number, verified: boolean}> {}
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
    class Component extends React.Component<{foo: '25' | 30}> {}
  `
  },
  {
    name: 'ts optional',
    typeSystem: 'typescript',
    code: `
    class Component extends React.Component<{foo?: string}> {}
  `
  },
  {
    name: 'ts void',
    typeSystem: 'typescript',
    code: `
    class Component extends React.Component<{foo: void}> {}
  `
  },
  {
    name: 'ts no react component',
    typeSystem: 'typescript',
    code: `
    class Component extends Foo<{foo: void}> {}
  `
  },
  {
    name: 'ts different React components',
    typeSystem: 'typescript',
    code: `
    import {Component} from 'react';

    class FooComponent extends Component<{foo: void}> {}

    class BarComponent extends React.Component<{foo: void}> {}
  `
  },
  {
    name: 'ts tuple',
    typeSystem: 'typescript',
    code: `
    class Component extends React.Component<{foo: [string, number]}> {}
  `
  },
  {
    name: 'ts enum',
    typeSystem: 'typescript',
    code: `
    enum Color {Red, Green, Blue};
    class Component extends React.Component<{foo: Color}> {}
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
  },
  {
    name: 'ts type alias declaration - 1',
    typeSystem: 'typescript',
    code: `
      type LiteralType = 'one' | 'two';
      interface Props {
        a: LiteralType;
      }

      class Component extends React.Component<Props> {
      }
    `
  },
  {
    name: 'ts type alias declaration - 2',
    typeSystem: 'typescript',
    code: `
      type ReactElement = React.ReactElement<any> | React.ReactElement<any>[];
      interface Props {
        a: ReactElement;
      }

      class Component extends React.Component<Props> {
      }
    `
  },
  {
    name: 'Should handle importing other ts files',
    typeSystem: 'typescript',
    code: `
      import { Props } from "./__fixtures__/props";

      class Component extends React.Component<Props> {
      }
    `
  },
  {
    name: 'ts method signature',
    typeSystem: 'typescript',
    code: `
      interface Props {
        on(x: string): void;
      }

      class Component extends React.Component<Props> {}
    `
  },
  {
    name: 'ts call signature declaration',
    typeSystem: 'typescript',
    code: `
      interface Props {
        (x: string): void;
      }

      class Component extends React.Component<Props> {}
    `
  },
  {
    name: 'ts parenthesized type',
    typeSystem: 'typescript',
    code: `
      interface Props {
        a: ({ b: string })
      }

      class Component extends React.Component<Props> {}
    `
  },
  {
    name: 'ts interface extend',
    typeSystem: 'typescript',
    code: `
      import { Type } from './__fixtures__/types';
      interface DefaultTypes {
        b: number
      }

      interface Props extends DefaultTypes, Type {
        a: string
      }

      class Component extends React.Component<Props> {
        static defaultProps = {
          b: 1
        }
      }
    `
  },
  {
    name: 'ts export all',
    typeSystem: 'typescript',
    code: `
      import { NestedInterface1 } from './__fixtures__/types';

      class Component extends React.Component<NestedInterface1> {}
    `
  },
  {
    name: 'ts recursive type',
    typeSystem: 'typescript',
    code: `
      interface SiblingInterface {
        property: string
      }

      interface RecursiveType {
        properties: SiblingInterface
        type: RecursiveType
      }

      class Component extends React.Component<RecursiveType> {}
    `
  },

  {
    name: 'indexed type',
    typeSystem: 'typescript',
    code: `
      type MyType = {
        props: number;
      }

      class Component extends React.Component<{ foo: MyType['props'] }> {}
    `
  },
  {
    name: 'indexed imported type',
    typeSystem: 'typescript',
    code: `
      class Component extends React.Component<{ foo: ImportedType['props'] }> {}
    `
  },
  {
    name: 'generic + type expression',
    typeSystem: 'typescript',
    code: `
    type Foo<T, U> = T extends object ? T : U;

    class Component extends React.Component<Foo<string, {}>> {
    }
  `
  },
  {
    name: 'unknown prop',
    typeSystem: 'typescript',
    code: `
    import React from 'react';

    type Props = {
      children: unknown,
    };

    class Component extends React.Component<Props> {}
  `
  },
  {
    name: 'follow export default export',
    typeSystem: 'typescript',
    code: `
      export { default } from './__fixtures__/component.tsx';
    `
  },
  {
    name: 'follow export named default export',
    typeSystem: 'typescript',
    code: `
      export { x as default } from './__fixtures__/componentB.tsx';
    `
  },
  {
    name: 'type query for class component',
    typeSystem: 'typescript',
    code: `
    import React from 'react';

    import { NestedInterface1 } from './__fixtures__/types';
    import { NestedInterface2 } from 'external-package';

    interface Props extends NestedInterface1, NestedInterface2 {
      foo: number;
      bar?: string;
      baz?: boolean
    }

    const value = {
      a: 'a value',
      b: 'b value',
    };

    type MyComponentProps = Props & typeof MyComponent.defaultProps & typeof value;

    class MyComponent extends React.Component<MyComponentProps> {
      static defaultProps = {
        bar: 'bar',
        baz: true
      }
    }
  `
  },
  {
    name: 'type query for functional component',
    typeSystem: 'typescript',
    code: `
    import React from 'react';

    type OCProps = {
      type: 'a' | 'b' | 'c' | 'd',
    }
    function OtherComponent(props: OCProps) {}

    type MCProps = {
      type: React.ComponentProps<typeof OtherComponent>['type'],
    }
    function MyComponent(props: MCProps) {}

    export default MyComponent;
  `
  },
  {
    name: 'forwardRef typed via generic types',
    typeSystem: 'typescript',
    code: `
    import React, { forwardRef } from 'react';

    type MyComponentProps = {
      foo: string,
    }

    const MyComponent = forwardRef<HTMLElement, MyComponentProps>((props, ref) => {
      return <span>Foo</span>;
    });

    export default MyComponent;
  `
  },
  {
    name: 'forwardRef typed via function args',
    typeSystem: 'typescript',
    code: `
    import React, { forwardRef } from 'react';

    type MyComponentProps = {
      foo: string,
    }

    const MyComponent = forwardRef((props: MyComponentProps, ref: HTMLElement) => {
      return <span>Foo</span>;
    });

    export default MyComponent;
  `
  }
];

cases(
  'TypeScript:',
  testCase => {
    let code = stripIndent(testCase.code);
    // Pass in file name so we can resolve imports to files in __fixtures__
    let result = extractReactTypes(code, testCase.typeSystem, __filename);
    expect(result.component).toMatchSnapshot();
  },
  TESTS
);
