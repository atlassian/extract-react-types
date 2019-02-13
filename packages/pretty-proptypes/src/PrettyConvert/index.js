// @flow
import React, { Component, type Node } from 'react';
import { resolveFromGeneric } from 'kind2string';
import { gridSize } from '../components/constants';
import allComponents, { type Components } from '../components';
import Toggle from './Toggle';
import prettyConvert, { SIMPLE_TYPES } from './converters';

const Wrapper = (props: { children: Node }) => (
  <code
    css={`
      display: inline-block;
      font-size: 0.8rem;
      line-height: 1.4;
      margin-bottom: ${gridSize}px;
      margin-top: ${gridSize}px;
    `}
    {...props}
  />
);

// const printFunc = type => null;

type PrettyPropTypeProps = {
  typeValue: Object,
  shouldCollapse?: boolean,
  components: Components
};

export default class PrettyPropType extends Component<PrettyPropTypeProps, *> {
  static defaultProps = {
    components: allComponents
  };

  render() {
    let { shouldCollapse, typeValue: type, components } = this.props;
    // any instance of returning null means we are confident the information will
    // be displayed elsewhere so we do not need to also include it here.
    if (type.kind === 'generic') {
      type = resolveFromGeneric(type);
    }
    if (SIMPLE_TYPES.includes(type.kind)) return null;
    if (type.kind === 'nullable' && SIMPLE_TYPES.includes(type.arguments.kind)) {
      return null;
    }

    return shouldCollapse ? (
      <Toggle
        beginClosed
        afterCollapse={(isCollapsed, toggleCollapse) => (
          <div>
            <components.Button isCollapsed={isCollapsed} onClick={toggleCollapse}>
              {isCollapsed ? 'Expand Prop Shape' : 'Hide Prop Shape'}
            </components.Button>
          </div>
        )}
      >
        <Wrapper>{prettyConvert(type, components)}</Wrapper>
      </Toggle>
    ) : (
      <Wrapper>{prettyConvert(type, components)}</Wrapper>
    );
  }
}
