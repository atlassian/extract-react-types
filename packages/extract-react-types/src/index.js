// @flow
import nodePath from 'path';
import createBabelFile from 'babel-file';
import { loadFileSync, resolveImportFilePathSync } from 'babel-file-loader';
import { isFlowIdentifier } from 'babel-flow-identifiers';
import { getTypeBinding } from 'babel-type-scopes';
import { getIdentifierKind } from 'babel-identifiers';
import { isReactComponentClass } from 'babel-react-components';
import createBabylonOptions from 'babylon-options';
import * as t from '@babel/types';
import { normalizeComment } from 'babel-normalize-comments';
import { sync as resolveSync } from 'resolve';
import matchExported from './matchExported';
import * as K from './kinds';

export type * from './kinds';

const converters = {};

const isSpecialReactComponentType = (path, type: 'memo' | 'forwardRef') => {
  if (path && path.isCallExpression()) {
    const callee = path.get('callee');
    if (callee.isIdentifier() && callee.node.name === type) {
      return true;
    }
    if (callee.isMemberExpression() && callee.matchesPattern(`React.${type}`)) {
      return true;
    }
  }
  return false;
};

const getPropFromObject = (props, property) => {
  let prop;

  if (!props.members) {
    throw new Error(
      `Attempted to get property from non-object kind: ${props.kind}. Full object: ${JSON.stringify(
        props
      )}`
    );
  }

  props.members.forEach(p => {
    if (p.kind === 'spread') {
      let spreadArg = resolveFromGeneric(p.value);
      if (!spreadArg || spreadArg.kind !== 'object') return;
      let p2 = getPropFromObject(spreadArg, property);
      if (p2) prop = p2;
      // The kind of the object member must be the same as the kind of the property
    } else if (property.key.kind === 'id' && p.key.name === property.key.name) {
      prop = p;
    } else if (property.key.kind === 'string' && p.key.value === property.key.value) {
      prop = p;
    }
  });

  return prop;
};

const resolveFromGeneric = type => {
  if (type.kind !== 'generic') return type;
  return resolveFromGeneric(type.value);
};

const getProp = (props, property) => {
  let prop;
  if (props.kind === 'intersection') {
    props.types.forEach(pr => {
      prop = getProp(resolveFromGeneric(pr), property) || prop;
    });
  } else if (props.kind === 'object') {
    prop = getPropFromObject(props, property);
  }

  return prop;
};

const isVariableOfMembers = defaultProps => {
  let defaultPropsIsVar =
    defaultProps && defaultProps.value && defaultProps.value.kind === 'variable';
  if (!defaultPropsIsVar) {
    return false;
  }
  let declarations = defaultProps.value.declarations;

  let lastDeclarationIsObject = declarations[declarations.length - 1].value.kind === 'object';

  if (lastDeclarationIsObject) {
    return true;
  } else {
    return false;
  }
};

const getDefaultProps = (path, context) => {
  let defaultProps = null;

  let foundDefaults = path
    .get('body')
    .get('body')
    .find(p => p.isClassProperty() && p.get('key').isIdentifier({ name: 'defaultProps' }));

  if (foundDefaults) {
    defaultProps = convert(foundDefaults, { ...context, mode: 'value' });
  }

  if (!defaultProps) {
    return [];
  } else if (defaultProps && defaultProps.value && defaultProps.value.kind === 'object') {
    return defaultProps.value.members;
  } else if (isVariableOfMembers(defaultProps)) {
    return defaultProps.value.declarations[defaultProps.value.declarations.length - 1].value
      .members;
  } else {
    throw new Error(`Could not resolve default Props, ${defaultProps}`);
  }
};

// This is the entry point. Program will only be found once.
converters.Program = (path, context): K.Program => {
  let components = exportedComponents(path, 'default', context);
  // components[0] could be undefined
  let component;
  if (components[0]) {
    component = components[0].component;
  }

  // just extract the props from the first class in the file
  if (!component) {
    path.traverse({
      ClassDeclaration(scopedPath) {
        if (!component && isReactComponentClass(scopedPath)) {
          component = convertReactComponentClass(scopedPath, context);
        }
      }
    });
  }

  return { kind: 'program', component };
};

function convertReactComponentFunction(path, context) {
  // we have a function, assume the props are the first parameter
  let propType = path.get('params.0.typeAnnotation');
  let functionProperties = convert(propType, {
    ...context,
    mode: 'type'
  });

  let name = '';
  if (path.type === 'FunctionDeclaration' && path.node.id && path.node.id.name) {
    name = path.node.id.name;
  } else {
    const variableDeclarator = path.findParent(scopedPath => scopedPath.isVariableDeclarator());

    if (variableDeclarator) {
      name = variableDeclarator.node.id.name;
    }
  }

  let defaultProps = [];

  if (name) {
    path.hub.file.path.traverse({
      // look for MyComponent.defaultProps = ...
      AssignmentExpression(assignmentPath) {
        const left = assignmentPath.get('left.object');
        if (left.isIdentifier() && left.node.name === name) {
          let initialConversion = convert(assignmentPath.get('right'), {
            ...context,
            mode: 'value'
          });
          defaultProps = initialConversion.members;
        }
      }
    });
    functionProperties.name = {
      kind: 'id',
      name,
      type: null
    };
  }

  return addDefaultProps(functionProperties, defaultProps);
}

