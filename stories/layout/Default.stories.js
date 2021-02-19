import React from 'react';

import Props from 'pretty-proptypes';
import TypeScriptComponent from '../TypeScriptComponent';

export default {
  title: 'Example/Layouts/Default',
  component: Props
};

const Template = args => args.component;

export const Default = Template.bind({});

Default.args = {
  component: <Props component={TypeScriptComponent} heading="Primitive types" />
};
