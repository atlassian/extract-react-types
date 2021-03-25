// @flow
/** @jsx jsx */
import { jsx, css, Global } from '@emotion/core';
import React from 'react';

import { TableLayout, PrettyProps } from 'pretty-proptypes';
import TypeScriptComponent from '../TypeScriptComponent';

export default {
  title: 'Example/Layouts/Table',
  component: PrettyProps
};

const Template = args => args.component;

export const Base = Template.bind({});

Base.args = {
  component: (
    <>
      <h2>Primitive types</h2>
      <table>
        <thead>
          <tr>
            <td>Name</td>
            <td>Type</td>
            <td>Defaults</td>
            <td>Description</td>
          </tr>
        </thead>
        <PrettyProps component={TypeScriptComponent} layout={TableLayout} />
      </table>
    </>
  )
};

export const WithReset = () => (
  <>
    <Global
      styles={css`
        @import 'https://unpkg.com/@atlaskit/css-reset@6.0.5/dist/bundle.css';
      `}
    />
    <h2>Primitive types</h2>
    <table>
      <thead>
        <tr>
          <td>Name</td>
          <td>Type</td>
          <td>Defaults</td>
          <td>Description</td>
        </tr>
      </thead>
      <PrettyProps component={TypeScriptComponent} layout={TableLayout} />
    </table>
  </>
);
