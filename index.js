// @flow
'use strict';

const {BabelError, prettyError, buildCodeFrameError} = require('babel-errors');
const createBabelFile = require('babel-file');
const {loadImportSync} = require('babel-file-loader');
const {isFlowIdentifier} = require('babel-flow-identifiers');
const {getIdentifierKind} = require('babel-identifiers');
const {isReactComponentClass} = require('babel-react-components');
const createBabylonOptions = require('babylon-options');
const babylon = require('babylon');
const babel = require('babel-core');

const converters = {};

converters.Program = path => {
  let result = {};

  result.kind = 'program';
  result.classes = [];

  path.traverse({
    ClassDeclaration(path) {
      if (!isReactComponentClass(path)) return;
      debugger
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
  return result;
};

converters.UnionTypeAnnotation = path => {
  const types = (path.types || path.node.types).map(convert);
  const result = {
    kind: 'union',
    types
  };

  return result;
};

converters.GenericTypeAnnotation = path => {
  console.log(path.scope)
  debugger
  const typeParameters = path.node.typeParameters ? path.node.typeParameters.params.map(type => {
    return convert(type);
  }) : null;
  let result = {
    kind: path.node.id.name,
    typeParameters
  };

  return result;
}

converters.IntersectionTypeAnnotation = path => {
  const types = path.node.types.map(convert);

  return { 
    kind: 'intersection',
    types
  };
};

converters.VoidTypeAnnotation = path => {
  return { kind: 'void' };
};

converters.BooleanTypeAnnotation = path => {
  return { kind: 'boolean' };
};

converters.StringLiteralTypeAnnotation = path => {
  return { kind: 'stringLiteral'};
}

converters.NumberLiteralTypeAnnotation = path => {
  return { kind: 'numberLiteral'};
}

converters.MixedTypeAnnotation = path => {
  return { kind: 'mixed'};
}

converters.AnyTypeAnnotation = path => {
  return { kind: 'any'};
}

converters.NumberTypeAnnotation = path => {
  return { kind: 'number' };
};

converters.FunctionTypeAnnotation = path => {
  return { kind: 'function' };
};

converters.StringTypeAnnotation = path => {
  return { kind: 'string' };
};

converters.NullableTypeAnnotation = path => {
  return {
    kind: 'nullable',
    arguments: convert(path.get('typeAnnotation'))
  };
}

converters.TSStringKeyword = path => {
  return {kind: 'string'};
}

converters.TSNumberKeyword = path => {
  return {kind: 'number'};
}

converters.TSBooleanKeyword = path => {
  return {kind: 'boolean'};
}

converters.TSVoidKeyword = path => {
  return {kind: 'void'};
}

// converters.TSPropertySignature = path => {
// }

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
  return {kind: 'literal', value: path.literal.value}
}

converters.TSTypeReference = path => {
  const typeParameters = path.node.typeParameters ? path.node.typeParameters.params.map(convert) : undefined;
  return {
    kind: path.node.typeName.name,
    typeParameters
  }
};

converters.TSUnionType = path => {
  const types = (path.types || path.node.types).map(convert);
  const result = {
    kind: 'union',
    types
  };

  return result;
};

converters.TSAnyKeyword = path => {
  return {kind: 'any'};
}

converters.TSTupleType = path => {
  const types = path.node.elementTypes.map(convert);
  return {
    kind: 'tuple',
    types
  }
}

converters.TSFunctionType = path => {
  const parameters = path.node.parameters.map(p => ({kind: p.name}));
  const returnType = convert(path.node.typeAnnotation.typeAnnotation);

  return {
    kind: 'function',
    returnType,
    parameters
  };
};

function convert(path) {
  let converter = converters[path.type];
  if (!converter) throw new Error(`Missing converter for: ${path.type}`);

  return converter(path);
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
