// @flow

const path = require('path');
const extractReactTypes = require('extract-react-types');

const devProps = {
  classes: [
    {
      value: {
        kind: 'object',
        members: [
          {
            kind: 'property',
            key: { kind: 'id', name: 'Warning' },
            value: { kind: 'any' },
            optional: false,
            leadingComments: [
              {
                type: 'commentBlock',
                value: `extract-react-types is not being run in dev mode for speed reasons. If you need to
see prop types add the environment variable \`FORCE_EXTRACT_REACT_TYPES\`
eg:
- \`FORCE_EXTRACT_REACT_TYPES=true yarn start <packageName>\`
- \`FORCE_EXTRACT_REACT_TYPES=true yarn start:<team>\``,
                raw: '**',
              },
            ],
            default: {
              kind: 'string',
              value: 'Prop types are not shown in dev mode',
            },
          },
        ],
        referenceIdName: 'AvatarPropTypes',
      },
    },
  ],
};

module.exports = function extractReactTypesLoader(content /* : string */) {
  if (
    !['staging', 'production'].includes(process.env.WEBSITE_ENV) &&
    !process.env.FORCE_EXTRACT_REACT_TYPES
  ) {
    return `module.exports = ${JSON.stringify(devProps)}`;
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
