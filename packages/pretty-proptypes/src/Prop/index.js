// @flow
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Component, type ComponentType, type Node } from 'react';
import md from 'react-markings';
import { gridSize } from '../components/constants';
import PrettyPropType from '../PrettyConvert';
import PropTypeHeading from './Heading';
import type { CommonProps } from '../types';

const PropTypeWrapper = (props: { children: Node }) => (
  <div
    css={css`
      margin-top: ${gridSize * 4}px;

      &:target {
        background: #e9f2ff;
      }
    `}
    {...props}
  />
);

type PropProps = CommonProps & {
  shapeComponent: ComponentType<CommonProps>
};

export default class Prop extends Component<PropProps> {
  static defaultProps = {
    shapeComponent: (props: CommonProps) => <PrettyPropType {...props} />
  };

  render() {
    let { shapeComponent: ShapeComponent, ...commonProps } = this.props;

    let {
      defaultValue,
      description,
      name,
      required,
      deprecated,
      type,
      components,
      componentDisplayName
    } = commonProps;

    return (
      <PropTypeWrapper
        {...(componentDisplayName ? { id: `${componentDisplayName}-${name}` } : null)}
      >
        <PropTypeHeading
          name={name}
          required={required}
          type={type}
          defaultValue={defaultValue}
          deprecated={deprecated}
        />
        {description && (
          <components.Description>
            {' '}
            {md([deprecated ? description.replace('@deprecated', '') : description])}
          </components.Description>
        )}
        <ShapeComponent {...commonProps} />
      </PropTypeWrapper>
    );
  }
}
