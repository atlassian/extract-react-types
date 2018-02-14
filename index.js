// @flow

/*::
import type {
  // These three types are to allow us to show unions of the below
  AnyKind,
  AnyTypeKind,
  AnyValueKind,
  // The below are base types in extract-react-types
  Any,
  Rest,
  ArrayExpression,
  AssignmentPattern,
  BinaryExpression,
  Boolean,
  Call,
  ClassKind,
  Exists,
  Func,
  Generic,
  Id,
  Import,
  Initial,
  Intersection,
  JSXAttribute,
  JSXElement,
  JSXExpressionContainer,
  JSXIdentifier,
  JSXMemberExpression,
  JSXOpeningElement,
  Literal,
  MemberExpression,
  Mixed,
  New,
  Null,
  Nullable,
  Number,
  Obj,
  ObjectPattern,
  Param,
  Program,
  Property,
  Spread,
  String,
  TemplateElement,
  TemplateExpression,
  TemplateLiteral,
  Tuple,
  Typeof,
  TypeParams,
  Unary,
  Union,
  Variable,
  Void,
} from 'extract-react-types/index.flow.js';

*/

const { resolveToLast } = require('./utils');

const unaryWhiteList = ['-', '+'];

function mapConvertAndJoin(array, joiner = ', ') {
  if (!Array.isArray(array)) return '';
  return array.map(convert).join(joiner);
}

