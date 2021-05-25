// @flow
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Component, type ComponentType, type Node, type StatelessFunctionalComponent } from 'react';
import md from 'react-markings';
import { gridSize, colors, borderRadius } from '../components/constants';
import PrettyPropType from '../PrettyConvert';
import type { CommonProps } from '../types';

import {
  Heading,
  HeadingRequired,
  HeadingName,
  HeadingType,
  HeadingDefault
} from '../components/Heading';

export default ({ name, isRequired, description, defaultValue, type, TypeShape }) => (
  <table
    css={css`
      width: 100%;
      border-collapse: collapse;
      margin-top: 40px;

      th {
        text-align: left;
        padding: 4px 16px 4px 8px;
        white-space: nowrap;
        vertical-align: top;
      }

      td {
        padding: 4px 0 4px 8px;
        width: 100%;
      }
    `}
  >
    <caption
      css={css`
        text-align: left;
        margin: 0;
        font-size: 1em;
      `}
    >
      <Heading
        css={css`
          font-size: 1em;
          padding-bottom: 8px;
          border-bottom: 1px solid ${colors.N30};
          margin-bottom: 4px;
        `}
      >
        <code
          css={css`
            background-color: ${colors.N20};
            color: ${colors.N800};
            border-radius: 3px;
            padding: 4px 8px;
            line-height: 20px;
            display: inline-block;
          `}
        >
          {name}
        </code>
        {isRequired && defaultValue === undefined && (
          <HeadingRequired
            css={css`
              margin-left: 1em;
              color: ${colors.R400};
            `}
          >
            required
          </HeadingRequired>
        )}
      </Heading>
    </caption>
    <tbody
      css={css`
        border-bottom: none;
      `}
    >
      <tr>
        <th scope="row">Description</th>
        <td>{description && <Description>{md([description])}</Description>}</td>
      </tr>
      {defaultValue !== undefined && (
        <tr>
          <th scope="row">Default</th>
          <td>
            <HeadingDefault>{defaultValue}</HeadingDefault>
          </td>
        </tr>
      )}
      <tr>
        <th scope="row">Type</th>
        <td
          css={css`
            display: flex;
            flex-direction: column;
          `}
        >
          <span>
            <HeadingType>{type}</HeadingType>
          </span>
          <span>
            <TypeShape />
          </span>
        </td>
      </tr>
    </tbody>
  </table>
);

const Description = ({ children }) => (
  <div
    css={css`
      p:first-of-type {
        margin-top: 0px;
      }
      p:last-of-type {
        margin-bottom: 0px;
      }
    `}
  >
    {children}
  </div>
);