function addDefaultProps(props, defaultProps) {
  if (!defaultProps) {
    return props;
  }

  defaultProps.forEach(property => {
    let ungeneric = resolveFromGeneric(props);
    const prop = getProp(ungeneric, property);
    if (!prop) {
      /* eslint-disable-next-line no-console */
      console.warn(
        `Could not find property to go with default of ${
          property.key.value ? property.key.value : property.key.name
        } in ${props.name} prop types`
      );
      return;
    }
    prop.default = property.value;
  });

  return props;
}

function convertReactComponentClass(path, context) {
  let params = path.get('superTypeParameters').get('params');
  let props = params[0];
  let defaultProps = getDefaultProps(path, context);

  let classProperties = convert(props, { ...context, mode: 'type' });
  classProperties.name = convert(path.get('id'), {
    ...context,
    mode: 'value'
  });
  return addDefaultProps(classProperties, defaultProps);
}

converters.TaggedTemplateExpression = (path, context): K.TemplateExpression => {
  return {
    kind: 'templateExpression',
    tag: convert(path.get('tag'), context)
  };
};

/* eslint-disable-next-line no-unused-vars */
converters.TemplateElement = (path, context): K.TemplateElement => {
  return {
    kind: 'templateElement',
    value: path.node.value
  };
};

converters.TemplateLiteral = (path, context): K.TemplateLiteral => {
  // hard challenge, we need to know the combined ordering of expressions and quasis
  return {
    kind: 'templateLiteral',
    expressions: path.get('expressions').map(e => convert(e, context)),
    quasis: path.get('quasis').map(q => convert(q, context))
  };
};

converters.LogicalExpression = (path, context) => {
  return {
    kind: 'logicalExpression',
    operator: path.node.operator,
    left: convert(path.get('left'), context),
    right: convert(path.get('right'), context)
  };
};

converters.RestElement = (path, context): K.Rest => {
  return {
    kind: 'rest',
    argument: convert(path.get('argument'), context)
  };
};

converters.AssignmentPattern = (path, context): K.AssignmentPattern => {
  return {
    kind: 'assignmentPattern',
    left: convert(path.get('left'), context),
    right: convert(path.get('right'), context)
  };
};

converters.ObjectPattern = (path, context): K.ObjectPattern => {
  let members = [];

  for (const property of path.get('properties')) {
    members.push(convert(property, context));
  }

  return {
    kind: 'objectPattern',
    members
  };
};

converters.ClassDeclaration = (path, context): K.ClassKind => {
  if (!isReactComponentClass(path)) {
    return {
      kind: 'class',
      name: convert(path.get('id'), context)
    };
  } else {
    return convertReactComponentClass(path, context);
  }
};

converters.SpreadElement = (path, context): K.Spread => {
  return {
    kind: 'spread',
    value: convert(path.get('argument'), context)
  };
};

// This has been renamed to SpreadElement in babel 7. Added here for backwards
// compatibility in other projects
converters.SpreadProperty = (path, context): K.Spread => {
  return {
    kind: 'spread',
    value: convert(path.get('argument'), context)
  };
};

converters.UnaryExpression = (path, context): K.Unary => {
  return {
    kind: 'unary',
    operator: path.node.operator,
    argument: convert(path.get('argument'), context)
  };
};

converters.JSXAttribute = (path, context): K.JSXAttribute => {
  return {
    kind: 'JSXAttribute',
    name: convert(path.get('name'), context),
    value: convert(path.get('value'), context)
  };
};

converters.JSXExpressionContainer = (path, context): K.JSXExpressionContainer => {
  return {
    kind: 'JSXExpressionContainer',
    expression: convert(path.get('expression'), context)
  };
};

converters.JSXElement = (path, context): K.JSXElement => {
  return {
    kind: 'JSXElement',
    value: convert(path.get('openingElement'), context)
  };
};

/* eslint-disable-next-line no-unused-vars */
converters.JSXIdentifier = (path, context): K.JSXIdentifier => {
  return {
    kind: 'JSXIdentifier',
    value: path.node.name
  };
};

converters.JSXMemberExpression = (path, context): K.JSXMemberExpression => {
  return {
    kind: 'JSXMemberExpression',
    object: convert(path.get('object'), context),
    property: convert(path.get('property'), context)
  };
};

converters.JSXOpeningElement = (path, context): K.JSXOpeningElement => {
  return {
    kind: 'JSXOpeningElement',
    name: convert(path.get('name'), context),
    attributes: path.get('attributes').map(item => convert(item, context))
  };
};

converters.ClassProperty = (path, context): K.Property => {
  return {
    kind: 'property',
    key: convert(path.get('key'), context),
    value: convert(path.get('value'), context)
  };
};

function convertCall(path, context) {
  const callee = convert(path.get('callee'), context);
  const args = path.get('arguments').map(a => convert(a, context));
  return { callee, args };
}

converters.CallExpression = (path, context): K.Call => {
  const { callee, args } = convertCall(path, context);
  return {
    kind: 'call',
    callee,
    args
  };
};

converters.NewExpression = (path, context): K.New => {
  const { callee, args } = convertCall(path, context);
  return {
    kind: 'new',
    callee,
    args
  };
};

converters.TypeofTypeAnnotation = (path, context): K.Typeof => {
  let type = convert(path.get('argument'), { ...context, mode: 'value' });
  let ungeneric = resolveFromGeneric(type);
  return {
    kind: 'typeof',
    type,
    name: ungeneric.name || ungeneric.referenceIdName
  };
};

