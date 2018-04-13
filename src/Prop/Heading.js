// @flow
import React, { type Node } from "react";
import { colors, gridSize, borderRadius } from "../components/constants";

const Heading = (props: { children: Node }) => (
  <h3
    css={`
      border-bottom: 2px solid ${colors.N20};
      font-size: 0.9rem;
      font-weight: normal;
      line-height: 1.4;
      margin: 0 0 ${gridSize}px 0;
      padding-bottom: ${gridSize}px;
    `}
    {...props}
  />
);

const HeadingDefault = (props: { children: Node }) => (
  <code
    css={`
      color: ${colors.subtleText};
    `}
    {...props}
  />
);

const HeadingRequired = (props: { children: Node }) => (
  <span
    css={`
      color: ${colors.R500};
    `}
  />
);

const HeadingType = (props: { children: Node }) => (
  <span
    css={`
      background: ${colors.N20};
      border-radius: ${borderRadius}px;
      color: ${colors.N300};
      display: inline-block;
      padding: 0 0.2em;
    `}
    {...props}
  />
);

const HeadingName = (props: { children: Node }) => (
  <span
    css={`
      background: ${colors.B50};
      color: ${colors.B500};
      border-radius: ${borderRadius}px;
      display: inline-block;
      margin-right: 0.8em;
      padding: 0 0.2em;
    `}
    {...props}
  />
);

type PropTypeHeadingProps = {
  name: any,
  required: boolean,
  type: any,
  // This is probably giving up
  defaultValue?: any
};

const PropTypeHeading = (props: PropTypeHeadingProps) => (
  <Heading>
    <code>
      <HeadingName>{props.name}</HeadingName>
      <HeadingType>{props.type}</HeadingType>
      {props.defaultValue !== undefined && (
        <HeadingDefault> = {props.defaultValue}</HeadingDefault>
      )}
      {props.required && props.defaultValue === undefined ? (
        <HeadingRequired> required</HeadingRequired>
      ) : null}
    </code>
  </Heading>
);

export default PropTypeHeading;
