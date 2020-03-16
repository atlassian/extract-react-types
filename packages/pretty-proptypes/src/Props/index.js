// @flow

/* eslint-disable no-underscore-dangle */

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
  props?: {
    component?: Obj | Inter
  },
  component?: ComponentType<any>
};

const getProps = props => {
  if (props && props.component) {
    return getPropTypes(props.component);
  }
  return null;
};

export default class Props extends Component<DynamicPropsProps> {
  render() {
    let { props, heading, component, ...rest } = this.props;
    if (component) {
      /* $FlowFixMe the component prop is typed as a component because
         that's what people pass to Props and the ___types property shouldn't
         exist in the components types so we're just going to ignore this error */
      if (component.___types) {
        props = { type: 'program', component: component.___types };
      } else {
        /* eslint-disable-next-line no-console */
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
