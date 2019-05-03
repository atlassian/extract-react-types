import stripIndent from 'strip-indent';
import { extractReactTypes } from '../';

test('extracts named export object', () => {
  let code = stripIndent(`
  export const obj = {
    hello: 'hello',
    my: 1
  }
  `);
  let result = extractReactTypes(code, 'flow', __filename);
  expect(result).toEqual({
    kind: 'program',
    body: [
      {
        kind: 'namedExports',
        values: [
          {
            kind: 'variable',
            declarations: [
              {
                kind: 'initial',
                id: {
                  kind: 'id',
                  name: 'obj',
                  type: null
                },
                value: {
                  kind: 'object',
                  members: [
                    {
                      kind: 'property',
                      key: {
                        kind: 'id',
                        name: 'hello',
                        type: null
                      },
                      value: {
                        kind: 'string',
                        value: 'hello'
                      }
                    },
                    {
                      kind: 'property',
                      key: {
                        kind: 'id',
                        name: 'my',
                        type: null
                      },
                      value: {
                        kind: 'number',
                        value: 1
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  });
});

test('extracts named exports component', () => {
  let code = stripIndent(`
  export const Foo = (props: {}) => "hi";
  export const Bar = (props: {}) => 1
  `);
  let result = extractReactTypes(code, 'flow', __filename);
  expect(result).toEqual({
    kind: 'program',
    body: [
      {
        kind: 'namedExports',
        values: [
          {
            kind: 'variable',
            declarations: [
              {
                kind: 'initial',
                id: {
                  kind: 'id',
                  name: 'Foo',
                  type: null
                },
                value: {
                  kind: 'component',
                  name: {
                    kind: 'id',
                    name: 'Foo',
                    type: null
                  },
                  props: {
                    kind: 'object',
                    members: []
                  }
                }
              }
            ]
          }
        ]
      },
      {
        kind: 'namedExports',
        values: [
          {
            kind: 'variable',
            declarations: [
              {
                kind: 'initial',
                id: {
                  kind: 'id',
                  name: 'Bar',
                  type: null
                },
                value: {
                  kind: 'component',
                  name: {
                    kind: 'id',
                    name: 'Bar',
                    type: null
                  },
                  props: {
                    kind: 'object',
                    members: []
                  }
                }
              }
            ]
          }
        ]
      }
    ]
  });
});

test('extracts named exports components consistently', () => {
  let code = stripIndent(`
  export const Foo = (props: {}) => "hi";
  export class Bar extends React.Component<{}> {};
  `);
  let result = extractReactTypes(code, 'flow', __filename);
  expect(result).toEqual({
    kind: 'program',
    body: [
      {
        kind: 'namedExports',
        values: [
          {
            kind: 'variable',
            declarations: [
              {
                kind: 'initial',
                id: {
                  kind: 'id',
                  name: 'Foo',
                  type: null
                },
                value: {
                  kind: 'component',
                  name: {
                    kind: 'id',
                    name: 'Foo',
                    type: null
                  },
                  props: {
                    kind: 'object',
                    members: []
                  }
                }
              }
            ]
          }
        ]
      },
      {
        kind: 'namedExports',
        values: [
          {
            kind: 'component',
            name: {
              kind: 'id',
              name: 'Bar',
              type: null
            },
            props: {
              kind: 'object',
              members: []
            }
          }
        ]
      }
    ]
  });
});

// {
//   name: 'Flow named export functional component',
//   typeSystem: 'flow',
//   code: `
//   const Thing = (props: {}) => "thing";
//   export { Thing };
//   `
// },
// {
//   name: 'Flow export type',
//   typeSystem: 'flow',
//   code: `
//   export type FooType = {
//     key: string
//   }
//   `
// }

// extractFirst = true
test('extractFirst extracts default export React function component', () => {
  let code = stripIndent(`
  export default (props: { greeting: string }) => greeting;
  `);
  let result = extractReactTypes(code, 'flow', __filename, { extractFirst: true });
  expect(result).toEqual({
    kind: 'program',
    body: [
      {
        kind: 'component',
        props: {
          kind: 'object',
          members: [
            {
              kind: 'property',
              key: {
                kind: 'id',
                name: 'greeting'
              },
              optional: false,
              value: {
                kind: 'string'
              }
            }
          ]
        },
        name: {
          kind: 'id',
          name: '',
          type: null
        }
      }
    ]
  });
});

test('extractFirst extracts first React component class', () => {
  let code = stripIndent(`
  class Foo extends React.Component<{ greeting: string }> {}
  `);
  // Pass in file name so we can resolve imports to files in __fixtures__
  let result = extractReactTypes(code, 'flow', __filename, { extractFirst: true });
  expect(result).toEqual({
    kind: 'program',
    body: [
      {
        kind: 'component',
        props: {
          kind: 'object',
          members: [
            {
              kind: 'property',
              key: {
                kind: 'id',
                name: 'greeting'
              },
              optional: false,
              value: {
                kind: 'string'
              }
            }
          ]
        },
        name: {
          kind: 'id',
          name: 'Foo',
          type: null
        }
      }
    ]
  });
});

test('extractFirst does not extract non-exported React function components', () => {
  let code = stripIndent(`
  const Foo = (props: { greeting: string }) => greeting;
  `);
  let result = extractReactTypes(code, 'flow', __filename, { extractFirst: true });
  expect(result).toEqual({
    kind: 'program',
    body: []
  });
});
