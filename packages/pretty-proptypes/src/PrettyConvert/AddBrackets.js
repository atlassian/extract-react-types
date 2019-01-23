// @flow
import React, { Component, Fragment, type Node } from 'react';
import { colors } from '../components/constants';

const StateBit = ({
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
  children,
}) => (
  <span
    onClick={onClick}
    css={`
      background-color: ${isHovered ? colors.P300 : colors.N20};
      color: ${isHovered ? 'white' : colors.subtleText};
      margin: 2px 0;
      padding: 0 0.2em;
      :hover {
        cursor: pointer;
      }
    `}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    {children}
  </span>
);

type Props = {
  openBracket: string,
  closeBracket: string,
  children: Node,
};

type State = {
  isHovered: boolean,
  isShown: boolean,
};

export default class AddBrackets extends Component<Props, State> {
  static defaultProps = {
    openBracket: '(',
    closeBracket: ')',
  };

  state = { isHovered: false, isShown: true };

  isHovered = () => this.setState({ isHovered: true });
  isNotHovered = () => this.setState({ isHovered: false });

  render() {
    let { openBracket, closeBracket, children } = this.props;
    let { isHovered, isShown } = this.state;

    return (
      <Fragment>
        <StateBit
          isHovered={isHovered}
          onClick={() => this.setState({ isShown: !isShown })}
          onMouseEnter={this.isHovered}
          onMouseLeave={this.isNotHovered}
        >
          {openBracket}
        </StateBit>
        {isShown ? (
          children
        ) : (
          <StateBit
            isHovered={isHovered}
            onClick={() => this.setState({ isShown: true, isHovered: false })}
            onMouseEnter={this.isHovered}
            onMouseLeave={this.isNotHovered}
          >
            ...
          </StateBit>
        )}
        <StateBit
          isHovered={isHovered}
          onClick={() => this.setState({ isShown: !isShown })}
          onMouseEnter={this.isHovered}
          onMouseLeave={this.isNotHovered}
        >
          {closeBracket}
        </StateBit>
      </Fragment>
    );
  }
}