converters.ObjectProperty = (path, context): K.Property => {
  return {
    kind: 'property',
    key: convert(path.get('key'), context),
    value: convert(path.get('value'), context)
  };
};

/* eslint-disable-next-line no-unused-vars */
converters.ExistentialTypeParam = (path, context): K.Exists => {
  return { kind: 'exists' };
};

/* eslint-disable-next-line no-unused-vars */
converters.StringLiteral = (path, context): K.String => {
  return { kind: 'string', value: path.node.value };
};

converters.TypeCastExpression = (path, context): K.TypeCastExpression => {
  return { kind: 'typeCastExpression', expression: convert(path.get('expression'), context) };
};

/* eslint-disable-next-line no-unused-vars */
converters.NumericLiteral = (path, context): K.Number => {
  return { kind: 'number', value: path.node.value };
};

/* eslint-disable-next-line no-unused-vars */
converters.NullLiteral = (path, context): K.Null => {
  return { kind: 'null' };
};

/* eslint-disable-next-line no-unused-vars */
converters.BooleanLiteral = (path, context): K.Boolean => {
  return { kind: 'boolean', value: path.node.value };
};

converters.ArrayExpression = (path, context): K.ArrayExpression => {
  return {
    kind: 'array',
    elements: path.get('elements').map(e => convert(e, context))
  };
};

converters.BinaryExpression = (path, context): K.BinaryExpression => {
  return {
    kind: 'binary',
    operator: path.node.operator,
    left: convert(path.get('left'), context),
    right: convert(path.get('right'), context)
  };
};

converters.MemberExpression = (path, context): K.MemberExpression => {
  return {
    kind: 'memberExpression',
    object: convert(path.get('object'), context),
    property: convert(path.get('property'), context)
  };
};

function isTsIdentifier(path) {
  if (
    ['TSExpressionWithTypeArguments', 'TSTypeReference'].indexOf(path.parentPath.type) !== -1 &&
    getIdentifierKind(path) === 'reference'
  ) {
    return true;
  }

  return false;
}

function convertParameter(param, context): K.Param {
  let { type, ...rest } = convert(param, context);
  return {
    kind: 'param',
    value: rest,
    type: type || null
  };
}

function convertFunction(path, context): K.Func {
  const parameters = path.get('params').map(p => convertParameter(p, context));
  let returnType = null;
  let id = null;

  if (path.node.returnType) {
    returnType = convert(path.get('returnType'), context);
  }

  if (path.node.id) {
    id = convert(path.get('id'), context);
  }

  return {
    kind: 'function',
    id,
    async: path.node.async,
    generator: path.node.generator,
    parameters,
    returnType
  };
}

converters.FunctionDeclaration = (path, context) => {
  return convertFunction(path, context);
};

converters.ArrowFunctionExpression = (path, context) => {
  return convertFunction(path, context);
};

converters.FunctionExpression = (path, context) => {
  return convertFunction(path, context);
};

converters.TypeAnnotation = (path, context) => {
  return convert(path.get('typeAnnotation'), context);
};

/* eslint-disable-next-line no-unused-vars */
converters.ExistsTypeAnnotation = (path, context): K.Exists => {
  return { kind: 'exists' };
};

converters.ObjectTypeAnnotation = (path, context): K.Obj => {
  return convertObject(path, context);
};

converters.ObjectTypeProperty = (path, context): K.Property => {
  let result = {};
  result.kind = 'property';
  result.key = convert(path.get('key'), context);
  result.value = convert(path.get('value'), context);
  result.optional = path.node.optional;
  return result;
};

converters.UnionTypeAnnotation = (path, context): K.Union => {
  const types = path.get('types').map(p => convert(p, context));
  return { kind: 'union', types };
};

converters.TypeParameterInstantiation = (path, context): K.TypeParams => {
  return {
    kind: 'typeParams',
    params: path.get('params').map(p => convert(p, context))
  };
};

converters.TypeParameterDeclaration = (path, context): K.TypeParamsDeclaration => {
  return {
    kind: 'typeParamsDeclaration',
    params: path.get('params').map(p => convert(p, context))
  };
};

/* eslint-disable-next-line no-unused-vars */
converters.TypeParameter = (path, context): K.TypeParam => {
  return {
    kind: 'typeParam',
    name: path.node.name
  };
};

// Converts utility types to a simpler representation
function convertUtilityTypes(type: K.Generic) {
  let result = { ...type };
  if (type.value.name === '$Exact') {
    // $Exact<T> can simply be converted to T
    if (type.typeParams && type.typeParams.params && type.typeParams.params[0]) {
      result = type.typeParams.params[0];
    } else {
      /* eslint-disable-next-line no-console */
      console.warn('Missing type parameter for $Exact type');
    }
  }

  return result;
}

converters.GenericTypeAnnotation = (path, context) => {
  let result = {};

  result.kind = 'generic';
  result.value = convert(path.get('id'), context);
  if (path.node.typeParameters) {
    result.typeParams = convert(path.get('typeParameters'), context);
  }
  if (result.value.kind === 'id') {
    result = convertUtilityTypes(result);
  }
  return result;
};

converters.ObjectMethod = (path, context): K.Func => {
  let parameters = path.get('params').map(p => convertParameter(p, context));
  let returnType = null;

  if (path.node.returnType) {
    returnType = convert(path.get('returnType'), context);
  }

  return {
    kind: 'function',
    id: null,
    async: path.node.async,
    generator: path.node.generator,
    parameters,
    returnType
  };
};

