// @flow
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { type Node } from 'react';
import { colors } from './constants';

const Outline = (props: { children: Node }) => (
  <span
    css={css`
      color: ${colors.subtleText};
      line-height: 1;
    `}
    {...props}
  />
);

export default Outline;
