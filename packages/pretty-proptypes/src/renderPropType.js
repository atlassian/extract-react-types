// @flow
/* eslint-disable no-param-reassign */
import React, { type ComponentType } from 'react';
import convert, { getKind, reduceToObj } from 'kind2string';
import allComponents from './components';

const IGNORE_COMMENTS_STARTING_WITH = ['eslint-disable', '@ts-'];
const DEPRECATE_PROPS_THAT_CONTAIN = '@deprecated';
const HIDE_PROPS_THAT_CONTAIN = ['@internal', '@access private'];

const shouldIgnoreComment = comment => {
  if (!comment) {
    return false;
  }

  for (let i = 0; i < IGNORE_COMMENTS_STARTING_WITH.length; i++) {
    const value = IGNORE_COMMENTS_STARTING_WITH[i];
    if (comment.startsWith(value)) {
      return true;
    }
  }

  return false;
};

const shouldHideProp = comment => {
  if (!comment) {
    return false;
  }

  for (let i = 0; i < HIDE_PROPS_THAT_CONTAIN.length; i++) {
    const value = HIDE_PROPS_THAT_CONTAIN[i];
    if (comment.includes(value)) {
      return true;
    }
  }

  return false;
};

const shouldDeprecateProp = comment => {
  if (!comment) {
    return false;
  }

  return comment.includes(DEPRECATE_PROPS_THAT_CONTAIN);
};

const renderPropType = (
  propType: any,
  { overrides = {}, shouldCollapseProps, components, componentDisplayName = {} }: any,
  PropComponent?: ComponentType<any>
) => {
  components = { ...allComponents, ...components };

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
    description = propType.leadingComments
      .filter(({ value }) => !shouldIgnoreComment(value))
      .reduce((acc, { value }) => acc.concat(`\n${value}`), '');
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

  if (shouldHideProp(description)) {
    return null;
  }

  const name = propType.kind === 'spread' ? '...' : convert(propType.key);
  const Component = overrides[name] || PropComponent;

  return (
    <Component
      key={name}
      components={components}
      name={name}
      description={description}
      required={!propType.optional}
      deprecated={shouldDeprecateProp(description)}
      type={getKind(propType.value)}
      defaultValue={propType.default && convert(propType.default)}
      shouldCollapse={shouldCollapseProps}
      typeValue={propType.value}
      componentDisplayName={componentDisplayName}
    />
  );
};

export default renderPropType;
