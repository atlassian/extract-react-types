// @flow
/** @jsx jsx */
import { jsx, css, Global } from '@emotion/core';
import { type Node } from 'react';

import React from 'react';

import { PrettyProps } from 'pretty-proptypes';
import TypeScriptComponent from '../TypeScriptComponent';

export default {
  title: 'Example/Layouts/Default',
  component: Props
};

const Template = args => args.component;

export const Base = Template.bind({});

Base.args = {
  component: (
    <>
      <h2>Primitive types</h2>
      <PrettyProps component={TypeScriptComponent} />
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
    <PrettyProps component={TypeScriptComponent} />
  </>
);
