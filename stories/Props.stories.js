// @flow
import React from 'react';

import Props from 'pretty-proptypes';
import FlowComponent from './FlowComponent';
import TypeScriptComponent from './TypeScriptComponent';

export default {
  title: 'Example/Props',
  component: Props
};

const Template = args => args.component;

export const Flow = Template.bind({});

Flow.args = {
  component: <Props component={FlowComponent} heading="Primitive types" />
};

export const TypeScript = Template.bind({});

TypeScript.args = {
  component: <Props component={TypeScriptComponent} heading="Primitive types" />
};
