// @flow
import React, { ComponentType, ReactNode, FunctionComponent } from 'react';

import { CommonProps } from '../types';

import getPropTypes from '../getPropTypes';
import { renderProp, extract } from '../PropType';

import { type RawProps } from '../types';

import DefaultLayout from '../layouts/DefaultLayout';

type Components = {};

type LayoutProps = {
  components: Components
};

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
    [key: string]: ComponentType<CommonProps>
  },
  props?: {
    component?: Obj | Inter
  },
  component?: ComponentType<any>
};

// TODO: figure out a better name
export type IPrettyProps = {
  Layout: LayoutProps => ReactNode,
  props?: RawProps,
  component?: ComponentType<any>
};

const getProps = (props: RawProps) => {
  if (props && props.component) {
    return getPropTypes(props.component);
  }
  return null;
};

const PrettyProps: FunctionComponent<IPrettyProps> = ({
  layout: Layout = DefaultLayout,
  props,
  component
}) => {
  let propTypes;

  if (component) {
    /* $FlowFixMe the component prop is typed as a component because
       that's what people pass to Props and the ___types property shouldn't
       exist in the components types so we're just going to ignore this error */
    if (component.___types) {
      propTypes = getProps({ type: 'program', component: component.___types });
    } else {
      /* eslint-disable-next-line no-console */
      console.error(
        'A component was passed to <Props> but it does not have types attached.\n' +
          'babel-plugin-extract-react-types may not be correctly installed.\n' +
          '<Props> will fallback to the props prop to display types.'
      );
    }
  }

  propTypes = propTypes || getProps(props);

  if (!propTypes) return null;

  return propTypes.map(renderProp(Layout));
};

export default PrettyProps;
