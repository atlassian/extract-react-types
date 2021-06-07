// @flow
const path = require('path');
const { extractReactTypes } = require('extract-react-types');

module.exports = function extractReactTypesLoader(content /* : string */) {
  const filename = this.resource;
  const ext = path.extname(filename);
  const typeSystem = ext === '.ts' || ext === '.tsx' ? 'typescript' : 'flow';

  const resolveOpts = {
    pathFilter: (pkg, location, dist) => {
      if (
        !pkg.types &&
        pkg['atlaskit:src'] &&
        location.includes('node_modules') &&
        location.includes(pkg.main)
      ) {
        return location.replace(dist, pkg['atlaskit:src']);
      }
      return null;
    },
    /* This is here for instances where there are paths which are not packages */
    moduleDirectory: ['node_modules', 'src']
  };

  const types = extractReactTypes(content, typeSystem, filename, resolveOpts);
  return `module.exports = ${JSON.stringify(types)}`;
};
