export function hasTypeAnnotation(path, left, right) {
  if (!path.isVariableDeclarator() || !path.node.id.typeAnnotation) {
    return false;
  }

  const { typeName, typeParameters } = path.node.id.typeAnnotation.typeAnnotation;

  if (!typeParameters) return false;

  if (
    (typeName.left && typeName.left.name === left && typeName.right.name === right) ||
    ((right && typeName.name === right) || typeName.name === left)
  ) {
    return true;
  }

  return false;
}
