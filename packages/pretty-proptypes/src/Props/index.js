// @flow
import React, { Component, type ComponentType } from 'react';

import type { Components } from '../components';
import type { CommonProps } from '../types';
import PropsWrapper from './Wrapper';
import getPropTypes from '../getPropTypes';
import renderPropType from '../PropType';

type Obj = {
  kind: 'object',
  members: Array<any>
};

type Gen = {
  kind: 'generic',
  value: any
};

type Inter = {
  kind: 'intersection',
  types: Array<Obj | Gen>
};

type DynamicPropsProps = {
  components?: Components,
  heading?: string,
  shouldCollapseProps?: boolean,
  overrides?: {
    [string]: ComponentType<CommonProps>
  },
  props: {
    component?: Obj | Inter
  }
};

const getProps = props => {
  if (props && props.component) {
    return getPropTypes(props.component);
  }
  return null;
};

export default class Props extends Component<DynamicPropsProps> {
  render() {
    let { props, heading, ...rest } = this.props;
    let propTypes = getProps(props);
    if (!propTypes) return null;

    return (
      <PropsWrapper heading={heading}>
        {propTypes.map(propType => renderPropType(propType, rest))}
      </PropsWrapper>
    );
  }
}
