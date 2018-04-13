// @flow
import React, { type Node } from "react";
import { borderRadius, colors } from "./constants";
import { css } from "emotion";

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

const Type = (props: { children: Node }) => (
  <span className={baseType} {...props} />
);

const TypeMeta = (props: { children: Node }) => (
  <span className={typeMeta} {...props} />
);

const StringType = (props: { children: Node }) => (
  <span className={stringType} {...props} />
);

export { TypeMeta, StringType };
export default Type;
