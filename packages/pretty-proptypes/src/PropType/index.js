// @flow
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
/* eslint-disable no-param-reassign */
import React, { type StatelessFunctionalComponent } from 'react';
import convert, { getKind, reduceToObj } from 'kind2string';
import allComponents from '../components';
import PrettyPropType from '../PrettyConvert';

const getName = propType => (propType.kind === 'spread' ? '...' : convert(propType.key));
const getIsRequired = propType => !propType.optional;
const getDescription = propType => {
  if (propType.leadingComments) {
    return propType.leadingComments.reduce((acc, { value }) => acc.concat(`\n${value}`), '');
  }
};

const getDefaultValue = propType => propType.default && convert(propType.default);

const extract = propType => ({
  name: getName(propType),
  isRequired: getIsRequired(propType),
  description: getDescription(propType),
  defaultValue: getDefaultValue(propType),
  type: getKind(propType.value),
  typeValue: propType.value,
  components: allComponents
});

type PropData = $Diff<$Call<typeof extract, {}>, { typeValue: any }>;

export const renderProp = (Layout: StatelessFunctionalComponent<PropData>) => propType => {
  if (propType.kind === 'spread') {
    const furtherProps = reduceToObj(propType.value);
    if (Array.isArray(furtherProps) && furtherProps.length > 0) {
      /* Only render the spread contents if they are a non-empty value, otherwise render the
       * spread itself so we can see the spread of generics and other types that have not been
       * converted into an object */
      return furtherProps.map(renderProp(Layout));
    }
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

  const { typeValue, ...propData } = extract(propType);

  const TypeShape = ({ shouldCollapse, components }) => <PrettyPropType typeValue={typeValue} />;

  return <Layout {...propData} TypeShape={TypeShape} />;
};
