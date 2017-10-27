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
const stripIndent = require('strip-indent');

const converters = {};

converters.Program = path => {
  let result = {};

  result.kind = 'program';
  result.classes = [];

  path.traverse({
    ClassDeclaration(path) {
      if (!isReactComponentClass(path)) return;

      let params = path.get('superTypeParameters').get('params');
      let props = params[0];

      result.classes.push(convert(props));
    },
  });

  return result;
};

converters.ObjectTypeAnnotation = path => {
  let result = {};

  result.kind = 'object';
  result.props = [];

  let properties = path.get('properties');

  for (let property of properties) {
    result.props.push(convert(property));
  }

  return result;
};

converters.ObjectTypeProperty = path => {
  let result = {};
  result.kind = 'property';
  result.key = path.get('key').node.name;
  result.value = convert(path.get('value'));
  result.optional = path.node.optional;
  return result;
};

converters.UnionTypeAnnotation = path => {
  const types = path.get('types').map(p => convert(p));
  return { kind: 'union', types };
};

converters.GenericTypeAnnotation = path => {
  return convert(path.get('id'));
}

converters.Identifier = path => {
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

    return bindingPath && convert(bindingPath);
  }
};

converters.TypeAlias = path => {
  return convert(path.get('right'));
};

converters.IntersectionTypeAnnotation = path => {
  const types = path.node.types.map(convert);
  return { kind: 'intersection', types };
};

converters.QualifiedTypeIdentifier = path => {
  return convert(path.get('id'));
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

converters.FunctionTypeParam = path => {
  return convert(path.get('typeAnnotation'));
};

converters.FunctionTypeAnnotation = path => {
  const parameters = path.get('params').map(p => convert(p));
  const returnType = convert(path.get('returnType'));

  return {
    parameters,
    returnType,
    kind: 'function'
  };
};

converters.StringTypeAnnotation = path => {
  return { kind: 'string' };
};

converters.NullableTypeAnnotation = path => {
  return {
    kind: 'nullable',
    arguments: convert(path.get('typeAnnotation')),
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

converters.TSTypeLiteral = path => {
  let result = {};

  result.kind = 'object';
  // TODO: find object key
  // result.key = '';
  result.props = [];

  let properties = path.get('members');

  properties.forEach(memberPath => {
    result.props.push(convert(memberPath.get('typeAnnotation').get('typeAnnotation')));
  });

  return result;
};

converters.TSLiteralType = path => {
  return {
    kind: 'literal',
    value: path.node.literal.value,
  };
}

converters.TSTypeReference = path => {
  return convert(path.get('typeName'));
};

converters.TSUnionType = path => {
  const types = path.get('types').map(p => convert(p));
  return { kind: 'union', types };
};

converters.TSAnyKeyword = path => {
  return { kind: 'any' };
};

converters.TSTupleType = path => {
  const types = path.get('elementTypes').map(p => convert(p));
  return { kind: 'tuple', types };
};

converters.TSFunctionType = path => {
  const parameters = path.get('parameters').map(p => convert(p));
  const returnType = convert(path.get('typeAnnotation').get('typeAnnotation'));

  return {
    kind: 'function',
    returnType,
    parameters,
  };
};

converters.ImportSpecifier = path => {
  let importKind = path.node.importKind || path.parent.importKind || 'value';
  let moduleSpecifier = path.parent.source.value;
  let name = path.node.imported.name;

  return {
    kind: 'import',
    importKind,
    name,
    moduleSpecifier,
  };
}

function attachCommentProperty(source, dest, name) {
  if (source[name]) {
    if (!dest[name]) dest[name] = [];
    dest[name] = dest[name].concat(source[name]);
  }
}

function attachComments(source, dest) {
  attachCommentProperty(source, dest, 'leadingComments');
  attachCommentProperty(source, dest, 'trailingComments');
  attachCommentProperty(source, dest, 'innerComments');

  if (dest.leadingComments) {
    dest.description = dest.leadingComments.map(comment => {
      if (comment.type === 'CommentLine') {
        return comment.value.trimLeft();
      } else {
        return stripIndent(comment.value).split('\n').map(commentLine => (
          commentLine
        )).join('\n')
      }
    }).join('\n')
  }
}

function convert(path) {
  let converter = converters[path.type];
  if (!converter) throw new Error(`Missing converter for: ${path.type}`);
  let result = converter(path);
  attachComments(path.node, result);
  return result;
}

function extractReactTypes(code /*: string */, typeSystem /*: 'flow' | 'typescript' */) {
  let plugins = ['jsx'];

  if (typeSystem === 'flow') plugins.push('flow');
  else if (typeSystem === 'typescript') plugins.push('typescript');
  else throw new Error('typeSystem must be either "flow" or "typescript"');

  let parserOpts = createBabylonOptions({
    stage: 2,
    plugins,
  });

  let file = new babel.File({
    options: { parserOpts },
    passes: [],
  });

  try {
    file.addCode(code);
    file.parseCode(code);
  } catch (err) {
    console.log(err);
  }
  return convert(file.path);
};

module.exports = extractReactTypes;