function convertObject(path, context) {
  let members = [];
  path.get('properties').forEach(p => {
    let mem = convert(p, context);
    if (mem.kind === 'spread') {
      let memVal = resolveFromGeneric(mem.value);
      if (memVal.kind === 'initial' && memVal.value.kind === 'object') {
        members = members.concat(memVal.value.members);
      } else if (memVal.kind === 'object') {
        members = members.concat(memVal.members);
      } else if (memVal.kind === 'variable') {
        let declarations = memVal.declarations;
        declarations = declarations[declarations.length - 1].value;
        if (declarations.kind !== 'object') {
          throw new Error('Trying to spread a non-object item onto an object');
        } else {
          members = members.concat(declarations.members);
        }
      } else if (memVal.kind === 'import') {
        // We are explicitly calling out we are handling the import kind
        members = members.concat(mem);
      } else {
        // This is a fallback
        members = members.concat(mem);
      }
    } else if (mem.kind === 'property') {
      members.push(mem);
    }
  });
  return { kind: 'object', members };
}

converters.ObjectExpression = (path, context): K.Obj => {
  return convertObject(path, context);
};

converters.VariableDeclaration = (path, context): K.Variable => {
  let res = {};
  res.kind = 'variable';
  res.declarations = path.get('declarations').map(p => convert(p, context));
  return res;
};

converters.VariableDeclarator = (path, context): K.Initial => {
  return {
    kind: 'initial',
    id: convert(path.get('id'), context),
    value: convert(path.get('init'), context)
  };
};

converters.Identifier = (path, context): K.Id => {
  let kind = getIdentifierKind(path);
  let name = path.node.name;

  if (context.mode === 'value') {
    if (kind === 'reference') {
      let binding = path.scope.getBinding(name);

      if (binding) {
        let bindingPath = binding.path;
        let foundPath = null;

        if (bindingPath.isVariableDeclaration()) {
          foundPath = bindingPath.get('declarators').find(p => {
            return p.node.name === name;
          });
        } else if (bindingPath.isVariableDeclarator()) {
          foundPath = bindingPath.get('init');
        } else if (
          bindingPath.isImportDefaultSpecifier() ||
          bindingPath.isImportNamespaceSpecifier()
        ) {
          foundPath = bindingPath;
        } else if (bindingPath.isImportSpecifier()) {
          foundPath = bindingPath;
        } else if (bindingPath.isDeclaration()) {
          foundPath = bindingPath.get('id');
        }

        if (foundPath === null || foundPath === undefined) {
          throw new Error(`Unable to resolve binding path for: ${bindingPath.type}`);
        }
        const convertedValue = convert(foundPath, context);
        return {
          ...convertedValue,
          referenceIdName: path.node.name
        };
      } else {
        let type = null;

        if (path.node.typeAnnotation) {
          type = convert(path.get('typeAnnotation'), {
            ...context,
            mode: 'type'
          });
        }

        return {
          kind: 'id',
          name,
          type
        };
      }
    } else if (kind === 'static' || kind === 'binding') {
      let type = null;
      if (path.node.typeAnnotation) {
        type = convert(path.get('typeAnnotation'), {
          ...context,
          mode: 'type'
        });
      }

      return {
        kind: 'id',
        name,
        type
      };
    } else {
      throw new Error(`Unable to resolve path for: ${kind}`);
    }
  } else if (context.mode === 'type') {
    if (kind === 'reference') {
      let bindingPath;

      if (isFlowIdentifier(path)) {
        let flowBinding = getTypeBinding(path, name);
        if (!flowBinding) throw new Error();
        bindingPath = flowBinding.path.parentPath;
      } else if (isTsIdentifier(path)) {
        let foundPath = path.scope.getBinding(name);
        if (
          foundPath &&
          (foundPath.path.isImportDefaultSpecifier() ||
            foundPath.path.isImportNamespaceSpecifier() ||
            foundPath.path.isImportSpecifier())
        ) {
          return convert(foundPath.path, context);
        }

        let tsBinding = getTypeBinding(path, name);
        if (!tsBinding) {
          return {
            kind: 'id',
            name
          };
        }
        bindingPath = tsBinding.path.parentPath;
      } else {
        bindingPath = path.scope.getBinding(name);
      }

      if (bindingPath) {
        if (bindingPath.kind === 'module') {
          bindingPath = bindingPath.path;
        }

        // If path is a descendant of bindingPath and share the same name, this is a recursive type.
        if (path.isDescendant(bindingPath) && bindingPath.get('id').node.name === name) {
          return { kind: 'id', name };
        }

        if (bindingPath.kind !== 'module') {
          const convertedValue = convert(bindingPath, context);
          return {
            ...convertedValue,
            referenceIdName: path.node.name
          };
        }
      } else {
        return { kind: 'id', name };
      }
    } else if (kind === 'static' || kind === 'binding') {
      return { kind: 'id', name };
    }
  }
  throw new Error(`Could not parse Identifier ${name} in mode ${context.mode}`);
};

converters.TypeAlias = (path, context) => {
  return convert(path.get('right'), context);
};

converters.IntersectionTypeAnnotation = (path, context): K.Intersection => {
  const types = path.get('types').map(p => convert(p, context));
  return { kind: 'intersection', types };
};

converters.QualifiedTypeIdentifier = (path, context) => {
  return convert(path.get('id'), context);
};

