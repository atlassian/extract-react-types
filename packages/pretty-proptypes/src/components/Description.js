// @flow
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { type Node } from 'react';

const ReadmeDescription = (props: { children: Node }) =>
  typeof props.children === 'string' ? (
    <p {...props} />
  ) : (
    <div
      css={css`
        margin-top: 12px;
      `}
      {...props}
    />
  );

export default ReadmeDescription;
