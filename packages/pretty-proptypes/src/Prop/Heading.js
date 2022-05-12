// @flow
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { type Node } from 'react';
import { colors, gridSize, borderRadius } from '../components/constants';

export const Heading = ({ children, ...rest }: { children: Node }) => (
  <h3
    css={css`
      border-bottom: 2px solid ${colors.N20};
      font-size: 0.9rem;
      font-weight: normal;
      line-height: 1.4;
      margin: 0 0 ${gridSize}px 0;
      padding-bottom: ${gridSize}px;
    `}
    {...rest}
  >
    {children}
  </h3>
);

export const HeadingDefault = (props: { children: Node }) => (
  <code
    css={css`
      color: ${colors.subtleText};
    `}
    {...props}
  />
);

export const HeadingRequired = (props: { children: Node }) => (
  <code
    css={css`
      color: ${colors.R500};
    `}
    {...props}
  />
);

export const HeadingDeprecated = (props: { children: Node }) => (
  <code
    css={css`
      color: ${colors.N300};
    `}
    {...props}
  />
);

export const HeadingType = (props: { children: Node }) => (
  <code
    css={css`
      background: ${colors.N20};
      border-radius: ${borderRadius}px;
      color: ${colors.N300};
      display: inline-block;
      padding: 0 0.2em;
    `}
    {...props}
  />
);

export const HeadingName = (props: { children: Node }) => (
  <code
    css={css`
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

const Whitespace = () => ' ';

type PropTypeHeadingProps = {
  name: any,
  required: boolean,
  deprecated?: boolean,
  type: any,
  // This is probably giving up
  defaultValue?: any
};

const PropTypeHeading = (props: PropTypeHeadingProps) => (
  <Heading>
    <HeadingName style={{ textDecoration: props.deprecated ? 'line-through' : 'none' }}>
      {props.name}
    </HeadingName>
    <Whitespace />
    <HeadingType>{props.type}</HeadingType>
    {props.defaultValue !== undefined && <HeadingDefault> = {props.defaultValue}</HeadingDefault>}
    {props.required && props.defaultValue === undefined ? (
      <HeadingRequired> required</HeadingRequired>
    ) : null}
    {props.deprecated && <HeadingDeprecated> deprecated</HeadingDeprecated>}
  </Heading>
);

export default PropTypeHeading;
