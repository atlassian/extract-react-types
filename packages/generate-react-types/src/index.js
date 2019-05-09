// @flow
import { extractReactTypes } from 'extract-react-types';
import { convertToTs } from './converters';

const target = {
  typescript: 'flow',
  flow: 'typescript'
};

export default (content, typeSystem, filename) => {
  const resolveOpts = {
    pathFilter: (pkg, location, dist) => {
      if (pkg['atlaskit:src'] && location.includes('node_modules') && location.includes(pkg.main)) {
        return location.replace(dist, pkg['atlaskit:src']);
      }
      return null;
    }
  };
  const ertAst = extractReactTypes(content, target[typeSystem], filename, resolveOpts);
  if (typeSystem === 'typescript') {
    return convertToTs(ertAst);
  }
  return ertAst;
};
