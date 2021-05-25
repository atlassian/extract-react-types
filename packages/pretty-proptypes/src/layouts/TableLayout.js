// @flow
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { Component, type ComponentType, type Node, type StatelessFunctionalComponent } from 'react';
import md from 'react-markings';
import { gridSize, colors, borderRadius } from '../components/constants';
import PrettyPropType from '../PrettyConvert';
import type { CommonProps } from '../types';

import { HeadingName, HeadingType, HeadingDefault } from '../components/Heading';

export default ({ name, isRequired, description, defaultValue, type, TypeShape, components }) => (
  <tbody>
    <tr
      valign="top"
      css={{
        '& > td': {
          padding: '14px 0px'
        }
      }}
    >
      <td>
        <HeadingName>{name}</HeadingName>
      </td>
      <td
        css={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <span>
          <HeadingType>{type}</HeadingType>
        </span>
        <span>
          <TypeShape />
        </span>
      </td>
      <td>{defaultValue !== undefined && <HeadingDefault>{defaultValue}</HeadingDefault>}</td>
      <td>{description && <components.Description>{md([description])}</components.Description>}</td>
    </tr>
  </tbody>
);
