// @flow
import nodePath from 'path';
import { sync as resolveSync } from 'resolve';
import * as t from '@babel/types';
import { loadFileSync, resolveImportFilePathSync } from 'babel-file-loader';
import { isFlowIdentifier } from 'babel-flow-identifiers';
import { getTypeBinding } from 'babel-type-scopes';
import { getIdentifierKind } from 'babel-identifiers';
import { isReactComponentClass } from 'babel-react-components';
import { normalizeComment } from 'babel-normalize-comments';

import {
  findExports,
  followExports,
  hasDestructuredDefaultExport,
  matchExported
} from './export-manager';
import { hasTypeAnnotation } from './utils';
import * as K from './kinds';

const converters = {};

// This is the entry point. Program will only be found once.
converters.Program = (path, context): K.Program => {
  // coerce whether or not we need to follow an export to a new File and Program
  // only do so on export { default } from 'x';
  // followExports(path, context, convert);
  if (hasDestructuredDefaultExport(path, context)) {
    return followExports(path, context, convert);
  } else {
    let components = convertComponentExports(findExports(path, 'default'), context);
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
            component = convertComponentClass(scopedPath, context);
          }
        }
      });
    }

    return { kind: 'program', component };
  }
};

converters.TaggedTemplateExpression = (path, context): K.TemplateExpression => ({
  kind: 'templateExpression',
  tag: convert(path.get('tag'), context)
});

converters.TemplateElement = (path): K.TemplateElement => ({
  kind: 'templateElement',
  value: path.node.value
});

converters.TemplateLiteral = (path, context): K.TemplateLiteral => ({
  kind: 'templateLiteral',
  expressions: path.get('expressions').map(e => convert(e, context)),
  quasis: path.get('quasis').map(q => convert(q, context))
});

converters.LogicalExpression = (path, context) => ({
  kind: 'logicalExpression',
  operator: path.node.operator,
  left: convert(path.get('left'), context),
  right: convert(path.get('right'), context)
});

converters.RestElement = (path, context): K.Rest => ({
  kind: 'rest',
  argument: convert(path.get('argument'), context)
});

converters.AssignmentPattern = (path, context): K.AssignmentPattern => ({
  kind: 'assignmentPattern',
  left: convert(path.get('left'), context),
  right: convert(path.get('right'), context)
});

converters.ObjectPattern = (path, context): K.ObjectPattern => {
  const members = [];

  for (const property of path.get('properties')) {
    members.push(convert(property, context));
  }

  return { kind: 'objectPattern', members };
};

converters.ClassDeclaration = (path, context): K.ClassKind => {
  if (!isReactComponentClass(path)) {
    return {
      kind: 'class',
      name: convert(path.get('id'), context)
    };
  }

  return convertComponentClass(path, context);
};

converters.SpreadElement = (path, context): K.Spread => ({
  kind: 'spread',
  value: convert(path.get('argument'), context)
});

// Renamed to SpreadElement in babel 7. Added here for backwards compatibility
converters.SpreadProperty = (path, context): K.Spread => ({
  kind: 'spread',
  value: convert(path.get('argument'), context)
});

converters.UnaryExpression = (path, context): K.Unary => ({
  kind: 'unary',
  operator: path.node.operator,
  argument: convert(path.get('argument'), context)
});

converters.JSXAttribute = (path, context): K.JSXAttribute => ({
  kind: 'JSXAttribute',
  name: convert(path.get('name'), context),
  value: convert(path.get('value'), context)
});

converters.JSXExpressionContainer = (path, context): K.JSXExpressionContainer => ({
  kind: 'JSXExpressionContainer',
  expression: convert(path.get('expression'), context)
});

converters.JSXElement = (path, context): K.JSXElement => ({
  kind: 'JSXElement',
  value: convert(path.get('openingElement'), context)
});

converters.JSXIdentifier = (path): K.JSXIdentifier => ({
  kind: 'JSXIdentifier',
  value: path.node.name
});

converters.JSXMemberExpression = (path, context): K.JSXMemberExpression => ({
  kind: 'JSXMemberExpression',
  object: convert(path.get('object'), context),
  property: convert(path.get('property'), context)
});

