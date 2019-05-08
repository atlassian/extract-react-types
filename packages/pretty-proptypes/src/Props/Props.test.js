// @flow
import React from 'react';
import { mount, configure } from 'enzyme';
import { extractReactTypes } from 'extract-react-types';
import Adapter from 'enzyme-adapter-react-16';

import Props from './';

configure({ adapter: new Adapter() });

const file = `
const MyComponent = (props: { simpleProp: string }) => null;

export default MyComponent;
`;

test('should visualise props from extract-types-loader', () => {
  const wrapper = mount(
    <Props props={extractReactTypes(file, 'flow')} heading="FormFooter Props" />
  );

  const prop = wrapper.find('Prop');

  expect(prop.length).toBe(1);
  expect(prop.prop('name')).toBe('simpleProp');
  expect(prop.prop('required')).toBe(true);
  expect(prop.prop('type')).toBe('string');
});

test('simple facts about two props', () => {
  const file2 = `
const MyComponent = (props: { simpleProp: string, secondProp?: number }) => null;

export default MyComponent;
`;

  const wrapper = mount(
    <Props props={extractReactTypes(file2, 'flow')} heading="FormFooter Props" />
  );

  const prop = wrapper.find('Prop');
  expect(prop.length).toBe(2);
});

test('renders no children when passed on props', () => {
  // $FlowFixMe
  const wrapper = mount(<Props heading="empty" />);

  expect(wrapper.children().length).toBe(0);
});
