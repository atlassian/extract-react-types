// @flow
const k2s = require('./dist');
import convert from './src';

const extractReactTypes = require('extract-react-types');

const assembleERTAST = (propTypes, defaultProps, type = 'flow') => {
  let file = `
  class Component extends React.Component<${propTypes}> {
    defaultProps = ${defaultProps}
  }`;
  let res = extractReactTypes(file, type);
  return res.classes[0].members;
};

const getSingleDefault = defaultPropVal => {
  return assembleERTAST(`{ a: any }`, `{ a: ${defaultPropVal} }`)[0].default;
};
const getSingleProp = defaultPropType => {
  const propTypes = assembleERTAST(`{ a: ${defaultPropType} }`, `{}`)[0];
  return convert(propTypes.value);
};
const getSingleTSPropTypes = defaultPropType => {
  const propTypes = assembleERTAST(
    `{ a: ${defaultPropType} }`,
    `{}`,
    'typescript',
  )[0];

  return convert(propTypes);
};

const base = {
  kind: 'memberExpression',
  property: {
    kind: 'id',
    name: 'a',
  },
};
const flatMemberExpressionId = {
  ...base,
  object: {
    kind: 'id',
    name: 'testObject',
  },
};
const flatMemberExpressionObject = {
  ...base,
  object: {
    kind: 'object',
    members: [
      {
        kind: 'property',
        key: {
          kind: 'id',
          name: 'redHerring',
        },
        value: {
          kind: 'number',
          value: NaN,
        },
      },
      {
        kind: 'property',
        key: {
          kind: 'string',
          value: 'a',
        },
        value: {
          kind: 'number',
          value: 34,
        },
      },
    ],
  },
};
const ErroneousMemberExpression = {
  ...base,
  object: flatMemberExpressionObject,
  property: {
    kind: 'id',
    name: 'badprop',
  },
};

const nestedMemberExpressionId = {
  ...base,
  object: flatMemberExpressionId,
};

const nestedMemberExpressionObject = {
  ...base,
  object: flatMemberExpressionObject,
};

