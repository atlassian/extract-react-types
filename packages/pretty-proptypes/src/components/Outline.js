// @flow
import React, { type Node } from 'react';
import { colors } from './constants';

const Outline = (props: { children: Node }) => (
  <span
    css={`
      color: ${colors.subtleText};
      line-height: 1;
    `}
    {...props}
  />
);

export default Outline;
