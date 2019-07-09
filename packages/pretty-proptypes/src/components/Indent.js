// @flow
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { type Node } from 'react';

export default function Indent(props: { children: Node }) {
  return (
    <div
      css={css`
        padding-left: 1.3em;
      `}
      {...props}
    />
  );
}
