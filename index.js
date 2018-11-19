// @flow

const path = require('path');
const extractReactTypes = require('extract-react-types');

module.exports = function extractReactTypesLoader(content /* : string */) {
  if (
    !['staging', 'production'].includes(process.env.WEBSITE_ENV) &&
    !process.env.FORCE_EXTRACT_REACT_TYPES
  ) {
    return 'module.exports = {}';
  }

  const filename = this.resource;
  const ext = path.extname(filename);
  const typeSystem = ext === '.ts' || ext === '.tsx' ? 'typescript' : 'flow';

  const resolveOpts = {
    pathFilter: (pkg, location, dist) => {
      if (
        pkg['atlaskit:src'] &&
        location.includes('node_modules') &&
        location.includes(pkg.main)
      ) {
        return location.replace(dist, pkg['atlaskit:src']);
      }
      return null;
    },
  };

  const types = extractReactTypes(content, typeSystem, filename, resolveOpts);
  return `module.exports = ${JSON.stringify(types)}`;
};
