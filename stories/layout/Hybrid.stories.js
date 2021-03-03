import React from 'react';

import { HybridLayout } from 'pretty-proptypes';
import { css, Global } from '@emotion/core';
import TypeScriptComponent from '../TypeScriptComponent';

import { colors } from '../../packages/pretty-proptypes/src/components/constants';

export default {
  title: 'Example/Layouts/Hybrid',
  component: HybridLayout
};

const Template = args => args.component;

export const Hybrid = Template.bind({});

Hybrid.args = {
  component: <HybridLayout component={TypeScriptComponent} heading="Primitive types" />
};

export const Option1 = Template.bind({});

Option1.args = {
  component: (
    <>
      <Global
        styles={css`
          @import 'https://unpkg.com/@atlaskit/css-reset@6.0.5/dist/bundle.css';

          #root {
            tbody {
              border: none;
            }

            h3 {
              padding-bottom: 8px;
              border-bottom-color: #ebecf0;
            }

            h3 code:first-of-type {
              background-color: rgb(244, 245, 247);
              color: rgb(23, 43, 77);
              border-radius: 3px;
              padding: 4px;
              font-size: initial;
            }
          }
        `}
      />
      <HybridLayout component={TypeScriptComponent} heading="Primitive types" />
    </>
  )
};

export const Option5 = Template.bind({});

Option5.args = {
  component: (
    <>
      <Global
        styles={css`
          @import 'https://unpkg.com/@atlaskit/css-reset@6.0.5/dist/bundle.css';

          #root {
            tbody {
              background: #fafbfc;
              border-bottom-color: #ebecf0;
            }

            h3 {
              padding-left: 8px;
              border-bottom-color: #ebecf0;
            }

            th {
              padding-left: 8px;
            }
          }
        `}
      />
      <HybridLayout component={TypeScriptComponent} heading="Primitive types" />
    </>
  )
};

export const Option8 = Template.bind({});

Option8.args = {
  component: (
    <>
      <Global
        styles={css`
          @import 'https://unpkg.com/@atlaskit/css-reset@6.0.5/dist/bundle.css';

          #root {
            tbody {
              border: none;
            }

            th {
              text-align: right;
              padding-left: 24px;
            }

            h3 {
              padding-bottom: 8px;
              border-bottom-color: #ebecf0;
            }

            h3 code:first-of-type {
              background-color: rgb(244, 245, 247);
              color: rgb(23, 43, 77);
              border-radius: 3px;
              padding: 4px;
              font-size: initial;
            }
          }
        `}
      />
      <HybridLayout component={TypeScriptComponent} heading="Primitive types" />
    </>
  )
};
