// @flow
'use strict';

const createBabelFile = require('babel-file');
const {loadImportSync} = require('babel-file-loader');
const {isFlowIdentifier} = require('babel-flow-identifiers');
const {findFlowBinding} = require('babel-flow-scope');
const {getIdentifierKind} = require('babel-identifiers');
const {isReactComponentClass} = require('babel-react-components');
const createBabylonOptions = require('babylon-options');
const babylon = require('babylon');
const babel = require('babel-core');
const t = require('babel-types');
const stripIndent = require('strip-indent');
const {normalizeComment} = require('babel-normalize-comments');

const matchExported = require('./matchExported');

const converters = {};

converters.Program = (path, context) => {
  let result = {};

  result.kind = 'program';
  result.classes = [];

  path.traverse({
    ClassDeclaration(path) {
      if (!isReactComponentClass(path)) return;

      let params = path.get('superTypeParameters').get('params');
      let props = params[0];

      // props can be IntersectionTypeAnnotation, GenericTypeAnnotation, or ObjectTypeAnnotation
      // TSTypeLiteral
      let updating = convert(props, context)
      // console.log(updating);
      if (updating.types) console.log(updating.types.map(a => a.props));
      if (updating.props) console.log(updating.props.map(a => a.props));
      result.classes.push(convert(props, context));
    },
  });

  return result;
};

converters.ObjectTypeAnnotation = (path, context) => {
  let result = {};

  result.kind = 'object';
  result.props = [];

  let properties = path.get('properties');

  for (let property of properties) {
    result.props.push(convert(property, context));
  }

  return result;
};

converters.ObjectTypeProperty = (path, context) => {
  let result = {};
  result.kind = 'property';
  result.key = path.get('key').node.name;
  result.value = convert(path.get('value'), context);
  result.optional = path.node.optional;
  return result;
};

converters.UnionTypeAnnotation = (path, context) => {
  const types = path.get('types').map(p => convert(p, context));
  return { kind: 'union', types };
};

converters.TypeParameterInstantiation = (path, context) => {
  let params = path.get('params').map(p => convert(p, context))
  return { kind: 'typeParameter', params }
}

converters.GenericTypeAnnotation = (path, context) => {
  let typeParams;
  if (path.get('typeParameters').node) {
    typeParams = convert(path.get('typeParameters'), context)
  }
  if (typeParams) return { ...convert(path.get('id'), context), typeParams };
  else return convert(path.get('id'), context);
}

converters.Identifier = (path, context) => {
  let kind = getIdentifierKind(path);

  if (kind === 'reference') {
    let bindingPath;

    if (isFlowIdentifier(path)) {
      let flowBinding = findFlowBinding(path, path.node.name);
      if (!flowBinding) throw new Error;
      bindingPath = flowBinding.path.parentPath;
    } else {
      bindingPath = path.scope.getBinding(path.node.name);
    }

    if (bindingPath) {
      return convert(bindingPath, context);
    } else {
      return { kind: 'id', name: path.node.name };
    }
  }
};

converters.TypeAlias = (path, context) => {
  return convert(path.get('right'), context);
};

converters.IntersectionTypeAnnotation = (path, context) => {
  const types = path.get('types').map(p => convert(p, context));
  return { kind: 'intersection', types };
};

converters.QualifiedTypeIdentifier = (path, context) => {
  return convert(path.get('id'), context);
};

converters.VoidTypeAnnotation = path => {
  return { kind: 'void' };
};

converters.BooleanTypeAnnotation = path => {
  return { kind: 'boolean' };
};

converters.StringLiteralTypeAnnotation = path => {
  return { kind: 'stringLiteral', value: path.node.value };
}

converters.NumberLiteralTypeAnnotation = path => {
  return { kind: 'numberLiteral' };
}

converters.MixedTypeAnnotation = path => {
  return { kind: 'mixed' };
}

converters.AnyTypeAnnotation = path => {
  return { kind: 'any' };
}

converters.NumberTypeAnnotation = path => {
  return { kind: 'number' };
};

converters.FunctionTypeParam = (path, context) => {
  return convert(path.get('typeAnnotation'), context);
};

converters.FunctionTypeAnnotation = (path, context) => {
  const parameters = path.get('params').map(p => convert(p, context));
  const returnType = convert(path.get('returnType'), context);

  return {
    parameters,
    returnType,
    kind: 'function'
  };
};

converters.StringTypeAnnotation = path => {
  return { kind: 'string' };
};

converters.NullableTypeAnnotation = (path, context) => {
  return {
    kind: 'nullable',
    arguments: convert(path.get('typeAnnotation'), context),
  };
};

converters.TSStringKeyword = path => {
  return { kind: 'string' };
};

converters.TSNumberKeyword = path => {
  return { kind: 'number' };
};

