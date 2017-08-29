// @flow
'use strict';

const path = require('path');
const extractReactTypes = require('extract-react-types');

module.exports = function(content /*: string */) {
  let filename = this.resource;
  let ext = path.extname(filename);
  let typeSystem = ext === '.ts' || ext === '.tsx' ? 'typescript' : 'flow';
  let types = extractReactTypes(content, typeSystem);
  return `module.exports = ${JSON.stringify(types)}`;
};