converters.JSXOpeningElement = (path, context): K.JSXOpeningElement => ({
  kind: 'JSXOpeningElement',
  name: convert(path.get('name'), context),
  attributes: path.get('attributes').map(item => convert(item, context))
});

converters.ClassProperty = (path, context): K.Property => ({
  kind: 'property',
  key: convert(path.get('key'), context),
  value: convert(path.get('value'), context)
});

converters.CallExpression = (path, context): K.Call => {
  const { callee, args } = convertCall(path, context);

  return { kind: 'call', callee, args };
};

converters.NewExpression = (path, context): K.New => {
  const { callee, args } = convertCall(path, context);

  return { kind: 'new', callee, args };
};

converters.InterfaceDeclaration = (path, context): K.InterfaceDeclaration => ({
  kind: 'interfaceDeclaration',
  id: convert(path.get('id'), context)
});

converters.OpaqueType = (path, context): K.OpaqueType => {
  // OpaqueTypes have several optional nodes that exist as a null when not present
  // We need to convert these when they exist, and ignore them when they don't;
  const supertypePath = path.get('supertype');
  const impltypePath = path.get('impltype');
  const typeParametersPath = path.get('typeParameters');

  // TODO we are having a fight at the moment with id returning a binding, not a node,
  // and don't have time to solve this properly - I am pathing it to being working-ish
  // here, and will come back to this later. If you find this comment still here and
  // want to fix this problem, I encourage you to do is.
  const supertype = supertypePath.node && convert(supertypePath, context);
  const impltype = impltypePath.node && convert(impltypePath, context);
  const typeParameters = typeParametersPath.node && convert(typeParametersPath, context);
  const id = convert(path.get('id'), context);

  return { kind: 'opaqueType', id, supertype, impltype, typeParameters };
};

converters.TypeofTypeAnnotation = (path, context): K.Typeof => {
  const type = convert(path.get('argument'), { ...context, mode: 'value' });
  const { name, referenceIdName } = resolveFromGeneric(type);

  return { kind: 'typeof', type, name: name || referenceIdName };
};

converters.ObjectProperty = (path, context): K.Property => ({
  kind: 'property',
  key: convert(path.get('key'), context),
  value: convert(path.get('value'), context)
});

converters.ExistentialTypeParam = (): K.Exists => ({ kind: 'exists' });

converters.StringLiteral = (path): K.String => ({ kind: 'string', value: path.node.value });

converters.TypeCastExpression = (path, context): K.TypeCastExpression => ({
  kind: 'typeCastExpression',
  expression: convert(path.get('expression'), context)
});

converters.NumericLiteral = (path): K.Number => ({ kind: 'number', value: path.node.value });

converters.NullLiteral = (): K.Null => ({ kind: 'null' });

converters.BooleanLiteral = (path): K.Boolean => ({ kind: 'boolean', value: path.node.value });

converters.ArrayExpression = (path, context): K.ArrayExpression => ({
  kind: 'array',
  elements: path.get('elements').map(e => convert(e, context))
});

converters.BinaryExpression = (path, context): K.BinaryExpression => ({
  kind: 'binary',
  operator: path.node.operator,
  left: convert(path.get('left'), context),
  right: convert(path.get('right'), context)
});

converters.MemberExpression = (path, context): K.MemberExpression => ({
  kind: 'memberExpression',
  object: convert(path.get('object'), context),
  property: convert(path.get('property'), context)
});

converters.FunctionDeclaration = (path, context) => convertFunction(path, context);

converters.ArrowFunctionExpression = (path, context) => convertFunction(path, context);

converters.FunctionExpression = (path, context) => convertFunction(path, context);

converters.TypeAnnotation = (path, context) => convert(path.get('typeAnnotation'), context);

converters.ExistsTypeAnnotation = (): K.Exists => ({ kind: 'exists' });

converters.ObjectTypeAnnotation = (path, context): K.Obj => convertObject(path, context);

converters.ObjectTypeProperty = (path, context): K.Property => ({
  kind: 'property',
  key: convert(path.get('key'), context),
  value: convert(path.get('value'), context),
  optional: path.node.optional
});

