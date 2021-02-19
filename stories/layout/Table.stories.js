import React from 'react';

import { PropsTable } from 'pretty-proptypes';
import TypeScriptComponent from '../TypeScriptComponent';

export default {
  title: 'Example/Layouts/Table',
  component: PropsTable
};

const Template = args => args.component;

export const Table = Template.bind({});

Table.args = {
  component: <PropsTable component={TypeScriptComponent} heading="Primitive types" />
};
