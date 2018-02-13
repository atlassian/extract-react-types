// @flow
const convert = require('./index');
const { resolveToLast } = require('./utils');
const extractReactTypes = require('extract-react-types');

const assembleERTAST = (propTypes, defaultProps, type = 'flow') => {
  let file = `
class Component extends React.Component<${propTypes}> {
  defaultProps = ${defaultProps}
}`;
  let res = extractReactTypes(file, type);
  return res.classes[0].members;
};

const getSingleDefault = (defaultPropVal, type) => {
  return assembleERTAST(`{ a: any }`, `{ a: ${defaultPropVal} }`)[0].default;
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
      it.only('should handle a spread', () => {
        let defaults = `({ ...res }) => {}`;
        let returnVal = `(a = () => undefined) => undefined`;
        let reId = getSingleDefault(defaults);
        let final = convert(reId);
        expect(final).toBe(returnVal);
      });
    });
  });
  describe('utilities', () => {
    describe('resolveLast', () => {});
  });
});