converters.TSBooleanKeyword = path => {
  return { kind: 'boolean' };
};

converters.TSVoidKeyword = path => {
  return { kind: 'void' };
};

// converters.TSPropertySignature = path => {
// };

converters.TSTypeLiteral = (path, context) => {
  let result = {};

  result.kind = 'object';
  // TODO: find object key
  // result.key = '';
  result.props = [];

  let properties = path.get('members');

  properties.forEach(memberPath => {
    result.props.push(convert(memberPath.get('typeAnnotation').get('typeAnnotation'), context));
  });

  return result;
};

converters.TSLiteralType = path => {
  return {
    kind: 'literal',
    value: path.node.literal.value,
  };
}

converters.TSTypeReference = (path, context) => {
  return convert(path.get('typeName'), context);
};

converters.TSUnionType = (path, context) => {
  const types = path.get('types').map(p => convert(p, context));
  return { kind: 'union', types };
};

converters.TSAnyKeyword = path => {
  return { kind: 'any' };
};

converters.TSTupleType = (path, context) => {
  const types = path.get('elementTypes').map(p => convert(p, context));
  return { kind: 'tuple', types };
};

converters.TSFunctionType = (path, context) => {
  const parameters = path.get('parameters').map(p => convert(p, context));
  const returnType = convert(path.get('typeAnnotation').get('typeAnnotation'), context);

  return {
    kind: 'function',
    returnType,
    parameters,
  };
};

converters.ObjectTypeSpreadProperty = (path, context) => {
  return convert(path.get('argument'), context)
}

converters.ImportSpecifier = (path, context) => {
  let importKind = path.node.importKind || path.parent.importKind || 'value';
  let moduleSpecifier = path.parent.source.value;

  if (!path.hub.file.opts.filename) {
    let name = path.node.imported.name;

    return {
      kind: 'import',
      importKind,
      name,
      moduleSpecifier,
    };
  } else {
    let kind = path.parent.importKind;
    if (kind === 'typeof') {
      throw new Error({ path, error: 'import typeof is unsupported' });
    }

    if (!/^\./.test(path.parent.source.value)) {
      let name = `${moduleSpecifier}.${path.node.imported.name}`;

      return {
        kind: name,
        importKind,
        name: '',
        moduleSpecifier,
      };
    }

    let file = loadImportSync(path.parentPath, context.resolveOptions);

    let name;
    if (path.type === 'ImportDefaultSpecifier' && kind === 'value') {
      name = 'default';
    } else if (path.node.imported) {
      name = path.node.imported.name;
    } else {
      name = path.node.local.name;
    }

    let id;
    if (path.node.imported) {
      id = path.node.imported.name;
    } else {
      id = path.node.local.name;
    }

    let exported = matchExported(file, name);
    if (!exported) {
      let name = `${path.node.imported.name}`;

      return {
        kind: 'import',
        importKind,
        name,
        moduleSpecifier,
      };
    }

    return convert(exported, Object.assign({}, context, {
      replacementId: t.identifier(id),
    }));
  }
}

function attachCommentProperty(source, dest, name) {
   if (!source) {
     console.log(dest);
   }
   if (!source || !source[name]) return;
   if (!dest[name]) dest[name] = [];

   let comments = source[name].map(comment => {
     return {
       type: comment.type === 'CommentLine' ? 'commentLine' : 'commentBlock',
       value: normalizeComment(comment),
       raw: comment.value,
     };
   });

   dest[name] = dest[name].concat(comments);
 }

 function attachComments(source, dest) {
   attachCommentProperty(source, dest, 'leadingComments');
   attachCommentProperty(source, dest, 'trailingComments');
   attachCommentProperty(source, dest, 'innerComments');
 }

function convert(path, context) {
  if (typeof path.get !== 'function') throw new Error(`Did not pass a NodePath to convert() ${JSON.stringify(path)}`);
  let converter = converters[path.type];
  if (!converter) throw new Error(`Missing converter for: ${path.type}`);
  let result = converter(path, context);
  attachComments(path.node, result);
  return result;
}

function extractReactTypes(
  code /*: string */,
  typeSystem /*: 'flow' | 'typescript' */,
  filename /*:? string */,
  resolveOptions/*:? Object */ = {}
) {
  let plugins = ['jsx'];

  if (typeSystem === 'flow') plugins.push('flow');
  else if (typeSystem === 'typescript') plugins.push('typescript');
  else throw new Error('typeSystem must be either "flow" or "typescript"');

  let parserOpts = createBabylonOptions({
    stage: 2,
    plugins,
  });

  let file = new babel.File({
    options: { parserOpts, filename },
    passes: [],
  });

  try {
    file.addCode(code);
    file.parseCode(code);
  } catch (err) {
    console.log(err);
  }
  return convert(file.path, { resolveOptions });
};

module.exports = extractReactTypes;
