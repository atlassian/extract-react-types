// @flow

const path = require('path');
const extractReactTypes = require('extract-react-types');

module.exports = function extractReactTypesLoader(content /* : string */) {
  const filename = this.resource;
  const ext = path.extname(filename);
  const typeSystem = ext === '.ts' || ext === '.tsx' ? 'typescript' : 'flow';
  const types = extractReactTypes(content, typeSystem, filename);
  return `module.exports = ${JSON.stringify(types)}`;
};
