// @flow
import test from 'ava';
import React from 'react';
import { mount, configure } from 'enzyme';
import extractReactTypes from 'extract-react-types';
import Adapter from 'enzyme-adapter-react-16';

import Props from './';

configure({ adapter: new Adapter() });

const file = `
const MyComponent = (props: { simpleProp: string }) => null;

export default MyComponent;
`;

test('should visualise props from extract-types-loader', t => {
  const wrapper = mount(
    <Props
      props={extractReactTypes(file, 'flow')}
      heading="FormFooter Props"
    />,
  );

  const prop = wrapper.find('Prop');

  t.is(prop.length, 1);
  t.is(prop.prop('name'), 'simpleProp');
  t.is(prop.prop('required'), true);
  t.is(prop.prop('type'), 'string');
});

test('simple facts about two props', t => {
  const file2 = `
const MyComponent = (props: { simpleProp: string, secondProp?: number }) => null;

export default MyComponent;
`;

  const wrapper = mount(
    <Props
      props={extractReactTypes(file2, 'flow')}
      heading="FormFooter Props"
    />,
  );

  const prop = wrapper.find('Prop');
  t.is(prop.length, 2);
});

test('renders no children when passed on props', t => {
  // $FlowFixMe
  const wrapper = mount(<Props heading="empty" />);

  t.is(wrapper.children().length, 0);
});
