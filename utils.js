
module.exports.resolveToLast = function resolveToLast (type/*: MemberExpression | Obj | Id*/) {
  switch (type.kind) {
    case 'id':
    case 'object':
      return type;
    case 'memberExpression':
      return resolveToLast(type.object);
    default:
      console.error('WHAT DID YOU GIVE ME?!');
      break;
  }
}

module.exports.mapConvertAndJoin = function mapConvertAndJoin (array, joiner = ',') {
  if (!Array.isArray(array)) return '';
  return array.map(convert).join(joiner);
};
