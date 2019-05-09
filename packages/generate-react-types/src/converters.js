// @flow
import * as t from '@babel/types';
import generate from '@babel/generator';

type ErtNode = { [string]: any };

type BabelNode = { [string]: any };

type Substitution = { [id: string]: ErtNode };

const addSubst = (subst: Substitution, id: string, value: ErtNode): Substitution => ({
  ...subst,
  [id]: value
});

const hasSubst = (subst: Substitution, id: string) => !!subst[id];

const getSubst = (subst: Substitution, id: string) => subst[id];

type State = {
  substitutions: Substitution
};

const initialState = () => ({
  substitutions: {}
});

type Converter = (ErtNode, State, Converter) => BabelNode;

const tsConverters = {
  boolean: () => t.tsBooleanKeyword(),

  function(ertNode, state, convert) {
    // TODO: can't decide whether this is a function type or function value
    return t.tsFunctionType(
      // t.tsTypeParameterDeclaration([]),
      null,
      ertNode.parameters.map(p => convert(p, state)),
      t.tsTypeAnnotation(convert(ertNode.returnType, state))
    );
  },

  generic(ertNode, state, convert) {
    // // Replace with these types
    if (ertNode.typeParams) {
      return convert(ertNode.value, {
        ...state,
        substitutions: ertNode.typeParams.params.reduce(
          (subst, tyParam, i) => addSubst(subst, ertNode.value.typeParams.params[i].name, tyParam),
          state.substitutions
        )
      });
    }
    // do I need to replace myself?
    if (hasSubst(state.substitutions, ertNode.value.referenceIdName)) {
      return convert(getSubst(state.substitutions, ertNode.value.referenceIdName), state);
    }
    return convert(ertNode.value, state);
  },

  id(ertNode) {
    return t.identifier(ertNode.name);
  },

  import(ertNode, state, convert) {
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

  object: (ertNode, state, convert) => {
    return t.tsTypeLiteral(ertNode.members.map(m => convert(m, state)));
  },

  param(ertNode, state, convert) {
    return {
      ...t.identifier('TODO'),
      typeAnnotation: t.tsTypeAnnotation(convert(ertNode.value, state))
    };
  },

  program: (ertNode, state, convert) => {
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
                ...convert(ertNode.component.name, state),
                typeAnnotation: t.tsTypeAnnotation(
                  t.tsTypeReference(
                    t.tsQualifiedName(t.identifier('React'), t.identifier('ComponentType')),
                    t.tsTypeParameterInstantiation([convert(ertNode.component, state)])
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

  property: (ertNode, state, convert) => {
    return {
      ...t.tsPropertySignature(
        convert(ertNode.key, state),
        t.tsTypeAnnotation(convert(ertNode.value, state))
      ),
      optional: !!ertNode.default
    };
  },

  string: ertNode => {
    return ertNode.value ? t.tsLiteralType(t.stringLiteral(ertNode.value)) : t.tsStringKeyword();
  },

  typeAlias(ertNode, state, convert) {
    return convert(ertNode.right, state);
  },

  typeParamsDeclaration(ertNode, state, convert) {
    return convert(ertNode.params.find(p => p.name === ertNode.referenceIdName), state);
  },

  typeParam(ertNode, state, convert) {
    return t.tsTypeReference(t.identifier(ertNode.name));
  },

  union: (ertNode, state, convert) => {
    const types = ertNode.types.map(ty => convert(ty, state));
    return t.tsUnionType(types);
  }
};

// eslint-disable-next-line import/prefer-default-export
export const convertToTs = ertNode => {
  let convert = (node, state) => {
    if (node.kind in tsConverters) {
      return tsConverters[node.kind](node, state, convert);
    }
    // eslint-disable-next-line no-console
    console.error(node);
    throw `Cannot process type: ${node.kind} right now`;
  };

  return generate(convert(ertNode, initialState())).code;
};
