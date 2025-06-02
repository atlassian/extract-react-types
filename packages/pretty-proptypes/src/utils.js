/* eslint-disable no-underscore-dangle */
// @flow strict-local

export const getComponentDisplayName = (
  data:
    | {
        ___displayName?: string
      }
    | {
        name?: {
          name?: string
        }
      }
    | void
): string | void => {
  // ensure displayName passes through, assuming it has been captured by Babel
  if (data && data.___displayName) {
    return String(data.___displayName);
    // or it might be obtainable from the converter logic in `packages/extract-react-types/src/converter`
  } else if (data && data.name && data.name.name) {
    return String(data.name.name);
  }

  return undefined;
};