describe('kind 2 string tests', () => {
  describe('converters', () => {
    describe('memberExpression', () => {
      describe('If the object property is of the type Obj', () => {
        it('and the property does not exist, we should log an error and return an empty string', () => {
          expect(convert(ErroneousMemberExpression)).toBe('undefined');
        });
        it('and the property does exist, we should return the value', () => {
          expect(convert(flatMemberExpressionObject)).toBe('34');
        });
      });
      describe('If the object property is of the type Id', () => {
        it('should return the ObjectId and Property name as a string representation', () => {
          expect(convert(flatMemberExpressionId)).toBe('testObject.a');
        });
      });
      describe('If the object property is of the type MemberExpression', () => {
        it('and the final type is of type object', () => {
          expect(convert(nestedMemberExpressionObject)).toBe('34');
        });
        it('and the final type is of type id', () => {
          expect(convert(nestedMemberExpressionId)).toBe('testObject.a.a');
        });
      });
    });
    describe('exists', () => {
      it('return a string representation of the exist kind', () => {
        const str = `*`;
        const result = '*';
        const final = getSingleProp(str);
        expect(final).toBe(result);
      });
    });
    describe('boolean', () => {
      describe('If no value exists', () => {
        it('return the string representation of the kind', () => {
          const str = `{ c: boolean }`;
          const result = `{ c: boolean }`;
          const final = getSingleProp(str);
          expect(final).toBe(result);
        });
      });
      describe('If a value exists', () => {
        it('return the string representatio of the value', () => {
          const str = `{ c: true }`;
          const result = `{ c: true }`;
          const final = getSingleProp(str);
          expect(final).toBe(result);
        });
      });
    });
    describe('number', () => {
      describe('If no value exists', () => {
        it('return the string representation of the kind', () => {
          const str = `{ c: number }`;
          const result = `{ c: number }`;
          const final = getSingleProp(str);
          expect(final).toBe(result);
        });
        it('return the string representatio of the value', () => {
          const str = `{ c: 3 }`;
          const result = `{ c: 3 }`;
          const final = getSingleProp(str);
          expect(final).toBe(result);
        });
      });
    });
    describe('string', () => {
      describe('If no value exists', () => {
        it('return the string representation of the kind', () => {
          const str = `{ c: string }`;
          const result = `{ c: string }`;
          const final = getSingleProp(str);
          expect(final).toBe(result);
        });
        it('return the string representatio of the value', () => {
          const str = `{ c: "hello" }`;
          const result = `{ c: "hello" }`;
          const final = getSingleProp(str);
          expect(final).toBe(result);
        });
      });
    });
    describe('templateLiteral', () => {
      it('should resolve to same string', () => {
        let str = '`abc${a}de`';
        let reId = getSingleDefault(str);
        let final = convert(reId);
        expect(final).toBe(str);
      });
      it('should resolve excaped characters', () => {
        let str = '`abc${a}de\n`';
        let reId = getSingleDefault(str);
        let final = convert(reId);
        expect(final).toBe(str);
      });
    });
    describe('any', () => {
      it('should resolve to whatever type kind is passed in', () => {
        let str = `any`;
        let final = getSingleProp(str);
        expect(final).toBe(str);
      });
    });
    describe('object', () => {
      it('should test a spread object', () => {
        let defaults = `{ a: { ...something, b: "val" } }`;
        let reId = getSingleDefault(defaults);
        let final = convert(reId);
        expect(final).toBe(defaults);
      });
    });
    describe('function', () => {
      it('should test a spread object', () => {
        let defaults = `() => {}`;
        let returnVal = `() => undefined`;
        let reId = getSingleDefault(defaults);
        let final = convert(reId);
        expect(final).toBe(returnVal);
      });
      it('should test a default of a function type', () => {
        let defaults = `(a = () => {}) => {}`;
        let returnVal = `(a = () => undefined) => undefined`;
        let reId = getSingleDefault(defaults);
        let final = convert(reId);
        expect(final).toBe(returnVal);
      });
      it('should handle a spread', () => {
        let defaults = `({ ...res }) => {}`;
        let returnVal = `({ ...res }) => undefined`;
        let reId = getSingleDefault(defaults);
        let final = convert(reId);
        expect(final).toBe(returnVal);
      });
    });
    describe('ObjectPattern', () => {
      it('should', () => {
        let defaults = `({ a, b }) => {}`;
        let returnVal = `({ a, b }) => undefined`;
        let reId = getSingleDefault(defaults);
        let final = convert(reId);
        expect(final).toBe(returnVal);
      });

      it('should handle assignment', () => {
        let defaults = `({ a = 24, b = 3 }) => {}`;
        let returnVal = `({ a = 24, b = 3 }) => undefined`;
        let reId = getSingleDefault(defaults);
        let final = convert(reId);
        expect(final).toBe(returnVal);
      });
    });
    describe('JSXElement', () => {
      it('resolve to a self-closing JSXElement with attributes', () => {
        let defaults = `<div a={3} b={4} />`;
        let reId = getSingleDefault(defaults);
        let final = convert(reId);
        expect(final).toBe(defaults);
      });
    });
    describe('intersection', () => {
      it('should return a string representation of an intersection type', () => {
        let prop = `true & false`;
        let final = getSingleProp(prop);
        expect(final).toBe(prop);
      });
    });
    describe('nullable', () => {
      it('should return a string representation of a nullable type value', () => {
        let prop = `{ b: ?string }`;
        let final = getSingleProp(prop);
        expect(final).toBe(prop);
      });
    });
    describe('typeof', () => {
      it('if no name property is present it should return a string representation of a typeof invocation', () => {
        let prop = `typeof 34`;
        let result = 'number';
        let final = getSingleProp(prop);
        expect(final).toBe(result);
      });
      it('if a name property is present, it should return a string representation of the id of the type', () => {
        let prop = 'typeof Foo';
        let final = getSingleProp(prop);
        expect(final).toBe(prop);
      });
    });
    describe('generic', () => {
      it('If type params exist it should return a string representation of a generic type with params', () => {
        let prop = `Array<string>`;
        let final = getSingleProp(prop);
        expect(final).toBe(prop);
      });
      it('If type params do not exist, it should return the name of the type as a string', () => {
        let prop = `Foo`;
        let final = getSingleProp(prop);
        expect(final).toBe(prop);
      });
    });
    describe('tuples', () => {
      it('Resolves down to a string representation of a tuple', () => {
        let prop = `[string, number]`;
        let final = getSingleTSPropTypes(prop);
        expect(final).toBe(`a: [string, number]`);
      });
    });
    describe('type params', () => {
      it('should return a string representation of a function type with type params', () => {
        let prop = '(<T>) => <T><string>';
        let file = `
        type Foo<T> = (bar: T) => T;
        class Component extends React.Component<{ a: Foo<string> }> {}
        `;
        let res = extractReactTypes(file, 'flow');
        let final = convert(res.classes[0].members[0].value);
        expect(final).toBe(prop);
      });
    });
  });
  describe('arrayType', () => {
    it('should convert the array syntax to a string', () => {
      let prop = `number[]`;
      let final = getSingleProp(prop);
      expect(final).toBe('Array of number');
    });
  });
  describe('import', () => {
    it('Resolves down to a string representation of an external import', () => {
      let file = `
        import { Component } from 'react';
        class Something extends React.Component<{ a: Component }> {}`;
      let res = extractReactTypes(file, 'flow').classes[0].members[0].value;
      let converted = convert(res);
      expect(converted).toBe('react.Component');
    });
    it.skip('Resolves down to a string representation for namespaced external imports', () => {
      let file = `
        import { Component } from 'react';
        import * as foo from 'bar';
        class Something extends Component<{ a: foo }> {}
      `;
      let res = extractReactTypes(file, 'flow').classes[0].members[0].value;
      let converted = convert(res);
      expect(converted).toBe('foo');
    });
  });
  describe('utilities', () => {
    describe('resolveLast', () => {});
  });
});