/* eslint-disable-next-line no-unused-vars */
converters.VoidTypeAnnotation = (path): K.Void => {
  return { kind: 'void' };
};

/* eslint-disable-next-line no-unused-vars */
converters.BooleanTypeAnnotation = (path): K.Boolean => {
  return { kind: 'boolean' };
};

/* eslint-disable-next-line no-unused-vars */
converters.BooleanLiteralTypeAnnotation = (path): K.Boolean => {
  return { kind: 'boolean', value: path.node.value };
};

/* eslint-disable-next-line no-unused-vars */
converters.NullLiteralTypeAnnotation = (path): K.Null => {
  return { kind: 'null' };
};

converters.StringLiteralTypeAnnotation = (path): K.String => {
  return { kind: 'string', value: path.node.value };
};

// This should absolutely return a value
converters.NumberLiteralTypeAnnotation = (path): K.Number => {
  return { kind: 'number', value: path.node.value };
};

/* eslint-disable-next-line no-unused-vars */
converters.MixedTypeAnnotation = (path): K.Mixed => {
  return { kind: 'mixed' };
};

/* eslint-disable-next-line no-unused-vars */
converters.AnyTypeAnnotation = (path): K.Any => {
  return { kind: 'any' };
};

/* eslint-disable-next-line no-unused-vars */
converters.NumberTypeAnnotation = (path): K.Number => {
  return { kind: 'number' };
};

converters.FunctionTypeParam = (path, context) => {
  return convert(path.get('typeAnnotation'), context);
};

converters.FunctionTypeAnnotation = (path, context): K.Func => {
  const parameters = path.get('params').map(p => convertParameter(p, context));
  const returnType = convert(path.get('returnType'), context);

  return {
    parameters,
    returnType,
    kind: 'function'
  };
};

/* eslint-disable-next-line no-unused-vars */
converters.StringTypeAnnotation = (path): K.String => {
  return { kind: 'string' };
};

converters.NullableTypeAnnotation = (path, context): K.Nullable => {
  return {
    kind: 'nullable',
    arguments: convert(path.get('typeAnnotation'), context)
  };
};

converters.TSIndexedAccessType = (path, context) => {
  const type = convert(path.get('objectType'), context);
  const indexKey = path.get('indexType').node.literal.value;

  if (type.kind === 'generic') {
    if (type.value.members) {
      const member = type.value.members.find(scopedMember => scopedMember.key.name === indexKey);
      if (member) {
        return member.value;
      }
    }

    const name = type.value.name || type.value.referenceIdName;

    return {
      kind: 'generic',
      value: {
        kind: type.value.kind,
        name: `${name.name || name}['${indexKey}']`
      }
    };
  } else {
    throw new Error(`Unsupported TSIndexedAccessType kind: ${type.kind}`);
  }
};

/* eslint-disable-next-line no-unused-vars */
converters.TSStringKeyword = (path): K.String => {
  return { kind: 'string' };
};

/* eslint-disable-next-line no-unused-vars */
converters.TSNumberKeyword = (path): K.Number => {
  return { kind: 'number' };
};

/* eslint-disable-next-line no-unused-vars */
converters.TSBooleanKeyword = (path): K.Boolean => {
  return { kind: 'boolean' };
};

/* eslint-disable-next-line no-unused-vars */
converters.TSVoidKeyword = (path): K.Void => {
  return { kind: 'void' };
};

/* eslint-disable-next-line no-unused-vars */
converters.TSUndefinedKeyword = (path, context): K.Void => {
  return { kind: 'void' };
};

converters.TSTypeLiteral = (path, context): K.Obj => {
  return {
    kind: 'object',
    members: path.get('members').map(memberPath => convert(memberPath, context))
  };
};

converters.TSPropertySignature = (path, context): K.Property => {
  return {
    kind: 'property',
    optional: !!path.node.optional,
    key: convert(path.get('key'), context),
    value: convert(path.get('typeAnnotation'), context)
  };
};

converters.TSTypeAliasDeclaration = (path, context): K.Obj => {
  return convert(path.get('typeAnnotation'), context);
};

converters.TSLiteralType = (path): K.String => {
  return {
    kind: 'string',
    value: path.node.literal.value
  };
};

converters.TSTypeReference = (path, context): K.Generic => {
  const typeParameters = path.get('typeParameters');

  if (typeParameters.node) {
    return {
      kind: 'generic',
      typeParams: convert(typeParameters, context),
      key: convert(path.get('key'), context),
      value: convert(path.get('typeName'), context)
    };
  }

  return {
    kind: 'generic',
    value: convert(path.get('typeName'), context)
  };
};

converters.TSUnionType = (path, context): K.Union => {
  const types = path.get('types').map(p => convert(p, context));
  return { kind: 'union', types };
};

/* eslint-disable-next-line no-unused-vars */
converters.TSAnyKeyword = (path): K.Any => {
  return { kind: 'any' };
};

converters.TSTupleType = (path, context): K.Tuple => {
  const types = path.get('elementTypes').map(p => convert(p, context));
  return { kind: 'tuple', types };
};

converters.TSFunctionType = (path, context): K.Generic => {
  const parameters = path.get('parameters').map(p => convertParameter(p, context));
  const returnType = convert(path.get('typeAnnotation'), context);

  return {
    kind: 'generic',
    value: {
      kind: 'function',
      returnType,
      parameters
    }
  };
};

