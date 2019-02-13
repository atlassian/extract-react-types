// @flow
import React, { type Node } from 'react';
import { gridSize } from '../components/constants';

const Wrapper = (props: { children: Node }) => (
  <div
    css={`
      margin-top: ${gridSize * 1.5}px;

      @media (min-width: 780px) {
        margin-bottom: ${gridSize * 3}px;
        margin-top: ${gridSize * 3}px;
      }
    `}
    {...props}
  />
);

const H2 = ({ children, ...rest }: { children: Node }) => (
  <h2
    css={`
      margintop: 1em;
    `}
    {...rest}
  >
    {children}
  </h2>
);

const PropsWrapper = ({ children, heading }: { children: Node, heading?: string }) => (
  <Wrapper>
    {typeof heading === 'string' && heading.length === 0 ? null : <H2>{heading || 'Props'}</H2>}
    {children}
  </Wrapper>
);

export default PropsWrapper;
