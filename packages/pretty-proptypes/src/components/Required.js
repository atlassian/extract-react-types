// @flow
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { type Node } from 'react';
import { colors } from './constants';

const Required = (props: { children: Node }) => (
  <span
    css={css`
      color: ${colors.R500};
    `}
    {...props}
  />
);

export default Required;
