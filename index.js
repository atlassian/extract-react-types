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
  TypeParam,
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
  boolean: (type /*: Boolean*/) /*:string*/ =>
    type.value ? type.value.toString() : type.kind,
  /*
    If the value here is undefined, we can safely assume that we're dealing with
    a NumberTypeAnnotation and not a NumberLiteralTypeAnnotation.
    */
  number: (type /*: Number*/) /*:string*/ =>
    type.value ? type.value.toString() : type.kind,
  /*
  If the value here is undefined, we can safely assume that we're dealing with
  a StringTypeAnnotation and not a StringLiteralTypeAnnotation.
*/
  string: (type /*: String*/) /*:string*/ =>
    type.value ? `"${type.value.toString()}"` : type.kind,
  custom: (type /*:any*/) /*:string*/ => type.value.toString(),
  any: (type /*: Any*/) /*:string*/ => type.kind,
  void: () /*:string*/ => 'undefined',
  mixed: (type /*:Mixed*/) /*:string*/ => type.kind,
  null: () /*:string*/ => 'null',

  unary: (type /*:Unary*/) /*:string*/ => {
    let space = unaryWhiteList.includes(type.operator) ? '' : ' ';
    return `${type.operator}${space}${convert(type.argument)}`;
  },

  id: (type /*:Id*/) /*:string*/ => {
    return type.name;
  },

  JSXMemberExpression: (type /*:any*/) /*:string*/ => {
    return `${convert(type.object)}.${convert(type.property)}`;
  },
  JSXExpressionContainer: (type /*:any*/) /*:string*/ => {
    return `{ ${convert(type.expression)} }`;
  },

  JSXElement: (type /*: JSXElement */) /*:string*/ => {
    return `<${convert(type.value.name)} ${type.value.attributes.map(
      attribute => convert(attribute),
    )} />`;
  },

  JSXIdentifier: (type /*: JSXIdentifier */) /*:string*/ => {
    return `${type.value}`;
  },

  JSXAttribute: (type /*: JSXAttribute */) /*:string*/ => {
    return `${convert(type.name)}= ${convert(type.value)}`;
  },

  binary: (type /*: BinaryExpression */) /*:string*/ => {
    const left = convert(type.left);
    const right = convert(type.right);
    return `${left} ${type.operator} ${right}`;
  },

  function: (type /*: Func */) /*:string*/ => {
    return `(${mapConvertAndJoin(type.parameters)}) => ${
      type.returnType === null ? 'undefined' : convert(type.returnType)
    }`;
  },

  objectPattern: (type /*: ObjectPattern */) => {
    return `{ ${mapConvertAndJoin(type.members)} }`;
  },

  rest: (type /*: Rest */) => {
    return `...${convert(type.argument)}`;
  },

  assignmentPattern: (type /*: AssignmentPattern */) /*:string*/ => {
    return `${convert(type.left)} = ${convert(type.right)}`;
  },

  param: (type /*: Param */) => {
    // this will not hold once we have types
    return convert(type.value);
  },

  array: (type /*:ArrayExpression*/) /*:string*/ => {
    return `[${mapConvertAndJoin(type.elements)}]`;
  },

  spread: (type /*: Spread */) /*:string*/ => {
    return `...${convert(type.value)}`;
  },

  property: (type /*: Property */) /*:string*/ => {
    return `${convert(type.key)}: ${convert(type.value)}`;
  },

  object: (type /*:Obj*/) /*:string*/ => {
    return `{ ${mapConvertAndJoin(type.members)} }`;
  },

  memberExpression: (type /*:MemberExpression*/) /*:string*/ => {
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

  call: (type /*:Call*/) /*:string*/ => {
    return `${convert(type.callee)}(${mapConvertAndJoin(type.args)})`;
  },

  new: (type /*:New*/) /*:string*/ => {
    const callee = convert(type.callee);
    const args = mapConvertAndJoin(type.args);
    return `new ${callee}(${args})`;
  },

  external: (type /*:any*/) /*:string*/ => {
    if (type.importKind === 'value') {
      return `${type.moduleSpecifier}.${type.name}`;
    }
    // eslint-disable-next-line no-console
    console.warn('could not convert external', type);
    return '';
  },

  variable: (type /*:Variable*/) /*:string*/ => {
    const val = type.declarations[type.declarations.length - 1];
    if (val.value) {
      return convert(val.value);
    }
    return convert(val.id);
  },

  templateExpression: (type /*: TemplateExpression */) => {
    return `${convert(type.tag)}`;
  },

  templateLiteral: (type /*: TemplateLiteral */) => {
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

  templateElement: (type /*: TemplateElement */) => {
    return type.value.cooked.toString();
  },

  // We should write these
  JSXOpeningElement: (type /*: any */) /*: string*/ => '',
  ObjectPattern: (type /*: any */) /*: string*/ => '',
  class: (type /*: any */) /*: string*/ => '',
  exists: (type /*: any */) /*: string*/ => '',
  generic: (type /*: any */) /*: string*/ => '',
  import: (type /*: any */) /*: string*/ => '',
  intersection: (type /*: any */) /*: string*/ => '',
  literal: (type /*: any */) /*: string*/ => '',
  nullable: (type /*: any */) /*: string*/ => '',
  program: (type /*: any */) /*: string*/ => '',
  tuple: (type /*: any */) /*: string*/ => '',
  typeParam: (type /*: any */) /*: string*/ => '',
  typeof: (type /*: any */) /*: string*/ => '',
  union: (type /*: any */) /*: string*/ => '',
};

function convert(type /*: any */) {
  const converter = converters[type.kind];
  if (!converter) {
    console.trace('could not find converter for', type.kind);
  } else {
    return converter(type);
  }
  return '';
}

module.exports = convert;
