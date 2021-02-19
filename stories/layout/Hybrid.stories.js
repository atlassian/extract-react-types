import React from 'react';

import { HybridLayout } from 'pretty-proptypes';
import TypeScriptComponent from '../TypeScriptComponent';

export default {
  title: 'Example/Layouts/Hybrid',
  component: HybridLayout
};

const Template = args => args.component;

export const Hybrid = Template.bind({});

Hybrid.args = {
  component: <HybridLayout component={TypeScriptComponent} heading="Primitive types" />
};
