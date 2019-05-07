// @flow
import * as t from '@babel/types';
import generate from '@babel/generator';

const tsConverters = {
  boolean: () => t.tsBooleanKeyword(),

  function(ertNode, convert) {
    // TODO: can't decide whether this is a function type or function value
    return t.tsFunctionType(
      // t.tsTypeParameterDeclaration([]),
      null,
      ertNode.parameters.map(p => convert(p, convert)),
      t.tsTypeAnnotation(convert(ertNode.returnType))
    );
  },

  generic(ertNode, convert) {
    return convert(ertNode.value);
  },

  id(ertNode) {
    return t.identifier(ertNode.name);
  },

  import(ertNode, convert) {
    if (ertNode.moduleSpecifier === 'react') {
      return t.tsTypeReference(
        t.tsQualifiedName(t.identifier('React'), t.identifier(ertNode.referenceIdName))
      );
    }
    throw 'cannot convert import';
  },

  number: () => {
    return t.tsNumberKeyword();
  },

  object: (ertNode, convert) => {
    return t.tsTypeLiteral(ertNode.members.map(n => convert(n, convert)));
  },

  param(ertNode, convert) {
    return {
      ...t.identifier('TODO'),
      typeAnnotation: t.tsTypeAnnotation(convert(ertNode.value))
    };
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

  string: ertNode => {
    return ertNode.value ? t.tsLiteralType(t.stringLiteral(ertNode.value)) : t.tsStringKeyword();
  },

  typeParamsDeclaration(ertNode, convert) {
    return convert(ertNode.params.find(p => p.name === ertNode.referenceIdName));
  },

  typeParam(ertNode, convert) {
    return t.tsTypeReference(t.identifier(ertNode.name));
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
    console.error(node);
    throw `Cannot process type: ${node.kind} right now`;
  };

  return generate(convert(ertNode)).code;
};