converters.UnionTypeAnnotation = (path, context): K.Union => ({
  kind: 'union',
  types: path.get('types').map(p => convert(p, context))
});

converters.TypeParameterInstantiation = (path, context): K.TypeParams => ({
  kind: 'typeParams',
  params: path.get('params').map(p => convert(p, context))
});

converters.TypeParameterDeclaration = (path, context): K.TypeParamsDeclaration => ({
  kind: 'typeParamsDeclaration',
  params: path.get('params').map(p => convert(p, context))
});

converters.TypeParameter = (path): K.TypeParam => ({
  kind: 'typeParam',
  name: path.node.name
});

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
  const parameters = path.get('params').map(p => convertParameter(p, context));
  const returnType = path.node.returnType ? convert(path.get('returnType'), context) : null;

  return {
    kind: 'function',
    id: null,
    async: path.node.async,
    generator: path.node.generator,
    parameters,
    returnType
  };
};

converters.ObjectExpression = (path, context): K.Obj => convertObject(path, context);

converters.VariableDeclaration = (path, context): K.Variable => ({
  kind: 'variable',
  declarations: path.get('declarations').map(p => convert(p, context))
});

converters.VariableDeclarator = (path, context): K.Initial => ({
  kind: 'initial',
  id: convert(path.get('id'), context),
  value: convert(path.get('init'), context)
});