const converters = {
  /*
  If the value here is undefined, we can safely assume that we're dealing with
  a BooleanTypeAnnotation and not a BooleanLiteralTypeAnnotation.
  */
  boolean: (type /*: Boolean*/, mode /*: string */) /*:string*/ =>
    type.value != null ? type.value.toString() : type.kind,
  exists: (type /*: Exists */, mode /*: string */) /*: string*/ => `*`,
  /*
    If the value here is undefined, we can safely assume that we're dealing with
    a NumberTypeAnnotation and not a NumberLiteralTypeAnnotation.
    */
  number: (type /*: Number*/, mode /*: string */) /*:string*/ =>
    type.value != null? type.value.toString() : type.kind,
  /*
  If the value here is undefined, we can safely assume that we're dealing with
  a StringTypeAnnotation and not a StringLiteralTypeAnnotation.
*/
  string: (type /*: String*/, mode /*: string */) /*:string*/ =>
    type.value != null ? `"${type.value.toString()}"` : type.kind,
  custom: (type /*:any*/, mode /*: string */) /*:string*/ => type.value.toString(),
  any: (type /*: Any*/, mode /*: string */) /*:string*/ => type.kind,
  void: (type /*: Void */, mode /*: string */) /*:string*/ => 'undefined',
  literal: (type /*: any */, mode /*: string */) /*: string*/ => `${type.kind}`,
  mixed: (type /*:Mixed*/, mode /*: string */) /*:string*/ => type.kind,
  null: (type /*: Null */, mode /*: string */) /*:string*/ => 'null',

  unary: (type /*:Unary*/, mode /*: string */) /*:string*/ => {
    let space = unaryWhiteList.includes(type.operator) ? '' : ' ';
    return `${type.operator}${space}${convert(type.argument)}`;
  },

  id: (type /*:Id*/, mode /*: string */) /*:string*/ => {
    return type.name;
  },

  JSXMemberExpression: (type /*:any*/, mode /*: string */) /*:string*/ => {
    return `${convert(type.object)}.${convert(type.property)}`;
  },
  JSXExpressionContainer: (type /*:any*/, mode /*: string */) /*:string*/ => {
    return `{${convert(type.expression)}}`;
  },
  JSXOpeningElement: (type /*JSXOpeningElement*/, mode /*: string */) /*:string*/ => {
    return `${convert(type.name)} ${mapConvertAndJoin(type.attributes, ' ')}`;
  },
  JSXElement: (type /*: JSXElement */, mode /*: string */) /*:string*/ => {
    return `<${convert(type.value)} />`;
  },

  JSXIdentifier: (type /*: JSXIdentifier */, mode /*: string */) /*:string*/ => {
    return `${type.value}`;
  },

  JSXAttribute: (type /*: JSXAttribute */, mode /*: string */) /*:string*/ => {
    return `${convert(type.name)}=${convert(type.value)}`;
  },

  binary: (type /*: BinaryExpression */, mode /*: string */) /*:string*/ => {
    const left = convert(type.left);
    const right = convert(type.right);
    return `${left} ${type.operator} ${right}`;
  },

  function: (type /*: Func */, mode /*: string */) /*:string*/ => {
    return `(${mapConvertAndJoin(type.parameters)}) => ${
      type.returnType === null ? 'undefined' : convert(type.returnType)
    }`;
  },
  /*
    TODO: Make this resolve members in a unique way that will allow us to
    handle property keys with no assigned value
  */
  objectPattern: (type /*: ObjectPattern */, mode /*: string */) /*: string */ => {
    // ({ a, b }) => undefined ({a: a, b: b}) => undefined
    // ({ a = 2, b }) => undefined  ({a: a = 2, b: b })=> undefined
    return `{ ${mapConvertAndJoin(type.members)} }`;
  },

  rest: (type /*: Rest */, mode /*: string */) /*: string */ => {
    return `...${convert(type.argument)}`;
  },

  assignmentPattern: (type /*: AssignmentPattern */, mode /*: string */) /*:string*/ => {
    return `${convert(type.left)} = ${convert(type.right)}`;
  },

  param: (type /*: Param */, mode /*: string */) /*: string */ => {
    // this will not hold once we have types
    return convert(type.value);
  },

  array: (type /*:ArrayExpression*/, mode /*: string */) /*:string*/ => {
    return `[${mapConvertAndJoin(type.elements)}]`;
  },

  spread: (type /*: Spread */, mode /*: string */) /*:string*/ => {
    return `...${convert(type.value)}`;
  },

  property: (type /*: Property */, mode /*: string */) /*:string*/ => {
    const sameId = type.key.kind === type.value.kind
      && type.key.name === type.value.name;

    const assignmentSameId = type.value.kind === 'assignmentPattern' && type.key.name === type.value.left.name;

    if (sameId) {
      // If both keys are IDs we're applying syntactic sugar
      return `${convert(type.key)}`;
    } else if (assignmentSameId) {
      // If the value is an assignment pattern with a left hand ID that is the same as our type.key, just return the resolved value.
      return `${convert(type.value)}`
    } else {
      return `${convert(type.key)}: ${convert(type.value)}`;
    }
  },

  object: (type /*:Obj*/, mode /*: string */) /*:string*/ => {
    return `{ ${mapConvertAndJoin(type.members)} }`;
  },

  memberExpression: (type /*:MemberExpression*/, mode /*: string */) /*:string*/ => {
    const object = resolveToLast(type.object);
    const property = convert(type.property);
    switch (object.kind) {
      case 'id':
        return `${convert(type.object)}.${property}`;
      case 'object':
        const mem = object.members.find(m => {
          if (typeof m.key !== 'string') {
            // Issue here is that convert(key) can result in either a String type or an Id type,
            // one returns the value wrapped in quotations, the other does not.
            // We're stripping the quotations so we can do an accurate match against the property which is always an Id
            return convert(m.key).replace(/"/g, '') === property;
          }
          return m.key === property;
        });
        if (mem && mem.value) {
          return convert(mem.value);
        } else {
          console.error(`${property} not found in ${convert(object)}`);
          return 'undefined';
        }
      default:
        console.error();
        return '';
    }
  },

  call: (type /*:Call*/, mode /*: string */) /*:string*/ => {
    return `${convert(type.callee)}(${mapConvertAndJoin(type.args)})`;
  },

  new: (type /*:New*/, mode /*: string */) /*:string*/ => {
    const callee = convert(type.callee);
    const args = mapConvertAndJoin(type.args);
    return `new ${callee}(${args})`;
  },

  external: (type /*:any*/, mode /*: string */) /*:string*/ => {
    if (type.importKind === 'value') {
      return `${type.moduleSpecifier}.${type.name}`;
    }
    // eslint-disable-next-line no-console
    console.warn('could not convert external', type);
    return '';
  },

  variable: (type /*:Variable*/, mode /*: string */) /*:string*/ => {
    const val = type.declarations[type.declarations.length - 1];
    if (val.value) {
      return convert(val.value);
    }
    return convert(val.id);
  },

  templateExpression: (type /*: TemplateExpression */, mode /*: string */) /*: string */ => {
    return `${convert(type.tag)}`;
  },

  templateLiteral: (type /*: TemplateLiteral */, mode /*: string */) /*: string */ => {
    let str = type.quasis.reduce(function(newStr, v, i) {
      let quasi = convert(v);
      newStr = `${newStr}${quasi}`;
      if (type.expressions[i]) {
        let exp = convert(type.expressions[i]);
        newStr = `${newStr}\${${exp}}`;
      }
      return newStr;
    }, '');
    return `\`${str}\``;
  },

  templateElement: (type /*: TemplateElement */, mode /*: string */) /*: string */ => {
    return type.value.cooked.toString();
  },

  // We should write these
  generic: (type /*: any */, mode /*: string */) /*: string*/ => {
    const typeParams = type.typeParams ? convert(type.typeParams) : '';
    const value = convert(type.value);
    return `${value}${typeParams}`;
  },
  intersection: (type /*: any */, mode /*: string */) /*: string*/ => `${mapConvertAndJoin(type.types, ' & ')}`,

  nullable: (type /*: any */, mode /*: string */) /*: string*/ => `?${convert(type.arguments)}`,
  typeParams: (type /*: TypeParams */, mode /*: string */) /*: string*/ =>   `<${mapConvertAndJoin(type.params, ', ')}>`,
  typeof: (type /*: Typeof */, mode /*: string */) /*: string*/ => {
    return type.name ? `typeof ${type.name}` : `${type.type.kind}`;
  },
  union: (type /*: any */, mode /*: string */) /*: string*/ => `${mapConvertAndJoin(type.types, ' | ')}`,

  // TS
  tuple: (type /*: any */, mode /*: string */) /*: string*/ => `[${mapConvertAndJoin(type.types)}]`,
};

function convert(type /*: any */, mode /*: string*/ = 'value') {
  const converter = converters[type.kind];
  if (!converter) {
    console.trace('could not find converter for', type.kind);
  } else {
    return converter(type);
  }
  return '';
}

module.exports = convert;
