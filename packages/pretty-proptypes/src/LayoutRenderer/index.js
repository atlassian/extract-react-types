// @flow

/* eslint-disable no-underscore-dangle */

import { FC, type ComponentType } from 'react';

import type { CommonProps } from '../types';
import type { Components } from '../components';

import getPropTypes from '../getPropTypes';
import renderPropType from '../renderPropType';
import PrettyPropType from '../PrettyConvert';
import { getComponentDisplayName } from '../utils';

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

type Prop = {
  kind: string,
  optional: boolean,
  key: { kind: string, name: string },
  value: { kind: string }
};

export type LayoutRendererProps = {
  /**
   * Types to render, passed directly from the output of extract-react-types-loader
   */
  props?: {
    component?: Obj | Inter
  },
  /** React Component to render props for. */
  component?: ComponentType<any>,
  /** Custom components to render to end-users */
  components?: Components,
  /**
   * Function to render each prop in the props list.
   * Render props contain the prop's information, including name, description etc.
   */
  renderType: CommonProps => ComponentType<CommonProps>,
  /**
   * If true, required props will be placed first in the props array
   */
  requiredPropsFirst?: boolean,
  /**
   * Sorting function applied to props list.
   * Given two prop objects, returns:
   * - 0 to maintain order
   * - < 0 if propA should render before propB
   * - > 0 if propB should render before propA
   */
  sortProps?: (propA: Prop, propB: Prop) => number
};

const getProps = props => (props && props.component ? getPropTypes(props.component) : []);

const LayoutRenderer: FC<LayoutRendererProps> = ({
  props,
  component,
  components,
  requiredPropsFirst,
  sortProps,
  ...rest
}) => {
  let resolvedProps = props;
  if (component) {
    /* $FlowFixMe the component prop is typed as a component because
         that's what people pass to Props and the ___types property shouldn't
         exist in the components types so we're just going to ignore this error */
    if (component.___types) {
      resolvedProps = { type: 'program', component: component.___types };
    } else {
      /* eslint-disable-next-line no-console */
      console.error(
        'A component was passed to <LayoutRenderer> but it does not have types attached.\n' +
          'babel-plugin-extract-react-types may not be correctly installed.\n' +
          '<LayoutRenderer> will fallback to the props prop to display types.'
      );
    }
  }

  let renderProps = rest;
  const componentDisplayName = getComponentDisplayName(component || (props || {}).component);
  if (typeof componentDisplayName === 'string') {
    renderProps = {
      ...rest,
      componentDisplayName
    };
  }

  // Sort prop list
  let finalProps = getProps(resolvedProps);
  if (sortProps) finalProps.sort(sortProps);
  if (requiredPropsFirst) {
    finalProps.sort((propA, propB) => {
      const propARequired = !(propA.optional || propA.default);
      const propBRequired = !(propB.optional || propB.default);
      if (propARequired === propBRequired) return 0;
      return propARequired ? -1 : 1;
    });
  }

  return finalProps.map(propType =>
    renderPropType(
      propType,
      { ...renderProps, components: { ...components, PropType: PrettyPropType } },
      rest.renderType
    )
  );
};

export default LayoutRenderer;