converters.Identifier = (path, context): K.Id => {
  const kind = getIdentifierKind(path);
  const name = path.node.name;

  if (context.mode === 'value') {
    if (kind === 'reference') {
      const binding = path.scope.getBinding(name);

      if (binding) {
        const bindingPath = binding.path;
        let foundPath = null;

        if (bindingPath.isVariableDeclaration()) {
          foundPath = bindingPath.get('declarators').find(p => p.node.name === name);
        } else if (bindingPath.isVariableDeclarator()) {
          foundPath = bindingPath.get('init');
        } else if (
          bindingPath.isImportDefaultSpecifier() ||
          bindingPath.isImportNamespaceSpecifier() ||
          bindingPath.isImportSpecifier()
        ) {
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
        const type = path.node.typeAnnotation
          ? convert(path.get('typeAnnotation'), { ...context, mode: 'type' })
          : null;

        return { kind: 'id', name, type };
      }
    }

    if (kind === 'static' || kind === 'binding') {
      const type = path.node.typeAnnotation
        ? convert(path.get('typeAnnotation'), { ...context, mode: 'type' })
        : null;

      return { kind: 'id', name, type };
    }

    throw new Error(`Unable to resolve path for: ${kind}`);
  }

  if (context.mode === 'type') {
    if (kind === 'reference') {
      let bindingPath;

      if (isFlowIdentifier(path)) {
        const flowBinding = getTypeBinding(path, name);
        if (!flowBinding) throw new Error();
        bindingPath = flowBinding.path.parentPath;
      } else if (isTsIdentifier(path)) {
        const foundPath = path.scope.getBinding(name);

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
          return { kind: 'id', name };
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

        // This is a hack that stops horrible regression errors and problems
        if (bindingPath.kind === 'unknown') {
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
    }

    if (kind === 'static' || kind === 'binding') {
      return { kind: 'id', name };
    }
  }

  throw new Error(`Could not parse Identifier ${name} in mode ${context.mode}`);
};

converters.TypeAlias = (path, context) => convert(path.get('right'), context);

converters.IntersectionTypeAnnotation = (path, context): K.Intersection => ({
  kind: 'intersection',
  types: path.get('types').map(p => convert(p, context))
});

converters.QualifiedTypeIdentifier = (path, context) => convert(path.get('id'), context);

converters.VoidTypeAnnotation = (): K.Void => ({ kind: 'void' });

converters.BooleanTypeAnnotation = (): K.Boolean => ({ kind: 'boolean' });

converters.BooleanLiteralTypeAnnotation = (path): K.Boolean => ({
  kind: 'boolean',
  value: path.node.value
});

converters.NullLiteralTypeAnnotation = (): K.Null => ({ kind: 'null' });

converters.StringLiteralTypeAnnotation = (path): K.String => ({
  kind: 'string',
  value: path.node.value
});

converters.NumberLiteralTypeAnnotation = (path): K.Number => ({
  kind: 'number',
  value: path.node.value
});

converters.MixedTypeAnnotation = (): K.Mixed => ({ kind: 'mixed' });

converters.AnyTypeAnnotation = (): K.Any => ({ kind: 'any' });

converters.NumberTypeAnnotation = (): K.Number => ({ kind: 'number' });

converters.FunctionTypeParam = (path, context) => convert(path.get('typeAnnotation'), context);

converters.FunctionTypeAnnotation = (path, context): K.Func => ({
  parameters: path.get('params').map(p => convertParameter(p, context)),
  returnType: convert(path.get('returnType'), context),
  kind: 'function'
});

converters.StringTypeAnnotation = (): K.String => ({ kind: 'string' });

converters.NullableTypeAnnotation = (path, context): K.Nullable => ({
  kind: 'nullable',
  arguments: convert(path.get('typeAnnotation'), context)
});

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
  }

  throw new Error(`Unsupported TSIndexedAccessType kind: ${type.kind}`);
};

converters.TSStringKeyword = (): K.String => ({ kind: 'string' });

converters.TSNumberKeyword = (): K.Number => ({ kind: 'number' });

converters.TSBooleanKeyword = (): K.Boolean => ({ kind: 'boolean' });

converters.TSVoidKeyword = (): K.Void => ({ kind: 'void' });

converters.TSUndefinedKeyword = (): K.Void => ({ kind: 'void' });

converters.TSTypeLiteral = (path, context): K.Obj => ({
  kind: 'object',
  members: path.get('members').map(memberPath => convert(memberPath, context))
});

converters.TSPropertySignature = (path, context): K.Property => ({
  kind: 'property',
  optional: !!path.node.optional,
  key: { kind: 'id', name: path.node.key.name },
  value: convert(path.get('typeAnnotation'), context)
});

converters.TSTypeAliasDeclaration = (path, context): K.Obj =>
  convert(path.get('typeAnnotation'), context);

converters.TSLiteralType = (path): K.String => ({
  kind: 'string',
  value: path.node.literal.value
});

converters.TSTypeReference = (path, context): K.Generic => {
  const typeParameters = path.get('typeParameters');

  return {
    kind: 'generic',
    value: convert(path.get('typeName'), context),
    ...(typeParameters.node && {
      key: convert(path.get('key'), context),
      typeParams: convert(typeParameters, context)
    })
  };
};

converters.TSUnionType = (path, context): K.Union => ({
  kind: 'union',
  types: path.get('types').map(p => convert(p, context))
});

converters.TSAnyKeyword = (): K.Any => ({ kind: 'any' });

converters.TSTupleType = (path, context): K.Tuple => ({
  kind: 'tuple',
  types: path.get('elementTypes').map(p => convert(p, context))
});

converters.TSFunctionType = (path, context): K.Generic => ({
  kind: 'generic',
  value: {
    kind: 'function',
    returnType: convert(path.get('typeAnnotation'), context),
    parameters: path.get('parameters').map(p => convertParameter(p, context))
  }
});

function convertMethodCall(path, context): K.Func {
  const parameters = path.get('parameters').map(p => convertParameter(p, context));
  const returnType = convert(path.get('typeAnnotation'), context);

  return {
    kind: 'function',
    returnType,
    parameters
  };
}

converters.TSMethodSignature = (path, context): K.Property => ({
  kind: 'property',
  optional: !!path.node.optional,
  key: convert(path.get('key'), context),
  value: convertMethodCall(path, context)
});

converters.TSCallSignatureDeclaration = (path, context): K.Property => ({
  kind: 'property',
  key: {
    kind: 'string'
  },
  optional: false,
  value: convertMethodCall(path, context)
});

function extendedTypesMembers(path, context) {
  const members = path.get('extends');
  if (!members || !members.length) {
    return [];
  }

  return members.reduce((acc, current) => {
    const { members: convertedMembers } = convert(current, context);

    // #convertedMembers are undefined if converter is not able to resolve
    // extended types which are coming from some external package.
    if (!convertedMembers) {
      return acc;
    }

    return acc.concat(convertedMembers);
  }, []);
}

converters.TSInterfaceDeclaration = (path, context): K.Obj => {
  const extendedTypes = extendedTypesMembers(path, context);
  const interfaceType = convert(path.get('body'), context) || { members: [] };

  return {
    kind: 'object',
    // Merge the current interface members with any extended members
    members: interfaceType.members.concat(extendedTypes)
  };
};

converters.TSExpressionWithTypeArguments = (path, context): K.Id =>
  convert(path.get('expression'), context);

converters.TSInterfaceBody = (path, context): K.Obj => ({
  kind: 'object',
  members: path.get('body').map(prop => convert(prop, context))
});

converters.TSTypeAnnotation = (path, context) => convert(path.get('typeAnnotation'), context);

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

converters.TSEnumMember = (path, context) => convert(path.get('id'), context);

converters.TSArray = (): K.Any => ({ kind: 'any' });

converters.TSArrayType = (path, context): K.ArrayType => ({
  kind: 'arrayType',
  type: convert(path.get('elementType'), context)
});

converters.TSTypeParameterInstantiation = (path, context): K.TypeParams => ({
  kind: 'typeParams',
  params: path.get('params').map(param => convert(param, context))
});

converters.ImportNamespaceSpecifier = (): K.Any => ({ kind: 'any' });

converters.undefined = (): K.Any => ({ kind: 'any' });

converters.ObjectTypeSpreadProperty = (path, context): K.Spread => ({
  kind: 'spread',
  value: convert(path.get('argument'), context)
});

converters.ArrayTypeAnnotation = (path, context): K.ArrayType => ({
  kind: 'arrayType',
  type: convert(path.get('elementType'), context)
});

converters.TSIntersectionType = (path, context): K.Intersection => ({
  kind: 'intersection',
  types: path.get('types').map(type => convert(type, context))
});

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

converters.TSParenthesizedType = (path, context) => convert(path.get('typeAnnotation'), context);

converters.TSObjectKeyword = (): K.Obj => ({ kind: 'object', members: [] });

converters.TSNullKeyword = (): K.Null => ({ kind: 'null' });

converters.TSUnknownKeyword = (): K.Unknown => ({ kind: 'unknown' });

converters.TSThisType = (): K.This => ({ kind: 'custom', value: 'this' });

converters.TSAsExpression = (path, context): K.Param => convert(path.get('expression'), context);

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

    if (!filePath || nodePath.extname(filePath) === '.json') {
      return {
        kind: 'import',
        importKind,
        name,
        moduleSpecifier
      };
    }

    const file = loadFileSync(filePath, context.parserOpts);
    const id = path.node.imported ? path.node.imported.name : path.node.local.name;

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

converters.ImportDefaultSpecifier = (path, context): K.Import =>
  importConverterGeneral(path, context);

converters.ImportDeclaration = (path, context): K.Import => {
  const filePath = resolveImportFilePathSync(path, context.resolveOptions);
  const file = loadFileSync(filePath, context.parserOpts);
  const exported = matchExported(file, context.replacementId.name);

  const importKind = path.node.importKind || 'value';
  const moduleSpecifier = path.get('source').node.value;
  const name = 'default';

  if (!exported || !context.replacementId) {
    return {
      kind: 'import',
      importKind,
      name,
      moduleSpecifier
    };
  }

  return convert(exported, context);
};

converters.ExportSpecifier = (path, context): K.ExportSpecifier => ({
  kind: 'exportSpecifier',
  local: convert(path.get('local'), context),
  exported: convert(path.get('exported'), context)
});

converters.ExportNamedDeclaration = (path, context): K.Export => {
  const specifiers = path.get('specifiers');
  // This needs to be in all of them --- let source = path.get('source');

  if (path.get('source').node) {
    const source = path.get('source');

    if (specifiers.length !== 1) {
      return {
        kind: 'export',
        exports: specifiers.map(s => convert(s, context)),
        source: convert(source, context)
      };
    }

    try {
      // The parentPath is a reference to where we currently are. We want to
      // get the source value, but resolving this first makes this easier.
      const filePath = resolveImportFilePathSync(source.parentPath, context.resolveOptions);

      const actualPath = resolveSync(
        nodePath.join(nodePath.dirname(filePath), source.node.value),
        context.resolveOptions
      );

      const name = convert(specifiers[0], context).local.name;
      const file = loadFileSync(actualPath, context.parserOpts);
      // We need to calculate name from the specifiers, I think knowing that there
      // will always be one specifier
      const resolvedValue = matchExported(file, name);

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

converters.ImportSpecifier = (path, context): K.Import => importConverterGeneral(path, context);

converters.TSConditionalType = (): K.Any => ({ kind: 'any' });

converters.TSTypeQuery = (path, context): K.TypeQuery => ({
  kind: 'typeQuery',
  exprName: convert(path.get('exprName'), { ...context, mode: 'value' })
});

function attachCommentProperty(source, dest, name) {
  if (!source || !source[name]) return;
  if (!dest[name]) dest[name] = [];

  dest[name] = dest[name].concat(parseComment(source[name]));
}

function attachComments(source, dest) {
  attachCommentProperty(source, dest, 'leadingComments');
  attachCommentProperty(source, dest, 'trailingComments');
  attachCommentProperty(source, dest, 'innerComments');
}

function parseComment(commentProperty) {
  return commentProperty.map(comment => ({
    type: comment.type === 'CommentLine' ? 'commentLine' : 'commentBlock',
    value: normalizeComment(comment),
    raw: comment.value
  }));
}

const isSpecialComponentType = (path, type: 'memo' | 'forwardRef') => {
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

function resolveExportAllDeclaration(path, context) {
  const source = path.get('source');
  // The parentPath is a reference to where we currently are. We want to
  // get the source value, but resolving this first makes this easier.
  const filePath = resolveImportFilePathSync(source.parentPath, context.resolveOptions);

  return loadFileSync(filePath, context.parserOpts);
}

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

function convertComponentClass(path, context) {
  const params = path.get('superTypeParameters').get('params');
  const props = params[0];
  const defaultProps = getDefaultProps(path, context);

  let classProperties = convert(props, { ...context, mode: 'type' });
  classProperties.name = convert(path.get('id'), { ...context, mode: 'value' });

  /**
   * FIXME: It's possible to get nulls in the members array when TS is unable
   * to resolve type definitions of non-relative module imports
   * See: https://github.com/atlassian/extract-react-types/issues/89
   **/
  if (classProperties.value && classProperties.value.members) {
    classProperties.value.members = classProperties.value.members.filter(m => !!m);
  }

  return addDefaultProps(classProperties, defaultProps);
}

function convertComponentFunction(path, context, propTypes) {
  // we have a function, assume the props are the first parameter
  const functionProperties = convert(propTypes, { ...context, mode: 'type' });

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
  if (!defaultProps) return props;

  defaultProps.forEach(property => {
    const ungeneric = resolveFromGeneric(props);
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

function convertCall(path, context) {
  const callee = convert(path.get('callee'), context);
  const args = path.get('arguments').map(a => convert(a, context));
  return { callee, args };
}

function recursivelyResolveExportAll(path, context, name) {
  const source = path
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

const isVariableOfMembers = (defaultProps: {}) => {
  const defaultPropsIsVar = defaultProps.value && defaultProps.value.kind === 'variable';

  if (!defaultPropsIsVar) return false;

  const declarations = defaultProps.value.declarations;
  const lastDeclarationIsObject = declarations[declarations.length - 1].value.kind === 'object';

  return lastDeclarationIsObject;
};

const getDefaultProps = (path, context) => {
  let defaultProps = null;

  const foundDefaults = path
    .get('body')
    .get('body')
    .find(p => p.isClassProperty() && p.get('key').isIdentifier({ name: 'defaultProps' }));

  if (foundDefaults) {
    defaultProps = convert(foundDefaults, { ...context, mode: 'value' });
  }

  if (!defaultProps) return [];

  if (defaultProps && defaultProps.value && defaultProps.value.kind === 'object') {
    return defaultProps.value.members;
  }

  if (isVariableOfMembers(defaultProps)) {
    return defaultProps.value.declarations[defaultProps.value.declarations.length - 1].value
      .members;
  }

  throw new Error(`Could not resolve default Props, ${defaultProps}`);
};

function isTsIdentifier(path) {
  return (
    ['TSExpressionWithTypeArguments', 'TSTypeReference'].indexOf(path.parentPath.type) !== -1 &&
    getIdentifierKind(path) === 'reference'
  );
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
  const returnType = path.node.returnType ? convert(path.get('returnType'), context) : null;
  const id = path.node.id ? convert(path.get('id'), context) : null;

  return {
    kind: 'function',
    id,
    async: path.node.async,
    generator: path.node.generator,
    parameters,
    returnType
  };
}

// This function is from mdn:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value#Examples
const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

export default function convert(path, context) {
  if (typeof path.get !== 'function') {
    // We were getting incredible unhelpful errors here at times, so we have a circular replacement
    // throw path.identifier;
    const stringedPath = JSON.stringify(path, getCircularReplacer(), 2);
    throw new Error(`Did not pass a NodePath to convert() ${stringedPath}`);
  }

  const converter = converters[path.type];

  if (!converter) {
    const propertySignature = path.find(p => p.isTSPropertySignature() || p.isObjectTypeProperty());

    // Fallback to a raw string if property uses a type without a matching converter
    if (propertySignature && propertySignature.node) {
      return {
        kind: 'raw',
        name: path.getSource()
      };
    }

    throw new Error(
      `Missing converter for: ${
        path.type
      }, see: https://github.com/atlassian/extract-react-types/issues/150`
    );
  }

  const result = converter(path, context);

  attachComments(path.node, result);
  return result;
}

export function convertComponentExports(componentExports, context) {
  // eslint-disable-next-line array-callback-return
  return componentExports.map(({ path, name }) => {
    if (
      path.isFunctionExpression() ||
      path.isArrowFunctionExpression() ||
      path.isFunctionDeclaration()
    ) {
      let propType;

      // check for a component typed with the `React.FC<Props>` or `FC<Props>` type annotation
      if (hasTypeAnnotation(path.parentPath, 'React', 'FC')) {
        propType = path.parentPath.get('id.typeAnnotation.typeAnnotation.typeParameters.params.0');
      } else {
        // we have a normal function, assume the props are the first parameter
        propType = path.get('params.0.typeAnnotation');
      }

      let component = convertComponentFunction(path, context, propType);
      return { name, path, component };
    }

    if (path.isClass()) {
      let component = convertComponentClass(path, context);
      return { name, path, component };
    }

    const isMemo = isSpecialComponentType(path, 'memo');
    const isForwardRef = isSpecialComponentType(path, 'forwardRef');

    if (isMemo || isForwardRef) {
      // Props typed via generics
      const genericParams = path.get('typeParameters');

      // Props are the second type arg
      if (isForwardRef && genericParams.node) {
        const component = convertComponentFunction(
          genericParams,
          context,
          genericParams.get('params.1')
        );

        return { name, path, component };
      }

      if (isMemo && genericParams.node) {
        const component = convertComponentFunction(
          genericParams,
          context,
          genericParams.get('params.0')
        );

        return { name, path, component };
      }

      // Props typed via function arguments
      const firstArg = path.get('arguments')[0];

      if (firstArg) {
        if (firstArg.isFunctionExpression() || firstArg.isArrowFunctionExpression()) {
          const component = convertComponentFunction(
            firstArg,
            context,
            firstArg.get('params.0.typeAnnotation')
          );
          return { name, path, component };
        }

        const firstArgGenericParams = firstArg.get('typeParameters');

        if (
          isMemo &&
          isSpecialComponentType(firstArg, 'forwardRef') &&
          firstArgGenericParams.node
        ) {
          const component = convertComponentFunction(
            firstArgGenericParams,
            context,
            firstArgGenericParams.get('params.1')
          );

          return { name, path, component };
        }

        if (isMemo && isSpecialComponentType(firstArg, 'forwardRef')) {
          const innerFirstArg = firstArg.get('arguments')[0];
          if (innerFirstArg.isFunctionExpression() || innerFirstArg.isArrowFunctionExpression()) {
            const component = convertComponentFunction(
              innerFirstArg,
              innerFirstArg,
              innerFirstArg.get('params.0.typeAnnotation')
            );

            return { name, path, component };
          }
        }
      }
    }
  });
}
