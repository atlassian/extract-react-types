// @flow

/* eslint-disable no-underscore-dangle */

import { FC, type ComponentType } from 'react';

import type { CommonProps } from '../types';
import type { Components } from '../components';

import getPropTypes from '../getPropTypes';
import renderPropType from '../renderPropType';
import PrettyPropType from '../PrettyConvert';

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

export type LayoutRendererProps = {
  props?: {
    component?: Obj | Inter
  },
  component?: ComponentType<any>,
  components?: Components,
  renderType: CommonProps => ComponentType<CommonProps>
};

const getProps = props => (props && props.component ? getPropTypes(props.component) : null);

const LayoutRenderer: FC<LayoutRendererProps> = ({ props, component, components, ...rest }) => {
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

  return getProps(resolvedProps).map(propType =>
    renderPropType(
      propType,
      { ...rest, components: { ...components, PropType: PrettyPropType } },
      rest.renderType
    )
  );
};

export default LayoutRenderer;
