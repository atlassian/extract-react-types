// @flow
/** @jsx jsx */
import { jsx, css, Global } from '@emotion/core';
import React from 'react';

import { HybridLayout, PrettyProps } from 'pretty-proptypes';
import TypeScriptComponent from '../TypeScriptComponent';

import { colors } from '../../packages/pretty-proptypes/src/components/constants';

export default {
  title: 'Example/Layouts/Hybrid',
  component: HybridLayout
};

const Template = args => args.component;

export const Base = Template.bind({});

Base.args = {
  component: (
    <>
      <h2>Primitive types</h2>
      <PrettyProps
        component={TypeScriptComponent}
        heading="Primitive types"
        layout={HybridLayout}
      />
    </>
  )
};

export const WithReset = Template.bind({});

WithReset.args = {
  component: (
    <>
      <Global
        styles={css`
          @import 'https://unpkg.com/@atlaskit/css-reset@6.0.5/dist/bundle.css';
        `}
      />
      <h2>Primitive types</h2>
      <PrettyProps
        component={TypeScriptComponent}
        heading="Primitive types"
        layout={HybridLayout}
      />
    </>
  )
};
