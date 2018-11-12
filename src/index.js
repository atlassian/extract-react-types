// @flow

/*::
import * as K from 'extract-react-types'
*/

import { resolveToLast, resolveFromGeneric, reduceToObj } from './utils';

const unaryWhiteList = ['-', '+', '!'];

function mapConvertAndJoin(array, joiner = ', ') {
  if (!Array.isArray(array)) return '';
  return array.map(a => convert(a)).join(joiner);
}

function getKind(type: K.AnyKind) {
  switch (type.kind) {
    case 'nullable':
      return `nullable ${getKind(type.arguments)}`;
    case 'id':
      return convert(type);
    case 'exists':
    case 'typeof':
      return convert(type);
    case 'generic': {
      if (type.typeParams) {
        let typeParams = type.typeParams.params.map(getKind).join(', ');
        return `${convert(type.value)}<${typeParams}>`;
      }
      return getKind(resolveFromGeneric(type));
    }
    default:
      return type.kind;
  }
}

const converters = {
  /*
  If the value here is undefined, we can safely assume that we're dealing with
  a BooleanTypeAnnotation and not a BooleanLiteralTypeAnnotation.
  */
  boolean: (type /*: K.Boolean*/, mode /*: string */) /*:string*/ =>
    type.value != null ? type.value.toString() : type.kind,
  exists: (type /*: K.Exists */, mode /*: string */) /*: '*' */ => `*`,
  /*
    If the value here is undefined, we can safely assume that we're dealing with
    a NumberTypeAnnotation and not a NumberLiteralTypeAnnotation.
    */
  number: (type /*: K.Number*/, mode /*: string */) /*:string*/ =>
    type.value != null ? type.value.toString() : type.kind,
  /*
  If the value here is undefined, we can safely assume that we're dealing with
  a StringTypeAnnotation and not a StringLiteralTypeAnnotation.
*/
  string: (type /*: K.String*/, mode /*: string */) /*:string*/ =>
    type.value != null ? `"${type.value.toString()}"` : type.kind,
  custom: (type /*:any*/, mode /*: string */) /*:string*/ =>
    type.value.toString(),
  any: (type /*: K.Any*/, mode /*: string */) /*:string*/ => type.kind,
  void: (type /*: K.Void */, mode /*: string */) /*: 'undefined' */ =>
    'undefined',
  literal: (type /*: any */, mode /*: string */) /*: string*/ => `${type.kind}`,
  mixed: (type /*: K.Mixed*/, mode /*: string */) /*:string*/ => type.kind,
  null: (type /*: K.Null */, mode /*: string */) /*: 'null' */ => 'null',

  unary: (type /*: K.Unary*/, mode /*: string */) /*:string*/ => {
    let space = unaryWhiteList.includes(type.operator) ? '' : ' ';
    return `${type.operator}${space}${convert(type.argument)}`;
  },

  id: (type /*: K.Id*/, mode /*: string */) /*:string*/ => {
    return type.name;
  },

  JSXMemberExpression: (type /*:any*/, mode /*: string */) /*:string*/ => {
    return `${convert(type.object)}.${convert(type.property)}`;
  },
  JSXExpressionContainer: (type /*:any*/, mode /*: string */) /*:string*/ => {
    return `{${convert(type.expression)}}`;
  },
  JSXOpeningElement: (
    type /*JSXOpeningElement*/,
    mode /*: string */,
  ) /*:string*/ => {
    return `${convert(type.name)} ${mapConvertAndJoin(type.attributes, ' ')}`;
  },
  JSXElement: (type /*: K.JSXElement */, mode /*: string */) /*:string*/ => {
    return `<${convert(type.value)} />`;
  },

  JSXIdentifier: (
    type /*: K.JSXIdentifier */,
    mode /*: string */,
  ) /*:string*/ => {
    return `${type.value}`;
  },

  JSXAttribute: (
    type /*: K.JSXAttribute */,
    mode /*: string */,
  ) /*:string*/ => {
    return `${convert(type.name)}=${convert(type.value)}`;
  },

  binary: (type /*: K.BinaryExpression */, mode /*: string */) /*:string*/ => {
    const left = convert(type.left);
    const right = convert(type.right);
    return `${left} ${type.operator} ${right}`;
  },

  function: (type /*: K.Func */, mode /*: string */) /*:string*/ => {
    return `(${mapConvertAndJoin(type.parameters)}) => ${
      type.returnType === null ? 'undefined' : convert(type.returnType)
    }`;
  },
  /*
    TODO: Make this resolve members in a unique way that will allow us to
    handle property keys with no assigned value
  */
  objectPattern: (
    type /*: K.ObjectPattern */,
    mode /*: string */,
  ) /*: string */ => {
    // ({ a, b }) => undefined ({a: a, b: b}) => undefined
    // ({ a = 2, b }) => undefined  ({a: a = 2, b: b })=> undefined
    return `{ ${mapConvertAndJoin(type.members)} }`;
  },

  rest: (type /*: K.Rest */, mode /*: string */) /*: string */ => {
    return `...${convert(type.argument)}`;
  },

  assignmentPattern: (
    type /*: K.AssignmentPattern */,
    mode /*: string */,
  ) /*:string*/ => {
    return `${convert(type.left)} = ${convert(type.right)}`;
  },

  param: (type /*: K.Param */, mode /*: string */) /*: string */ => {
    // this will not hold once we have types
    return convert(type.value);
  },

  array: (type /*: K.ArrayExpression*/, mode /*: string */) /*:string*/ => {
    return `[${mapConvertAndJoin(type.elements)}]`;
  },

  arrayType: (type /*: K.ArrayType*/, mode /*: string */) /*:string*/ => {
    return `Array of ${convert(type.type)}`;
  },

  spread: (type /*: K.Spread */, mode /*: string */) /*:string*/ => {
    return `...${convert(type.value)}`;
  },

  property: (type /*: K.Property */, mode /*: string */) /*:string*/ => {
    const sameId =
      type.key.kind === 'id' &&
      type.value.kind === 'id' &&
      type.key.name === type.value.name;

    const assignmentSameId =
      type.value.kind === 'assignmentPattern' &&
      type.key.kind === 'id' &&
      type.value.left.kind === 'id' &&
      type.key.name === type.value.left.name;

    if (sameId) {
      // If both keys are IDs we're applying syntactic sugar
      return `${convert(type.key)}`;
    } else if (assignmentSameId) {
      // If the value is an assignment pattern with a left hand ID that is the same as our type.key, just return the resolved value.
      return `${convert(type.value)}`;
    } else {
      return `${convert(type.key)}: ${convert(type.value)}`;
    }
  },

  object: (type /*: K.Obj*/, mode /*: string */) /*:string*/ => {
    if (type.members.length === 0) return `{}`;
    return `{ ${mapConvertAndJoin(type.members)} }`;
  },

  memberExpression: (
    type /*: K.MemberExpression*/,
    mode /*: string */,
  ) /*:string*/ => {
    const object = resolveToLast(type.object);
    const property = convert(type.property);

    if (!object) {
      console.error('Object property does not exist on this member expression');
      return '';
    }

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
      case 'import':
        return `${convert(type.object)}.${property}`;
      default:
        console.error('failed to resolve member expression');
        return '';
    }
  },

  call: (type /*: K.Call*/, mode /*: string */) /*:string*/ => {
    let callSignature = '';
    if (type.callee.referenceIdName) {
      callSignature = type.callee.referenceIdName;
    } else if (type.callee.id) {
      callSignature = convert(type.callee.id);
    } else {
      callSignature = convert(type.callee);
    }
    // $FlowFixMe - this is incorrectly reading type.callee.referenceIdName as possibly not a string.
    return `${callSignature}(${mapConvertAndJoin(type.args)})`;
  },

  new: (type /*: K.New*/, mode /*: string */) /*:string*/ => {
    const callee = convert(type.callee);
    const args = mapConvertAndJoin(type.args);
    return `new ${callee}(${args})`;
  },

  variable: (type /*: K.Variable*/, mode /*: string */) /*:string*/ => {
    const val = type.declarations[type.declarations.length - 1];
    if (val.value) {
      return convert(val.value);
    }
    return convert(val.id);
  },

  templateExpression: (
    type /*: K.TemplateExpression */,
    mode /*: string */,
  ) /*: string */ => {
    return `${convert(type.tag)}`;
  },

  templateLiteral: (
    type /*: K.TemplateLiteral */,
    mode /*: string */,
  ) /*: string */ => {
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

  templateElement: (
    type /*: K.TemplateElement */,
    mode /*: string */,
  ) /*: string */ => {
    return type.value.cooked.toString();
  },
  class: (type /*: K.ClassKind */, mode /*: string */) /*: string */ => {
    return convert(type.name);
  },
  // We should write these
  generic: (type /*: K.Generic */, mode /*: string */) /*: string*/ => {
    const typeParams = type.typeParams ? convert(type.typeParams) : '';
    const value = convert(type.value);
    return `${value}${typeParams}`;
  },
  intersection: (type /*: K.Intersection */, mode /*: string */) /*: string*/ =>
    `${mapConvertAndJoin(type.types, ' & ')}`,

  nullable: (type /*: K.Nullable */, mode /*: string */) /*: string*/ =>
    `?${convert(type.arguments)}`,
  typeParams: (type /*: K.TypeParams */, mode /*: string */) /*: string*/ =>
    `<${mapConvertAndJoin(type.params, ', ')}>`,
  typeof: (type /*: K.Typeof */, mode /*: string */) /*: string*/ => {
    return type.name ? `typeof ${type.name}` : `${type.type.kind}`;
  },
  union: (type /*: K.Union */, mode /*: string */) /*: string*/ =>
    `${mapConvertAndJoin(type.types, ' | ')}`,
  import: (type /*: K.Import */, mode /*: string */) /*: string*/ => {
    if (type.name === 'default') {
      return `${type.moduleSpecifier}`;
    } else {
      return `${type.moduleSpecifier}.${type.name}`;
    }
  },
  export: (type /*: K.Export */, mode /*: string */) /*: string*/ => {
    if (type.exports.length === 1) {
      return convert(type.exports[0]);
    } else {
      console.warn(
        `kind2string has received an export type with multiple exports, and have no way of printing this.
The exports we found were: ${type.exports
          .map(xport => convert(xport, mode))
          .join(', ')}
from file: ${convert(type.source, mode)}`,
      );
      return '';
    }
  },
  exportSpecifier: (type, mode) => convert(type.exported),

  // TS
  tuple: (type /*: K.Tuple */, mode /*: string */) /*: string*/ =>
    `[${mapConvertAndJoin(type.types)}]`,
};

function convert(type /*: any */, mode /*: string*/ = 'value') {
  if (!type) {
    console.error('No type argument has been passed in');
    return '';
  }

  const converter = converters[type.kind];
  if (!converter) {
    if (!type.kind) {
      console.error('convert was passed an object without a kind', type);
    } else {
      console.error('could not find converter for', type.kind);
    }
  } else {
    return converter(type);
  }
  return '';
}

export default convert;
export { getKind, resolveFromGeneric, reduceToObj };
