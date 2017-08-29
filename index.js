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

converters.BooleanTypeAnnotation = path => {
  return { kind: 'boolean' };
};

converters.NumberTypeAnnotation = path => {
  return { kind: 'number' };
};

converters.StringTypeAnnotation = path => {
  return { kind: 'string' };
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
