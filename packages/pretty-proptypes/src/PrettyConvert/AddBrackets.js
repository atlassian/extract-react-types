// @flow
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, ComponentType, Fragment, type Node } from 'react';
import ExpanderDefault from '../Components/Expander';

type Props = {
  openBracket: string,
  closeBracket: string,
  children: Node | void,
  Expander: ComponentType<any>
};

type State = {
  isHovered: boolean,
  isShown: boolean
};

export default class AddBrackets extends Component<Props, State> {
  static defaultProps = {
    openBracket: '(',
    closeBracket: ')',
    Expander: ExpanderDefault
  };

  state = { isHovered: false, isShown: true };

  isHovered = () => this.setState({ isHovered: true });
  isNotHovered = () => this.setState({ isHovered: false });

  render() {
    const { openBracket, closeBracket, children, Expander } = this.props;
    const { isHovered, isShown } = this.state;

    return (
      <Fragment>
        <Expander
          isHovered={isHovered}
          onClick={() => this.setState({ isShown: !isShown })}
          onMouseEnter={this.isHovered}
          onMouseLeave={this.isNotHovered}
        >
          {openBracket}
        </Expander>
        {isShown ? (
          children
        ) : (
          <Expander
            isHovered={isHovered}
            onClick={() => this.setState({ isShown: true, isHovered: false })}
            onMouseEnter={this.isHovered}
            onMouseLeave={this.isNotHovered}
          >
            ...
          </Expander>
        )}
        <Expander
          isHovered={isHovered}
          onClick={() => this.setState({ isShown: !isShown })}
          onMouseEnter={this.isHovered}
          onMouseLeave={this.isNotHovered}
        >
          {closeBracket}
        </Expander>
      </Fragment>
    );
  }
}
