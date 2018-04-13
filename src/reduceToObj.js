// @flow
import type { Kind } from "./types";

// TODO: This function should be owned by kind2string, not PrettyPropType.
// Pull this into kind2string and delete it from here.
const reduceToObj = (type: Kind) => {
  if (type.kind === "generic") {
    return reduceToObj(type.value);
  } else if (type.kind === "object") {
    return type.members;
  } else if (type.kind === "intersection") {
    return type.types.reduce((acc, i) => [...acc, ...reduceToObj(i)], []);
  }
  // eslint-disable-next-line no-console
  console.warn("was expecting to reduce to an object and could not", type);
  return [];
};

export default reduceToObj;
