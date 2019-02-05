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
  props?: {
    component?: Obj | Inter
  },
  component?: ComponentType<any>
};

const getProps = props => {
  if (props && props.component) {
    return getPropTypes(props.component);
  }
};

export default class Props extends Component<DynamicPropsProps> {
  render() {
    let { props, heading, component, ...rest } = this.props;
    if (component) {
      if (component.___types) {
        props = { type: 'program', component: component.___types };
      } else {
        console.error(
          'A component was passed to <Props> but it does not have types attached.\n' +
            'babel-plugin-extract-react-types may not be correctly installed.\n' +
            '<Props> will fallback to the props prop to display types.'
        );
      }
    }
    let propTypes = getProps(props);
    if (!propTypes) return null;

    return (
      <PropsWrapper heading={heading}>
        {propTypes.map(propType => renderPropType(propType, rest))}
      </PropsWrapper>
    );
  }
}
