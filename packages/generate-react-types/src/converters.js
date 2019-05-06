// @flow
import * as t from '@babel/types';
import generate from '@babel/generator';

const tsConverters = {
  id: ertNode => t.identifier(ertNode.name),

  boolean: () => t.tsBooleanKeyword,

  generic: (ertNode, convert) => convert(ertNode.value),

  object: (ertNode, convert) => {
    return t.tsTypeLiteral(ertNode.members.map(n => convert(n, convert)));
  },

  program: (ertNode, convert) => {
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
  },

  property: (ertNode, convert) => {
    return {
      ...t.tsPropertySignature(convert(ertNode.key), t.tsTypeAnnotation(convert(ertNode.value))),
      optional: !!ertNode.default
    };
  },

  string: () => {
    return t.tsStringKeyword();
  },

  number: () => {
    return t.tsNumberKeyword();
  },

  union: (ertNode, convert) => {
    const types = ertNode.types.map(type => convert(type, convert));
    return t.tsUnionType(types);
  }
};

// eslint-disable-next-line import/prefer-default-export
export const convertToTs = ertNode => {
  let convert = node => {
    if (node.kind in tsConverters) {
      return tsConverters[node.kind](node, convert);
    }
    // eslint-disable-next-line no-console
    console.error(`Cannot process type: ${node.kind} right now`);
  };

  return generate(convert(ertNode)).code;
};
