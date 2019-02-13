// @flow
import React, { type Node } from 'react';

const ReadmeDescription = (props: { children: Node }) =>
  typeof props.children === 'string' ? (
    <p {...props} />
  ) : (
    <div
      css={`
        margin-top: 12px;
      `}
      {...props}
    />
  );

export default ReadmeDescription;
