// @flow
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { type Node } from 'react';
import { borderRadius, colors } from './constants';

const baseType = css`
  background-color: ${colors.P50};
  border-radius: ${borderRadius}px;
  color: ${colors.P500};
  display: inline-block;
  margin: 2px 0;
  padding: 0 0.2em;
`;

const typeMeta = css`
  ${baseType}
  background-color: ${colors.N20};
  color: ${colors.subtleText};
`;

const stringType = css`
  ${baseType}
  background-color: ${colors.G50};
  color: ${colors.G500};
`;

const functionType = css``;

const Type = (props: { children: Node }) => <span css={baseType} {...props} />;

const TypeMeta = (props: { children: Node }) => <span css={typeMeta} {...props} />;

const StringType = (props: { children: Node }) => <span css={stringType} {...props} />;

const FunctionType = (props: { children: Node }) => <span css={functionType} {...props} />;

export { TypeMeta, StringType, FunctionType };
export default Type;
