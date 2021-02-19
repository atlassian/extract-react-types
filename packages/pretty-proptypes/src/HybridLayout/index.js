// @flow

/* eslint-disable no-underscore-dangle */

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { Component, type ComponentType } from 'react';

import type { Components } from '../components';
import type { CommonProps } from '../types';
import PropsWrapper from '../Props/Wrapper';
import getPropTypes from '../getPropTypes';
import renderPropType from '../PropType';
import PropEntry from './PropEntry';

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

export default class HybridLayout extends Component<DynamicPropsProps> {
  render() {
    let { props, heading, component, components, ...rest } = this.props;
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

    if (!components || !components.Description) {
      components = components || {};
      components.Description = ({ children }) => (
        <div
          css={css`
            p:first-of-type {
              margin-top: 0px;
            }
            p:last-of-type {
              margin-bottom: 0px;
            }
          `}
        >
          {children}
        </div>
      );
    }

    let propTypes = getProps(props);
    if (!propTypes) return null;

    return (
      <PropsWrapper heading={heading}>
        {propTypes.map(propType => renderPropType(propType, { ...rest, components }, PropEntry))}
      </PropsWrapper>
    );
  }
}
