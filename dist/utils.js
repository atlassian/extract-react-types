'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.resolveToLast = resolveToLast;
exports.resolveFromGeneric = resolveFromGeneric;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function resolveToLast(type /*: MemberExpression | Obj | Id*/) {
  switch (type.kind) {
    case 'id':
    case 'object':
    case 'import':
      return type;
    case 'memberExpression':
      return resolveToLast(type.object);
    default:
      console.error('Unexpected initial type of member expression', (0, _stringify2.default)(type));
      break;
  }
}

function resolveFromGeneric(type) {
  if (type.kind !== 'generic') return type;
  if (type.typeParams) {
    // If a generic type is an Array, we don't want to just return the value,
    // But also the entire type object, so we can parse the typeParams later on.
    return type;
  }
  if (type.value.kind === 'generic') {
    return resolveFromGeneric(type.value);
  }
  return type.value;
}