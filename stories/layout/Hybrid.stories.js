import React from 'react';

import { HybridLayout } from 'pretty-proptypes';
import { css, Global } from '@emotion/core';
import TypeScriptComponent from '../TypeScriptComponent';

export default {
  title: 'Example/Layouts/Hybrid',
  component: HybridLayout
};

const Template = args => args.component;

export const Base = Template.bind({});

Base.args = {
  component: <HybridLayout component={TypeScriptComponent} heading="Primitive types" />
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
      <HybridLayout component={TypeScriptComponent} heading="Primitive types" />
    </>
  )
};
