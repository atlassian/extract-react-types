// @flow
import reduceToObj from "./reduceToObj";
import type { Kind } from "./types";

const getPropTypes = (propTypesObj: Kind) => {
  let propTypes;
  if (propTypesObj.kind === "object") {
    propTypes = propTypesObj.members;
  } else if (propTypesObj.kind === "intersection") {
    propTypes = propTypesObj.types.reduce(
      (acc, type) => [...acc, ...reduceToObj(type)],
      []
    );
  }
  return propTypes;
};

export default getPropTypes;
