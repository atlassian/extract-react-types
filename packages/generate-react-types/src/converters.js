// @flow
import * as t from '@babel/types';
import generate from '@babel/generator';

const id = (ertNode, convert) => t.identifier(ertNode.name);

const boolean = (ertNode, convert) => t.tsBooleanKeyword();

const generic = (ertNode, convert) => convert(ertNode.value);

const object = (ertNode, convert) => {
  return t.tsTypeLiteral(ertNode.members.map(n => convert(n, convert)));
};

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
              ...convert(ertNode.component.name, convert),
              typeAnnotation: t.tsTypeAnnotation(
                t.tsTypeReference(
                  t.tsQualifiedName(t.identifier('React'), t.identifier('ComponentType')),
                  t.tsTypeParameterInstantiation([convert(ertNode.component, convert)])
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
  return {
    ...t.tsPropertySignature(convert(ertNode.key), t.tsTypeAnnotation(convert(ertNode.value))),
    optional: !!ertNode.default
  };
};

const string = (ertNode, convert) => t.tsStringKeyword();

const tsConverters = {
  boolean,
  id,
  generic,
  object,
  program,
  property,
  string
};

// eslint-disable-next-line import/prefer-default-export
export const convertToTs = ertNode => {
  let convert = node => {
    return tsConverters[node.kind](node, convert);
  };
  return generate(convert(ertNode)).code;
};
