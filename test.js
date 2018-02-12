const convert = require('./index');
const { resolveToLast } = require('./utils');
const extractReactTypes = require('extract-react-types');
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
  });
  describe('utilities', () => {
    describe('resolveLast', () => {});
  });
});
