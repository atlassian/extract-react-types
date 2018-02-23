'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveFromGeneric = exports.getKind = undefined;

var _utils = require('./utils');

var unaryWhiteList = ['-', '+'];

/*::
import * as K from 'extract-react-types'
*/

function mapConvertAndJoin(array) {
  var joiner = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ', ';

  if (!Array.isArray(array)) return '';
  return array.map(function (a) {
    return convert(a);
  }).join(joiner);
}

function getKind(type) {
  switch (type.kind) {
    case 'nullable':
      return 'nullable ' + getKind(type.arguments);
    case 'id':
      return convert(type);
    case 'exists':
    case 'typeof':
      return convert(type);
    case 'generic':
      {
        if (type.typeParams) {
          return convert(type.value) + '<' + type.typeParams.params.map(getKind).join(', ') + '>';
        }
        return getKind((0, _utils.resolveFromGeneric)(type));
      }
    default:
      return type.kind;
  }
}

var converters = {
  /*
  If the value here is undefined, we can safely assume that we're dealing with
  a BooleanTypeAnnotation and not a BooleanLiteralTypeAnnotation.
  */
  boolean: function boolean(type /*: K.Boolean*/, mode /*: string */) {
    return (/*:string*/type.value != null ? type.value.toString() : type.kind
    );
  },
  exists: function exists(type /*: K.Exists */, mode /*: string */) {
    return (/*: '*' */'*'
    );
  },
  /*
    If the value here is undefined, we can safely assume that we're dealing with
    a NumberTypeAnnotation and not a NumberLiteralTypeAnnotation.
    */
  number: function number(type /*: K.Number*/, mode /*: string */) {
    return (/*:string*/type.value != null ? type.value.toString() : type.kind
    );
  },
  /*
  If the value here is undefined, we can safely assume that we're dealing with
  a StringTypeAnnotation and not a StringLiteralTypeAnnotation.
  */
  string: function string(type /*: K.String*/, mode /*: string */) {
    return (/*:string*/type.value != null ? '"' + type.value.toString() + '"' : type.kind
    );
  },
  custom: function custom(type /*:any*/, mode /*: string */) {
    return (/*:string*/type.value.toString()
    );
  },
  any: function any(type /*: K.Any*/, mode /*: string */) {
    return (/*:string*/type.kind
    );
  },
  void: function _void(type /*: K.Void */, mode /*: string */) {
    return (/*: 'undefined' */'undefined'
    );
  },
  literal: function literal(type /*: any */, mode /*: string */) {
    return (/*: string*/'' + type.kind
    );
  },
  mixed: function mixed(type /*: K.Mixed*/, mode /*: string */) {
    return (/*:string*/type.kind
    );
  },
  null: function _null(type /*: K.Null */, mode /*: string */) {
    return (/*: 'null' */'null'
    );
  },

  unary: function unary(type /*: K.Unary*/, mode /*: string */) /*:string*/{
    var space = unaryWhiteList.includes(type.operator) ? '' : ' ';
    return '' + type.operator + space + convert(type.argument);
  },

  id: function id(type /*: K.Id*/, mode /*: string */) /*:string*/{
    return type.name;
  },

  JSXMemberExpression: function JSXMemberExpression(type /*:any*/, mode /*: string */) /*:string*/{
    return convert(type.object) + '.' + convert(type.property);
  },
  JSXExpressionContainer: function JSXExpressionContainer(type /*:any*/, mode /*: string */) /*:string*/{
    return '{' + convert(type.expression) + '}';
  },
  JSXOpeningElement: function JSXOpeningElement(type /*JSXOpeningElement*/
  , mode /*: string */
  ) /*:string*/{
    return convert(type.name) + ' ' + mapConvertAndJoin(type.attributes, ' ');
  },
  JSXElement: function JSXElement(type /*: K.JSXElement */, mode /*: string */) /*:string*/{
    return '<' + convert(type.value) + ' />';
  },

  JSXIdentifier: function JSXIdentifier(type /*: K.JSXIdentifier */
  , mode /*: string */
  ) /*:string*/{
    return '' + type.value;
  },

  JSXAttribute: function JSXAttribute(type /*: K.JSXAttribute */
  , mode /*: string */
  ) /*:string*/{
    return convert(type.name) + '=' + convert(type.value);
  },

  binary: function binary(type /*: K.BinaryExpression */, mode /*: string */) /*:string*/{
    var left = convert(type.left);
    var right = convert(type.right);
    return left + ' ' + type.operator + ' ' + right;
  },

  function: function _function(type /*: K.Func */, mode /*: string */) /*:string*/{
    return '(' + mapConvertAndJoin(type.parameters) + ') => ' + (type.returnType === null ? 'undefined' : convert(type.returnType));
  },
  /*
    TODO: Make this resolve members in a unique way that will allow us to
    handle property keys with no assigned value
  */
  objectPattern: function objectPattern(type /*: K.ObjectPattern */
  , mode /*: string */
  ) /*: string */{
    // ({ a, b }) => undefined ({a: a, b: b}) => undefined
    // ({ a = 2, b }) => undefined  ({a: a = 2, b: b })=> undefined
    return '{ ' + mapConvertAndJoin(type.members) + ' }';
  },

  rest: function rest(type /*: K.Rest */, mode /*: string */) /*: string */{
    return '...' + convert(type.argument);
  },

  assignmentPattern: function assignmentPattern(type /*: K.AssignmentPattern */
  , mode /*: string */
  ) /*:string*/{
    return convert(type.left) + ' = ' + convert(type.right);
  },

  param: function param(type /*: K.Param */, mode /*: string */) /*: string */{
    // this will not hold once we have types
    return convert(type.value);
  },

  array: function array(type /*: K.ArrayExpression*/, mode /*: string */) /*:string*/{
    return '[' + mapConvertAndJoin(type.elements) + ']';
  },

  spread: function spread(type /*: K.Spread */, mode /*: string */) /*:string*/{
    return '...' + convert(type.value);
  },

  property: function property(type /*: K.Property */, mode /*: string */) /*:string*/{
    var sameId = type.key.kind === 'id' && type.value.kind === 'id' && type.key.name === type.value.name;

    var assignmentSameId = type.value.kind === 'assignmentPattern' && type.key.kind === 'id' && type.value.left.kind === 'id' && type.key.name === type.value.left.name;

    if (sameId) {
      // If both keys are IDs we're applying syntactic sugar
      return '' + convert(type.key);
    } else if (assignmentSameId) {
      // If the value is an assignment pattern with a left hand ID that is the same as our type.key, just return the resolved value.
      return '' + convert(type.value);
    } else {
      return convert(type.key) + ': ' + convert(type.value);
    }
  },

  object: function object(type /*: K.Obj*/, mode /*: string */) /*:string*/{
    if (type.members.length === 0) return '{}';
    return '{ ' + mapConvertAndJoin(type.members) + ' }';
  },

  memberExpression: function memberExpression(type /*: K.MemberExpression*/
  , mode /*: string */
  ) /*:string*/{
    var object = (0, _utils.resolveToLast)(type.object);
    var property = convert(type.property);

    if (!object) {
      console.error('Object property does not exist on this member expression');
      return '';
    }

    switch (object.kind) {
      case 'id':
        return convert(type.object) + '.' + property;
      case 'object':
        var mem = object.members.find(function (m) {
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
          console.error(property + ' not found in ' + convert(object));
          return 'undefined';
        }
      case 'import':
        return convert(type.object) + '.' + property;
      default:
        console.error('failed to resolve member expression');
        return '';
    }
  },

  call: function call(type /*: K.Call*/, mode /*: string */) /*:string*/{
    return convert(type.callee) + '(' + mapConvertAndJoin(type.args) + ')';
  },

  new: function _new(type /*: K.New*/, mode /*: string */) /*:string*/{
    var callee = convert(type.callee);
    var args = mapConvertAndJoin(type.args);
    return 'new ' + callee + '(' + args + ')';
  },

  variable: function variable(type /*: K.Variable*/, mode /*: string */) /*:string*/{
    var val = type.declarations[type.declarations.length - 1];
    if (val.value) {
      return convert(val.value);
    }
    return convert(val.id);
  },

  templateExpression: function templateExpression(type /*: K.TemplateExpression */
  , mode /*: string */
  ) /*: string */{
    return '' + convert(type.tag);
  },

  templateLiteral: function templateLiteral(type /*: K.TemplateLiteral */
  , mode /*: string */
  ) /*: string */{
    var str = type.quasis.reduce(function (newStr, v, i) {
      var quasi = convert(v);
      newStr = '' + newStr + quasi;
      if (type.expressions[i]) {
        var exp = convert(type.expressions[i]);
        newStr = newStr + '${' + exp + '}';
      }
      return newStr;
    }, '');
    return '`' + str + '`';
  },

  templateElement: function templateElement(type /*: K.TemplateElement */
  , mode /*: string */
  ) /*: string */{
    return type.value.cooked.toString();
  },

  // We should write these
  generic: function generic(type /*: K.Generic */, mode /*: string */) /*: string*/{
    var typeParams = type.typeParams ? convert(type.typeParams) : '';
    var value = convert(type.value);
    return '' + value + typeParams;
  },
  intersection: function intersection(type /*: K.Intersection */, mode /*: string */) {
    return (/*: string*/'' + mapConvertAndJoin(type.types, ' & ')
    );
  },

  nullable: function nullable(type /*: K.Nullable */, mode /*: string */) {
    return (/*: string*/'?' + convert(type.arguments)
    );
  },
  typeParams: function typeParams(type /*: K.TypeParams */, mode /*: string */) {
    return (/*: string*/'<' + mapConvertAndJoin(type.params, ', ') + '>'
    );
  },
  typeof: function _typeof(type /*: K.Typeof */, mode /*: string */) /*: string*/{
    return type.name ? 'typeof ' + type.name : '' + type.type.kind;
  },
  union: function union(type /*: K.Union */, mode /*: string */) {
    return (/*: string*/'' + mapConvertAndJoin(type.types, ' | ')
    );
  },
  import: function _import(type /*: K.Import */, mode /*: string */) /*: string*/{
    if (type.name === 'default') {
      return '' + type.moduleSpecifier;
    } else {
      return type.moduleSpecifier + '.' + type.name;
    }
  },

  // TS
  tuple: function tuple(type /*: K.Tuple */, mode /*: string */) {
    return (/*: string*/'[' + mapConvertAndJoin(type.types) + ']'
    );
  }
};

function convert(type /*: any */) {
  var mode /*: string*/ = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'value';

  if (!type) {
    console.error('No type argument has been passed in');
    return '';
  }

  var converter = converters[type.kind];
  if (!converter) {
    console.error('could not find converter for', type.kind);
  } else {
    return converter(type);
  }
  return '';
}

exports.default = convert;
exports.getKind = getKind;
exports.resolveFromGeneric = _utils.resolveFromGeneric;