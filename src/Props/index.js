// @flow
import React, { Component, type Node, type ComponentType } from 'react';
import { gridSize } from '../components/constants';
import convert, { getKind } from 'kind2string';

import Prop from '../Prop';
import { type CommonProps } from '../types';
import allComponents, { type Components } from '../components';
import PropsWrapper from './Wrapper';
import getPropTypes from '../getPropTypes';
import renderPropType from '../PropType';

type Obj = {
  kind: 'object',
  members: Array<any>,
};

type Gen = {
  kind: 'generic',
  value: any,
};

type Inter = {
  kind: 'intersection',
  types: Array<Obj | Gen>,
};

type DynamicPropsProps = {
  components: Components,
  heading?: string,
  shouldCollapseProps?: boolean,
  overrides?: {
    [string]: ComponentType<CommonProps>,
  },
  props: {
    classes?: Array<{
      kind: string,
      value: Obj | Inter,
    }>,
  },
};

export default class Props extends Component<DynamicPropsProps> {
  getProps = () => {
    let { props } = this.props;

    const classes = props && props.classes;
    if (!classes) return false;

    const propTypesObj = classes[0] && classes[0].value;
    if (!propTypesObj) return false;

    const propTypes = getPropTypes(propTypesObj);
    if (!propTypes) return false;

    return propTypes;
  };

  render() {
    let { props, ...rest } = this.props;
    let propTypes = this.getProps();
    if (!propTypes) return null;

    return (
      <PropsWrapper heading={this.props.heading}>
        {propTypes.map(propType => renderPropType(propType, rest))}
      </PropsWrapper>
    );
  }
}
