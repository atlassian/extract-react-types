// @flow

/*::
import type {
  // These three types are to allow us to show unions of the below
  AnyKind,
  AnyTypeKind,
  AnyValueKind,
  // The below are base types in extract-react-types
  Any,
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
} from 'ert-types';
*/

const { resolveToLast, mapConvertAndJoin } = require('./utils');

const converters = {};

/*
  If the value here is undefined, we can safely assume that we're dealing with
  a BooleanTypeAnnotation and not a BooleanLiteralTypeAnnotation.
*/
converters.boolean = (type /*:Boolean*/) /*:string*/ =>
  type.value ? type.value.toString() : 'boolean';
/*
  If the value here is undefined, we can safely assume that we're dealing with
  a NumberTypeAnnotation and not a NumberLiteralTypeAnnotation.
*/
converters.number = (type /*:Number*/) /*:string*/ =>
  type.value ? type.value.toString() : 'number';
/*
  If the value here is undefined, we can safely assume that we're dealing with
  a StringTypeAnnotation and not a StringLiteralTypeAnnotation.
*/
converters.string = (type /*:any*/) /*:string*/ => `"${type.value.toString()}"`;
converters.custom = (type /*:any*/) /*:string*/ => type.value.toString();
converters.any = (type /*:AnyValueKind*/) /*:string*/ => type.value.toString();
converters.void = () /*:string*/ => 'undefined';
converters.mixed = (type /*:Mixed*/) /*:string*/ => type.value.toString();
converters.null = () /*:string*/ => 'null';
converters.unary = (type /*:Unary*/) /*:string*/ =>
  `${type.operator}${convert(type.argument)}`;

converters.id = (type /*:Id*/) /*:string*/ => {
  if (type.resolvedVal) {
    return convert(type.resolvedVal);
  }
  return type.name;
};

converters.JSXMemberExpression = (type /*:any*/) /*:string*/ => {
  return `${convert(type.object)}.${convert(type.property)}`;
};
converters.JSXExpressionContainer = (type /*:any*/) /*:string*/ => {
  return `{ ${convert(type.expression)} }`;
};

converters.JSXElement = (type /*:any*/) /*:string*/ => {
  return `<${convert(type.value.name)} ${type.value.attributes.map(attribute =>
    convert(attribute),
  )} />`;
};

converters.JSXIdentifier = (type /*:any*/) /*:string*/ => {
  return `${type.value}`;
};

converters.JSXAttribute = (type /*:any*/) /*:string*/ => {
  return `${convert(type.name)}= ${convert(type.value)}`;
};

converters.binary = (type /*:BinaryExpression*/) /*:string*/ => {
  const left = convert(type.left);
  const right = convert(type.right);
  return `${left} ${type.operator} ${right}`;
};

converters.function = (type /*:Func*/) /*:string*/ => {
  return `(${type.parameters.map(p => convert(p.value)).join(', ')}) => ${
    type.returnType
  }`;
};

converters.array = (type /*:ArrayExpression*/) /*:string*/ => {
  return `[${mapConvertAndJoin(type.elements)}]`;
};

converters.property = () => {
  console.error('The converting of properties should be handled by the containing data structure')
  return ''
}

converters.object = (type /*:Obj*/) /*:string*/ => {
  return `{ ${type.members
    .map(m => `${convert(m.key)}: ${m.value.defaultValue || convert(m.value)}`)
    .join(', ')} }`;
};

converters.memberExpression = (type /*:MemberExpression*/) /*:string*/ => {
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
};

converters.call = (type /*:Call*/) /*:string*/ => {
  return `${convert(type.callee)}(${mapConvertAndJoin(type.args)})`;
};

converters.new = (type /*:New*/) /*:string*/ => {
  const callee = convert(type.callee);
  const args = mapConvertAndJoin(type.args);
  return `new ${callee}(${args})`;
};

converters.external = (type /*:any*/) /*:string*/ => {
  if (type.importKind === 'value') {
    return `${type.moduleSpecifier}.${type.name}`;
  }
  // eslint-disable-next-line no-console
  console.warn('could not convert external', type);
  return '';
};

converters.variable = (type /*:Variable*/) /*:string*/ => {
  const val = type.declarations[type.declarations.length - 1];
  if (val.value) {
    return convert(val.value);
  }
  return convert(val.id);
};

converters.templateExpression = type => {
  return `${convert(type.tag)}`;
};

converters.templateLiteral = type => {
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
};

converters.templateElement = type => {
  return type.value.cooked.toString();
};

function convert(type /*:AnyKind*/) {
  const converter = converters[type.kind];
  if (!converter) {
    console.error('could not find converter for', type.kind);
  } else {
    return converter(type);
  }
  return '';
}

module.exports = convert;