converters.TSMethodSignature = (path, context): K.Property => {
  return {
    kind: 'property',
    optional: !!path.node.optional,
    key: convert(path.get('key'), context),
    value: convertMethodCall(path, context)
  };
};

converters.TSCallSignatureDeclaration = (path, context): K.Property => {
  return {
    kind: 'property',
    key: {
      kind: 'string'
    },
    optional: false,
    value: convertMethodCall(path, context)
  };
};

converters.TSInterfaceDeclaration = (path, context): K.Obj => {
  const extendedTypes = extendedTypesMembers(path, context);
  const interfaceType = convert(path.get('body'), context) || { members: [] };
  return {
    kind: 'object',
    // Merge the current interface members with any extended members
    members: interfaceType.members.concat(extendedTypes)
  };
};

converters.TSExpressionWithTypeArguments = (path, context): K.Id => {
  return convert(path.get('expression'), context);
};

converters.TSInterfaceBody = (path, context): K.Obj => {
  return {
    kind: 'object',
    members: path.get('body').map(prop => convert(prop, context))
  };
};

converters.TSTypeAnnotation = (path, context) => {
  return convert(path.get('typeAnnotation'), context);
};

converters.TSQualifiedName = (path, context): K.Id => {
  const left = convert(path.get('left'), context);
  const right = convert(path.get('right'), context);

  return {
    kind: 'id',
    name: `${left.name || left.referenceIdName}.${right.name}`
  };
};

converters.TSEnumDeclaration = (path, context): K.Union => {
  const { name } = path.get('id').node;
  const types = path.get('members').map(p => {
    const member = convert(p, context);
    return {
      kind: member.kind,
      name: `${name}.${member.name}`
    };
  });
  return { kind: 'union', types };
};

converters.TSEnumMember = (path, context) => {
  return convert(path.get('id'), context);
};

/* eslint-disable-next-line no-unused-vars */
converters.TSArray = (path, context): K.Any => {
  return { kind: 'any' };
};

converters.TSArrayType = (path, context): K.ArrayType => {
  return {
    kind: 'arrayType',
    type: convert(path.get('elementType'), context)
  };
};

converters.TSTypeParameterInstantiation = (path, context): K.TypeParams => {
  return {
    kind: 'typeParams',
    params: path.get('params').map(param => convert(param, context))
  };
};

/* eslint-disable-next-line no-unused-vars */
converters.ImportNamespaceSpecifier = (path, context): K.Any => {
  return { kind: 'any' };
};

/* eslint-disable-next-line no-unused-vars */
converters.undefined = (path, context): K.Any => {
  return { kind: 'any' };
};

converters.ObjectTypeSpreadProperty = (path, context): K.Spread => {
  return {
    kind: 'spread',
    value: convert(path.get('argument'), context)
  };
};

converters.ArrayTypeAnnotation = (path, context): K.ArrayType => {
  return {
    kind: 'arrayType',
    type: convert(path.get('elementType'), context)
  };
};

converters.TSIntersectionType = (path, context): K.Intersection => {
  const types = path.get('types').map(type => convert(type, context));
  return { kind: 'intersection', types };
};

converters.TSIndexSignature = (path, context): K.Property => {
  const id = path.get('parameters')[0];
  return {
    kind: 'property',
    key: {
      kind: 'id',
      name: `[${convert(id, context).name}: ${convert(id.get('typeAnnotation'), context).kind}]`
    },
    value: convert(path.get('typeAnnotation'), context)
  };
};

converters.TSParenthesizedType = (path, context) => {
  return convert(path.get('typeAnnotation'), context);
};

/* eslint-disable-next-line no-unused-vars */
converters.TSObjectKeyword = (path, context): K.Obj => {
  return { kind: 'object', members: [] };
};

/* eslint-disable-next-line no-unused-vars */
converters.TSNullKeyword = (path, context): K.Null => {
  return { kind: 'null' };
};

/* eslint-disable-next-line no-unused-vars */
converters.TSThisType = (path, context): K.This => {
  return { kind: 'custom', value: 'this' };
};

function extendedTypesMembers(path, context) {
  const members = path.get('extends');
  if (!members || !members.length) {
    return [];
  }

  return members.reduce((acc, current) => {
    const converted = convert(current, context);
    return acc.concat(converted.members);
  }, []);
}

function importConverterGeneral(path, context): K.Import {
  let importKind = path.node.importKind || path.parent.importKind || 'value';
  let moduleSpecifier = path.parent.source.value;
  let name;
  let kind = path.parent.importKind;
  if (path.type === 'ImportDefaultSpecifier' && kind === 'value') {
    name = 'default';
  } else if (path.node.imported) {
    name = path.node.imported.name;
  } else {
    name = path.node.local.name;
  }

  if (!path.hub.file.opts.filename) {
    return {
      kind: 'import',
      importKind,
      name,
      moduleSpecifier
    };
  } else {
    if (kind === 'typeof') {
      throw new Error({ path, error: 'import typeof is unsupported' });
    }

    let filePath;

    try {
      filePath = resolveImportFilePathSync(path.parentPath, context.resolveOptions);
    } catch (e) {
      return {
        kind: 'import',
        importKind,
        name,
        moduleSpecifier
      };
    }

    if (!filePath) {
      return {
        kind: 'import',
        importKind,
        name,
        moduleSpecifier
      };
    }

    // Don't attempt to parse JSON
    if (nodePath.extname(filePath) === '.json') {
      return {
        kind: 'import',
        importKind,
        name,
        moduleSpecifier
      };
    }

    let file = loadFileSync(filePath, context.parserOpts);

    let id;
    if (path.node.imported) {
      id = path.node.imported.name;
    } else {
      id = path.node.local.name;
    }

    let exported = matchExported(file, name);

    if (!exported) {
      exported = recursivelyResolveExportAll(file.path, context, name);

      if (!exported) {
        return {
          kind: 'import',
          importKind,
          name,
          moduleSpecifier
        };
      }
    }

    return convert(exported, { ...context, replacementId: t.identifier(id) });
  }
}

