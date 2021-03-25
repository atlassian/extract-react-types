// @flow
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Component, type ComponentType, type Node, type StatelessFunctionalComponent } from 'react';
import md from 'react-markings';
import { gridSize, colors, borderRadius } from '../components/constants';
import PrettyPropType from '../PrettyConvert';
import type { CommonProps } from '../types';

export default ({ name, isRequired, description, defaultValue, type, TypeShape, components }) => (
  <Wrapper>
    <Heading>
      <HeadingName>{name}</HeadingName>
      <Whitespace />
      <HeadingType>{type}</HeadingType>
      {defaultValue !== undefined && <HeadingDefault> = {defaultValue}</HeadingDefault>}
      {isRequired && defaultValue === undefined ? (
        <HeadingRequired> required</HeadingRequired>
      ) : null}
    </Heading>
    {description && <components.Description>{md([description])}</components.Description>}
    <TypeShape />
  </Wrapper>
);

const Whitespace = () => ' ';

const Wrapper = ({ children }: { children: Node }) => (
  <div
    css={css`
      margin-top: ${gridSize * 4}px;
    `}
  >
    {children}
  </div>
);

const Heading = ({ children }: { children: Node }) => (
  <h3
    css={css`
      border-bottom: 2px solid ${colors.N20};
      font-size: 0.9rem;
      font-weight: normal;
      line-height: 1.4;
      margin: 0 0 ${gridSize}px 0;
      padding-bottom: ${gridSize}px;
    `}
  >
    {children}
  </h3>
);

const HeadingDefault = ({ children }: { children: Node }) => (
  <code
    css={css`
      color: ${colors.subtleText};
    `}
  >
    {children}
  </code>
);

const HeadingRequired = ({ children }: { children: Node }) => (
  <code
    css={css`
      color: ${colors.R500};
    `}
  >
    {children}
  </code>
);

const HeadingType = ({ children }: { children: Node }) => (
  <code
    css={css`
      background: ${colors.N20};
      border-radius: ${borderRadius}px;
      color: ${colors.N300};
      display: inline-block;
      padding: 0 0.2em;
    `}
  >
    {children}
  </code>
);

const HeadingName = ({ children }: { children: Node }) => (
  <code
    css={css`
      background: ${colors.B50};
      color: ${colors.B500};
      border-radius: ${borderRadius}px;
      display: inline-block;
      margin-right: 0.8em;
      padding: 0 0.2em;
    `}
  >
    {children}
  </code>
);
