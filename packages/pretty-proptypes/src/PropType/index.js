// @flow
/* eslint-disable no-param-reassign */
import React from 'react';
import convert, { getKind, reduceToObj } from 'kind2string';
import Prop from '../Prop';
import allComponents from '../components';

const renderPropType = (
  propType: any,
  { overrides = {}, shouldCollapseProps, components }: any
) => {
  if (!components) {
    components = allComponents;
  } else {
    components = { ...allComponents, ...components };
  }
  if (propType.kind === 'spread') {
    const furtherProps = reduceToObj(propType.value);
    if (Array.isArray(furtherProps) && furtherProps.length > 0) {
      /* Only render the spread contents if they are a non-empty value, otherwise render the
       * spread itself so we can see the spread of generics and other types that have not been
       * converted into an object */
      return furtherProps.map(p =>
        renderPropType(p, { overrides, shouldCollapseProps, components })
      );
    }
  }

  let description;
  if (propType.leadingComments) {
    description = propType.leadingComments.reduce((acc, { value }) => acc.concat(`\n${value}`), '');
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

  const name = propType.kind === 'spread' ? '...' : convert(propType.key);
  const OverrideComponent = overrides[name];
  const commonProps = {
    components,
    name,
    key: name,
    required: !propType.optional,
    type: getKind(propType.value),
    defaultValue: propType.default && convert(propType.default),
    description,
    shouldCollapse: shouldCollapseProps,
    typeValue: propType.value
  };

  return overrides[name] ? <OverrideComponent {...commonProps} /> : <Prop {...commonProps} />;
};

export default renderPropType;
