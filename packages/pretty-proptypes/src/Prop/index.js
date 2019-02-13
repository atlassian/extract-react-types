// @flow
import React, { Component, type ComponentType, type Node } from 'react';
import md from 'react-markings';
import { gridSize } from '../components/constants';
import PrettyPropType from '../PrettyConvert';
import PropTypeHeading from './Heading';
import type { CommonProps } from '../types';

const PropTypeWrapper = (props: { children: Node }) => (
  <div
    css={`
      margin-top: ${gridSize * 4}px;
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

    let { defaultValue, description, name, required, type, components } = commonProps;

    return (
      <PropTypeWrapper>
        <PropTypeHeading name={name} required={required} type={type} defaultValue={defaultValue} />
        {description && <components.Description>{md([description])}</components.Description>}
        <ShapeComponent {...commonProps} />
      </PropTypeWrapper>
    );
  }
}