function recursivelyResolveExportAll(path, context, name) {
  let source = path
    .get('body')
    .filter(item => item.isExportAllDeclaration())
    .map(item => resolveExportAllDeclaration(item, context))
    .filter(Boolean);

  const matchedDeclartion = source.reduce((acc, current) => {
    if (acc) {
      return acc;
    }

    return matchExported(current, name);
  }, null);

  if (matchedDeclartion) {
    return matchedDeclartion;
  }

  return source.reduce((acc, current) => {
    if (acc) {
      return acc;
    }

    return recursivelyResolveExportAll(current.path, context, name);
  }, null);
}

function resolveExportAllDeclaration(path, context) {
  let source = path.get('source');
  // The parentPath is a reference to where we currently are. We want to
  // get the source value, but resolving this first makes this easier.
  let filePath = resolveImportFilePathSync(source.parentPath, context.resolveOptions);

  return loadFileSync(filePath, context.parserOpts);
}

converters.ImportDefaultSpecifier = (path, context): K.Import => {
  return importConverterGeneral(path, context);
};

converters.ImportDeclaration = (path, context): K.Import => {
  let importKind = path.node.importKind || 'value';
  let moduleSpecifier = path.get('source').node.value;
  let name = 'default';

  if (!context.replacementId) {
    return {
      kind: 'import',
      importKind,
      name,
      moduleSpecifier
    };
  }

  let filePath = resolveImportFilePathSync(path, context.resolveOptions);
  let file = loadFileSync(filePath, context.parserOpts);
  let exported = matchExported(file, context.replacementId.name);

  if (!exported) {
    return {
      kind: 'import',
      importKind,
      name,
      moduleSpecifier
    };
  }

  return convert(exported, context);
};

converters.ExportSpecifier = (path, context): K.ExportSpecifier => {
  let local = convert(path.get('local'), context);
  let exported = convert(path.get('exported'), context);

  return {
    kind: 'exportSpecifier',
    local,
    exported
  };
};

converters.ExportNamedDeclaration = (path, context): K.Export => {
  let specifiers = path.get('specifiers');
  // This needs to be in all of them --- let source = path.get('source');

  if (path.get('source').node) {
    let source = path.get('source');

    if (specifiers.length !== 1) {
      return {
        kind: 'export',
        exports: specifiers.map(s => convert(s, context)),
        source: convert(source, context)
      };
    }

    let name = convert(specifiers[0], context).local.name;

    let file;

    try {
      // The parentPath is a reference to where we currently are. We want to
      // get the source value, but resolving this first makes this easier.
      let filePath = resolveImportFilePathSync(source.parentPath, context.resolveOptions);

      let actualPath = resolveSync(
        nodePath.join(nodePath.dirname(filePath), source.node.value),
        context.resolveOptions
      );

      file = loadFileSync(actualPath, context.parserOpts);
      // We need to calculate name from the specifiers, I think knowing that there
      // will always be one specifier
      let resolvedValue = matchExported(file, name);

      if (resolvedValue) {
        return convert(resolvedValue, context);
      }
      return {
        kind: 'export',
        exports: specifiers.map(s => convert(s, context)),
        source: convert(source, context)
      };
    } catch (e) {
      return {
        kind: 'export',
        exports: specifiers.map(s => convert(s, context)),
        source: convert(source, context)
      };
    }
  } else {
    return {
      kind: 'export',
      exports: specifiers.map(s => convert(s, context))
    };
  }
};

converters.ImportSpecifier = (path, context): K.Import => {
  return importConverterGeneral(path, context);
};

function convertMethodCall(path, context): K.Func {
  const parameters = path.get('parameters').map(p => convertParameter(p, context));
  const returnType = convert(path.get('typeAnnotation'), context);

  return {
    kind: 'function',
    returnType,
    parameters
  };
}

function mapComment(comment) {
  return {
    type: comment.type === 'CommentLine' ? 'commentLine' : 'commentBlock',
    value: normalizeComment(comment),
    raw: comment.value
  };
}

function attachCommentProperty(source, dest, name) {
  if (!source || !source[name]) return;
  if (!dest[name]) dest[name] = [];

  let comments = source[name].map(mapComment);
  dest[name] = dest[name].concat(comments);
}

function attachComments(source, dest) {
  attachCommentProperty(source, dest, 'leadingComments');
  attachCommentProperty(source, dest, 'trailingComments');
  attachCommentProperty(source, dest, 'innerComments');
}

function convert(path, context) {
  if (typeof path.get !== 'function')
    throw new Error(`Did not pass a NodePath to convert() ${JSON.stringify(path)}`);
  let converter = converters[path.type];
  if (!converter) throw new Error(`Missing converter for: ${path.type}`);
  let result = converter(path, context);
  attachComments(path.node, result);
  return result;
}

