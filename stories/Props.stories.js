// @flow
import React from 'react';

import { PrettyProps } from 'pretty-proptypes';
import FlowComponent from './FlowComponent';
import TypeScriptComponent from './TypeScriptComponent';

export default {
  title: 'Example/Props',
  component: PrettyProps
};

const Template = args => args.component;

export const Flow = Template.bind({});

Flow.args = {
  component: (
    <>
      <h2>Primitive types</h2>
      <PrettyProps component={FlowComponent} />
    </>
  )
};

export const TypeScript = Template.bind({});

TypeScript.args = {
  component: (
    <>
      <h2>Primitive types</h2>
      <PrettyProps component={TypeScriptComponent} />
    </>
  )
};
