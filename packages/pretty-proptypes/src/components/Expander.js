// @flow
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { type Node } from 'react';
import { colors } from './constants';

const Expander = ({
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
  children
}: {
  isHovered: boolean,
  onMouseEnter: () => mixed,
  onMouseLeave: () => mixed,
  onClick: () => mixed,
  children: Node
}) => (
  <button
    type="button"
    onClick={onClick}
    css={css`
      background-color: ${isHovered ? colors.P300 : colors.N20};
      color: ${isHovered ? 'white' : colors.subtleText};
      border: 0;
      border-radius: 3px;
      font-size: 14px;
      font-family: sans-serif;
      line-height: 20px;
      width: auto;
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
  </button>
);

export default Expander;
