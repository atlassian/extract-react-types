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
  const types = (path.types || path.node.types).map(convert);
  const result = {
    kind: 'union',
    types
  };

  return result;
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

  return {
    kind: 'intersection',
    types
  };
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
  return { kind: 'stringLiteral', value: path.extra.rawValue};
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

converters.FunctionTypeParam = path => {
  return convert(path.typeAnnotation);
};

converters.FunctionTypeAnnotation = path => {
  const parameters = path.node.params.map(convert);
  const returnType = convert(path.node.returnType);

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
  return convert(path.get('typeName'));
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
