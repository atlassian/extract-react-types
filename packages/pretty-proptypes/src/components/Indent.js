// @flow
import React, { type Node } from 'react';

export default function Indent(props: { children: Node }) {
  return (
    <div
      css={`
        padding-left: 1.3em;
      `}
      {...props}
    />
  );
}
