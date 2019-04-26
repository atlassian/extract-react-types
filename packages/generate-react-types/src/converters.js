// @flow
import * as t from '@babel/types';
import generate from '@babel/generator';

const id = (ertNode, convert) => t.identifier(ertNode.name);

const boolean = (ertNode, convert) => t.tsBooleanKeyword();

const program = (ertNode, convert) => {
  if (ertNode.component) {
    return t.program([
      t.importDeclaration(
        [t.importDefaultSpecifier(t.identifier('React'))],
        t.stringLiteral('react')
      ),
      t.exportNamedDeclaration(
        {
          ...t.variableDeclaration('var', [
            t.variableDeclarator({
              ...t.identifier(ertNode.component.name.name),
              typeAnnotation: t.tsTypeAnnotation(
                t.tsTypeReference(
                  t.tsQualifiedName(t.identifier('React'), t.identifier('ComponentType')),
                  t.tsTypeParameterInstantiation([
                    t.tsTypeLiteral(ertNode.component.members.map(n => convert(n, convert)))
                  ])
                )
              )
            })
          ]),
          declare: true
        },
        []
      )
    ]);
  }
  return t.program([]);
};

const property = (ertNode, convert) => {
  return t.tsPropertySignature(convert(ertNode.key), t.tsTypeAnnotation(convert(ertNode.value)));
};

const tsConverters = {
  boolean,
  program,
  property,
  id
};

// eslint-disable-next-line import/prefer-default-export
export const convertToTs = ertNode => {
  let convert = node => {
    return tsConverters[node.kind](node, convert);
  };
  return generate(convert(ertNode)).code;
};