function getContext(typeSystem: 'flow' | 'typescript', filename?: string, resolveOptions?: Object) {
  let plugins = ['jsx', ['decorators', { decoratorsBeforeExport: true }]];
  /* eslint-disable-next-line no-param-reassign */
  if (!resolveOptions) resolveOptions = {};

  if (!resolveOptions.extensions) {
    // The resolve package that babel-file-loader uses only resolves .js files by default instead of the
    // default extension list of node (.js, .json and .node) so add .json back here.
    resolveOptions.extensions = ['.js', '.json'];
  }

  if (typeSystem === 'flow') {
    plugins.push(['flow', { all: true }]);
  } else if (typeSystem === 'typescript') {
    plugins.push('typescript');

    resolveOptions.extensions.push('.tsx');
    resolveOptions.extensions.push('.ts');
  } else {
    throw new Error('typeSystem must be either "flow" or "typescript"');
  }

  /* $FlowFixMe - need to update types in babylon-options */
  let parserOpts = createBabylonOptions({
    stage: 2,
    plugins
  });

  return { resolveOptions, parserOpts };
}

export function extractReactTypes(
  code: string,
  typeSystem: 'flow' | 'typescript',
  filename?: string,
  inputResolveOptions?: Object
) {
  let { resolveOptions, parserOpts } = getContext(typeSystem, filename, inputResolveOptions);

  let file = createBabelFile(code, { parserOpts, filename });
  return convert(file.path, { resolveOptions, parserOpts });
}

function findExports(
  path,
  exportsToFind: 'all' | 'default'
): Array<{ name: string | null, path: any }> {
  let moduleExports = path.get('body').filter(bodyPath =>
    // we only check for named and default exports here, we don't want export all
    exportsToFind === 'default'
      ? bodyPath.isExportDefaultDeclaration()
      : (bodyPath.isExportNamedDeclaration() &&
          bodyPath.node.source === null &&
          // exportKind is 'value' or 'type' in flow
          (bodyPath.node.exportKind === 'value' ||
            // exportKind is undefined in typescript
            bodyPath.node.exportKind === undefined)) ||
        bodyPath.isExportDefaultDeclaration()
  );

  let formattedExports = [];

  moduleExports.forEach(exportPath => {
    if (exportPath.isExportDefaultDeclaration()) {
      let declaration = exportPath.get('declaration');
      if (declaration.isIdentifier()) {
        let binding = path.scope.bindings[declaration.node.name].path;
        if (binding.isVariableDeclarator()) {
          binding = binding.get('init');
        }
        formattedExports.push({
          name: declaration.node.name,
          path: binding
        });
      } else {
        let name = null;
        if (
          (declaration.isClassDeclaration() || declaration.isFunctionDeclaration()) &&
          declaration.node.id !== null
        ) {
          name = declaration.node.id.name;
        }
        formattedExports.push({ name, path: declaration });
      }
    } else {
      let declaration = exportPath.get('declaration');
      let specifiers = exportPath.get('specifiers');
      if (specifiers.length === 0) {
        if (declaration.isFunctionDeclaration() || declaration.isClassDeclaration()) {
          let identifier = declaration.node.id;
          formattedExports.push({
            name: identifier === null ? null : identifier.name,
            path: declaration
          });
        }
        if (declaration.isVariableDeclaration()) {
          declaration.get('declarations').forEach(declarator => {
            formattedExports.push({
              name: declarator.node.id.name,
              path: declarator.get('init')
            });
          });
        }
      } else {
        specifiers.forEach(specifier => {
          let name = specifier.node.local.name;
          let binding = path.scope.bindings[name].path;
          if (binding.isVariableDeclarator()) {
            binding = binding.get('init');
          }
          formattedExports.push({
            name,
            path: binding
          });
        });
      }
    }
  });
  return formattedExports;
}

function exportedComponents(programPath, componentsToFind: 'all' | 'default', context) {
  let components = [];
  let exportPaths = findExports(programPath, componentsToFind);
  exportPaths.forEach(({ path, name }) => {
    if (
      path.isFunctionExpression() ||
      path.isArrowFunctionExpression() ||
      path.isFunctionDeclaration()
    ) {
      let component = convertReactComponentFunction(path, context);
      components.push({ name, path, component });
      return;
    }
    if (path.isClass()) {
      let component = convertReactComponentClass(path, context);
      components.push({ name, path, component });
      return;
    }
    let isMemo = isSpecialReactComponentType(path, 'memo');
    if (isMemo || isSpecialReactComponentType(path, 'forwardRef')) {
      let firstArg = path.get('arguments')[0];
      if (firstArg) {
        if (firstArg.isFunctionExpression() || firstArg.isArrowFunctionExpression()) {
          let component = convertReactComponentFunction(firstArg, context);
          components.push({ name, path, component });
          return;
        }
        if (isMemo && isSpecialReactComponentType(firstArg, 'forwardRef')) {
          let innerFirstArg = firstArg.get('arguments')[0];
          if (innerFirstArg.isFunctionExpression() || innerFirstArg.isArrowFunctionExpression()) {
            let component = convertReactComponentFunction(innerFirstArg, context);
            components.push({ name, path, component });
          }
        }
      }
    }
  });
  return components;
}

export const findExportedComponents = (
  programPath: any,
  typeSystem: 'flow' | 'typescript',
  filename?: string,
  resolveOptions?: Object
) => exportedComponents(programPath, 'all', getContext(typeSystem, filename, resolveOptions));
