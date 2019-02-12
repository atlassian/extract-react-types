// @flow
import { reduceToObj, resolveFromGeneric } from 'kind2string';
import type { Kind } from './types';

const getPropTypes = (propTypesObj: Kind) => {
  let resolvedTypes = resolveFromGeneric(propTypesObj);
  let propTypes;
  if (resolvedTypes.kind === 'object') {
    propTypes = resolvedTypes.members;
  } else if (resolvedTypes.kind === 'intersection') {
    propTypes = resolvedTypes.types.reduce((acc, type) => [...acc, ...reduceToObj(type)], []);
  }
  return propTypes;
};

export default getPropTypes;
