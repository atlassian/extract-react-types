// @flow
import React, { type Node } from 'react';
import { colors } from './constants';

const Required = (props: { children: Node }) => (
  <span
    css={`
      color: ${colors.R500};
    `}
    {...props}
  />
);

export default Required;
