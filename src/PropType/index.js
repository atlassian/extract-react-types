// @flow
import React from "react";
import convert, { getKind ,reduceToObj } from "kind2string";
import Prop from "../Prop";
import allComponents, { type Components } from "../components";

const renderPropType = (
  propType: any,
  { overrides = {}, shouldCollapseProps, components }: any
) => {
  if (!components) {
    components = allComponents;
  } else {
    components = { ...allComponents, ...components };
  }
  if (propType.kind === "spread") {
    const furtherProps = reduceToObj(propType.value);
    return furtherProps.map(p =>
      renderPropType(p, { overrides, shouldCollapseProps, components })
    );
  }

  let description;
  if (propType.leadingComments) {
    description = propType.leadingComments.reduce(
      (acc, { value }) => acc.concat(`\n${value}`),
      ""
    );
  }

  if (!propType.value) {
    // eslint-disable-next-line no-console
    console.error(
      `Prop ${
        propType.key
      } has no type; this usually indicates invalid propType or defaultProps config`
    );
    return null;
  }

  const name = convert(propType.key);
  const OverrideComponent = overrides[name];
  const commonProps = {
    components,
    name,
    key: convert(propType.key),
    required: !propType.optional,
    type: getKind(propType.value),
    defaultValue: propType.default && convert(propType.default),
    description: description,
    shouldCollapse: shouldCollapseProps,
    typeValue: propType.value
  };

  return overrides[name] ? (
    <OverrideComponent {...commonProps} />
  ) : (
    <Prop {...commonProps} />
  );
};

export default renderPropType;
